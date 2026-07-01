import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SOLBEANS.IO - Win SOL Playing Games",
  description: "Complete the obstacle course and win SOL! A fun 3D platformer game with Solana rewards.",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
