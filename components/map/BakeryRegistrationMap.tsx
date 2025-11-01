"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface BakeryRegistrationMapProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
}

export default function BakeryRegistrationMap({
  onLocationSelect,
  initialLocation,
}: BakeryRegistrationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string>("");

  // 기본 중심 좌표 (서울 시청)
  const defaultCenter = { lat: 37.5665, lng: 126.9780 };
  const center = initialLocation || defaultCenter;

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current) return;

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
          level: 3, // 더 자세한 레벨
        };

        const mapInstance = new window.kakao.maps.Map(container, options);
        setMap(mapInstance);

        // Geocoder 초기화
        if (window.kakao.maps.services) {
          geocoderRef.current = new window.kakao.maps.services.Geocoder();
        }

        return true;
      } catch (error) {
        console.error("Map initialization failed:", error);
        return false;
      }
    };

    // Kakao Maps SDK 로딩 체크
    if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
      initMap();
    } else {
      const handleReady = () => {
        initMap();
      };

      window.addEventListener("kakao-maps-ready", handleReady);

      // 폴백 polling
      let attempts = 0;
      const maxAttempts = 50;

      const checkKakao = setInterval(() => {
        attempts++;

        if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
          clearInterval(checkKakao);
          initMap();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkKakao);
          console.error("Kakao Maps SDK loading timeout");
        }
      }, 100);

      return () => {
        window.removeEventListener("kakao-maps-ready", handleReady);
        clearInterval(checkKakao);
      };
    }
  }, [center.lat, center.lng]);

  // 좌표로부터 주소 가져오기 (Reverse Geocoding)
  const getAddressFromCoords = (lat: number, lng: number) => {
    if (!geocoderRef.current) {
      console.error("Geocoder not initialized");
      return;
    }

    setIsLoading(true);

    geocoderRef.current.coord2Address(lng, lat, (result: any, status: any) => {
      setIsLoading(false);

      if (status === window.kakao.maps.services.Status.OK) {
        const address = result[0]?.address?.address_name || "";
        const roadAddress = result[0]?.road_address?.address_name || "";

        // 도로명 주소 우선, 없으면 지번 주소
        const finalAddress = roadAddress || address;

        setCurrentAddress(finalAddress);

        onLocationSelect({
          lat,
          lng,
          address: finalAddress,
        });
      } else {
        console.error("Reverse geocoding failed:", status);
        onLocationSelect({
          lat,
          lng,
          address: "",
        });
      }
    });
  };

  // 마커 생성/업데이트
  const updateMarker = (lat: number, lng: number) => {
    if (!map) return;

    const position = new window.kakao.maps.LatLng(lat, lng);

    if (markerRef.current) {
      // 기존 마커 위치 업데이트
      markerRef.current.setPosition(position);
    } else {
      // 새 마커 생성
      const markerImageSrc =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
            <g>
              <!-- 그림자 -->
              <ellipse cx="24" cy="54" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
              <!-- 핀 배경 -->
              <path d="M24 0 C12 0 2 10 2 22 C2 34 24 56 24 56 C24 56 46 34 46 22 C46 10 36 0 24 0 Z" fill="#8B5E3C"/>
              <!-- 내부 원 -->
              <circle cx="24" cy="20" r="14" fill="#F6E9D8"/>
              <!-- 빵 이모지 -->
              <text x="24" y="28" font-size="18" text-anchor="middle">🍞</text>
            </g>
          </svg>
        `);

      const markerImageSize = new window.kakao.maps.Size(48, 58);
      const markerImageOption = {
        offset: new window.kakao.maps.Point(24, 58),
      };

      const markerImage = new window.kakao.maps.MarkerImage(
        markerImageSrc,
        markerImageSize,
        markerImageOption
      );

      const marker = new window.kakao.maps.Marker({
        position,
        image: markerImage,
        draggable: true, // 드래그 가능
      });

      marker.setMap(map);
      markerRef.current = marker;

      // 드래그 종료 이벤트
      window.kakao.maps.event.addListener(marker, "dragend", () => {
        const markerPosition = marker.getPosition();
        const lat = markerPosition.getLat();
        const lng = markerPosition.getLng();

        // 지도 중심을 마커로 이동
        map.setCenter(markerPosition);

        // 주소 업데이트
        getAddressFromCoords(lat, lng);
      });
    }

    // 지도 중심을 마커로 이동
    map.setCenter(position);
  };

  // 지도 클릭 이벤트
  useEffect(() => {
    if (!map) return;

    const handleClick = (mouseEvent: any) => {
      const latlng = mouseEvent.latLng;
      const lat = latlng.getLat();
      const lng = latlng.getLng();

      updateMarker(lat, lng);
      getAddressFromCoords(lat, lng);
    };

    window.kakao.maps.event.addListener(map, "click", handleClick);

    return () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.event) {
        window.kakao.maps.event.removeListener(map, "click", handleClick);
      }
    };
  }, [map]);

  // 초기 위치에 마커 생성
  useEffect(() => {
    if (map && initialLocation) {
      updateMarker(initialLocation.lat, initialLocation.lng);
      if (initialLocation.address) {
        setCurrentAddress(initialLocation.address);
      } else {
        getAddressFromCoords(initialLocation.lat, initialLocation.lng);
      }
    }
  }, [map, initialLocation]);

  // 현재 위치로 이동
  const moveToCurrentLocation = () => {
    if (!map) return;

    setIsLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          updateMarker(lat, lng);
          getAddressFromCoords(lat, lng);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.");
          setIsLoading(false);
        }
      );
    } else {
      alert("이 브라우저는 위치 서비스를 지원하지 않습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* 지도 */}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: "400px" }}
      />

      {/* 컨트롤 버튼들 */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* 현재 위치 버튼 */}
        <button
          onClick={moveToCurrentLocation}
          disabled={isLoading}
          className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="내 위치로 이동"
        >
          <Navigation className="w-5 h-5 text-[#8B5E3C]" />
        </button>
      </div>

      {/* 주소 표시 영역 */}
      {currentAddress && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-[#8B5E3C] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">선택된 위치</p>
              <p className="text-sm font-medium text-gray-900">{currentAddress}</p>
            </div>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center rounded-lg">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin text-2xl">🍞</div>
            <span className="text-sm text-gray-700">주소를 찾는 중...</span>
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      {!markerRef.current && !isLoading && (
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm text-gray-700">
            📍 지도를 클릭해서 빵집 위치를 선택하세요
          </p>
        </div>
      )}
    </div>
  );
}
