"use client";

import {
  AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, Download,
  ExternalLink, FileText, KeyRound, Loader2, LockKeyhole, Plane, Plus,
  ShieldCheck, Sparkles, Trash2, UploadCloud, UserRound, WalletCards,
} from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { runLocalChecks } from "@/lib/checks";
import { AgentResult, ApplicationData, EMPTY_APPLICATION, TripStop } from "@/lib/types";

const STEPS = [
  ["安全设置", KeyRound], ["申请人", UserRound], ["旅行计划", Plane],
  ["资金情况", WalletCards], ["回国约束", ShieldCheck], ["材料", FileText],
  ["审查结果", CheckCircle2],
] as const;
const INPUT = "mt-2 w-full rounded-md border border-[#c9d0d6] bg-white px-3 py-2.5 text-[15px] text-[#18232c] outline-none transition focus:border-[#146c5a] focus:ring-2 focus:ring-[#146c5a]/15";
const DEMO_RESULT: AgentResult = {
  summary: "申请人的旅行目的和行程基本清晰，但资助金额、资助人收入证明和返程约束材料仍需补充。建议在提交前对照申请表再做一次数字与日期核对。",
  readinessScore: 72,
  missingInformation: ["资助人近期收入和银行流水", "申请人返回后的学业或工作安排证明", "拟住宿酒店名称或所在区域"],
  contradictions: [{ severity: "medium", field: "旅行费用", issue: "预计总费用与资助声明中的金额尚未完全对应。", action: "统一申请表、资助信和解释信中的金额与币种。" }],
  checklist: [
    { category: "身份", document: "有效护照", status: "ready", reason: "请提供资料页及相关出入境记录。" },
    { category: "资金", document: "申请人银行流水", status: "review", reason: "需要说明家庭每月转账的性质与用途。" },
    { category: "资助", document: "资助信与关系证明", status: "missing", reason: "说明资助范围、支付方式及双方关系。" },
  ],
  coverLetter: "Dear Entry Clearance Officer,\n\nI am applying for a Standard Visitor visa for a short tourism trip to the United Kingdom. The purpose of my visit is sightseeing and visiting museums and historic landmarks.\n\nThe estimated cost of my trip is [TO CONFIRM: amount]. My father will provide financial support for [TO CONFIRM: flights/accommodation/daily expenses], while I will also use my personal savings. Supporting bank statements and evidence of our relationship are included.\n\nI will return after the visit because [TO CONFIRM: study, employment or other evidenced commitment].\n\nYours faithfully,\n[Applicant name]",
  nextSteps: ["补充资助人流水、收入证明及身份证明", "统一所有文件中的旅行日期、总费用和资助金额", "补全非英文材料的可独立验证英文翻译", "亲自核对申请表后再前往 GOV.UK 提交"],
  disclaimer: "此结果仅用于材料准备，不是法律意见或获签预测。",
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-[#293740]">{label}{children}{hint && <span className="mt-1.5 block text-xs font-normal text-[#66747d]">{hint}</span>}</label>;
}
function Title({ title, description }: { title: string; description: string }) {
  return <div className="mb-7 border-b border-[#dfe4e7] pb-5"><h1 className="text-2xl font-semibold text-[#15242c]">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#607079]">{description}</p></div>;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [data, setData] = useState<ApplicationData>(EMPTY_APPLICATION);
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const localChecks = useMemo(() => runLocalChecks(data), [data]);
  const completed = useMemo(() => [
    apiKey.startsWith("sk-") && data.consent,
    Boolean(data.applicant.fullName && data.applicant.nationality && data.applicant.currentCountry),
    Boolean(data.trip.arrivalDate && data.trip.departureDate && data.trip.purpose),
    Boolean(data.finance.estimatedCost && (data.finance.personalFunds || data.finance.sponsorName)),
    Boolean(data.ties.summary || data.ties.status), files.length > 0, Boolean(result),
  ], [apiKey, data, files, result]);

  function update<K extends keyof ApplicationData>(section: K, patch: Partial<ApplicationData[K]>) {
    setData((old) => ({ ...old, [section]: { ...(old[section] as object), ...patch } }));
  }
  function updateStop(index: number, patch: Partial<TripStop>) {
    update("trip", { stops: data.trip.stops.map((item, i) => i === index ? { ...item, ...patch } : item) });
  }
  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    setFiles((old) => [...old, ...Array.from(event.target.files ?? [])].slice(0, 8));
    event.target.value = "";
  }
  async function analyze() {
    setError("");
    if (!apiKey.startsWith("sk-")) { setError("请输入有效的 OpenAI API Key。"); setStep(0); return; }
    if (!data.consent) { setError("请先确认数据处理和人工审核条款。"); setStep(0); return; }
    setLoading(true); setStep(6);
    try {
      const body = new FormData();
      body.append("apiKey", apiKey); body.append("application", JSON.stringify(data));
      files.forEach((file) => body.append("documents", file));
      const response = await fetch("/api/analyze", { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "分析失败，请稍后重试。");
      setResult(payload);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "分析失败。"); }
    finally { setLoading(false); }
  }
  function downloadCase() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), application: data, result }, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "uk-visitor-visa-case.json"; link.click(); URL.revokeObjectURL(url);
  }

  return <div className="min-h-screen bg-[#f3f5f4] text-[#17242c]">
    <header className="border-b border-[#d8dedc] bg-[#0f493f] text-white"><div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between px-4 sm:px-7">
      <div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-md bg-white text-[#0f493f]"><Plane className="size-5" /></div><div><div className="font-semibold">UK Visitor Visa Agent</div><div className="text-xs text-white/70">中国申请人版 · MVP</div></div></div>
      <a className="hidden items-center gap-1.5 text-sm text-white/80 hover:text-white sm:flex" href="https://www.gov.uk/standard-visitor/apply-standard-visitor-visa" target="_blank" rel="noreferrer">GOV.UK 官方指南 <ExternalLink className="size-3.5" /></a>
    </div></header>
    <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] md:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_290px]">
      <aside className="min-w-0 border-r border-[#dce2df] bg-white px-4 py-6 md:min-h-[calc(100vh-65px)]"><nav className="flex min-w-0 gap-2 overflow-x-auto md:block md:space-y-1">
        {STEPS.map(([label, Icon], index) => <button key={label} type="button" onClick={() => setStep(index)} className={`flex min-w-max items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition md:w-full ${index === step ? "bg-[#e7f1ee] font-semibold text-[#0f5b4d]" : "text-[#5c6a72] hover:bg-[#f3f5f4]"}`}><span className={`grid size-6 place-items-center rounded-full ${completed[index] ? "bg-[#17715f] text-white" : "bg-[#edf0ef]"}`}>{completed[index] ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}</span>{label}</button>)}
      </nav><div className="mt-8 hidden border-t border-[#e1e5e3] pt-5 text-xs leading-5 text-[#6b777d] md:block"><LockKeyhole className="mb-2 size-4 text-[#17715f]" />密钥仅随当前分析请求发送，不会写入浏览器存储或项目日志。</div></aside>

      <main className="min-w-0 px-4 py-7 sm:px-8 lg:px-12"><div className="mx-auto max-w-3xl">
        {error && <div className="mb-5 flex gap-3 rounded-md border border-[#e4b8ad] bg-[#fff4f1] px-4 py-3 text-sm text-[#8a3427]"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{error}</div>}
        {step === 0 && <section><Title title="在本机开始你的签证案件" description="Agent 会从信息一致性、资金来源、回国约束力和材料完整性四个角度审查英国标准访客签证。" />
          <div className="rounded-md border border-[#d7ddda] bg-white p-5 sm:p-6"><div className="mb-5 flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-md bg-[#e6f1ee] text-[#13604f]"><KeyRound className="size-5" /></div><div><h2 className="font-semibold">OpenAI API Key</h2><p className="mt-1 text-sm text-[#68757c]">费用由你的 OpenAI 账户承担。</p></div></div>
            <Field label="API Key"><input className={INPUT} type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." autoComplete="off" /></Field>
            <div className="mt-5 rounded-md bg-[#f1f6f4] px-4 py-3 text-sm leading-6 text-[#43544e]"><strong>数据原则：</strong>默认不保存申请内容。材料仅在开始审查后发送给 OpenAI API，分析结束后不在本项目服务器留存。</div>
            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#3f4d54]"><input type="checkbox" checked={data.consent} onChange={(e) => setData({ ...data, consent: e.target.checked })} className="mt-1 size-4 accent-[#146c5a]" /><span>我同意处理填写的信息，并理解本工具不是移民律师、不保证获签，所有最终声明和提交必须由我亲自核对。</span></label>
            <button type="button" onClick={() => { setResult(DEMO_RESULT); setStep(6); }} className="mt-5 text-sm font-semibold text-[#155e50] underline decoration-[#155e50]/30 underline-offset-4 hover:decoration-[#155e50]">暂时没有 API Key？先看示例审查结果</button>
          </div></section>}

        {step === 1 && <section><Title title="申请人信息" description="姓名和证件信息请与护照完全一致。不确定的内容可留空，Agent 不会猜测。" /><div className="grid gap-5 sm:grid-cols-2">
          <Field label="护照英文姓名"><input className={INPUT} value={data.applicant.fullName} onChange={(e) => update("applicant", { fullName: e.target.value })} placeholder="LI MING" /></Field>
          <Field label="国籍"><input className={INPUT} value={data.applicant.nationality} onChange={(e) => update("applicant", { nationality: e.target.value })} /></Field>
          <Field label="出生日期"><input className={INPUT} type="date" value={data.applicant.dateOfBirth} onChange={(e) => update("applicant", { dateOfBirth: e.target.value })} /></Field>
          <Field label="护照号"><input className={INPUT} value={data.applicant.passportNumber} onChange={(e) => update("applicant", { passportNumber: e.target.value })} /></Field>
          <Field label="当前所在国家/地区"><input className={INPUT} value={data.applicant.currentCountry} onChange={(e) => update("applicant", { currentCountry: e.target.value })} placeholder="Hong Kong SAR" /></Field>
          <Field label="当地合法身份有效期" hint="如在非国籍地申请，通常需要证明合法居留权。"><input className={INPUT} type="date" value={data.applicant.residenceExpiry} onChange={(e) => update("applicant", { residenceExpiry: e.target.value })} /></Field>
          <Field label="婚姻状况"><select className={INPUT} value={data.applicant.maritalStatus} onChange={(e) => update("applicant", { maritalStatus: e.target.value })}><option value="">请选择</option><option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option></select></Field>
          <Field label="过去 10 年旅行概要"><input className={INPUT} value={data.applicant.travelHistory} onChange={(e) => update("applicant", { travelHistory: e.target.value })} placeholder="Japan x3, Australia x2..." /></Field>
        </div></section>}

        {step === 2 && <section><Title title="旅行计划" description="行程需要合理、可执行，与预算和申请表中的日期保持一致。" /><div className="grid gap-5 sm:grid-cols-2">
          <Field label="到达日期"><input className={INPUT} type="date" value={data.trip.arrivalDate} onChange={(e) => update("trip", { arrivalDate: e.target.value })} /></Field><Field label="离境日期"><input className={INPUT} type="date" value={data.trip.departureDate} onChange={(e) => update("trip", { departureDate: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="访问主要目的"><textarea className={`${INPUT} min-h-24 resize-y`} value={data.trip.purpose} onChange={(e) => update("trip", { purpose: e.target.value })} /></Field></div>
        </div><div className="mt-7 flex items-center justify-between"><h2 className="font-semibold">城市与住宿</h2><button type="button" onClick={() => update("trip", { stops: [...data.trip.stops, { city: "", activities: "", accommodation: "" }] })} className="flex items-center gap-1.5 text-sm font-semibold text-[#116351]"><Plus className="size-4" />添加城市</button></div>
          <div className="mt-3 space-y-3">{data.trip.stops.map((stop, index) => <div key={index} className="grid gap-3 border-b border-[#d9dfdc] bg-white p-4 sm:grid-cols-[.65fr_1.3fr_1fr_auto]"><input aria-label="城市" className={INPUT.replace("mt-2 ", "")} value={stop.city} onChange={(e) => updateStop(index, { city: e.target.value })} placeholder="London" /><input aria-label="活动" className={INPUT.replace("mt-2 ", "")} value={stop.activities} onChange={(e) => updateStop(index, { activities: e.target.value })} placeholder="British Museum, Westminster..." /><input aria-label="住宿" className={INPUT.replace("mt-2 ", "")} value={stop.accommodation} onChange={(e) => updateStop(index, { accommodation: e.target.value })} placeholder="Hotel name or area" /><button aria-label="删除这一站" type="button" onClick={() => update("trip", { stops: data.trip.stops.filter((_, i) => i !== index) })} className="grid size-10 place-items-center self-center rounded-md text-[#8a4a40] hover:bg-[#fff1ee]"><Trash2 className="size-4" /></button></div>)}</div>
        </section>}

        {step === 3 && <section><Title title="资金与资助" description="请填写真实的每月收入、现有资金、行程成本与资助来源，保持所有数字一致。" /><div className="grid gap-5 sm:grid-cols-2">
          <Field label="预计旅行总费用（GBP）"><input className={INPUT} inputMode="decimal" value={data.finance.estimatedCost} onChange={(e) => update("finance", { estimatedCost: e.target.value })} /></Field><Field label="可支配个人资金（GBP 等值）"><input className={INPUT} inputMode="decimal" value={data.finance.personalFunds} onChange={(e) => update("finance", { personalFunds: e.target.value })} /></Field>
          <Field label="每月个人收入（原币种）"><input className={INPUT} value={data.finance.monthlyIncome} onChange={(e) => update("finance", { monthlyIncome: e.target.value })} placeholder="HKD 8,000 family support" /></Field><Field label="每月必要支出（原币种）"><input className={INPUT} value={data.finance.monthlyExpenses} onChange={(e) => update("finance", { monthlyExpenses: e.target.value })} /></Field>
          <Field label="资助人姓名（如有）"><input className={INPUT} value={data.finance.sponsorName} onChange={(e) => update("finance", { sponsorName: e.target.value })} /></Field><Field label="与资助人的关系"><input className={INPUT} value={data.finance.sponsorRelationship} onChange={(e) => update("finance", { sponsorRelationship: e.target.value })} placeholder="Father" /></Field>
          <Field label="资助金额（GBP）"><input className={INPUT} value={data.finance.sponsorAmount} onChange={(e) => update("finance", { sponsorAmount: e.target.value })} /></Field><Field label="资助人年收入与币种"><input className={INPUT} value={data.finance.sponsorIncome} onChange={(e) => update("finance", { sponsorIncome: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="大额入账或特殊交易说明"><textarea className={`${INPUT} min-h-24`} value={data.finance.largeTransactions} onChange={(e) => update("finance", { largeTransactions: e.target.value })} placeholder="说明日期、金额、对方、用途和可佐证材料。" /></Field></div>
        </div></section>}

        {step === 4 && <section><Title title="个人情况与回程约束" description="说明你为什么会按时离开英国。只写可以用材料证明的事实。" /><div className="grid gap-5 sm:grid-cols-2">
          <Field label="当前身份"><select className={INPUT} value={data.ties.status} onChange={(e) => update("ties", { status: e.target.value })}><option value="">请选择</option><option>Student</option><option>Employed</option><option>Self-employed</option><option>Unemployed</option><option>Retired</option></select></Field><Field label="学校或单位"><input className={INPUT} value={data.ties.institution} onChange={(e) => update("ties", { institution: e.target.value })} /></Field>
          <Field label="返回后的重要日期"><input className={INPUT} type="date" value={data.ties.returnDate} onChange={(e) => update("ties", { returnDate: e.target.value })} /></Field><Field label="该日期对应的事项"><input className={INPUT} value={data.ties.returnCommitment} onChange={(e) => update("ties", { returnCommitment: e.target.value })} placeholder="Graduation, classes, work..." /></Field>
          <div className="sm:col-span-2"><Field label="家庭、学业、工作、资产或其他约束"><textarea className={`${INPUT} min-h-28`} value={data.ties.summary} onChange={(e) => update("ties", { summary: e.target.value })} placeholder="说明可验证的联系，以及对应证明材料。" /></Field></div>
        </div></section>}

        {step === 5 && <section><Title title="上传佐证材料" description="支持 PDF、JPG 和 PNG，最多 8 份，每份不超过 10 MB。不要上传密码、短信验证码或 UKVI 登录凭证。" />
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-[#b9c7c2] bg-white px-5 text-center transition hover:border-[#3d806f] hover:bg-[#f7faf9]"><UploadCloud className="size-8 text-[#176451]" /><span className="mt-3 font-semibold">选择材料</span><span className="mt-1 text-sm text-[#68757c]">例如护照、居留许可、在读/在职证明、流水和资助证明</span><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={addFiles} className="sr-only" /></label>
          <div className="mt-4 space-y-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center gap-3 border-b border-[#d9dfdc] bg-white px-4 py-3"><FileText className="size-4 text-[#176451]" /><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{file.name}</div><div className="text-xs text-[#728087]">{(file.size / 1024 / 1024).toFixed(2)} MB</div></div><button type="button" aria-label={`删除 ${file.name}`} onClick={() => setFiles(files.filter((_, i) => i !== index))} className="text-[#895047]"><Trash2 className="size-4" /></button></div>)}</div>
        </section>}

        {step === 6 && <section><Title title="案件审查结果" description="这些是决策前的材料质量提示，不是获签预测或法律意见。" />
          {loading ? <div className="grid min-h-64 place-items-center border border-[#d7ddda] bg-white text-center"><div><Loader2 className="mx-auto size-8 animate-spin text-[#176451]" /><div className="mt-4 font-semibold">正在核对申请信息与材料…</div></div></div> : result ? <Result result={result} onDownload={downloadCase} /> : <div className="border border-[#d7ddda] bg-white p-6"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 size-5 text-[#176451]" /><div><h2 className="font-semibold">准备生成完整审查</h2><p className="mt-1 text-sm leading-6 text-[#68757c]">已在本地发现 {localChecks.length} 项需注意内容。Agent 将结合材料生成清单、风险点和文书草稿。</p></div></div>{localChecks.length > 0 && <ul className="mt-4 space-y-2 text-sm text-[#73533d]">{localChecks.map((item) => <li key={item.code} className="flex gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{item.message}</li>)}</ul>}<button type="button" onClick={analyze} className="mt-6 flex items-center gap-2 rounded-md bg-[#155e50] px-5 py-3 text-sm font-semibold text-white hover:bg-[#104b40]"><Sparkles className="size-4" />开始 AI 审查</button></div>}
        </section>}

        <div className="mt-9 flex items-center justify-between border-t border-[#d8dedb] pt-5"><button type="button" disabled={step === 0} onClick={() => setStep((v) => Math.max(0, v - 1))} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-[#506069] disabled:opacity-30"><ArrowLeft className="size-4" />上一步</button>{step < 6 ? <button type="button" onClick={() => setStep((v) => Math.min(6, v + 1))} className="flex items-center gap-2 rounded-md bg-[#155e50] px-4 py-2.5 text-sm font-semibold text-white">下一步<ArrowRight className="size-4" /></button> : !result && !loading ? <button type="button" onClick={analyze} className="flex items-center gap-2 rounded-md bg-[#155e50] px-4 py-2.5 text-sm font-semibold text-white"><Sparkles className="size-4" />开始审查</button> : null}</div>
      </div></main>

      <aside className="hidden border-l border-[#dce2df] bg-[#f8faf9] px-5 py-7 xl:block"><h2 className="text-sm font-semibold">当前案件</h2><div className="mt-4 border border-[#d8dfdc] bg-white p-4"><div className="flex items-center justify-between text-sm"><span className="text-[#65737a]">完成度</span><strong>{completed.filter(Boolean).length}/7</strong></div><div className="mt-3 h-2 rounded-full bg-[#e7ebe9]"><div className="h-full rounded-full bg-[#1c7865]" style={{ width: `${completed.filter(Boolean).length / 7 * 100}%` }} /></div></div><div className="mt-5 text-xs font-semibold uppercase text-[#6a777d]">本地预检</div><div className={`mt-2 flex items-start gap-2 px-3 py-3 text-sm ${localChecks.length ? "bg-[#fff4e9] text-[#795134]" : "bg-[#eaf4f0] text-[#23604f]"}`}>{localChecks.length ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}{localChecks.length ? `已发现 ${localChecks.length} 项待核对内容` : "未发现明显矛盾"}</div><div className="mt-6 border-t border-[#dde3e0] pt-5 text-xs leading-5 text-[#69767c]"><strong className="text-[#394850]">人工确认点</strong><p className="mt-2">Agent 不会自动付费、声明、提交、预约指纹或登录 UKVI 账号。</p></div></aside>
    </div>
  </div>;
}

function Result({ result, onDownload }: { result: AgentResult; onDownload: () => void }) {
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-[160px_1fr]"><div className="bg-[#124e43] p-5 text-white"><div className="text-xs uppercase text-white/70">Readiness</div><div className="mt-2 text-4xl font-semibold">{result.readinessScore}<span className="text-base text-white/70">/100</span></div></div><div className="border border-[#d7ddda] bg-white p-5"><h2 className="font-semibold">案件摘要</h2><p className="mt-2 text-sm leading-6 text-[#526169]">{result.summary}</p></div></div>
    <List title="需要补充" items={result.missingInformation} />
    <div className="border border-[#d7ddda] bg-white p-5"><h2 className="font-semibold">一致性问题</h2><div className="mt-3 space-y-3">{result.contradictions.length ? result.contradictions.map((item, i) => <div key={i} className="border-l-2 border-[#bd6a42] pl-3"><div className="text-sm font-semibold">{item.field} · {item.severity}</div><p className="mt-1 text-sm text-[#5d6970]">{item.issue}</p><p className="mt-1 text-sm text-[#176451]">建议：{item.action}</p></div>) : <p className="text-sm text-[#68757c]">未发现明显矛盾。</p>}</div></div>
    <div className="border border-[#d7ddda] bg-white p-5"><h2 className="font-semibold">材料清单</h2><div className="mt-3 divide-y divide-[#e4e8e6]">{result.checklist.map((item, i) => <div key={i} className="grid gap-1 py-3 text-sm sm:grid-cols-[120px_1fr_90px]"><span className="text-[#68757c]">{item.category}</span><span><strong>{item.document}</strong><span className="mt-1 block text-xs font-normal text-[#6d7a80]">{item.reason}</span></span><span className="text-[#176451]">{item.status}</span></div>)}</div></div>
    <div className="border border-[#d7ddda] bg-white p-5"><h2 className="font-semibold">解释信初稿</h2><pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-7 text-[#46555d]">{result.coverLetter}</pre></div><List title="下一步" items={result.nextSteps} />
    <button type="button" onClick={onDownload} className="flex items-center gap-2 rounded-md bg-[#155e50] px-4 py-2.5 text-sm font-semibold text-white"><Download className="size-4" />下载案件 JSON</button></div>;
}
function List({ title, items }: { title: string; items: string[] }) { return <div className="border border-[#c7ded6] bg-[#f4faf7] p-5"><h2 className="font-semibold">{title}</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-[#536169]">{items.map((item, i) => <li key={i} className="flex gap-2"><CheckCircle2 className="mt-1 size-4 shrink-0 text-[#17715f]" />{item}</li>)}</ul></div>; }
