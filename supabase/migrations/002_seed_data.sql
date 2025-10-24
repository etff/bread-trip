-- 🍞 빵지순례 시드 데이터
-- 서울 주요 빵집 초기 데이터

-- 참고: created_by는 NULL로 설정 (시스템 등록)
INSERT INTO public.bakeries (name, address, district, lat, lng, signature_bread, image_url) VALUES
  ('성수연방', '서울 성동구 연무장5가길 7', '성수', 37.5446, 127.0556, '크루아상', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop'),
  ('모스버거베이커리', '서울 마포구 포은로8길 15', '망원', 37.5563, 126.9016, '소금빵', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop'),
  ('텐바이텐커피', '서울 마포구 와우산로29나길 12', '홍대', 37.5518, 126.9228, '카눌레', 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&h=600&fit=crop'),
  ('온더코너', '서울 용산구 녹사평대로40길 7', '이태원', 37.5344, 126.9914, '베이글', 'https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?w=800&h=600&fit=crop'),
  ('델리브레드', '서울 강남구 압구정로2길 38', '압구정', 37.5275, 127.0277, '바게트', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&h=600&fit=crop'),
  ('브레드05', '서울 마포구 동교로 152-1', '연남', 37.5629, 126.9234, '식빵', 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&h=600&fit=crop'),
  ('제이드가든', '서울 용산구 이태원로55길 18', '경리단길', 37.5347, 126.9945, '타르트', 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&h=600&fit=crop'),
  ('르빵꼼마니에', '서울 용산구 한남대로20길 42', '한남', 37.5343, 127.0023, '크루아상', 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800&h=600&fit=crop'),
  ('파리바게뜨 성수점', '서울 성동구 아차산로 17', '성수', 37.5445, 127.0561, '단팥빵', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop'),
  ('성북동커피', '서울 성북구 선잠로5길 31', '성북', 37.5910, 126.9943, '스콘', 'https://images.unsplash.com/photo-1612182062631-5a092d6e4b29?w=800&h=600&fit=crop');

-- 참고: 이미지는 Unsplash의 무료 빵/베이커리 사진을 사용했습니다.
