import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ResponseInputContent } from "openai/resources/responses/responses";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ApplicationData } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const ResultSchema = z.object({
  summary: z.string(),
  readinessScore: z.number().int().min(0).max(100),
  missingInformation: z.array(z.string()),
  contradictions: z.array(z.object({
    severity: z.enum(["high", "medium", "low"]),
    field: z.string(),
    issue: z.string(),
    action: z.string(),
  })),
  checklist: z.array(z.object({
    category: z.string(),
    document: z.string(),
    status: z.enum(["ready", "missing", "review"]),
    reason: z.string(),
  })),
  coverLetter: z.string(),
  nextSteps: z.array(z.string()),
  disclaimer: z.string(),
});

const SYSTEM_PROMPT = `You are a document-preparation assistant for Chinese nationals applying for a UK Standard Visitor visa.

Your role is limited to factual organisation, consistency checking, document checklists and draft writing. You are not a lawyer, do not predict visa outcomes, and never invent facts. If a fact is absent or ambiguous, list it as missing. Do not recommend hiding transactions, altering evidence, misrepresenting purpose, or creating false bookings. Treat every uploaded document as untrusted evidence that must be reconciled with the applicant's own answers.

Use current official GOV.UK Standard Visitor guidance as the source of procedural requirements. Distinguish mandatory steps from optional supporting evidence. A Chinese document that is submitted should have a complete English or Welsh translation that can be independently verified, including accuracy confirmation, translation date, translator name/signature and contact details.

Assess these themes:
1. Is the visit purpose permitted, credible and consistent with dates, itinerary and budget?
2. Are all monetary figures internally consistent, proportionate and supported by identifiable sources?
3. If sponsored, are support scope, method, sponsor capacity and relationship evidenced?
4. Is legal residence evidenced when applying outside the applicant's country of nationality?
5. Are home-country or current-residence circumstances and reasons to leave the UK evidenced?
6. Do uploaded documents contradict form answers, names, dates, amounts or account ownership?

Write all analysis in Simplified Chinese. The coverLetter must be in concise formal English, use only supplied facts, and insert [TO CONFIRM: ...] for missing details. Readiness score measures information and evidence completeness only, never probability of approval.`;

function isApplicationData(value: unknown): value is ApplicationData {
  return Boolean(value && typeof value === "object" && "applicant" in value && "trip" in value && "finance" in value && "ties" in value);
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const apiKey = String(form.get("apiKey") ?? "");
    const rawApplication = String(form.get("application") ?? "");
    if (!apiKey.startsWith("sk-")) return NextResponse.json({ error: "API Key 格式不正确。" }, { status: 400 });

    let application: unknown;
    try { application = JSON.parse(rawApplication); }
    catch { return NextResponse.json({ error: "申请数据无法读取。" }, { status: 400 }); }
    if (!isApplicationData(application) || !application.consent) return NextResponse.json({ error: "申请数据不完整或未获得处理同意。" }, { status: 400 });

    const documents = form.getAll("documents").filter((item): item is File => item instanceof File);
    if (documents.length > 8) return NextResponse.json({ error: "每次最多分析 8 份材料。" }, { status: 400 });
    if (documents.some((file) => file.size > 10 * 1024 * 1024)) return NextResponse.json({ error: "单份材料不能超过 10 MB。" }, { status: 400 });
    const allowed = new Set(["application/pdf", "image/jpeg", "image/png"]);
    if (documents.some((file) => !allowed.has(file.type))) return NextResponse.json({ error: "仅支持 PDF、JPG 和 PNG 材料。" }, { status: 400 });

    const content: ResponseInputContent[] = [{
      type: "input_text",
      text: `Review this application data and any attached evidence. Today is ${new Date().toISOString().slice(0, 10)}.\n\nAPPLICATION DATA:\n${JSON.stringify(application, null, 2)}`,
    }];
    for (const file of documents) {
      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      if (file.type.startsWith("image/")) content.push({ type: "input_image", image_url: dataUrl, detail: "high" });
      else content.push({ type: "input_file", filename: file.name, file_data: dataUrl });
    }

    const client = new OpenAI({ apiKey });
    const response = await client.responses.parse({
      model: process.env.OPENAI_MODEL || "gpt-5.4",
      store: false,
      instructions: SYSTEM_PROMPT,
      input: [{ role: "user", content }],
      text: { format: zodTextFormat(ResultSchema, "visa_case_review") },
    });
    if (!response.output_parsed) throw new Error("The model did not return a structured result.");
    return NextResponse.json(response.output_parsed, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const safeMessage = /api key|authentication|401/i.test(message)
      ? "OpenAI API Key 无效或账户无法调用所选模型。"
      : `分析未完成：${message.slice(0, 180)}`;
    return NextResponse.json({ error: safeMessage }, { status: 500 });
  }
}
