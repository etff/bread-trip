"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ImageUpload from "@/components/ui/ImageUpload";
import type { District } from "@/types/common";

interface AddressSearchResult {
  address_name: string;
  x: string; // lng
  y: string; // lat
}

const districts: District[] = [
  "성수",
  "망원",
  "홍대",
  "연남",
  "이태원",
  "경리단길",
  "한남",
  "강남",
  "신사",
  "압구정",
  "성북",
  "부암",
  "기타",
];

export default function NewBakeryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    district: "" as District | "",
    lat: 0,
    lng: 0,
    signature_bread: "",
    description: "",
    image_url: "",
  });

  // 주소 검색
  const [addressQuery, setAddressQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Kakao Maps SDK 로드 대기
  useEffect(() => {
    const checkKakaoLoaded = () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        setIsKakaoLoaded(true);
        return true;
      }
      return false;
    };

    if (checkKakaoLoaded()) {
      return;
    }

    // SDK가 로드될 때까지 polling
    const interval = setInterval(() => {
      if (checkKakaoLoaded()) {
        clearInterval(interval);
      }
    }, 100);

    // 최대 10초 대기
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!isKakaoLoaded) {
        console.error("Kakao Maps SDK 로드 실패");
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleAddressSearch = () => {
    if (!addressQuery.trim()) return;

    // Kakao Maps SDK 로드 확인
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      alert("지도 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsSearching(true);

    // Kakao 주소 검색 API
    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(addressQuery, (result: any, status: any) => {
      setIsSearching(false);

      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(result);
      } else {
        alert("주소를 찾을 수 없습니다. 다시 시도해주세요.");
        setSearchResults([]);
      }
    });
  };

  const handleSelectAddress = (result: AddressSearchResult) => {
    setFormData({
      ...formData,
      address: result.address_name,
      lat: parseFloat(result.y),
      lng: parseFloat(result.x),
    });
    setSearchResults([]);
    setAddressQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.name.trim()) {
      alert("빵집 이름을 입력해주세요.");
      return;
    }

    if (!formData.address) {
      alert("주소를 검색하여 선택해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/bakeries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("빵집이 등록되었습니다!");
        router.push(`/bakeries/${data.bakery.id}`);
      } else {
        alert(data.error || "등록에 실패했습니다.");
      }
    } catch (error) {
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-cream">
        <div className="max-w-screen-md mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-cream rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-brown" />
          </button>
          <h1 className="text-lg font-bold text-brown ml-3">빵집 등록하기</h1>
        </div>
      </div>

      {/* 폼 */}
      <div className="max-w-screen-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-800 text-sm mb-6 font-semibold">
            새로운 빵집을 발견하셨나요? 다른 빵지러들과 공유해보세요!
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 빵집 이름 */}
            <Input
              label="빵집 이름 *"
              placeholder="예) 성수연방"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            {/* 주소 검색 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                주소 검색 *
              </label>

              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="주소를 입력하세요"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddressSearch();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddressSearch}
                  disabled={isSearching || !isKakaoLoaded}
                  className="px-4"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>

              {/* 검색 결과 */}
              {searchResults.length > 0 && (
                <div className="border border-cream rounded-lg p-2 space-y-1 max-h-48 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectAddress(result)}
                      className="w-full text-left px-3 py-2 hover:bg-cream rounded-lg transition-colors text-sm text-gray-900 font-medium"
                    >
                      <MapPin className="w-4 h-4 inline mr-1 text-brown" />
                      {result.address_name}
                    </button>
                  ))}
                </div>
              )}

              {/* 선택된 주소 */}
              {formData.address && (
                <div className="mt-2 p-3 bg-cream rounded-lg text-sm text-gray-900 font-semibold">
                  <MapPin className="w-4 h-4 inline mr-1 text-brown" />
                  {formData.address}
                </div>
              )}
            </div>

            {/* 지역 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                지역
              </label>
              <select
                value={formData.district}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    district: e.target.value as District,
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brown focus:border-transparent text-gray-900 font-medium"
              >
                <option value="">지역을 선택하세요</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            {/* 대표 메뉴 */}
            <Input
              label="대표 메뉴"
              placeholder="예) 크루아상"
              value={formData.signature_bread}
              onChange={(e) =>
                setFormData({ ...formData, signature_bread: e.target.value })
              }
            />

            {/* 빵집 소개 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                빵집 소개
              </label>
              <textarea
                placeholder="이 빵집의 특징이나 분위기를 소개해주세요"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brown focus:border-transparent text-gray-900 resize-none"
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                대표 이미지
              </label>
              <ImageUpload
                currentImage={formData.image_url}
                onUploadComplete={(url) =>
                  setFormData({ ...formData, image_url: url })
                }
              />
            </div>

            {/* 제출 버튼 */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !formData.name || !formData.address}
            >
              {isLoading ? "등록 중..." : "빵집 등록하기"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
