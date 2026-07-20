# Brainrot AI Platform V1 — Product Requirements Document

> 文档状态：Draft for implementation  
> 版本：1.0  
> 日期：2026-07-15  
> 目标市场：美国英语用户  
> 产品阶段：正式可收费 V1，不按 MVP 范围交付

## 1. 执行摘要

本项目要建设一个完整的 AI Brainrot 内容生成平台。用户可以从文本、PDF 或 Italian Brainrot 角色创意出发，完成脚本生成、角色或素材生成、AI 配音、字幕、视频渲染、项目保存、付费和导出。

首发不是若干互不相干的小工具，而是一个共享账户、共享积分、共享项目系统和共享生成管线的平台。SEO 页面是不同搜索意图的入口，最终进入同一个工作台。

首发公开页面：

1. `/` — AI Brainrot Video Generator 首页
2. `/italian-brainrot-generator`
3. `/italian-brainrot-voice-generator`
4. `/pdf-to-brainrot`
5. `/text-to-brainrot`

首发应用页面：

1. `/login`
2. `/app`
3. `/app/projects/[projectId]`
4. `/app/billing`
5. `/app/account`
6. `/pricing`

首发必须完成完整商业闭环：

```text
搜索/社交流量
  → 对应功能页
  → 配置生成参数
  → 登录/注册
  → 创建项目
  → AI 生成与渲染
  → 预览
  → 支付或消耗积分
  → 下载/分享
  → 项目历史与再次生成
```

## 2. 第一性原理与产品原则

### 2.1 第一性原理

用户购买的不是“AI”或“Brainrot”概念，而是以下结果：

- 更快得到一条能发布的短视频
- 把无聊文本或 PDF 变成更容易消费的内容
- 得到具有传播性的角色、声音和模板
- 不学习专业剪辑软件也能完成导出

因此产品价值应衡量为：

```text
节省的创作时间
× 输出质量
× 发布成功率
× 重复使用频率
− 学习成本
− 等待时间
− 生成失败成本
```

### 2.2 产品原则

- 一个核心生成引擎，多个搜索入口。
- 用户在首屏就能理解输入什么、得到什么。
- 生成前展示预计积分、时长和输出规格。
- 生成失败必须自动退还积分。
- 不隐藏错误，不让用户在无反馈状态下等待。
- 不首发完整时间线剪辑器；提供必要的场景、字幕和声音编辑能力。
- 不为尚未出现的需求增加团队协作、API、移动 App 等复杂功能。
- 所有公开 SEO 页面必须有真实可用工具，不能是只有营销文案的伪工具页。

## 3. 市场依据与关键词映射

数据口径：Semrush US Desktop，2026-07-15。

| 页面 | 主关键词 | 月搜索量 | KD | 页面角色 |
|---|---|---:|---:|---|
| `/` | ai brainrot | 3,600 | 50 | 品牌与长期战略入口 |
| `/` | brainrot video generator | 480 | 47 | 首页产品意图 |
| `/italian-brainrot-generator` | italian brainrot generator | 2,900 | 18 | 高流量角色/内容生成入口 |
| `/italian-brainrot-voice-generator` | italian brainrot voice generator | 320 | 6 | 低竞争、高匹配的 Voice/TTS 入口 |
| `/italian-brainrot-voice-generator` | italian brainrot voice | 480 | 25 | Voice 页面词群 |
| `/pdf-to-brainrot` | pdf to brainrot | 2,400 | 24 | 高商业价值学习/内容转换入口 |
| `/text-to-brainrot` | text to brainrot | 590 | 45 | 创作者重复使用入口 |

页面合并规则：

- `brainrot pdf`、`pdf brainrot`、`pdf to brainrot free` 合并到 `/pdf-to-brainrot`。
- `italian brainrot voice`、`brainrot text to speech`、`italian brainrot text to speech` 合并到 Voice 页面。
- `ai brainrot generator`、`ai brainrot video generator`、`brainrot video generator` 合并到首页。
- 不为同一搜索意图创建多个相似页面。

## 4. 产品目标与非目标

### 4.1 V1 产品目标

- 用户能够完成从输入到可下载输出的完整生成流程。
- 支持文本、PDF、Italian Brainrot 角色、Italian Voice 四类核心任务。
- 支持账户、积分、订阅、一次性充值、项目保存和历史记录。
- 支持可编辑的脚本、场景、字幕、声音和模板。
- 支持 9:16 短视频预览和导出。
- 所有核心页面具备完整 SEO、结构化数据和真实案例。
- 管理员能够查看用户、支付、任务、成本、失败和退款。
- 建立可追踪的访问、激活、生成、付费和留存数据。

### 4.2 V1 非目标

- 不做 Premiere/CapCut 级完整时间线编辑器。
- V1 不做用户上传声音的 Voice Cloning；该能力属于验证普通 TTS、付费和合规流程后的后续扩展。
- 不做多人团队空间和协作审批。
- 不做开发者 API。
- 不做原生 iOS/Android App。
- 不做多域名拆分。
- 不做大规模程序化 SEO 页面。
- 不做无限生成套餐。
- 不做自动发布到 TikTok、YouTube 或 Instagram。
- 不承诺复制或冒充真实人物、受保护角色的声音和形象。

## 5. 目标用户与 Jobs To Be Done

### 5.1 Shorts 创作者

目标：快速产生可发布的 TikTok、YouTube Shorts 和 Reels 内容。

核心任务：

- 把一个创意或脚本变成完整短视频。
- 快速测试不同 Hook、声音和模板。
- 批量保存项目并重复生成。

