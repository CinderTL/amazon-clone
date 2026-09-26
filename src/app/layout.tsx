import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Header, Footer } from "@/components/Header";
import { SiteChrome } from "@/components/SiteChrome";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const heading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Lixazon — Simple marketplace",
    template: "%s | Lixazon",
  },
  description: "A friendly, high-energy marketplace for buyers and sellers—simple without missing features.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${heading.variable} ${body.variable}`}>
      <body id="top" className="flex flex-col antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <SiteChrome header={<Header />} footer={<Footer />}>
            {children}
          </SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
