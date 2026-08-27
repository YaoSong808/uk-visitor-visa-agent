# UK Visitor Visa Agent

一生在办签证的猪肝红！

面向中国申请人的英国 Standard Visitor visa 材料准备工具。它能检查日期、行程、资金和资助关系，读取佐证材料，并生成风险提示、材料清单和英文解释信草稿。

> [!IMPORTANT]
> 这是材料准备工具，不是移民律师，不预测或保证获签。付费、最终声明、提交和生物信息预约必须由申请人亲自完成。

![安全设置和 API Key 输入页面](./public/screenshots/01-secure-start.jpg)

## 不会命令行？直接这样用

### 方式一：Windows 双击版

1. 打开 [最新版下载页面](https://github.com/YaoSong808/uk-visitor-visa-agent/releases/latest)。
2. 下载其中一个文件：
   - `UK-Visitor-Visa-Agent-Setup-...exe`：安装版，适合长期使用。
   - `UK-Visitor-Visa-Agent-Portable-...exe`：免安装版，下载后直接打开。
3. 启动程序，输入自己的 OpenAI API Key。
4. 按左侧顺序填写信息、上传材料，然后点击 **开始 AI 审查**。

不需要安装 Node.js，不需要运行 `npm install`，也不需要自己租服务器。应用只在你的电脑上启动本地页面；真正开始 AI 审查时，所选材料会随本次请求发送到 OpenAI API。

> [!CAUTION]
> 当前个人开源版本没有购买代码签名证书，Windows 可能显示“未知发布者”。请只从本仓库的 Releases 下载；不能确认来源时不要运行。

### 方式二：Codex Skill

已经使用 Codex 的用户，可以把下面这句话直接发给 Codex：

```text
请安装这个 Skill：https://github.com/YaoSong808/uk-visitor-visa-agent/tree/main/skills/uk-visitor-visa-prep
```

安装后，把材料放在一个文件夹里，再说：

```text
请使用 $uk-visitor-visa-prep 检查这个文件夹中的英国旅游签证材料，从材料盘点和事实台账开始，不要修改原件。
```

Skill 会按照固定流程盘点文件、核对申请表数字、检查资助关系、准备行程与解释信，并把新文件放进单独的 `Generated/` 文件夹。它不会代替申请人登录 UKVI、付款或提交。

Skill 源码位于 [`skills/uk-visitor-visa-prep`](./skills/uk-visitor-visa-prep)，也可以在 [Releases](https://github.com/YaoSong808/uk-visitor-visa-agent/releases/latest) 下载独立 ZIP。

## 7 步使用教程

### 第 1 步：准备材料

| 建议准备 | 用来做什么 |
| --- | --- |
| 护照和申请地合法居留证明 | 核对身份与居留有效期 |
| 拟旅行日期、城市和住宿计划 | 检查行程是否可信且前后一致 |
| UKVI 已填写或已提交的申请表 | 作为姓名、日期和金额的主要核对依据 |
| 申请人近期银行流水 | 说明可用资金及资金来源 |
| 资助人流水、收入和关系证明 | 说明资助内容、关系和支付能力 |
| 在读、在职或其他个人情况材料 | 说明申请人会在访问结束后离开英国 |
| 非英文或威尔士文材料的完整翻译 | 便于 UKVI 独立核验 |

酒店和机票预订单本身通常不是有力的个人情况或资金证明。没有实际预订时，写清楚 **intended accommodation**，不要声称已经付款或确认。

### 第 2 步：输入 API Key

1. 登录 [OpenAI API Platform](https://platform.openai.com/)。
2. 创建 API Key，并设置账单和使用限额。
3. 把 Key 填入本地应用，阅读并勾选数据处理确认。

API Key 会产生 API 使用费用。它不是 ChatGPT 会员密码，也不是 UKVI 密码。不要把 Key 发给他人、截图公开或写进 GitHub。

没有 API Key 时，可以点击首页的 **“暂时没有 API Key？先看示例审查结果”**；这不会调用 API。

### 第 3 步：填写申请人和旅行信息

严格按护照和申请表填写姓名、出生日期、护照信息、申请地身份、入境和离境日期、城市、活动及拟住宿地点。

在香港或其他非国籍地申请时，应填写真实的当地合法身份及其有效期。不要根据卡片外观猜测日期，应以对应签证、电子签证、入境许可或官方身份文件为准。

### 第 4 步：填写全部金额

依次填写预计旅行总费用、申请人支付金额、资助人支付金额、每月收入或家庭支持、日常支出和需要解释的大额交易。

同一个数字必须在 UKVI 表格、流水说明、资助信和 cover letter 中保持一致。家庭支持不是工资，账户之间的内部转账也不是新收入。不确定时先留空，不要猜。

### 第 5 步：上传材料

进入 **材料** 页面，选择 PDF、JPG 或 PNG：

- 每次最多 8 份，每份不超过 10 MB。
- 文件名应直接说明内容，例如 `Applicant_Bank_Statement.pdf`。
- 原件、翻译件和标注件要区分清楚。
- 不要上传 UKVI 密码、验证码、银行密码或信用卡完整信息。

### 第 6 步：运行审查

进入 **审查结果**，先修正本地预检发现的日期和金额问题，再点击 **开始 AI 审查**。

![AI 案件审查结果](./public/screenshots/02-review-result.jpg)

按这个顺序处理结果：

1. 补齐 `missing` 项。
2. 处理姓名、日期、币种、金额、资助关系和账户归属冲突。
3. 解释有证据支持的大额入账和资金来源。
4. 替换所有 `[TO CONFIRM: ...]`，删除无法证明的句子。
5. 修改资料后重新审查。

Readiness 分数只表示信息和材料完整度，不是获签概率。

### 第 7 步：亲自核对并提交

下载案件 JSON 并保存审查结果，然后前往 [GOV.UK Standard Visitor visa 申请页](https://www.gov.uk/standard-visitor/apply-standard-visitor-visa)，由申请人亲自完成：

1. 核对最终申请表。
2. 阅读并接受声明。
3. 付款。
4. 按申请系统当日指引上传材料。
5. 预约并前往签证申请中心提供生物信息。

## 常见问题

### 会自动提交签证吗？

不会。项目不接收 UKVI 密码，不自动付款、接受声明、提交申请或预约生物信息。

### 上传的材料会保存吗？

当前应用没有数据库，不会由应用代码把材料写入服务器磁盘。点击 AI 审查后，材料会随当前请求发送到 OpenAI API；请同时阅读适用于自己 API 账户的数据政策。

### 适用于所有英国签证吗？

不适用。当前只面向 Standard Visitor 材料准备，不应用于工作、学生、家庭、定居或庇护类申请。

## 开发者运行

需要 Node.js 20 或更高版本：

```bash
git clone https://github.com/YaoSong808/uk-visitor-visa-agent.git
cd uk-visitor-visa-agent
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。可选地通过环境变量调整模型：

```bash
OPENAI_MODEL=gpt-5.4 npm run dev
```

运行检查和桌面打包准备：

```bash
npm test
npm run lint
npm run build
npm run desktop:prepare
```

Windows `.exe` 由 [GitHub Actions](./.github/workflows/build-windows.yml) 构建。推送 `v*` 标签时，安装版、免安装版和 Skill ZIP 会自动发布到 Releases。

## 安全边界

- API Key 不写入 localStorage、Cookie 或项目日志。
- OpenAI 请求设置 `store: false`。
- 应用不使用数据库，不保存上传材料。
- 公共托管前必须增加用户隔离、身份验证、限流、恶意文件检测、隐私政策和数据保留政策。

详细威胁模型见 [SECURITY.md](./SECURITY.md)。

## 官方依据

- [Standard Visitor overview](https://www.gov.uk/standard-visitor)
- [Apply for a Standard Visitor visa](https://www.gov.uk/standard-visitor/apply-standard-visitor-visa)
- [Visiting the UK: supporting documents](https://www.gov.uk/government/publications/visitor-visa-guide-to-supporting-documents/guide-to-supporting-documents-visiting-the-uk)
- [Immigration Rules Appendix V: Visitor](https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-v-visitor)
- [OpenAI Responses API](https://developers.openai.com/api/reference/typescript/resources/beta/subresources/responses/methods/create)

签证费用、处理时间、文件要求和申请流程会变化。提交前应以 GOV.UK 当日内容为准。

## 作者与许可证

Author: [YaoSong808](https://github.com/YaoSong808)

MIT