### 5.2 学生和学习内容用户

目标：把 PDF、课堂笔记或长文本变成更容易观看的学习视频。

核心任务：

- 上传文件并自动提取重点。
- 控制总结程度和视频长度。
- 获得字幕清晰、结构准确的视频。

### 5.3 Italian Brainrot 娱乐用户

目标：生成角色、名字、台词、声音和可分享视频。

核心任务：

- 输入动物、物品和性格描述。
- 得到有一致视觉与声音风格的角色。
- 下载或分享生成结果。

### 5.4 Meme 与社交媒体运营者

目标：把趋势、评论或短文本快速转换为高注意力内容。

核心任务：

- 快速生成不同版本。
- 保持统一画面比例和字幕样式。
- 以低成本持续发布。

## 6. 产品定位与信息架构

### 6.1 一句话定位

> Turn text, PDFs and ideas into viral Brainrot videos with AI.

### 6.2 导航结构

公开站点主导航：

- Create
  - AI Brainrot Video
  - Italian Brainrot
  - PDF to Brainrot
  - Text to Brainrot
  - Brainrot Voice
- Templates
- Pricing
- My Projects
- Sign in / Credits

应用内导航：

- Projects
- Create New
- Templates
- Billing
- Account
- Help

### 6.3 统一页面关系

```text
公开 SEO 页面
  → 创建带预设模式的项目
  → /app/projects/[projectId]
  → 编辑脚本/场景/声音/模板
  → 渲染
  → 下载/分享
```

## 7. 用户权限与账户系统

### 7.1 未登录用户

可以：

- 浏览所有公开页面、案例、模板和定价。
- 在公开工具表单中填写参数。
- 预览静态示例和声音样例。
- 查看预计积分和输出规格。

不能：

- 提交正式视频生成任务。
- 上传私人 PDF 到长期处理队列。
- 保存项目或下载无水印结果。

当用户点击 Generate 时，保存当前表单草稿并进入登录流程。登录成功后恢复草稿并创建项目。

### 7.2 登录方式

V1 仅支持 Google OAuth。

- 不提供 Email magic link。
- 不提供邮箱密码注册。
- 不提供密码重置流程。
- Google 登录失败或用户取消授权时，必须返回原页面并保留未提交草稿。
- 账户唯一性以已验证的 Google Account ID 为主，不仅依赖邮箱字符串。

### 7.3 新用户权益

- 注册后获得一次性 Starter Credits。
- Starter Credits 应至少支持一次短视频或多次 Voice 试听。
- 同一设备、邮箱和支付身份应有基础防滥用限制。

### 7.4 账户页面

用户可以：

- 查看昵称、邮箱和登录方式。
- 查看剩余积分。
- 查看套餐和续费日期。
- 查看支付记录和发票链接。
- 取消订阅。
- 删除账户。
- 请求删除全部项目和上传文件。

## 8. 共享项目系统

### 8.1 项目类型

- `text_video`
- `pdf_video`
- `italian_character`
- `italian_voice`

### 8.2 项目状态

```text
draft
→ ready
→ queued
→ processing
→ rendering
→ completed

异常状态：failed / canceled
```

### 8.3 项目列表

`/app` 必须支持：

- 创建新项目
- 按类型筛选
- 按更新时间排序
- 显示缩略图、标题、状态、更新时间
- 打开、复制、重命名、删除项目
- 对失败项目执行 Retry
- 对完成项目执行 Download 或 Remix

### 8.4 自动保存

- 编辑内容自动保存。
- 保存失败时显示明确错误和重试按钮。
- 不允许在后台静默丢失用户修改。
- 用户离开有未保存变更的页面时应提示。

## 9. 共享生成管线

### 9.1 标准处理流程

1. 输入校验
2. 内容安全检查
3. PDF/OCR 或文本解析
4. 内容总结与脚本生成
5. 场景拆分
6. 角色、图片或背景素材生成/选择
7. TTS 配音
8. 字幕时间轴生成
9. 视频合成与渲染
10. 输出文件存储
11. 项目状态更新
12. 邮件和站内完成通知

### 9.2 生成任务规则

- 提交前显示预计积分消耗。
- 提交时冻结对应积分。
- 成功后正式扣除积分。
- 系统失败自动退还全部冻结积分。
- 用户主动取消：未进入付费模型或渲染阶段时全退；已产生实际成本时按后台规则结算。
- 同一项目不能并发提交两个互相覆盖的最终渲染任务。
- 任务必须具备幂等键，避免重复扣费和重复渲染。

### 9.3 生成进度

前端显示可理解的阶段，而不是无限 Loading：

- Preparing content
- Writing script
- Creating voice
- Building scenes
- Rendering video
- Finalizing download

每个阶段显示状态；失败时显示失败阶段、原因和操作建议。

### 9.4 错误处理

必须处理：

- PDF 无法读取
- 加密或损坏 PDF
- 扫描 PDF OCR 失败
- 文本过长
- 内容审核拒绝
- 模型超时
- TTS 失败
- 图片生成失败
- 渲染失败
- 存储上传失败
- 支付成功但积分未到账
- Webhook 重复或乱序

所有真实错误应记录错误代码、任务 ID、提供商和成本信息。

## 10. 首页 `/`

### 10.1 页面目标

- 解释整个平台能力。
- 承接 `ai brainrot`、`brainrot video generator` 等长期关键词。
- 让用户立即创建普通 Brainrot 视频。
- 将用户导向 PDF、Italian、Voice 和 Text 专项页面。

