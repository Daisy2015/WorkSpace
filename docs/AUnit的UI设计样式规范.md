# &#x20;通用 UI 样式规范（基础版 / 可复用）

> 适用于：所有页面、所有产品模块、所有组件设计的统一底层规范

***

# 一、设计基础原则（Design Principles）

### 1. 视觉基调

- 浅色体系（Light Theme）
- 低对比（Soft Contrast）
- 扁平化（Flat Design）
- 依赖间距而非颜色区分层级

***

# 二、颜色规范（Color Tokens）

## 1. 主色（Primary）

Token

值

用途

primary

\#3B82F6

主操作

primary-hover

\#2563EB

Hover

primary-active

\#1D4ED8

点击

***

## 2. 中性色（Neutral）

Token

值

用途

bg-page

\#F5F7FA

页面背景

bg-container

\#FFFFFF

容器背景

border

\#E5E7EB

边框

divider

\#F0F0F0

分割线

***

## 3. 文本色（Text）

Token

值

text-primary

\#1F2937

text-regular

\#374151

text-secondary

\#6B7280

text-placeholder

\#9CA3AF

***

## 4. 语义色（Semantic）

Token

值

success

\#10B981

warning

\#F59E0B

error

\#EF4444

info

\#3B82F6

***

# 三、字体规范（Typography）

## 字体族

- 中文：PingFang SC / 思源黑体
- 英文：Inter / Helvetica / Arial

***

## 字号体系

Token

大小

用途

font-xl

20px

页面标题

font-lg

16px

区块标题

font-md

14px

正文

font-sm

12px

辅助

***

## 字重

Token

值

regular

400

medium

500

semibold

600

***

# 四、间距规范（Spacing System）

基于 **8px 栅格体系**

Token

数值

space-xs

4px

space-sm

8px

space-md

16px

space-lg

24px

space-xl

32px

***

# 五、圆角规范（Radius）

Token

值

radius-sm

4px

radius-md

8px

radius-lg

12px

radius-pill

999px

***

# 六、边框规范（Border）

Token

值

border-width

1px

border-color

\#E5E7EB

border-style

solid

***

# 七、阴影规范（Shadow）

（整体风格偏弱，尽量少用）

Token

值

shadow-sm

0 1px 2px rgba(0,0,0,0.05)

shadow-md

0 2px 6px rgba(0,0,0,0.08)

👉 建议：**优先用边框，不用阴影**

***

# 八、尺寸规范（Size）

## 控件高度

Token

值

height-sm

28px

height-md

32px

height-lg

40px

***

## 图标尺寸

Token

值

icon-sm

16px

icon-md

20px

icon-lg

24px

***

# 九、透明度（Opacity）

Token

值

disabled

0.4

hover-overlay

0.04

***

# 十、交互状态（Interaction States）

## Hover

- 背景：浅色叠加（opacity 4%）
- 或边框加深

## Active

- 颜色加深一档
- 或透明度降低

## Disabled

- 降低 opacity（40%）
- 禁止交互（cursor: not-allowed）

***

# 十一、过渡动画（Motion）

Token

值

transition-fast

0.15s

transition-base

0.2s

推荐：

```
transition: all 0.2s ease;

```

***

# 十二、设计 Token（可直接给前端用）

```
{
  "color": {
    "primary": "#3B82F6",
    "bgPage": "#F5F7FA",
    "bgContainer": "#FFFFFF",
    "border": "#E5E7EB",
    "textPrimary": "#1F2937",
    "textRegular": "#374151",
    "textSecondary": "#6B7280"
  },
  "radius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px"
  },
  "spacing": {
    "sm": "8px",
    "md": "16px",
    "lg": "24px"
  }
}

```

***

