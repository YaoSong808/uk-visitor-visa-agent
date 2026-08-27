import { access, cp, mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");
const output = path.join(root, "dist", "desktop-server");

await access(path.join(standalone, "server.js"));
await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });
await cp(standalone, output, { recursive: true });
await rename(path.join(output, "node_modules"), path.join(output, "vendor"));
await cp(path.join(root, "public"), path.join(output, "public"), { recursive: true });
await mkdir(path.join(output, ".next"), { recursive: true });
await cp(path.join(root, ".next", "static"), path.join(output, ".next", "static"), { recursive: true });

console.log(`Desktop server prepared at ${output}`);