### 10.2 首屏

首屏包含：

- H1：AI Brainrot Video Generator
- 一句话价值主张
- Text / PDF / Idea 三个入口 Tab
- 文本输入或上传入口
- 模板选择
- 视频时长选择
- Generate 按钮
- 一条真实视频结果预览
- 免费额度与是否有水印的清晰说明

### 10.3 页面模块

1. Generator Hero
2. Real Output Examples
3. Create from Text / PDF / Italian Character
4. Template Gallery
5. How It Works
6. Voice and Caption Options
7. Creator and Study Use Cases
8. Pricing Preview
9. Trust, Privacy and Copyright
10. FAQ
11. Final CTA

### 10.4 首页验收标准

- 用户可从首页创建 `text_video` 或 `pdf_video` 草稿。
- 未登录用户登录后恢复输入。
- 首页真实示例可播放且具备字幕。
- 所有专项页面在首页至少获得一次语义相关内链。
- 移动端首屏可以看到输入区和 Generate 按钮。

## 11. Italian Brainrot Generator

### 11.1 页面目标

承接 Italian Brainrot 角色生成意图，输出不应只有名字或文字，而应形成角色视觉、角色设定、声音和可选短视频。

### 11.2 输入项

- Character concept
- Animal/object combinations
- Personality
- Visual style preset
- Background/environment
- Output language
- Aspect ratio
- Video duration
- Voice preset
- Content safety acknowledgment

### 11.3 输出内容

- Character name
- Character image
- Short lore/description
- Catchphrase or narration
- Voice preview
- 9:16 animated/video output
- Download image
- Download video
- Remix to new project

### 11.4 编辑能力

- 修改角色名称和描述
- 重新生成图片
- 修改台词
- 更换声音
- 更换背景和字幕样式
- 重新渲染视频

### 11.5 版权与安全

- 不提供复制特定真实人物声音的能力。
- 不在官方模板中使用无授权的第三方角色素材。
- 趋势风格采用描述性预设，不承诺官方授权或完全复制。
- 用户生成内容需经过文本和图片安全检查。

### 11.6 页面验收标准

- 能从一个描述生成完整角色卡。
- 能生成并试听角色声音。
- 能将角色卡转换为短视频。
- 图片、音频和视频均保存到同一项目。
- 失败步骤可以单独重试，不要求重做所有步骤。

## 12. Italian Brainrot Voice Generator

### 12.1 页面目标

提供低摩擦的 Brainrot TTS 体验，并把 Voice 用户导入视频生成器。

### 12.2 输入项

- Text
- Voice preset
- Language/accent
- Speed
- Pitch
- Emotion/intensity

### 12.3 功能要求

- 选择至少 4 个可区分的 Voice Preset。
- 支持短文本快速试听。
- 支持完整音频生成。
- 支持 MP3 下载。
- 支持将音频发送到现有或新建视频项目。
- 显示文本长度和预计积分。
- 支持生成历史。

### 12.4 限制

- V1 不支持用户上传样本进行声音克隆。
- 对过长文本拆分或提示用户转入 Text to Brainrot。
- 防止重复快速请求造成滥用。

### 12.5 页面验收标准

- 用户能在一分钟内完成文本到音频。
- 播放器支持播放、暂停、进度和重新生成。
- 下载文件名包含项目名称和时间。
- Voice 结果可一键进入视频项目。

## 13. PDF to Brainrot

### 13.1 页面目标

把 PDF、笔记和学习材料转换为结构准确、可编辑、可发布的短视频。

### 13.2 上传要求

- 支持 PDF。
- 推荐上限：25 MB、200 页；最终上限由处理成本验证后配置。
- 支持文本 PDF。
- 支持扫描 PDF OCR。
- 明确提示不支持或需要密码的加密 PDF。
- 上传前显示隐私与删除政策。

### 13.3 输入参数

- Summary depth
- Video goal：Study / Explain / Quiz / Story
- Target audience
- Output language
- Duration
- Number of scenes
- Background template
- Voice
- Caption style

### 13.4 处理流程

1. 上传并校验
2. 提取文本/OCR
3. 显示识别结果摘要
4. 生成大纲
5. 生成场景脚本
6. 用户确认和编辑
7. 生成声音、字幕和视频

### 13.5 隐私要求

- 原始 PDF 默认在 24 小时内自动删除。
- 用户删除项目时立即进入删除队列。
- 不使用用户 PDF 训练模型。
- 日志不得记录完整 PDF 内容。
- 提供明确的 Privacy、Data Deletion 和 Security 说明。

### 13.6 页面验收标准

- 文本 PDF 和扫描 PDF 均有明确处理结果。
- 用户可查看并修正提取文本或大纲。
- 视频脚本必须可编辑后再渲染。
- 删除 PDF 后项目中的用户确认脚本和成品仍按用户选择保留。
- PDF 处理失败不扣除视频渲染积分。

## 14. Text to Brainrot

### 14.1 页面目标

把文章、故事、评论、脚本或创意转换为完整 Brainrot 短视频。

### 14.2 输入项

- Source text
- Goal/platform
- Tone
- Target audience
- Duration
- Hook style
- Template
- Voice
- Caption style
- Aspect ratio

### 14.3 脚本编辑器

必须支持：

- Hook 编辑
- 场景顺序调整
- 单场景文本修改
- 场景删除与新增
- 每个场景更换素材或背景
- 重新生成单个场景
- 字幕开关和样式
- 声音与速度调整

