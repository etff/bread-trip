"use client";

import { useEffect } from "react";

export default function KakaoMapsLoader() {
  useEffect(() => {
    const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_MAPS_APP_KEY;

    if (!kakaoAppKey) {
      return;
    }

    // 이미 로드되어 있는지 확인
    if (
      window.kakao &&
      window.kakao.maps &&
      window.kakao.maps.LatLng
    ) {
      window.dispatchEvent(new Event("kakao-maps-ready"));
      return;
    }

    // 스크립트 동적 로드
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoAppKey}&autoload=false`;
    script.async = false;

    script.onload = function () {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(function () {
          window.dispatchEvent(new Event("kakao-maps-ready"));
        });
      }
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      // 스크립트 제거는 하지 않음 (재사용 위해)
    };
  }, []);

  return null;
}
