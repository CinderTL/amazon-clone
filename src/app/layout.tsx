import type { Metadata } from "next";
import { Header, Footer } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lixazon — Shop everything",
    template: "%s | Lixazon",
  },
  description: "Lixazon is a demo marketplace for everyday essentials, electronics, fashion, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body id="top" className="flex flex-col antialiased" suppressHydrationWarning>
        <div className="min-h-[100vh] min-h-svh flex flex-col">
          <div className="shrink-0">
            <Header />
          </div>
          <main className="flex-1 w-full flex flex-col min-h-0">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