V1 不要求自由拖动的多轨时间线。

### 14.4 页面验收标准

- 用户可以从原文生成结构化场景。
- 用户可以修改脚本后再渲染。
- 单场景重生成不会覆盖其他已确认场景。
- 最终视频字幕和音频时间基本同步。

## 15. 模板系统

### 15.1 V1 模板类别

- Minecraft/Parkour-style background
- Gameplay background
- Satisfying/loop background
- Meme slideshow
- Italian character showcase
- Study explainer
- Quiz/reveal
- Story narration

模板素材必须自有、获得许可或来自允许商业使用的来源。

### 15.2 模板配置

模板至少定义：

- 名称和缩略图
- 支持的项目类型
- 背景素材
- 字幕样式
- 默认声音
- 默认时长范围
- 场景布局
- 是否免费
- 积分倍率
- 是否启用

### 15.3 模板管理

管理员可以：

- 创建、编辑、禁用模板
- 上传预览和素材
- 调整默认参数
- 标记 Free/Premium
- 查看模板使用量和付费转化

## 16. 视频与导出规格

### 16.1 输出规格

- 默认比例：9:16
- 免费：720p、有水印
- 付费：1080p、无水印
- 格式：MP4 H.264
- 音频：AAC
- 字幕：烧录字幕；可选下载 SRT
- Voice 页面：MP3
- Italian 页面：PNG/JPEG 角色图

### 16.2 水印

- 水印不得遮挡字幕和主体。
- 位置由模板定义并保持一致。
- 免费导出明确显示水印预览。
- 付费导出不得残留水印素材。

### 16.3 文件生命周期

- 已登录用户的最终成品按账户策略保留。
- 免费账户长期未使用文件可按政策清理。
- 删除项目时删除源文件、生成中间件和最终文件。
- 使用带过期时间的签名下载链接。

## 17. 积分、套餐与支付

### 17.1 定价结构

推荐首发：

| 套餐 | 价格 | 权益 |
|---|---:|---|
| Free | $0 | Starter Credits、720p、水印、基础模板 |
| Creator | $19/月 | 月度积分、1080p、无水印、Premium Voice/模板 |
| Pro | $39/月 | 更多积分、更长视频、更高并发优先级 |
| Credit Pack | $9.99 | 一次性补充积分，不过期或按条款设置长期有效期 |

积分数量必须在正式上线前根据真实生成成本校准。目标毛利率不低于 70%。

### 17.2 建议积分模型

以下为初始可配置值，不应硬编码：

| 操作 | 建议积分 |
|---|---:|
| Short Voice Preview | 1 |
| Full Voice Generation | 2–4 |
| Character Image | 2–4 |
| 15s Video | 10 |
| 30s Video | 18 |
| 60s Video | 32 |
| OCR/PDF extraction | 1–3 |

### 17.3 支付提供商

- 通过统一 Billing Adapter 接入 Creem 或 Stripe。
- 如果现有 Creem 账户已完成审核，V1 推荐优先使用 Creem。
- 支付成功以服务端 Webhook 为准，不能只相信前端跳转。
- Webhook 必须验签、幂等并记录处理状态。

### 17.4 支付功能

- 创建 Checkout
- 订阅开通
- 一次性积分包
- 订阅续费
- 取消订阅
- 支付失败处理
- Webhook 重试
- 发票/收据链接
- 退款后扣回未使用权益
- 管理员人工调整积分

### 17.5 积分账本

积分不能只保存在用户余额字段。必须有不可变账本记录：

- grant
- purchase
- subscription_renewal
- reservation
- charge
- refund
- admin_adjustment
- expiration

任何余额变化都要能够追溯来源和关联任务。

## 18. 工作台与项目编辑器 UX

### 18.1 工作台

- 显示剩余积分和套餐。
- 显示 Create New 主按钮。
- 显示最近项目。
- 显示失败任务及 Retry。
- 显示推荐模板，但不能挤压主要项目内容。

### 18.2 项目编辑器布局

桌面端：

- 左侧：输入、脚本、场景、声音和模板设置
- 中间：视频或角色预览
- 右侧：项目状态、积分、生成和导出

移动端：

- 使用步骤式编辑器
- 预览保持可访问
- Generate/Render 为底部固定主操作

### 18.3 防止误操作

- 高成本渲染前显示规格和积分确认。
- 删除项目需要二次确认。
- 离开未保存脚本需要提示。
- 切换模板不会静默覆盖已编辑脚本。

## 19. SEO 与内容要求

### 19.1 技术 SEO

每个公开页面必须包含：

- 唯一 Title
- 唯一 Meta Description
- Canonical
- Open Graph/Twitter Card
- Breadcrumb
- XML Sitemap
- 正确 robots 指令
- SoftwareApplication 或 WebApplication Schema
- FAQ Schema（仅页面真实展示 FAQ 时）
- VideoObject Schema（存在公开可播放示例时）
- 可爬取的正文和示例说明

### 19.2 页面内容

每个核心功能页至少具备：

- 8–12 个真实生成案例
- 原始输入、生成结果和使用说明
- 功能限制和隐私说明
- 3–5 个典型使用场景
- 6–10 个真实 FAQ
- 最后更新时间
- 内链至相关功能页和 Pricing

### 19.3 索引规则

- 登录、工作台、项目、支付和账户页面 `noindex`。
- 用户私人项目不得被公开索引。
- 公开 Gallery/Remix 页面不属于 V1，首发不批量开放索引。
- 只有功能完成、示例真实、元数据完整的页面才能进入 sitemap。

