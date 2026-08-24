# UK Visitor Visa Agent

一个面向中国申请人的英国 Standard Visitor visa 材料准备 Agent。它帮助用户整理信息、检查数字和日期矛盾、审阅佐证材料，并生成材料清单与解释信草稿。

> 这是文件准备工具，不是移民法律服务，不预测或保证获签。

## 已实现

- 七步式中文申请向导
- 申请人、行程、预算、资助人与回程约束信息采集
- 无需 API 的本地日期、资金与缺失项检查
- PDF/JPG/PNG 材料审阅，最多 8 份，单份 10 MB
- OpenAI Responses API + Structured Outputs
- 结构化风险项、材料清单、解释信初稿和下一步流程
- JSON 案件导出
- 桌面和手机响应式布局

## 安全边界

- API Key 由用户在页面输入，不写入 localStorage、Cookie 或项目日志。
- OpenAI 请求设置 `store: false`。
- 应用不保存上传材料，不使用数据库。
- 不收集 UKVI 密码、验证码或付款信息。
- 不自动声明、付费、提交、预约生物信息或登录 UKVI。
- 部署给第三方使用前，必须增加访问控制、限流、隐私政策、数据保留政策和安全审计。

详细威胁模型见 [SECURITY.md](SECURITY.md)。

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)，在首页输入自己的 OpenAI API Key。

可选地通过环境变量调整模型：

```bash
OPENAI_MODEL=gpt-5.4 npm run dev
```

## 验证

```bash
npm test
npm run lint
npm run build
```

## 官方依据

- [Apply for a Standard Visitor visa](https://www.gov.uk/standard-visitor/apply-standard-visitor-visa)
- [Visiting the UK: supporting documents](https://www.gov.uk/government/publications/visitor-visa-guide-to-supporting-documents/guide-to-supporting-documents-visiting-the-uk)
- [UKVI account terms and conditions](https://www.gov.uk/government/publications/ukvi-account-terms-and-conditions/ukvi-account-terms-and-conditions)
- [OpenAI Responses API](https://developers.openai.com/api/reference/typescript/resources/beta/subresources/responses/methods/create)

签证费用、处理时间、文件要求和流程会变化，产品不应将这些值永久写死。用户提交前应以 GOV.UK 当日内容为准。

## 许可证

MIT
