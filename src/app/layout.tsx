import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Voice AI Assistant",
  description: "Conversational AI with advanced voice capabilities - speak naturally and get intelligent responses",
  keywords: ["AI", "voice assistant", "speech recognition", "conversational AI", "voice chat"],
  authors: [{ name: "Voice AI Team" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen`}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white animate-pulse"></div>
                </div>
                Voice AI Assistant
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Speak naturally, get intelligent responses
              </p>
            </div>
          </header>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}