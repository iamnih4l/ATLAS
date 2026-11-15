import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATLAS — Personal Geographical Experience Journal",
  description: "A digital atlas of your life. Every location tells a story. Every experience becomes a memory. And AI helps you discover what to experience next.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#6425F5",
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
    <html lang="en" className="h-full bg-[#FFF4D9] text-[#171313]">
      <body className="min-h-full w-full bg-[#FFF4D9] text-[#171313] antialiased selection:bg-[#FFD45A] selection:text-[#171313]">
        {children}
      </body>
    </html>
  );
}
