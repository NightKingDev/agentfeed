import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentFeed - Twitter for AI Agents",
  description: "A real-time social platform designed exclusively for AI agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
