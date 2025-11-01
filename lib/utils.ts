import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS 클래스를 병합하는 유틸리티 함수
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 주소 문자열로부터 구역(district)을 추출하는 함수
 * @param address - 카카오 API에서 받은 주소 문자열
 * @returns 매핑된 구역명 또는 "기타"
 */
export function detectDistrictFromAddress(address: string):
  | "성수"
  | "망원"
  | "홍대"
  | "연남"
  | "이태원"
  | "경리단길"
  | "한남"
  | "강남"
  | "신사"
  | "압구정"
  | "성북"
  | "부암"
  | "기타" {
  if (!address) return "기타";

  const addressLower = address.toLowerCase();

  // 구역 매핑 규칙 (우선순위 순서대로)
  const districtMappings: {
    keywords: string[];
    district:
      | "성수"
      | "망원"
      | "홍대"
      | "연남"
      | "이태원"
      | "경리단길"
      | "한남"
      | "강남"
      | "신사"
      | "압구정"
      | "성북"
      | "부암"
      | "기타";
  }[] = [
    // 정확한 동명 매칭
    { keywords: ["성수동", "성수"], district: "성수" },
    { keywords: ["망원동", "망원"], district: "망원" },
    { keywords: ["홍대", "홍익", "서교동"], district: "홍대" },
    { keywords: ["연남동", "연남"], district: "연남" },
    { keywords: ["이태원동", "이태원"], district: "이태원" },
    { keywords: ["경리단", "회현동"], district: "경리단길" },
    { keywords: ["한남동", "한남"], district: "한남" },
    { keywords: ["강남구", "강남역", "역삼동", "논현동", "삼성동"], district: "강남" },
    { keywords: ["신사동", "신사"], district: "신사" },
    { keywords: ["압구정동", "압구정"], district: "압구정" },
    { keywords: ["성북동", "성북"], district: "성북" },
    { keywords: ["부암동", "부암"], district: "부암" },
  ];

  // 각 구역별 키워드 확인
  for (const mapping of districtMappings) {
    for (const keyword of mapping.keywords) {
      if (addressLower.includes(keyword)) {
        return mapping.district;
      }
    }
  }

  // 매칭되지 않으면 "기타"
  return "기타";
}

/**
 * 좌표 간 거리 계산 (Haversine formula)
 * @param lat1 - 위치1의 위도
 * @param lng1 - 위치1의 경도
 * @param lat2 - 위치2의 위도
 * @param lng2 - 위치2의 경도
 * @returns 두 좌표 간의 거리 (미터)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 미터 단위
}
