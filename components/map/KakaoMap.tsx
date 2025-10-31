"use client";

import { useEffect, useRef, useState } from "react";
import type { Bakery } from "@/types/common";

interface KakaoMapProps {
  bakeries: Bakery[];
  onMarkerClick?: (bakery: Bakery) => void;
  center?: { lat: number; lng: number };
  level?: number;
}

export default function KakaoMap({
  bakeries,
  onMarkerClick,
  center = { lat: 37.5665, lng: 126.9780 }, // 서울 시청 기본 좌표
  level = 7,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const markersRef = useRef<any[]>([]);
  const isInitialBoundsSetRef = useRef(false);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const initMap = () => {
      const container = mapRef.current;
      if (
        !container ||
        !window.kakao ||
        !window.kakao.maps ||
        !window.kakao.maps.LatLng
      ) {
        return false;
      }

      try {
        const options = {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level,
        };

        const mapInstance = new window.kakao.maps.Map(container, options);
        setMap(mapInstance);
        return true;
      } catch (error) {
        return false;
      }
    };

    // Kakao Maps SDK가 완전히 초기화되었는지 확인
    if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
      initMap();
    } else {
      // 'kakao-maps-ready' 이벤트를 기다림
      const handleReady = () => {
        initMap();
      };

      window.addEventListener("kakao-maps-ready", handleReady);

      // 폴백: 이벤트를 놓쳤을 경우를 대비한 polling
      let attempts = 0;
      const maxAttempts = 50;

      const checkKakao = setInterval(() => {
        attempts++;

        if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
          clearInterval(checkKakao);
          initMap();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkKakao);
        }
      }, 100);

      return () => {
        window.removeEventListener("kakao-maps-ready", handleReady);
        clearInterval(checkKakao);
      };
    }
  }, [center.lat, center.lng, level]);

  // 마커 표시
  useEffect(() => {
    if (!map) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 생성
    bakeries.forEach((bakery) => {
      const markerPosition = new window.kakao.maps.LatLng(
        bakery.lat,
        bakery.lng
      );

      // 커스텀 마커 이미지 (빵 이모지)
      const markerImageSrc =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
            <g>
              <!-- 그림자 -->
              <ellipse cx="20" cy="46" rx="12" ry="4" fill="rgba(0,0,0,0.2)"/>
              <!-- 핀 배경 -->
              <path d="M20 0 C10 0 2 8 2 18 C2 28 20 48 20 48 C20 48 38 28 38 18 C38 8 30 0 20 0 Z" fill="#8B5E3C"/>
              <!-- 내부 원 -->
              <circle cx="20" cy="16" r="12" fill="#F6E9D8"/>
              <!-- 빵 이모지 -->
              <text x="20" y="22" font-size="16" text-anchor="middle">🍞</text>
            </g>
          </svg>
        `);

      const markerImageSize = new window.kakao.maps.Size(40, 50);
      const markerImageOption = {
        offset: new window.kakao.maps.Point(20, 50),
      };

      const markerImage = new window.kakao.maps.MarkerImage(
        markerImageSrc,
        markerImageSize,
        markerImageOption
      );

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        image: markerImage,
        title: bakery.name,
      });

      marker.setMap(map);

      // 마커 클릭 이벤트
      if (onMarkerClick) {
        window.kakao.maps.event.addListener(marker, "click", () => {
          onMarkerClick(bakery);
        });
      }

      markersRef.current.push(marker);
    });

    // 초기 로드 시에만 모든 마커가 보이도록 bounds 조정
    if (bakeries.length > 0 && !isInitialBoundsSetRef.current) {
      const bounds = new window.kakao.maps.LatLngBounds();
      bakeries.forEach((bakery) => {
        bounds.extend(new window.kakao.maps.LatLng(bakery.lat, bakery.lng));
      });
      map.setBounds(bounds);
      isInitialBoundsSetRef.current = true;
    }
  }, [map, bakeries, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