### 19.4 性能目标

- 移动端首屏避免自动加载大型视频。
- 示例视频使用 Poster 和按需加载。
- 公开页面 LCP 目标小于 2.5 秒。
- CLS 目标小于 0.1。
- 公开工具表单在 JavaScript 加载失败时至少保留可理解内容和登录入口。

## 20. 分析与事件追踪

### 20.1 核心事件

- `page_view`
- `tool_input_started`
- `template_selected`
- `generate_clicked`
- `login_started`
- `signup_completed`
- `project_created`
- `generation_queued`
- `generation_stage_completed`
- `generation_completed`
- `generation_failed`
- `preview_played`
- `download_clicked`
- `paywall_viewed`
- `checkout_started`
- `purchase_completed`
- `subscription_started`
- `subscription_canceled`
- `project_remixed`

### 20.2 必须附带的公共属性

- anonymous/user ID
- session ID
- landing page
- project type
- template ID
- output duration
- estimated credits
- charged credits
- provider
- generation time
- device
- country
- acquisition source

不得把完整 PDF 内容、敏感输入或支付信息发送到分析系统。

### 20.3 V1 核心指标

- Landing Page → Generate Click
- Generate Click → Signup
- Signup → First Successful Generation
- Successful Generation → Paywall
- Paywall → Purchase
- 7-day and 30-day repeat generation
- Generation success rate
- Median generation time
- Cost per completed output
- Gross margin by project type
- Revenue by landing page
- Refund and chargeback rate

## 21. 管理后台

### 21.1 用户管理

- 搜索用户
- 查看套餐、积分和注册来源
- 查看项目与任务状态
- 调整积分
- 禁用滥用账户
- 发起数据删除

### 21.2 生成任务

- 按状态、类型、提供商筛选
- 查看阶段耗时
- 查看成本
- 查看错误代码和日志摘要
- 重试安全任务
- 退还积分

### 21.3 支付管理

- 查看订单和订阅
- 查看 Webhook 状态
- 重放失败 Webhook
- 查看退款
- 关联用户和积分账本

### 21.4 模板管理

- 创建和编辑模板
- 上传缩略图和演示
- 设置可见性、价格等级和积分倍率
- 禁用有版权或质量问题的素材

### 21.5 成本与健康面板

- 每日生成量
- 成功率
- 平均成本
- 平均生成时间
- 提供商失败率
- 付费转化
- 毛利率

## 22. 通知与邮件

V1 邮件：

- Welcome/Starter Credits
- 视频生成完成
- 视频生成失败且积分已退还
- 支付成功
- 支付失败
- 订阅续费/取消
- 低积分提醒（可退订）

站内通知：

- 任务完成
- 任务失败
- 积分不足
- 支付到账

## 23. 安全、隐私与合规

### 23.1 安全要求

- 所有支付操作在服务端完成。
- Webhook 验签。
- 上传文件进行 MIME、大小和恶意文件校验。
- 私有文件使用不可猜测路径和签名 URL。
- 管理后台必须有独立授权检查。
- API 采用速率限制。
- 高成本生成操作采用用户和 IP 双层限速。
- 数据库变更和积分操作保留审计记录。

### 23.2 隐私要求

- 清晰披露使用的第三方 AI/渲染服务类别。
- 用户可删除账户和项目。
- PDF 默认 24 小时删除。
- 不使用私人输入训练模型。
- 分析系统不保存完整私人输入。

### 23.3 内容政策

禁止：

- 未成年人性内容
- 非自愿色情或深度伪造
- 仇恨、极端暴力和违法内容
- 冒充真实人物的声音或形象
- 明确侵犯第三方版权的官方模板

审核拒绝必须提供简短原因，不暴露内部安全规则细节。

## 24. 服务质量目标

### 24.1 可用性

- 公开站点月可用性目标：99.9%
- 生成系统月可用性目标：99.5%
- 支付 Webhook 必须支持重试和人工恢复

### 24.2 性能

- 登录和普通 API P95 小于 1 秒（不含第三方生成）。
- Voice 短预览目标在 30 秒内完成。
- 15–30 秒视频目标在 5 分钟内完成。
- 超过预计时间时显示更新后的等待状态。

### 24.3 质量

- 视频生成成功率目标 ≥95%。
- Voice 生成成功率目标 ≥98%。
- 支付成功后积分到账目标 ≤30 秒。
- 系统失败自动退款准确率 100%。

## 25. 数据模型概览

核心实体：

- `users`
- `accounts`
- `sessions`
- `subscriptions`
- `orders`
- `credit_ledger`
- `projects`
- `project_sources`
- `scripts`
- `scenes`
- `assets`
- `voice_generations`
- `generation_jobs`
- `generation_job_steps`
- `outputs`
- `templates`
- `webhook_events`
- `audit_logs`

关键关系：

- 用户拥有多个项目。
- 项目拥有脚本、场景、素材和输出。
- 每次生成任务关联一个项目和积分账本记录。
- 支付订单或订阅产生积分账本记录。
- 输出文件关联生成任务，便于成本与错误追溯。

## 26. 逻辑技术架构

PRD 不锁定具体云厂商，但 V1 需要以下逻辑组件：

```text
Web Frontend
  → Application API
    → Authentication
    → Database
    → Billing Adapter
    → Object Storage
    → Generation Orchestrator
      → LLM/Script Provider
      → Image Provider
      → TTS Provider
      → OCR/PDF Parser
      → Render Worker
    → Job Queue
    → Email Provider
    → Analytics
```

