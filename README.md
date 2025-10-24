# 🍞 빵지순례 (BreadTrip)

> "서울의 빵집을 탐험하고, 나만의 빵지도를 채워가는 따뜻한 탐방 서비스"

서울 한정 MVP 버전

---

## 📋 프로젝트 현황

### ✅ 완료된 기능 (Phase 0-3)

#### Phase 0: 프로젝트 초기 설정
- [x] Next.js 14+ (App Router) 프로젝트 생성
- [x] TypeScript 설정
- [x] Tailwind CSS 커스텀 테마 (빵집 감성)
- [x] 폴더 구조 (`/app`, `/components`, `/lib`, `/types`)
- [x] 환경 변수 설정

#### Phase 1: Supabase 설정
- [x] Supabase 클라이언트 (client, server, middleware)
- [x] TypeScript 타입 정의
- [x] DB 스키마 SQL (`users`, `bakeries`, `reviews`)
- [x] 시드 데이터 (서울 빵집 10개)
- [x] RLS 정책

#### Phase 2: 기본 레이아웃 & 인증
- [x] 하단 네비게이션 바
- [x] 로그인 모달 (Email Magic Link)
- [x] Auth Server Actions
- [x] 프로필 페이지 스켈레톤
- [x] 피드 페이지 스켈레톤

#### Phase 3: 지도 탐색 (핵심 기능)
- [x] Kakao Map 통합
- [x] 커스텀 빵집 마커 (🍞)
- [x] 마커 클릭 이벤트
- [x] 하단 시트 (빵집 미리보기)
- [x] 빵집 상세 페이지
- [x] API 엔드포인트 (`/api/bakeries`)

---

## 🚀 시작하기

### 1. 환경 변수 설정

`.env.local` 파일이 이미 생성되어 있습니다:

```bash
# Supabase (이미 설정됨)
NEXT_PUBLIC_SUPABASE_URL=https://vetpzzvvdkpjgqdywflb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Kakao Maps (이미 설정됨)
NEXT_PUBLIC_KAKAO_MAPS_APP_KEY=9c0d85c9de...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase 데이터베이스 설정

**중요: 아직 Supabase에서 SQL을 실행하지 않았다면 반드시 실행하세요!**

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트: `vetpzzvvdkpjgqdywflb` 선택
3. 좌측 메뉴 > **SQL Editor** 클릭
4. 아래 파일 내용을 순서대로 복사 & 실행:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`

자세한 설명: `supabase/README.md` 참고

### 3. 개발 서버 실행

```bash
npm install  # 이미 설치됨
npm run dev  # 이미 실행 중
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📱 주요 기능

### 현재 사용 가능한 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 🗺️ 홈 (지도) | `/` | Kakao Map 기반 빵집 탐색 |
| 📰 피드 | `/feed` | 리뷰 피드 (스켈레톤) |
| 👤 프로필 | `/profile` | 로그인/찜 목록 |
| 🍞 빵집 상세 | `/bakeries/:id` | 빵집 정보 상세 보기 |

### 주요 컴포넌트

```
components/
├── layout/
│   ├── Navigation.tsx       # 하단 네비게이션 바
│   └── AuthModal.tsx        # 로그인 모달
├── map/
│   ├── KakaoMap.tsx         # 카카오맵 컴포넌트
│   └── BottomSheet.tsx      # 빵집 미리보기 시트
└── ui/
    ├── Button.tsx           # 버튼
    ├── Input.tsx            # 입력 필드
    └── Modal.tsx            # 모달
```

---

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Email Magic Link) |
| **Map** | Kakao Maps SDK |
| **Storage** | Supabase Storage (준비 중) |
| **Deploy** | Vercel (예정) |

---

## 📂 프로젝트 구조

```
bread-trip/
├── app/                      # Next.js App Router
│   ├── actions/              # Server Actions
│   │   └── auth.ts
│   ├── api/                  # API Routes
│   │   └── bakeries/
│   ├── auth/                 # 인증 관련
│   ├── bakeries/[id]/        # 빵집 상세
│   ├── feed/                 # 피드
│   ├── profile/              # 프로필
│   └── page.tsx              # 홈 (지도)
├── components/               # React 컴포넌트
│   ├── layout/
│   ├── map/
│   └── ui/
├── lib/                      # 유틸리티
│   ├── supabase/             # Supabase 클라이언트
│   └── utils.ts
├── types/                    # TypeScript 타입
│   ├── database.ts           # DB 타입
│   ├── common.ts             # 공통 타입
│   └── kakao.d.ts            # Kakao Maps 타입
├── supabase/                 # Supabase 설정
│   ├── migrations/           # SQL 마이그레이션
│   └── README.md
└── public/                   # 정적 파일
```

---

## 🔄 다음 단계 (Phase 4-6)

### Phase 4: 빵집 등록
- [ ] 빵집 등록 폼
- [ ] Kakao 주소 검색 API
- [ ] 이미지 업로드 (Supabase Storage)
- [ ] 등록 API

### Phase 5: 피드 시스템
- [ ] 리뷰 작성 모달
- [ ] 리뷰 API
- [ ] 무한 스크롤
- [ ] 리뷰 카드 컴포넌트

### Phase 6: 최적화 & 배포
- [ ] 이미지 최적화
- [ ] 로딩/에러 상태 개선
- [ ] GA4 이벤트
- [ ] Vercel 배포

---

## 🐛 현재 알려진 제한사항

1. **Supabase SQL 실행 필요**: 데이터베이스 스키마를 수동으로 실행해야 합니다
2. **찜하기 미구현**: UI는 있지만 백엔드 연동 필요
3. **리뷰 미구현**: 피드와 리뷰 작성 기능은 Phase 5에서 구현 예정
4. **이미지 업로드 미구현**: Storage 설정 후 구현 예정
5. **인증 상태 관리**: 프로필 페이지에서 실제 유저 정보 연동 필요

---

## 📝 개발 노트

### Tailwind 커스텀 색상

```css
--cream-beige: #F6E9D8  /* 크림베이지 */
--brown: #8B5E3C         /* 브라운 */
--white-warm: #FFF9F4    /* 따뜻한 화이트 */
```

사용 예:
```tsx
<div className="bg-cream text-brown">
```

### API 엔드포인트

```typescript
GET  /api/bakeries          # 빵집 목록 조회
POST /api/bakeries          # 빵집 등록 (인증 필요)
GET  /api/bakeries/:id      # 빵집 상세 조회
```

### 데이터베이스 테이블

- `users`: 사용자 정보
- `bakeries`: 빵집 정보
- `reviews`: 리뷰 (준비됨, 미사용)

---

## 🙋 문제 해결

### 지도가 표시되지 않는 경우

1. Kakao Maps API 키 확인
2. 브라우저 콘솔에서 에러 확인
3. `window.kakao` 객체 로드 확인

### API 호출 실패

1. Supabase URL/Key 확인
2. Supabase에서 SQL 실행 여부 확인
3. RLS 정책 확인

### 빌드 에러

```bash
npm run build
```

TypeScript 에러가 발생하면 타입 정의 확인

---

## 📄 라이선스

MIT

---

## 🎯 프로젝트 목표

- **유입**: 서울 시드 빵집 50개 등록
- **참여**: 지도 클릭률 40% 이상
- **유지**: D7 재방문율 20% 이상
