"use client";

import { useEffect, useRef, useState } from "react";
import type { ChallengeBakeryWithBakery } from "@/types/common";

interface ChallengeMapProps {
  challengeBakeries: ChallengeBakeryWithBakery[];
  onBakeryClick?: (bakeryId: string) => void;
}

export default function ChallengeMap({
  challengeBakeries,
  onBakeryClick,
}: ChallengeMapProps) {
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
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 7,
        };

        const mapInstance = new window.kakao.maps.Map(container, options);
        setMap(mapInstance);
        return true;
      } catch (error) {
        return false;
      }
    };

    if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
      initMap();
    } else {
      const handleReady = () => {
        initMap();
      };

      window.addEventListener("kakao-maps-ready", handleReady);

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
  }, []);

  // 마커 표시
  useEffect(() => {
    if (!map) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 생성
    challengeBakeries.forEach((cb) => {
      const { bakery, visited_at } = cb;
      const isVisited = !!visited_at;

      const markerPosition = new window.kakao.maps.LatLng(
        bakery.lat,
        bakery.lng
      );

      // 방문/미방문 상태에 따라 다른 마커 이미지
      const markerColor = isVisited ? "#22C55E" : "#9CA3AF"; // green-500 : gray-400
      const markerImageSrc =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
            <g>
              <!-- 그림자 -->
              <ellipse cx="20" cy="46" rx="12" ry="4" fill="rgba(0,0,0,0.2)"/>
              <!-- 핀 배경 -->
              <path d="M20 0 C10 0 2 8 2 18 C2 28 20 48 20 48 C20 48 38 28 38 18 C38 8 30 0 20 0 Z" fill="${markerColor}"/>
              <!-- 내부 원 -->
              <circle cx="20" cy="16" r="12" fill="#FFFFFF"/>
              <!-- 체크 또는 빵 아이콘 -->
              <text x="20" y="22" font-size="16" text-anchor="middle">${isVisited ? "✓" : "🍞"}</text>
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
      if (onBakeryClick) {
        window.kakao.maps.event.addListener(marker, "click", () => {
          onBakeryClick(bakery.id);
        });
      }

      markersRef.current.push(marker);
    });

    // 초기 로드 시에만 모든 마커가 보이도록 bounds 조정
    if (challengeBakeries.length > 0 && !isInitialBoundsSetRef.current) {
      const bounds = new window.kakao.maps.LatLngBounds();
      challengeBakeries.forEach((cb) => {
        bounds.extend(new window.kakao.maps.LatLng(cb.bakery.lat, cb.bakery.lng));
      });
      map.setBounds(bounds);
      isInitialBoundsSetRef.current = true;
    }
  }, [map, challengeBakeries, onBakeryClick]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />

      {/* 범례 */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-700">방문 완료</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span className="text-xs text-gray-700">미방문</span>
        </div>
      </div>
    </div>
  );
}