架构要求：

- 第三方模型通过适配器接入，允许替换但不建设过度抽象的平台。
- 视频生成采用异步任务队列。
- API 与渲染 Worker 分离，避免长任务占用 Web 请求。
- 生成阶段可单独重试。
- 所有费用相关操作由服务端负责。

## 27. 无障碍与响应式

- 所有输入具备 Label 和错误说明。
- 支持键盘导航。
- 焦点状态清晰可见。
- 颜色对比满足 WCAG AA。
- 视频播放器提供字幕。
- 生成进度不能只依赖颜色。
- 移动端必须完成从创建到支付和下载的完整流程。

## 28. 客服与政策页面

首发必须上线：

- `/pricing`
- `/about`
- `/contact`
- `/privacy`
- `/terms`
- `/refund-policy`
- `/copyright`
- `/data-deletion`
- `/status` 或可访问的服务状态说明

用户支持至少通过 Email 或工单表单提供，并展示预计响应时间。

## 29. 完整 V1 交付阶段

以下时间假设：已有可用 AI/TTS/渲染提供商；2 名工程师与兼职设计/内容支持。单人开发周期通常需要增加 40%–70%。

### 阶段 1：产品与设计系统（第 1–2 周）

- 确认品牌、域名和视觉方向
- 完成信息架构
- 完成五个公开页面线框
- 完成工作台和项目编辑器交互稿
- 确认提供商和成本
- 确认积分模型
- 建立设计系统和基础项目结构

### 阶段 2：平台基础（第 2–4 周）

- 登录与账户
- 数据库与项目系统
- 文件上传与对象存储
- 积分账本
- Creem/Stripe 支付
- Webhook
- 工作台
- 管理后台基础

### 阶段 3：生成管线（第 3–7 周）

- 文本脚本生成
- 场景编辑
- TTS
- 字幕
- 模板
- 视频渲染
- Italian 角色生成
- PDF/OCR
- 失败重试和自动退款

### 阶段 4：五个公开页面（第 5–8 周）

- 首页
- Italian Generator
- Voice Generator
- PDF to Brainrot
- Text to Brainrot
- Pricing 和政策页
- 真实案例内容
- SEO 元数据和结构化数据

### 阶段 5：质量与商业验收（第 8–10 周）

- 全流程 QA
- 支付和退款 QA
- 成本和积分校准
- 移动端测试
- 性能优化
- 安全与隐私检查
- 分析事件验证
- 生产环境演练

### 阶段 6：正式发布（第 10–12 周）

- 小流量生产发布
- 修复真实任务问题
- 开放 Google 索引
- 发布 TikTok/YouTube 内容
- 工具目录与创作者外联
- 每日监控支付、失败、成本和转化

估算：

- 2 名工程师小团队：10–12 周
- 1 名全职开发者：14–18 周
- 如果视频渲染、支付或 OCR 需要自研，周期需要重新评估

## 30. 上线阻断条件

以下任一条件未满足，不得正式开放收费和大规模索引：

- 登录后无法稳定恢复公开页草稿
- 支付成功后积分可能不到账
- Webhook 未验签或不幂等
- 生成失败不自动退还积分
- PDF 没有自动删除机制
- 用户无法删除项目和账户
- 视频成功率低于 90%
- 成本无法按任务追踪
- 移动端无法完成支付和下载
- 核心公开页面没有真实生成案例
- 定价可能导致低于 50% 毛利率
- 管理员无法定位失败任务和处理退款

## 31. 正式上线验收清单

### 平台

- [ ] Google 登录可用
- [ ] Starter Credits 正确发放且防重复
- [ ] 项目创建、保存、复制和删除可用
- [ ] 生成状态完整且实时更新
- [ ] 失败自动退款
- [ ] 工作台展示正确

### 生成

- [ ] Text 视频完整生成
- [ ] PDF 文本和 OCR 路径完整生成
- [ ] Italian 角色图片、Voice 和视频完整生成
- [ ] Voice 试听和 MP3 下载可用
- [ ] 字幕与声音同步
- [ ] 720p/1080p 和水印规则正确
- [ ] 文件删除策略生效

### 支付

- [ ] Creator 订阅可购买
- [ ] Pro 订阅可购买
- [ ] Credit Pack 可购买
- [ ] Webhook 验签、幂等、重试可用
- [ ] 续费和取消正确
- [ ] 支付失败提示清晰
- [ ] 积分账本可追溯

### SEO

- [ ] 五个页面 Title/Description 唯一
- [ ] Canonical 正确
- [ ] Schema 与可见内容一致
- [ ] Sitemap 只包含可索引页面
- [ ] App 页面 noindex
- [ ] 所有示例真实可播放
- [ ] 内链结构完整
- [ ] 移动端性能达到目标

### 运营

- [ ] 真实生成案例至少 40–60 个
- [ ] 30 条首发短视频准备完成
- [ ] 客服邮箱和退款流程可用
- [ ] 管理后台可查看成本和失败
- [ ] 隐私、条款、退款和版权页面上线

## 32. 发布后 30 天指标

| 指标 | 目标 |
|---|---:|
| 访问 → Generate Click | ≥20% |
| 注册 → 首次成功生成 | ≥50% |
| 视频生成成功率 | ≥95% |
| Voice 成功率 | ≥98% |
| 完成生成 → Paywall | ≥10% |
| 访问 → 付费 | ≥0.8% |
| 7 天重复生成 | ≥15% |
| 退款率 | <5% |
| 支付拒付率 | <1% |
| 毛利率 | ≥70% |

