import type { Metadata } from "next";
import { Cairo, Amiri } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-quran",
});

export const metadata: Metadata = {
  title: "رحيق القرآن | نظام متكامل لإدارة حلقات تحفيظ القرآن الكريم",
  description: "رحيق القرآن — منصة تفاعلية حديثة لحفظ ومراجعة القرآن الكريم، تدعم الحصص المباشرة والخطط الفردية وتقارير أولياء الأمور والتقييم والشهادات المعتمدة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${amiri.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-cream dark:bg-dark-bg text-gray-800 dark:text-gray-200">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
