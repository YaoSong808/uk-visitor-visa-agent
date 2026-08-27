import { spawn } from "node:child_process";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow, dialog, shell } from "electron";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;
let serverProcess;
let isQuitting = false;

function reservePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close(() => port ? resolve(port) : reject(new Error("Unable to reserve a local port.")));
    });
  });
}

function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const retry = () => {
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error("The local application server did not start in time."));
        return;
      }
      setTimeout(attempt, 250);
    };
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) resolve();
        else retry();
      });
      request.setTimeout(1500, () => request.destroy());
      request.on("error", retry);
    };
    attempt();
  });
}

async function startLocalServer() {
  const port = await reservePort();
  const serverRoot = app.isPackaged
    ? path.join(process.resourcesPath, "server")
    : path.join(__dirname, "..", "dist", "desktop-server");
  const serverEntry = path.join(serverRoot, "server.js");
  const origin = `http://127.0.0.1:${port}`;
  const vendorPath = path.join(serverRoot, "vendor");

  serverProcess = spawn(process.execPath, [serverEntry], {
    cwd: serverRoot,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "production",
      NODE_PATH: process.env.NODE_PATH
        ? `${vendorPath}${path.delimiter}${process.env.NODE_PATH}`
        : vendorPath,
      PORT: String(port),
    },
    stdio: ["ignore", "ignore", "pipe"],
    windowsHide: true,
  });

  let startupError = "";
  serverProcess.stderr.on("data", (chunk) => { startupError += chunk.toString(); });
  serverProcess.on("exit", (code) => {
    if (code && !isQuitting) startupError += `\nServer exited with code ${code}.`;
  });

  try {
    await waitForServer(origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${message}${startupError ? `\n\n${startupError.slice(-1200)}` : ""}`);
  }
  return origin;
}

function createWindow(origin) {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 920,
    minHeight: 680,
    show: false,
    backgroundColor: "#f3f5f4",
    icon: path.join(__dirname, "assets", "icon.png"),
    title: "UK Visitor Visa Agent",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.removeMenu();
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(origin)) shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(origin)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.loadURL(origin);
}

function stopServer() {
  if (serverProcess && !serverProcess.killed) serverProcess.kill();
  serverProcess = undefined;
}

const hasLock = app.requestSingleInstanceLock();
if (!hasLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      const origin = await startLocalServer();
      createWindow(origin);
    } catch (error) {
      dialog.showErrorBox(
        "UK Visitor Visa Agent could not start",
        error instanceof Error ? error.message : String(error),
      );
      app.quit();
    }
  });
}

app.on("before-quit", () => {
  isQuitting = true;
  stopServer();
});
app.on("window-all-closed", () => app.quit());