## 33. 主要风险与缓解

### 趋势继续下降

缓解：把核心能力建立在 Text/PDF/Voice/Short Video 自动化上，而不是只依赖 Italian Brainrot 梗。

### 用户只想免费体验

缓解：免费结果提供真实价值，但在无水印、1080p、时长、Premium Voice 和项目保存上建立清晰付费价值。

### 视频生成成本失控

缓解：积分、时长上限、任务限速、成本监控和禁止无限套餐。

### SEO 页面互相竞争

缓解：一个搜索意图一个页面，统一 Canonical 和内部关键词映射。

### 版权与声音风险

缓解：不做真实人物声音克隆；只使用有权利的模板素材；建立投诉和下架流程。

### 第三方提供商不稳定

缓解：阶段级重试、明确适配器边界、失败退款和关键提供商备用方案。

## 34. 发布后扩展顺序

只有 V1 数据证明流量和付费后，按以下顺序扩展：

1. `/brainrot-copypasta`
2. `/italian-brainrot-name-generator`
3. `/random-brainrot-generator`
4. 公开模板详情页
5. 可索引的用户 Gallery/Remix
6. 批量视频生成
7. Creator Referral/Affiliate
8. 自动发布集成
9. Consent-based Voice Cloning
10. 团队工作空间
11. API

Voice Cloning 只有满足以下条件后才能立项：

- 普通 TTS 已证明存在持续付费和重复使用。
- 用户必须明确声明并证明拥有声音使用权。
- 声音样本具有独立删除、撤销授权和数据保留机制。
- 禁止公众人物、未成年人和未经同意的第三方声音克隆。
- 生成内容具备可追溯的 Voice Model ID 和所有权记录。
- 建立投诉、冻结和下架流程。
- 完成针对目标市场的法律与支付平台政策审查。

`/video-meme-generator` 不在近期扩展范围，除非现有用户数据证明通用 Meme 编辑需求显著。

## 35. 待确认的实施决策与推荐默认值

| 决策 | 推荐默认值 |
|---|---|
| 首发语言 | English only |
| 登录 | Google OAuth only |
| 支付 | 已审核则 Creem，否则 Stripe |
| 免费策略 | 注册后 Starter Credits，不匿名提交高成本任务 |
| 默认输出 | 9:16、15 秒、720p 水印 |
| 付费输出 | 1080p、无水印 |
| PDF 删除 | 原文件 24 小时自动删除 |
| Voice Cloning | V1 不支持；满足授权、删除、投诉与合规条件后作为后续能力 |
| 定价 | Free + $19 Creator + $39 Pro + $9.99 Pack |
| 域名策略 | 单域名、多功能内页 |
| 首发页面 | 首页 + Italian + Voice + PDF + Text |

## 36. UX 完整性验证体系

### 36.1 UX 完整的定义

UX 完整不等于功能数量多、页面漂亮或动效复杂。V1 的 UX 只有在以下条件同时成立时才算完整：

1. 新用户无需外部指导即可完成核心任务。
2. 用户在每一步都知道当前状态、下一步操作、预计消耗和失败后的恢复方式。
3. 桌面端和移动端都能完成登录、生成、支付、下载和项目管理。
4. 正常、空白、加载、校验失败、积分不足、生成失败、支付失败和成功状态全部设计并实现。
5. 真实用户测试和生产数据达到预设门槛。

### 36.2 五个首发核心任务

所有 UX 评审和测试围绕以下任务，不以页面数量作为完成标准：

1. 从首页输入文本，Google 登录后恢复草稿并生成视频。
2. 创建 Italian Brainrot 角色，修改图片或台词，并导出短视频。
3. 输入文本生成 Italian Brainrot Voice，下载 MP3 或发送到视频项目。
4. 上传 PDF，检查提取内容，修改脚本并生成学习视频。
5. 积分不足时理解套餐差异，完成支付并回到原任务继续生成。

### 36.3 关键流程 UX 验收

#### 发现与理解

- 用户进入页面 5 秒内能够回答“这是什么、输入什么、会得到什么”。
- 每个页面只有一个主操作，次级操作不能与 Generate 竞争。
- 定价、水印、时长和登录要求不能在生成后突然出现。

#### Google 登录

- 点击 Generate 后触发登录时，保存全部输入、上传状态和已选参数。
- Google 登录成功后返回原页面或创建的项目，而不是统一跳回首页。
- 用户取消或登录失败时保留草稿，并提供 Retry。
- 不出现 Email 登录、密码或 Magic Link 的残留入口。

#### 创建与编辑

- 必填项和可选项视觉层级明确。
- 校验错误显示在对应字段旁，并说明如何修复。
- 切换模板、声音或时长时立即更新预计积分。
- 高成本操作执行前提供一次清晰确认，不重复弹窗。
- 自动保存状态可见：Saving / Saved / Failed to save。

#### 生成与等待

- 显示真实生成阶段，不使用无期限 Loading。
- 显示合理的预计等待区间。
- 用户可以安全离开页面，任务完成后通过工作台和邮件找到结果。
- 部分步骤失败时允许从失败阶段重试。
- 系统失败明确显示积分已退还。

#### 支付

- Paywall 明确说明当前任务缺少多少积分。
- 套餐差异围绕用户当前任务展示，不堆砌无关权益。
- 支付完成后自动返回原项目并继续用户中断的操作。
- 支付处理中、失败、取消和成功均有独立状态。
- 不允许支付成功但页面仍显示旧余额且没有刷新提示。

