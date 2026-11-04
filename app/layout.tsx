import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "말씀기록장 — 성경통독 기록",
  description: "목양교회 성도와 함께 성경 66권 중 원하는 책을 골라 통독 기록을 남기는 앱입니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body
        className="h-dvh w-full overflow-y-auto bg-background font-serif text-foreground antialiased"
      >
        {children}
      </body>
    </html>
  );
}
