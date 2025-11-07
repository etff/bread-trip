"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, CheckCircle, History, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ImageUpload from "@/components/ui/ImageUpload";
import BakeryRegistrationMap from "@/components/map/BakeryRegistrationMap";
import { detectDistrictFromAddress } from "@/lib/utils";
import type { District, Theme } from "@/types/common";

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface DuplicateBakery {
  id: string;
  name: string;
  address: string;
  distance?: number;
  matchReason: "same_name" | "nearby";
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

const RECENT_LOCATIONS_KEY = "breadtrip_recent_locations";
const MAX_RECENT_LOCATIONS = 5;

export default function NewBakeryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    district: "" as District | "",
    lat: 0,
    lng: 0,
    signature_bread: "",
    description: "",
    image_url: "",
    themeIds: [] as string[],
  });

  // 중복 체크
  const [duplicates, setDuplicates] = useState<DuplicateBakery[]>([]);
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);

  // 최근 위치
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);
  const [showRecentLocations, setShowRecentLocations] = useState(false);

  // 테마 목록
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);

  // 테마 목록 불러오기
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch("/api/themes");
        const data = await response.json();
        if (data.themes) {
          setThemes(data.themes);
        }
      } catch (error) {
        console.error("Failed to load themes:", error);
      } finally {
        setIsLoadingThemes(false);
      }
    };

    fetchThemes();
  }, []);

  // 최근 위치 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_LOCATIONS_KEY);
      if (saved) {
        const locations = JSON.parse(saved);
        setRecentLocations(locations);
      }
    } catch (error) {
      console.error("Failed to load recent locations:", error);
    }
  }, []);

  // 최근 위치 저장
  const saveRecentLocation = (location: Location) => {
    try {
      const updated = [
        location,
        ...recentLocations.filter(
          (loc) => loc.address !== location.address
        ),
      ].slice(0, MAX_RECENT_LOCATIONS);

      localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
      setRecentLocations(updated);
    } catch (error) {
      console.error("Failed to save recent location:", error);
    }
  };

  // 위치 선택 핸들러
  const handleLocationSelect = (location: Location) => {
    setFormData({
      ...formData,
      address: location.address || "",
      lat: location.lat,
      lng: location.lng,
      district: detectDistrictFromAddress(location.address || ""),
    });

    // 최근 위치 저장
    if (location.address) {
      saveRecentLocation(location);
    }

    // 중복 체크 수행
    checkDuplicates(formData.name, location.lat, location.lng);
  };

  // 테마 토글 함수
  const toggleTheme = (themeId: string) => {
    setFormData((prev) => ({
      ...prev,
      themeIds: prev.themeIds.includes(themeId)
        ? prev.themeIds.filter((id) => id !== themeId)
        : [...prev.themeIds, themeId],
    }));
  };

  // 중복 체크 함수
  const checkDuplicates = async (
    name: string,
    lat: number,
    lng: number
  ) => {
    if (!name.trim() && (!lat || !lng)) {
      setDuplicates([]);
      return;
    }

    setIsDuplicateChecking(true);

    try {
      const params = new URLSearchParams();
      if (name.trim()) params.append("name", name.trim());
      if (lat) params.append("lat", lat.toString());
      if (lng) params.append("lng", lng.toString());

      const response = await fetch(
        `/api/bakeries/check-duplicate?${params.toString()}`
      );
      const data = await response.json();

      if (response.ok && data.hasDuplicates) {
        setDuplicates(data.duplicates);
      } else {
        setDuplicates([]);
      }
    } catch (error) {
      console.error("Duplicate check failed:", error);
    } finally {
      setIsDuplicateChecking(false);
    }
  };

  // 빵집 이름 변경 시 중복 체크
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name.trim()) {
        checkDuplicates(formData.name, formData.lat, formData.lng);
      } else {
        setDuplicates([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.name.trim()) {
      alert("빵집 이름을 입력해주세요.");
      return;
    }

    if (!formData.address || formData.lat === 0 || formData.lng === 0) {
      alert("지도에서 위치를 선택해주세요.");
      return;
    }

    // 중복 경고
    if (duplicates.length > 0) {
      const confirmed = confirm(
        `유사한 빵집 ${duplicates.length}곳이 발견되었습니다. 그래도 등록하시겠습니까?`
      );
      if (!confirmed) return;
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
            <div>
              <Input
                label="빵집 이름 *"
                placeholder="예) 성수연방"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              {/* 중복 체크 결과 */}
              {isDuplicateChecking && (
                <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                  <div className="animate-spin">🔍</div>
                  중복 체크 중...
                </div>
              )}

              {duplicates.length > 0 && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-900">
                        비슷한 빵집이 이미 등록되어 있습니다
                      </p>
                      <div className="mt-2 space-y-1">
                        {duplicates.map((dup) => (
                          <div
                            key={dup.id}
                            className="text-xs text-amber-800 bg-white/50 rounded px-2 py-1"
                          >
                            <span className="font-semibold">{dup.name}</span>
                            <span className="text-amber-600 ml-2">
                              {dup.matchReason === "same_name"
                                ? "(같은 이름)"
                                : `(${dup.distance}m 거리)`}
                            </span>
                            <br />
                            <span className="text-amber-700">{dup.address}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {duplicates.length === 0 && formData.name.trim() && !isDuplicateChecking && (
                <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  등록 가능합니다
                </div>
              )}
            </div>

            {/* 지도에서 위치 선택 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-800">
                  위치 선택 *
                </label>

                {/* 최근 위치 버튼 */}
                {recentLocations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowRecentLocations(!showRecentLocations)}
                    className="text-sm text-brown hover:text-brown/80 flex items-center gap-1"
                  >
                    <History className="w-4 h-4" />
                    최근 위치
                  </button>
                )}
              </div>

              {/* 최근 위치 목록 */}
              {showRecentLocations && recentLocations.length > 0 && (
                <div className="mb-3 p-3 bg-cream rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-800">
                      최근 검색한 위치
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowRecentLocations(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentLocations.map((loc, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          handleLocationSelect(loc);
                          setShowRecentLocations(false);
                        }}
                        className="w-full text-left px-3 py-2 bg-white hover:bg-gray-50 rounded-lg transition-colors text-sm"
                      >
                        {loc.address}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-[500px] rounded-lg overflow-hidden border border-cream">
                <BakeryRegistrationMap
                  onLocationSelect={handleLocationSelect}
                  initialLocation={
                    formData.lat && formData.lng
                      ? {
                          lat: formData.lat,
                          lng: formData.lng,
                          address: formData.address,
                        }
                      : undefined
                  }
                />
              </div>

              {/* 선택된 주소 표시 */}
              {formData.address && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">선택된 주소:</span>{" "}
                    {formData.address}
                  </p>
                </div>
              )}
            </div>

            {/* 자동 감지된 지역 (수정 가능) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                지역 {formData.district && <span className="text-xs text-green-600">(자동 감지됨)</span>}
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

            {/* 테마 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                테마 선택 (해시태그)
              </label>
              <p className="text-xs text-gray-600 mb-3">
                이 빵집과 어울리는 테마를 선택해주세요 (중복 선택 가능)
              </p>

              {isLoadingThemes ? (
                <div className="text-sm text-gray-500 py-4 text-center">
                  테마 로딩 중...
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 카테고리별로 테마 그룹화 */}
                  {["bread_type", "atmosphere", "special"].map((category) => {
                    const categoryThemes = themes.filter(
                      (theme) => theme.category === category
                    );
                    if (categoryThemes.length === 0) return null;

                    const categoryNames: Record<string, string> = {
                      bread_type: "빵 종류",
                      atmosphere: "분위기",
                      special: "특별한",
                    };

                    return (
                      <div key={category}>
                        <p className="text-xs font-bold text-gray-700 mb-2 uppercase">
                          {categoryNames[category]}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {categoryThemes.map((theme) => {
                            const isSelected = formData.themeIds.includes(
                              theme.id
                            );
                            return (
                              <button
                                key={theme.id}
                                type="button"
                                onClick={() => toggleTheme(theme.id)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                  isSelected
                                    ? "ring-2 ring-brown scale-105"
                                    : "hover:scale-105 opacity-70"
                                }`}
                                style={{
                                  backgroundColor: theme.color
                                    ? `${theme.color}20`
                                    : "#f5e6d3",
                                  color: theme.color || "#8B4513",
                                }}
                              >
                                <span>{theme.icon || "🍞"}</span>
                                <span>{theme.name}</span>
                                {isSelected && <span>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 선택된 테마 개수 표시 */}
              {formData.themeIds.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  선택된 테마: {formData.themeIds.length}개
                </div>
              )}
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
              disabled={
                isLoading ||
                !formData.name ||
                !formData.address ||
                formData.lat === 0 ||
                formData.lng === 0
              }
            >
              {isLoading ? "등록 중..." : "빵집 등록하기"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
