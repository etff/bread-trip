"use client";

import { useEffect } from "react";

export default function KakaoMapsLoader() {
  useEffect(() => {
    const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_MAPS_APP_KEY;

    if (!kakaoAppKey) {
      console.error("❌ KAKAO_MAPS_APP_KEY가 설정되지 않았습니다.");
      return;
    }

    console.log("🚀 Kakao Maps 초기화 시작");

    // 이미 로드되어 있는지 확인
    if (
      window.kakao &&
      window.kakao.maps &&
      window.kakao.maps.LatLng
    ) {
      console.log("✅ Kakao Maps SDK 이미 로드됨");
      window.dispatchEvent(new Event("kakao-maps-ready"));
      return;
    }

    // 스크립트 동적 로드
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoAppKey}&autoload=false`;
    script.async = false;

    script.onload = function () {
      console.log("✅ Kakao Maps SDK 스크립트 로드 완료");
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(function () {
          console.log("✅ Kakao Maps SDK 초기화 완료");
          window.dispatchEvent(new Event("kakao-maps-ready"));
        });
      }
    };

    script.onerror = function () {
      console.error("❌ Kakao Maps SDK 로드 실패");
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      // 스크립트 제거는 하지 않음 (재사용 위해)
    };
  }, []);

  return null;
}
