import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "字体文件修复器",
  description:
    "在线修复损坏或不兼容的 TTF / OTF 字体文件，解决浏览器 Failed to decode 和 OTS parsing error 报错，免费使用。",
  keywords: ["字体修复", "TTF修复", "OTF修复", "字体转换", "OTS parsing error"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "字体文件修复器 | 云端字帖",
    description:
      "在线修复损坏或不兼容的 TTF / OTF 字体文件，解决浏览器 Failed to decode 和 OTS parsing error 报错，免费使用。",
    type: "website",
  },
};

export default function RepairLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
