# 🗄️ Supabase 설정 가이드

## 1. 데이터베이스 스키마 설정

### 방법 1: Supabase Dashboard 사용

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 선택
4. 아래 파일들을 순서대로 복사하여 실행:
   - `migrations/001_initial_schema.sql` - 테이블 및 RLS 정책 생성
   - `migrations/002_seed_data.sql` - 초기 데이터 추가

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 연결
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 마이그레이션 실행
supabase db push
```

## 2. Storage 버킷 생성

1. Supabase Dashboard > **Storage** 메뉴
2. **Create bucket** 클릭
3. 버킷 이름: `bakery-images`
4. Public bucket: **체크** (공개 이미지)
5. **Create bucket** 클릭

### Storage 정책 설정

Storage > bakery-images > Policies에서 다음 정책 추가:

```sql
-- 모든 사람이 이미지 읽기 가능
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'bakery-images');

-- 인증된 사용자만 이미지 업로드 가능
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bakery-images'
  AND auth.role() = 'authenticated'
);

-- 업로더만 이미지 삭제 가능
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bakery-images'
  AND auth.uid() = owner
);
```

## 3. 환경 변수 설정

`.env.local` 파일에 Supabase 정보 입력:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**키 확인 방법:**
- Dashboard > Settings > API
- `URL`: Project URL
- `anon public`: NEXT_PUBLIC_SUPABASE_ANON_KEY
- `service_role`: SUPABASE_SERVICE_ROLE_KEY (서버용, 절대 공개 X)

## 4. 인증 설정 (선택)

현재는 Email Magic Link를 사용하지만, 추후 소셜 로그인 추가 가능:

1. Dashboard > Authentication > Providers
2. 원하는 Provider 활성화 (Google, GitHub 등)
3. Client ID, Secret 입력

## 5. 확인

모든 설정이 완료되면 다음 쿼리로 확인:

```sql
-- 테이블 확인
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 빵집 데이터 확인
SELECT * FROM public.bakeries;

-- RLS 정책 확인
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

## 문제 해결

### 마이그레이션 실패 시
- SQL Editor에서 에러 메시지 확인
- 테이블이 이미 존재하는지 확인 (`DROP TABLE IF EXISTS` 사용)

### RLS 정책 오류 시
- Authentication > Policies에서 정책 확인
- `auth.uid()` 함수가 제대로 작동하는지 확인

### Storage 업로드 실패 시
- 버킷이 Public인지 확인
- Storage Policies가 올바르게 설정되었는지 확인