#### 结果与导出

- 成品页面首先展示结果，而不是再次展示营销内容。
- Download、Remix、Edit、Create New 层级清晰。
- 免费水印和付费无水印差异在导出前可见。
- 下载失败时提供重试，不重复扣积分。

### 36.4 页面状态矩阵

每个核心页面和组件必须设计、实现并测试以下适用状态：

| 状态 | 要求 |
|---|---|
| Default | 清楚显示可执行的首个操作 |
| Empty | 解释为什么为空以及如何创建内容 |
| Draft | 显示已输入但尚未提交的内容 |
| Validation Error | 指向具体字段并给出修复方式 |
| Authentication Required | 保存草稿并解释登录原因 |
| Insufficient Credits | 显示缺口、套餐和返回路径 |
| Queued | 显示排队与取消规则 |
| Processing | 显示真实阶段和进度信息 |
| Partial Failure | 保留成功步骤并允许局部重试 |
| Failure | 显示原因、退款和可执行操作 |
| Success | 结果、下载、编辑和 Remix 可用 |
| Offline/Network Error | 不丢失编辑内容并允许重试 |
| Deleted/Expired | 说明文件状态和恢复可能性 |

没有覆盖适用状态的页面不得通过 UX 验收。

### 36.5 原型与设计验收流程

#### 第一步：低保真流程图

- 确认页面、步骤和返回路径。
- 先解决流程，不讨论视觉装饰。
- 标记所有登录、积分、支付和失败分支。

#### 第二步：可点击高保真原型

- 覆盖五个首发核心任务。
- 同时提供桌面端和移动端关键页面。
- 模拟真实文本长度、长文件名、错误和慢任务。

#### 第三步：内部走查

产品、设计、工程和运营分别检查：

- 用户是否知道下一步。
- 功能是否真的可实现。
- 是否存在隐藏成本或状态。
- 文案是否与真实规则一致。
- 是否有无法退出或恢复的死路。

#### 第四步：目标用户可用性测试

- 首轮至少测试 5–8 名目标用户。
- 创作者、学生/PDF 用户和娱乐用户至少各包含代表用户。
- 测试人员只能获得任务目标，不能获得操作教程。
- 记录完成率、完成时间、错误点、求助次数和主观困惑。

#### 第五步：开发后实机验收

- 不只测试 Figma 原型。
- 使用真实 Google 登录、真实上传、真实生成和支付测试环境。
- 在真实手机和常见桌面尺寸上完成端到端测试。

### 36.6 UX 量化门槛

| 指标 | V1 通过标准 |
|---|---:|
| 5 秒价值理解正确率 | ≥80% |
| 核心任务无帮助完成率 | ≥85% |
| Google 登录后草稿恢复成功率 | 100% |
| 支付后返回原任务成功率 | 100% |
| 首次用户字段校验修复率 | ≥90% |
| 生成失败后恢复/重试成功率 | ≥80% |
| 移动端核心任务完成率 | ≥80% |
| SUS 可用性评分 | ≥75 |
| 无关键流程死路 | 100% |

生产发布后继续监控：

- Landing → Tool Start
- Tool Start → Google Login Completed
- Login → Project Created
- Project Created → Successful Generation
- Generation → Download
- Paywall → Purchase

任一关键步骤相较上一阶段流失超过 60%，必须进行专项 UX 复盘。

### 36.7 响应式验收尺寸

至少测试：

- 360 × 800
- 390 × 844
- 768 × 1024
- 1024 × 768
- 1440 × 900

不能只通过缩小桌面布局完成移动端。移动端应采用步骤式编辑、固定主操作和适合触控的输入尺寸。

### 36.8 UX 发布阻断条件

以下任一问题存在时，不得正式发布：

- 用户登录后丢失输入或上传文件。
- 用户不知道生成将消耗多少积分。
- 生成失败后没有明确退款状态。
- 支付完成后无法返回原任务。
- 移动端无法完成上传、支付或下载。
- 用户必须依赖客服或教程才能完成首次生成。
- 错误只显示技术代码，没有可执行的解决方式。
- 页面存在没有返回、取消或重试能力的死路。
- 主要交互依赖 Hover，触屏设备无法操作。
- 颜色、焦点或表单标签不符合基本无障碍要求。

### 36.9 UX Definition of Done

每个功能只有满足以下要求才可标记为 UX Done：

- 正常流程已设计并实现。
- 所有适用状态已覆盖。
- 桌面端和移动端均完成。
- 文案与真实价格、积分、隐私和错误规则一致。
- 键盘、焦点、标签和对比度通过检查。
- 可用性测试达到任务完成率门槛。
- 分析事件可以定位该功能的流失点。
- 客服和管理员能够理解并处理相关失败状态。

## 37. Definition of Done

V1 只有在以下结果同时成立时才算完成：

1. 新用户可以从任一公开功能页进入，登录后不丢失输入。
2. 用户可以完成至少一种完整视频生成，并在失败时自动退还积分。
3. 用户可以购买订阅或积分包并立即获得权益。
4. 用户可以在工作台找到、编辑、复制、下载和删除项目。
5. 管理员可以定位任务、成本、支付和积分问题。
6. PDF、账户、支付和生成数据具备明确安全与删除规则。
7. 五个核心页面都包含真实工具、真实案例和完整 SEO。
8. 移动端可以完成登录、生成、支付和下载。
9. 所有关键事件能够在分析系统中形成完整漏斗。
10. 生成成本、价格和积分能够维持目标毛利率。
