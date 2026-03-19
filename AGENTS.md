# Agents Guide

## 项目简介

「练字助手」是一个基于 Next.js 的中文练字 Web 应用，帮助用户在浏览器中生成字帖、练习书写。

## 包管理器

本项目使用 **pnpm**，请勿使用 `npm` 或 `yarn`。

```bash
pnpm install   # 安装依赖
pnpm dev       # 启动开发服务器
pnpm build     # 生产构建
pnpm start     # 启动生产服务器
pnpm lint      # 代码检查
```

## 项目结构

```
.
├── app/
│   ├── api/
│   │   └── fonts/
│   │       └── route.ts       # 扫描 public/ 中的字体文件并返回列表
│   ├── lib/
│   │   ├── configStorage.ts   # localStorage 配置持久化（页面设置、自定义内容）
│   │   └── fontStorage.ts     # IndexedDB 字体缓存（用户上传的字体）
│   ├── repair/
│   │   └── page.tsx           # 字体修复工具页
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # 主页面（字帖生成器）
├── public/                    # 静态资源；放入此目录的字体文件会自动出现在字体选项中
└── AGENTS.md                  # 本文件
```

## 字体机制

- **系统 / Google 字体**：硬编码在 `page.tsx` 的 `WEB_FONTS` 数组中。
- **内置字体**：放置在 `public/` 目录下的 `.ttf`、`.otf`、`.woff`、`.woff2` 文件，由 `/api/fonts` 接口自动扫描，在前端通过 `FontFace` API 加载，并在字体选择器的「内置字体」分组中展示。
- **用户上传字体**：通过「加载本地字体」按钮上传，存储于 IndexedDB，在字体选择器的「本地缓存字体」分组中展示。

若需新增内置字体，直接将字体文件复制到 `public/` 目录即可，无需修改任何代码。

## 技术栈

| 技术 | 版本 |
|------|------|
| Next.js | 16.2.x |
| React | 19.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| lucide-react | 0.563.x |

## 开发注意事项

- 主页面 (`app/page.tsx`) 是客户端组件（`'use client'`），所有字体加载和 IndexedDB 操作均在客户端执行。
- `app/api/fonts/route.ts` 是服务端路由，运行在 Node.js 环境中，可以使用 `fs` 模块。
- 页面配置（字号、格线类型、颜色等）通过 `configStorage.ts` 持久化到 `localStorage`。
- 构建产物在 `.next/` 目录，已被 `.gitignore` 忽略。
