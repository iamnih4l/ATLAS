import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATLAS — Personal Geographical Experience Journal",
  description: "A digital atlas of your life. Every location tells a story. Every experience becomes a memory. And AI helps you discover what to experience next.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#09090b] text-[#f5f5f0]">
      <body className="h-full w-full overflow-hidden bg-[#09090b] text-[#f5f5f0] antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
