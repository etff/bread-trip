import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "빵지순례 | 서울 빵집 탐험",
  description: "서울의 빵집을 탐험하고, 나만의 빵지도를 채워가는 따뜻한 탐방 서비스",
  keywords: ["빵집", "베이커리", "서울", "빵순이", "맛집", "카페"],
  openGraph: {
    title: "빵지순례",
    description: "서울의 빵집을 탐험하고, 나만의 빵지도를 채워가세요",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_MAPS_APP_KEY;

  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                console.log('🚀 Kakao Maps 초기화 시작');

                const KAKAO_APP_KEY = '${kakaoAppKey}';

                if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
                  console.log('✅ Kakao Maps SDK 이미 로드됨');
                  window.dispatchEvent(new Event('kakao-maps-ready'));
                  return;
                }

                const script = document.createElement('script');
                script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=' + KAKAO_APP_KEY + '&autoload=false';
                script.async = false;

                script.onload = function() {
                  console.log('✅ Kakao Maps SDK 스크립트 로드 완료');
                  if (window.kakao && window.kakao.maps) {
                    window.kakao.maps.load(function() {
                      console.log('✅ Kakao Maps SDK 초기화 완료');
                      window.dispatchEvent(new Event('kakao-maps-ready'));
                    });
                  }
                };

                script.onerror = function() {
                  console.error('❌ Kakao Maps SDK 로드 실패');
                };

                document.head.appendChild(script);
              })();
            `,
          }}
        />
      </head>
      <body className={`${geist.variable} antialiased`}>
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
