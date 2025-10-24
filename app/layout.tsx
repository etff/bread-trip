import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import KakaoMapsLoader from "@/components/KakaoMapsLoader";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "빵지순례 | 서울 빵집 탐험",
  description: "서울의 빵집을 탐험하고, 나만의 빵지도를 채워가는 따뜻한 탐방 서비스",
  keywords: ["빵집", "베이커리", "서울", "빵순이", "맛집", "카페"],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "빵지순례",
    description: "서울의 빵집을 탐험하고, 나만의 빵지도를 채워가세요",
    type: "website",
    images: ["/mascot.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} antialiased`}>
        <KakaoMapsLoader />
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 pb-16">
            {children}
          </main>
          <Navigation />
        </div>
      </body>
    </html>
  );
}
