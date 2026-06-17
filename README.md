# 🌈 MoodCanvas — 情绪可视化日记

> 用视觉记录情绪，而不是文字。一个基于物理场的情绪可视化系统。

## 核心理念

MoodCanvas 不是传统的情绪记录工具，而是一个**情绪物理模拟器**：

```
Emotion Vector (5维) → Physics Field → Particle Simulation → Canvas Render
```

每种情绪不再只是一个标签，而是由五维向量（valence / arousal / tension / clarity / stability）驱动的动态物理场，粒子在五彩斑斓的画布上实时运动、扩散、抖动的视觉效果。

## 五种情绪场

| 情绪 | 场类型 | 颜色 | 视觉特征 |
| --- | --- | --- | --- |
| 😄 开心 | 扩张场 | 金色 `#FFD700` | 粒子向外扩散、上升漂浮 |
| 😢 难过 | 下沉场 | 蓝色 `#4A90E2` | 重力下沉、模糊扩散 |
| 😡 愤怒 | 爆裂场 | 红色 `#FF3B30` | 高能爆发、屏幕震动、光晕脉冲 |
| 😐 平静 | 稳态场 | 浅蓝 `#6EC6FF` | 流体波纹、呼吸光晕、低频流动 |
| 😰 焦虑 | 混沌场 | 灰色 `#B0B0B0` | 高频抖动、噪点闪烁、glitch 位移 |

## 五维情绪向量

```
EmotionVector {
  valence:   -1 ~ +1  情绪正负 → 扩张/收缩力 + 冷暖色调
  arousal:    0 ~  1  激活程度 → 粒子速度与数量
  tension:    0 ~  1  紧张程度 → 噪声强度
  clarity:    0 ~  1  清晰程度 → 模糊程度（反比）
  stability:  0 ~  1  稳定程度 → 随机漂移（反比）
}
```

## 三层渲染架构

```
Layer 1: 基础场       → 径向渐变背景 + 场特异光效（呼吸/亮斑）
Layer 2: 粒子系统     → 环境粒子 + 情绪粒子物理模拟（5种力驱动）
Layer 3: 干扰层       → 噪声 / 模糊 / glitch / 屏幕震动
       ↓
   情绪标签叠加
```

## 功能

- 选择情绪 + 调节强度 → 实时生成动态粒子画布
- 情绪时间轴（按日期分组，可点击回放）
- PNG 导出（所见即所得，逻辑分辨率）
- Web Share API 分享
- localStorage 持久化
- Glass Morphism 暗色主题

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 状态 | Zustand |
| 路由 | react-router-dom v6 |
| 动效 | Framer Motion |
| 绘图 | Canvas 2D API / RAF 60fps |
| 存储 | localStorage |

## 项目结构

```
mood-canvas/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json                  # Vercel 一键部署配置
│
├── src/
│   ├── core/                    # 核心引擎
│   │   ├── emotionEngine.ts     # 五维向量 + 场参数计算 + 预设情绪
│   │   ├── canvasEngine.ts      # 总控引擎（RAF 循环 + 三层渲染 + 导出）
│   │   ├── particleSystem.ts    # 粒子系统（物理力模拟 + 自动补充）
│   │   └── motionEngine.ts      # 基础场 + 干扰层 + 环境粒子
│   │
│   ├── components/
│   │   ├── EmotionSelector.tsx   # 情绪选择 + 强度滑块 + 备注
│   │   ├── MoodCanvas.tsx        # 全屏 Canvas 组件
│   │   ├── Timeline.tsx          # 情绪时间轴
│   │   └── ExportPanel.tsx       # PNG 导出 / 分享
│   │
│   ├── pages/
│   │   ├── Home.tsx              # 首页（情绪选择入口）
│   │   ├── Create.tsx            # 画布页（粒子可视化）
│   │   └── Archive.tsx           # 归档页（历史时间轴）
│   │
│   ├── store/moodStore.ts        # Zustand 全局状态
│   ├── utils/
│   │   ├── storage.ts            # localStorage
│   │   └── export.ts             # 导出工具
│   ├── App.tsx                   # 路由
│   ├── main.tsx                  # 入口
│   └── index.css                 # Glass Morphism 暗色主题
│
└── dist/                         # 构建产物
```

## 快速开始

```bash
cd mood-canvas
npm install
npm run dev       # http://localhost:5173
```

## 构建

```bash
npm run build     # → dist/
npm run preview   # 预览构建产物
```

## Vercel 部署

项目已包含 `vercel.json`，无需额外配置：

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入仓库
3. Vercel 自动识别 Vite 框架，直接部署

## 交互流程

```
首页 → 选择情绪 → 调强度 → 记录情绪
  ↓
画布页 → 实时粒子场 + 导出PNG / 分享 ↗
  ↓                      ↑
时间轴 → 点击历史记录 → 跳转回画布回放
```

## 可扩展方向

- AI 情绪识别（文本 → EmotionVector）
- Three.js 情绪宇宙
- 情绪时间轨迹分析
- 音乐驱动情绪场
- PWA 离线支持
