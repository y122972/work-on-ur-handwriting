import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hanzi.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "云端字帖 - 在线中文练字工具",
    template: "%s | 云端字帖",
  },
  description:
    "免费在线生成中文练字字帖，支持楷体、宋体、行书等多种字体，田字格、米字格、回字格等格线样式，自定义文字内容，一键打印练字。",
  keywords: [
    "练字",
    "字帖",
    "中文练字",
    "在线字帖",
    "汉字练习",
    "毛笔字",
    "钢笔字",
    "硬笔书法",
    "田字格",
    "米字格",
    "楷体",
    "行书",
  ],
  authors: [{ name: "云端字帖" }],
  creator: "云端字帖",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName: "云端字帖",
    title: "云端字帖 - 在线中文练字工具",
    description:
      "免费在线生成中文练字字帖，支持楷体、宋体、行书等多种字体，田字格、米字格、回字格等格线样式，自定义文字内容，一键打印练字。",
  },
  twitter: {
    card: "summary_large_image",
    title: "云端字帖 - 在线中文练字工具",
    description:
      "免费在线生成中文练字字帖，支持楷体、宋体、行书等多种字体，田字格、米字格、回字格等格线样式，自定义文字内容，一键打印练字。",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
