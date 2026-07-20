# Higgsfield-Inspired Product Design System

> 版本：1.0  
> 提取日期：2026-07-16  
> 参考站点：[higgsfield.ai](https://higgsfield.ai/)  
> 适用范围：品牌首页、SEO 功能页、生成器工作台、Pricing、登录与支付界面  
> 目标：复现 Higgsfield 的视觉气质和交互语言，不复制其商标、Logo、文案或专有媒体素材

## 1. 设计方向

### 1.1 核心定义

这套视觉不是传统“AI SaaS 紫色渐变”，也不是普通深色后台。

它应被理解为：

> Dark creative operating system + kinetic editorial gallery + acid-lime product controls.

中文描述：

- 近黑色的创作舞台
- 高密度、媒体优先的作品陈列
- 酸性荧光黄作为唯一主操作色
- 极紧凑、全大写的展示标题
- 稳定克制的深灰产品控件
- 少量洋红、青色作为活动和标签点缀
- 看起来像创作者工具和数字文化杂志的结合，而不是企业管理软件

### 1.2 第一性原理

Higgsfield 风格成立的原因不是“黑色 + 荧光黄”本身，而是以下关系：

1. 黑色舞台让生成作品成为视觉主体。
2. 荧光黄只负责导航注意力和关键行动，因此始终醒目。
3. 标题压缩、全大写，制造编辑出版物和电影海报感。
4. UI 表单使用克制的深灰层级，避免与内容争夺注意力。
5. 大量真实视频、图片和作品缩略图承担品牌表达，界面本身保持安静。

如果缺少高质量媒体素材，只复制颜色和圆角，最终不会像 Higgsfield。

## 2. 视觉关键词

- Cinematic
- Creator-first
- Media-dense
- Editorial
- Kinetic
- Technical
- Acidic
- Premium but not luxurious
- Bold but not playful
- Dark without glassmorphism overload

## 3. 禁用方向

不要使用：

- 紫色、蓝紫色 AI 渐变作为主视觉
- 漂浮光球、抽象网格和无意义粒子背景
- 巨大的居中营销 Hero 加一张浏览器 Mockup
- 每个模块都使用玻璃拟态
- 厚重多层投影
- 过度柔和、圆润、儿童化的组件
- 大段低对比度营销文案
- 同时使用多个高饱和主色
- 把所有按钮都做成荧光黄
- 在产品表单里使用海报级标题密度

## 4. Design Tokens

### 4.1 基础颜色

```css
:root {
  color-scheme: dark;

  /* Page */
  --hf-bg-deep: #0b0b0b;
  --hf-bg: #0f1113;
  --hf-bg-reversed: #ffffff;

  /* Surfaces */
  --hf-surface-section: #18191c;
  --hf-surface-1: #1c1e20;
  --hf-surface-1-alt: #1c1e21;
  --hf-surface-2: #23262a;
  --hf-surface-hover: #2a2d32;
  --hf-surface-disabled: #292b2c;

  /* Brand */
  --hf-lime: #d1fe17;
  --hf-pink: #ff005b;
  --hf-cyan: #9ce6f3;

  /* Typography */
  --hf-text: #f7f7f8;
  --hf-text-strong: #ffffff;
  --hf-text-secondary: #898a8b;
  --hf-text-muted: rgba(255, 255, 255, 0.45);
  --hf-text-on-lime: #131517;

  /* Borders */
  --hf-border-subtle: rgba(255, 255, 255, 0.05);
  --hf-border-default: rgba(255, 255, 255, 0.10);
  --hf-border-strong: rgba(255, 255, 255, 0.20);

  /* Feedback */
  --hf-success: #53c546;
  --hf-danger: #e72930;
  --hf-warning: #f3c977;
  --hf-info: #4778f5;
}
```

### 4.2 颜色使用比例

推荐单屏颜色占比：

- 近黑和深灰：75%–85%
- 媒体内容自身颜色：10%–20%
- 白色文字：5%–10%
- Lime：2%–5%
- Pink/Cyan：每种不超过 1%–2%

Lime 只能用于：

- 主 CTA
- 当前激活导航
- 重要 Section Heading
- New/Featured 状态
- 关键数字或选中状态
- 极少量光晕

Pink 主要用于：

- Discount
- Limited/Promo
- 活动标签
- 与 Lime 形成短促对比

Cyan 主要用于：

- 辅助高亮词
- 信息型徽标
- 媒体内容内部的视觉点缀

### 4.3 透明度层级

```css
--hf-white-90: rgba(255,255,255,.90);
--hf-white-70: rgba(255,255,255,.70);
--hf-white-60: rgba(255,255,255,.60);
--hf-white-45: rgba(255,255,255,.45);
--hf-white-20: rgba(255,255,255,.20);
--hf-white-10: rgba(255,255,255,.10);
--hf-white-05: rgba(255,255,255,.05);
```

不要用低于 45% 白色作为重要正文。

## 5. Typography

### 5.1 字体家族

```css
--font-display: "Space Grotesk", system-ui, sans-serif;
--font-ui: "Inter", system-ui, sans-serif;
--font-body: "Inter", system-ui, sans-serif;
--font-mono: "IBM Plex Mono", "Space Mono", monospace;
--font-editorial: "Instrument Serif", Georgia, serif;
```

使用规则：

- `Space Grotesk`：品牌标题、Section Heading、生成器主标题、卡片海报标题。
- `Inter`：按钮、表单、Pricing、说明文字、工作台 UI。
- `IBM Plex Mono/Space Mono`：Credits、倒计时、模型 ID、技术标签、参数值。
- `Instrument Serif`：只允许用于少量编辑性强调或活动文案，不用于核心 UI。

### 5.2 字体特征

品牌标题应具备：

- uppercase
- 700 weight
- 紧 tracking
- 短行
- 高对比
- 不使用长段落式大标题

### 5.3 字体比例

| Token | Desktop | Mobile | Font | Usage |
|---|---|---|---|---|
| Display XL | 56/59 | 36/40 | Space Grotesk 700 | 品牌级 Section Hero |
| Display L | 48/50 | 32/36 | Space Grotesk 700 | 大型功能标题 |
| Display M | 40/48 | 28/34 | Space Grotesk 700 | 生成器主标题 |
| Heading L | 28/32 | 24/28 | Space Grotesk 700 | Section Heading |
| Heading M | 20/28 | 20/28 | Space Grotesk 600–700 | 卡片和面板标题 |
| Card Title | 16/24 | 16/24 | Space Grotesk 700 | 媒体卡片标题 |
| Body L | 16/24 | 16/24 | Inter 400 | 正文 |
| Body M | 14/20 | 14/20 | Inter 400–500 | 表单与说明 |
| Caption | 12/16 | 12/16 | Inter 500 | 徽标、统计 |
| Mono | 12/16 | 12/16 | IBM Plex Mono 500 | Credits、模型、参数 |

### 5.4 Tracking

- 56px 展示标题：`-1.2px`
- 40–48px 展示标题：`-0.96px` 到 `-1.2px`
- 24–28px 大写标题：`-1.2px`
- 16px 大写卡片标题：约 `-0.64px` 或 `-4%`
- 普通 UI 文本：`0` 到 `-0.1px`

CSS 示例：

```css
.display-heading {
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -1.2px;
  text-transform: uppercase;
}
```

## 6. Spacing

### 6.1 基础刻度

```css
--space-0: 0;
--space-1: 2px;
--space-2: 4px;
--space-3: 6px;
--space-4: 8px;
--space-5: 10px;
--space-6: 12px;
--space-8: 16px;
--space-10: 20px;
--space-12: 24px;
--space-14: 28px;
--space-16: 32px;
--space-20: 40px;
--space-24: 48px;
--space-28: 56px;
--space-32: 64px;
--space-40: 80px;
--space-48: 96px;
```

### 6.2 页面规则

- Desktop 全宽营销页面左右边距：16px。
- Mobile 左右边距：16px。
- 普通 Section 垂直间距：32px。
- 大型品牌 Section：48–80px。
- 卡片网格 Gap：10px 或 16px。
- 工具页面主网格 Gap：16px。
- 表单内部 Gap：8–12px。
- 面板 Padding：16px。
- 大型 Feature Stage Padding：8–12px，依靠媒体而不是大 Padding 制造体量。

Higgsfield 风格不依赖 120px 的巨大空白。它是密度可控的媒体流。

## 7. Radius

```css
--radius-xs: 4px;
--radius-sm: 6px;
--radius-md: 8px;
--radius-control: 10px;
--radius-button: 12px;
--radius-card: 16px;
--radius-promo: 20px;
--radius-stage: 24px;
--radius-full: 9999px;
```

使用规则：

- 徽标、小控件：6–8px
- 顶部导航按钮：10px
- 主按钮和输入框：12px
- 普通媒体卡片：16px
- Pricing/Promo：20px
- 大型沉浸式舞台：24px
- Pills/Segmented Control：full

避免所有组件统一成 24px 大圆角。

## 8. Borders and Shadows

### 8.1 边框

```css
.surface-card {
  border: 1px solid var(--hf-border-subtle);
}

.surface-control {
  border: 1px solid var(--hf-border-default);
}
```

边框重点：

- 0.5–1px
- 白色 5%–10%
- 用于区分深灰层级，不制造明显描边
- 媒体卡可只用背景色而不加边框

### 8.2 阴影

不使用传统大投影。

允许：

- Lime Promo Strip：`0 0 12px rgba(209,254,23,.5)`
- 主 CTA 底部内压：`inset 0 -3px 0 rgba(0,0,0,.43)`
- 顶部导航按钮轻微白色内高光
- Modal 使用黑色 Overlay 和极轻边界

禁止：

- 多层蓝紫投影
- 白色卡片式 SaaS 阴影
- 大范围发光边框

## 9. Layout System

### 9.1 Marketing/Home

特点：

- 页面全宽，16px 安全边距
- 媒体内容优先
- 顶部直接进入水平内容 Carousel，而不是传统中心 Hero
- Section 使用紧凑标题 + 一句说明 + 媒体网格
- 多使用横向滚动、4 列作品网格和不对称 Feature Stage

Desktop：

- Top carousel card：约 512px 宽
- Carousel gap：20px
- Community grid：4 列，gap 16px
- Community card：约 300px 宽，radius 16px
- Large feature stage：全宽减 32px，radius 24px

Mobile：

- Carousel card：约 312px 宽
- 页面边距：16px
- Utility cards：2 列，每列约 `(100vw - 40px) / 2`
- Utility card 最小高：126–138px
- 大型内容区改为单列或横向滑动

### 9.2 Pricing

- 主内容 Desktop 最大宽度约 1064px
- 居中显示
- 标题使用 Inter，不必所有页面都用展示标题
- 套餐 Desktop 3 列，gap 16px
- Pricing Card radius 20px
- Card 使用深灰渐变和极弱白色径向高光
- 推荐套餐可以加入 Lime/Olive 或 Pink/Magenta 色温，但仍保持低亮度

Pricing card surface：

```css
background:
  radial-gradient(58% 220% at 3% 42%, rgba(255,255,255,.094), rgba(255,255,255,.035) 42%, rgba(255,255,255,.01)),
  linear-gradient(#1d1f20, #17191b);
border-radius: 20px;
```

### 9.3 Generator/App

Desktop 网格：

```css
grid-template-columns: 320px minmax(0, 1fr);
gap: 16px;
padding-inline: 16px;
max-width: 1920px;
```

左侧：

- 模式 Tabs
- 模型/预设卡
- Upload Dropzone
- Prompt
- 参数与 Credits
- 底部固定 Generate CTA

右侧：

- 初始 How It Works
- 生成预览
- History/状态
- 结果和下载

Generator 应像专业创作工具，不像营销 Landing Page。

## 10. Navigation

### 10.1 Promotion Strip

- 高度：49px
- 背景：`#D1FE17`
- 文字：`#131517`
- 字号：14/20
- Mobile sticky top
- 可以搭配小型 Pink Discount Badge
- 不允许同时出现多条促销 Banner

### 10.2 Desktop Global Nav

- 高度：52px
- 背景：`#0F1113`
- Logo 左侧
- 产品入口采用紧凑水平文字链接
- 链接间使用微弱 Separator
- 右侧为 Pricing、Login、Sign up
- Pricing：深色 5% 白背景，radius 10px
- Sign up：Lime 背景、深色文字、36px 高、radius 10px

### 10.3 Mobile Header

- Logo 左侧
- Pricing + Discount Badge
- 社交入口可选
- Sign up Lime Button
- 不展示完整产品导航

### 10.4 Mobile Bottom Nav

- 高度约 61px
- Sticky bottom
- 背景：`#131517`
- `backdrop-filter: blur(4px)`
- 顶部 1px Subtle Border
- 5 个入口：Home / Community / Generate / Library / Profile
- 中间 Generate 使用 Lime 强调
- 非激活项使用 `#898A8B`

## 11. Buttons

### 11.1 Primary CTA

```css
.button-primary {
  min-height: 48px;
  padding: 0 16px 2px;
  border: 0;
  border-radius: 12px;
  color: #14151a;
  background: radial-gradient(circle, #effe17 40%, #d1fe17 100%);
  box-shadow: inset 0 -3px 0 rgba(0,0,0,.43);
  font: 600 16px/24px var(--font-ui);
}

.button-primary:active {
  transform: scale(.97);
}
```

规则：

- 一个面板最多一个 Lime 主按钮。
- Credits 可以放在按钮右侧，使用 Mono 或紧凑数字。
- Disabled 使用 `#292B2C`，不要降低到不可读。

### 11.2 Brand Soft

```css
background: rgba(209,254,23,.10);
color: #d1fe17;
height: 48px;
border-radius: 12px;
```

适合 Explore、Learn、Secondary Create。

### 11.3 Secondary

- 背景：透明或 `#1C1E20`
- Border：white 10%
- 文字：white 90%
- Hover：`#23262A`
- Height：36–40px
- Radius：8–10px

### 11.4 Icon Button

- 32px square
- Full radius
- `rgba(35,38,42,.75)`
- 可使用 8–16px backdrop blur
- Hover 提升到更亮的深灰

## 12. Inputs and Generator Controls

### 12.1 Text Area

- Surface：`#1C1E20`
- Border：white 5%–10%
- Radius：12px
- Label：14/20、`#898A8B`
- Placeholder：white 45%
- 最小高度：114px
- Padding top 必须给浮动/顶部 Label 留空间

Higgsfield 的 Prompt 面板由上下两个区域组成：

- 上部文本输入，顶部圆角 12px
- 下部 Elements/Audio 等附加控制，底部圆角 12px
- 两者构成一个连续控件，而不是多个浮动卡片

### 12.2 Upload Dropzone

- Surface：`#1C1E20`
- Border：dashed 或 white 10%
- Radius：12px
- 图标 20–24px
- 主文案 16px
- 支持格式 14px secondary
- 不使用大面积 Lime 边框

### 12.3 Segmented Control

- 外容器 Surface 1
- 内部选中块 Surface 2 或浅色反转
- 高度 32–40px
- Radius 8px 或 full
- 标签 12–14px、500
- 选中变化 150–200ms

### 12.4 Model Selector

- 作为独立深色行或卡片
- 模型名为主要文字
- Credits/Speed/Quality 为 secondary 或 mono
- 右侧使用 Chevron
- Hover 只提升 surface，不加 Lime 描边

## 13. Cards

### 13.1 Media Card

- Background：`#1C1E21`
- Radius：16px
- Padding：4px
- Gap：4px
- 媒体占 75% 以上视觉面积
- 标题和作者信息紧贴媒体下方
- Hover：background `#202326` 或 `#23262A`
- 不使用常驻明显阴影

### 13.2 Utility Card

- Background：`#1C1E20`
- Border：white 5%
- Radius：16px
- Padding：16px
- Min-height：126px
- Icon、名称、描述、Badge
- Mobile 2 列
- 不放长文案

### 13.3 App/Project Card

- Border：0.5–1px white 5%
- Radius：16px
- Padding：6px
- Gap：6px
- Poster 为主要内容
- Footer 显示 Name、Views、Credits
- Hover：`translateY(-2px)`，300ms

### 13.4 Pricing Card

- Radius：20px
- 深色纵向渐变
- 极弱径向高光
- Header Padding：16px
- 内部权益区使用更浅 3%–5% Surface
- 推荐卡可以使用 Lime/Olive 或 Pink Tint，但不能成为高饱和整块

### 13.5 Promo Card

- Radius：20px
- 可以使用暗红、暗青、暗紫媒体背景
- 主标题 Space Grotesk 28–32px uppercase
- 一小段说明
- 白色实心 CTA 或 Lime CTA
- Promo Badge 使用 Pink

## 14. Section Headers

标准结构：

```text
UPPERCASE SECTION TITLE
One concise supporting sentence.
```

规则：

- 标题可使用 Lime 或 White
- 说明使用 secondary text
- 标题与说明 gap 4px
- Header 与内容 gap 20px
- Desktop 标题 28/32
- Mobile 标题 24/28
- 更大型品牌段落可以使用 36–56px

## 15. Media and Art Direction

### 15.1 素材原则

- 使用真实生成结果，不使用通用 SaaS 插画。
- 首选电影感、时尚、广告、音乐视频和社交短片画面。
- 画面可以高饱和，但 UI Surface 保持低饱和。
- 海报可以内嵌大标题，但 UI 不重复同样信息。
- 所有缩略图必须有明确主体和良好裁切。

### 15.2 视频

- Autoplay 仅限 muted、loop、可见区域内的短预览。
- Mobile 使用 Poster 或按需加载，避免首屏同时播放多条视频。
- Hover 播放只能作为增强，点击和触屏仍可操作。
- 视频卡需要支持 Reduced Motion。

### 15.3 图片比例

- Feature carousel：约 16:9
- Community cards：16:9 媒体 + 紧凑 metadata
- App grid：约 16:9 poster
- Portrait generation：9:16 或 4:5
- Promo：宽屏横幅

## 16. Icons and Badges

### 16.1 Icons

- 线性图标
- 20–24px 标准尺寸
- Stroke 1.5–2px
- 默认 White/Secondary
- Active Lime
- 不混用填充卡通图标

### 16.2 Badges

类型：

- NEW：Lime 背景、深色文字
- DISCOUNT：Pink 背景、白色文字
- MODEL/TYPE：深灰背景、浅灰文字
- PREMIUM：Lime 10% 背景、Lime 文字
- INFO：Cyan 10% 背景、Cyan 文字

Badge 应小、紧凑、略带倾斜只用于促销，不要每张卡都倾斜。

## 17. Motion

### 17.1 Duration Tokens

```css
--duration-instant: 0ms;
--duration-fast: 100ms;
--duration-120: 120ms;
--duration-150: 150ms;
--duration-180: 180ms;
--duration-normal: 200ms;
--duration-220: 220ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### 17.2 Motion Rules

- Button hover/active：150–200ms
- Surface color：200ms
- Card lift：300ms
- Modal：200–300ms
- Promo 展开/收起：300ms ease-out
- Carousel 可使用惯性滚动
- Active press：scale 0.97
- Card hover：translateY -2px

推荐曲线：

```css
--ease-out-expo: cubic-bezier(.16, 1, .3, 1);
```

不要：

- 所有内容滚动入场
- 大范围模糊动画
- 慢于 500ms 的常规 UI 动效
- 鼠标跟随发光

始终支持：

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
  }
}
```

## 18. Modal and Overlay

- Overlay：black 70%–80%
- Modal Surface：`#1C1E20` 或 `#23262A`
- Radius：20–24px
- Border：white 5%–10%
- 大型产品介绍 Modal 可以左图右文
- Close：右上 32px full-round icon button
- 主 CTA 置底并接近全宽
- 不在 Modal 内嵌多层卡片

## 19. Responsive System

建议 Breakpoints：

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Mobile Adaptation

- Desktop Nav → 简化 Header + Bottom Nav
- 320px Tool Sidebar → 全宽步骤式面板或 Bottom Sheet
- 4-column Gallery → 2-column 或横向滑动
- 3-column Pricing → 单列
- 56px Heading → 36px
- 40px Generator Heading → 28px
- Tool CTA 固定在可达区域
- 不把桌面 Side Panel 单纯缩小

### Mobile QA sizes

- 360 × 800
- 390 × 844
- 430 × 932
- 768 × 1024

## 20. Accessibility

- Lime on dark 可作为文字；dark on Lime 用于按钮。
- Secondary text 不能低于 white 45% 且不能承载关键操作。
- Focus ring：2px Lime，offset 2px dark。
- 所有图标按钮必须有 accessible label。
- 所有视频必须有字幕或文字替代。
- 不依赖 Hover 才能发现操作。
- Bottom Nav Active 同时改变颜色和图标/标签状态。
- 表单 Error 靠文字说明，不只使用红色。
- Reduced Motion 必须生效。

## 21. Voice and Copy

### 21.1 品牌文案

- 短
- 直接
- 动词开头
- 结果导向
- 少用“Revolutionary / Cutting-edge / Unleash”

推荐：

- Make videos in one click
- Turn PDFs into watchable stories
- Pick a preset. Add your idea. Generate.
- Create, remix, publish

避免：

- Revolutionize your content creation journey
- Harness the power of next-generation artificial intelligence
- Unlock limitless creativity with our comprehensive solution

### 21.2 Labels

- Create Video
- Upload Media
- Prompt
- Model
- Duration
- Generate
- Credits
- History
- Download

Label 不使用营销化句子。

## 22. Component Inventory

### Global

- PromoStrip
- DesktopGlobalNav
- MobileHeader
- MobileBottomNav
- LogoMark
- PricingAction
- AuthAction

### Marketing

- FeatureCarousel
- FeatureCarouselCard
- SectionHeader
- CommunityProjectCard
- UtilityCard
- PromoCard
- FeatureStage
- MediaGallery
- ExploreMoreGrid

### Generator

- GeneratorShell
- GeneratorTabs
- GeneratorSidebar
- PresetCard
- UploadDropzone
- PromptEditor
- AttachedElementsBar
- ModelSelector
- ParameterRow
- CreditEstimate
- GenerateButton
- GenerationProgress
- PreviewStage
- OutputActions
- HistoryPanel

### Billing

- BillingToggle
- PricingCard
- DiscountBadge
- CreditRow
- FeatureList
- CheckoutCTA

### Feedback

- Toast
- InlineError
- SkeletonCard
- EmptyState
- RetryState
- InsufficientCreditsState
- ProcessingState
- SuccessState

## 23. Page Blueprints

### 23.1 Homepage

1. Promo Strip
2. Global Nav
3. Horizontal Feature Carousel
4. Product Shortcut/Sign-up Promo Grid
5. Lime Section Header
6. Community Work Grid
7. Explore Community CTA
8. Large Feature/App Stage
9. Model/Marketing Showcases
10. Explore More Features
11. High-contrast Footer Section
12. Footer

主页不要从传统“一个 H1 + 一段描述 + 两个按钮”开始。

### 23.2 SEO Tool Page

为了兼顾搜索意图，不应完全照搬首页：

1. Promo Strip
2. Global Nav
3. Tool Heading + Short Benefit
4. Generator Shell above the fold
5. Real Output Gallery
6. How It Works
7. Presets/Templates
8. Related Tools
9. FAQ
10. Footer

视觉仍保持黑、Lime、媒体优先，但内容结构必须服务搜索任务。

### 23.3 Generator Workspace

1. Promo Strip（可关闭）
2. Global Nav
3. 320px Sidebar + Flexible Preview
4. Tabs at sidebar top
5. Input controls stacked vertically
6. Sticky/anchored Generate CTA
7. Preview/How It Works on right
8. History and Help near workspace top

### 23.4 Pricing

1. Global Nav
2. Optional Discount Promo Card
3. Page Title + Description
4. Individual/Business Segmented Control
5. Monthly/Annual Toggle
6. 3-column Pricing Cards
7. Plan Comparison
8. FAQ
9. Footer

## 24. Do / Don’t Checklist

### Do

- 用真实作品撑起页面
- 用 Lime 指引主操作
- 用 Space Grotesk 做短促大写标题
- 用 Inter 构建稳定 UI
- 用 16px 页面边距保持紧凑一致
- 用 12/16/20/24px 分级圆角
- 用 5%–10% 白边框区分 Surface
- 保持表单和工作台克制
- 在移动端提供 Bottom Nav
- 为 Hover 提供触屏替代

### Don’t

- 不用紫色渐变
- 不做大面积 Lime 背景页面
- 不用荧光黄承载长段正文
- 不给每个卡片加投影
- 不让所有卡片尺寸完全一致
- 不把 Section 包成嵌套白边框卡片
- 不在工具页面堆叠大型宣传海报
- 不使用多个相互竞争的主 CTA
- 不使用低质量占位图
- 不复制 Higgsfield Logo、品牌名称或专有素材

## 25. Implementation Starter

```css
body {
  margin: 0;
  background: var(--hf-bg);
  color: var(--hf-text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.page-shell {
  width: 100%;
  padding-inline: 16px;
}

.hf-card {
  background: var(--hf-surface-1);
  border: 1px solid var(--hf-border-subtle);
  border-radius: var(--radius-card);
}

.hf-card:hover {
  background: var(--hf-surface-hover);
}

.hf-focus:focus-visible {
  outline: 2px solid var(--hf-lime);
  outline-offset: 2px;
}
```

## 26. Extraction Method and Source Evidence

本设计文档不是根据单张截图主观总结，而是通过以下步骤形成：

1. 检查 Higgsfield 首页的 Desktop 结构和完整内容流。
2. 在 390 × 844 视口检查 Mobile Header、卡片、字体缩放和 Bottom Nav。
3. 检查 Pricing 页面，提取商业页面的标题、套餐网格、卡片渐变和 Billing Controls。
4. 检查 AI Video Generator，提取 320px Sidebar、Prompt、Upload、Generate CTA、Credits 和 Preview Stage。
5. 读取页面实际计算样式，包括字体、字号、行高、颜色、圆角、Padding、Grid 和 Hover/Transition 类。
6. 提取实际 CSS 变量和字体资源，确认：
   - Space Grotesk
   - Inter
   - Instrument Serif
   - IBM Plex Mono / Space Mono
   - `#D1FE17` Lime
   - `#FF005B` Pink
   - `#0F1113` Page Background
   - `#1C1E20` / `#23262A` Surfaces
7. 对照 Desktop 与 Mobile，区分品牌表达规则和产品工具规则。

关键实测值：

| Item | Observed value |
|---|---|
| Page background | `#0F1113` |
| Primary surface | `#1C1E20` |
| Secondary surface | `#23262A` |
| Brand lime | `#D1FE17` |
| Brand pink | `#FF005B` |
| Promo strip | 49px |
| Desktop global nav | 52px |
| Mobile bottom nav | 61px |
| Page side padding | 16px |
| Generator sidebar | 320px |
| Main grid gap | 16px |
| Primary CTA | 48px high / 12px radius |
| Media cards | 16px radius |
| Pricing cards | 20px radius |
| Large feature stage | 24px radius |
| Card hover | 200–300ms, surface lift/change |

## 27. Final Quality Gate

页面只有同时满足以下要求，才算与 Higgsfield 风格一致：

- 页面 75% 以上视觉面积由 dark surfaces 和 media 构成。
- Lime 仍然是明显但稀缺的主操作色。
- 大型标题使用 Space Grotesk、uppercase、tight tracking。
- 表单和工作台使用 Inter 与低干扰 Surface。
- 媒体卡片比营销文案更突出。
- 没有紫色 AI 渐变、玻璃卡片堆叠和巨大投影。
- Desktop 和 Mobile 使用不同导航策略。
- Generator 的功能密度高于 Marketing 页面，但视觉令牌一致。
- 所有图片和视频都有真实产品含义。
- 页面即使移除 Higgsfield Logo，仍能通过字体、密度、色彩和组件语言呈现同类气质。

## 28. Project Design Contract

本文件是本项目后续开发的唯一设计基准（Single Source of Truth）。网站的首页、功能内页、生成器工作台、登录、支付、定价、账户中心和移动端界面，均应按照本文件定义的视觉语言、设计令牌、布局、组件、交互和响应式规则进行开发。

执行规则：

- 开发前先从本文件复用 Token 和组件规则，不为单个页面另造一套视觉系统。
- 品牌展示页与产品工作台允许具有不同的信息密度，但必须共享颜色、字体、圆角、间距和交互反馈。
- 新页面或新组件如果本文件已有对应规范，直接复用，不做主观改色或模板化替换。
- 如果实现需求与本文件冲突，优先保证核心任务完成、内容可读、操作可用和移动端可完成，再用最接近本规范的方式落地。
- 任何会改变主色、字体体系、圆角体系、导航模式或核心页面结构的修改，都需要明确确认后再更新本文件。
- 第三方页面可以作为交互和功能参考，但不能覆盖本文件已经确定的项目设计语言。
- 不复制 Higgsfield 的 Logo、商标、文案或专有媒体素材，只复用经过抽象的设计方法和视觉规律。

开发完成条件：

1. 实现符合第 27 节的全部质量门槛。
2. Desktop 与 Mobile 均完成真实内容和真实状态测试。
3. 登录、支付、生成、下载、失败、空状态和加载状态都具有一致的视觉反馈。
4. 页面在不依赖 Higgsfield 品牌资产的情况下，仍保持本文件定义的媒体优先、深色高对比、克制 Lime 操作色风格。

除非项目负责人明确批准新的设计方向，否则后续开发均以本文件为准，不再重新定义视觉风格。
