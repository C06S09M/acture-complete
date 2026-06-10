# ACTure - AI 식단 분석 앱

사진 한 장으로 영양성분을 분석하고, 부족한 영양소에 맞는 음식을 추천받는 서비스.

## 빠른 시작

### 1. 패키지 설치
```bash
cd acture-app
npm install
```

### 2. Supabase 프로젝트 생성
1. https://supabase.com 에서 무료 프로젝트 생성
2. Settings → API에서 URL과 anon key 복사
3. Settings → API에서 service_role key 복사
4. SQL Editor에서 `supabase-schema.sql` 내용 실행
5. Authentication → Providers에서 Kakao, Google 활성화

### 3. Anthropic API 키
https://console.anthropic.com/settings/keys 에서 발급

### 4. Toss Payments (결제)
1. https://developers.tosspayments.com 에서 개발자 등록
2. 테스트용 Client Key, Secret Key 발급
3. 실결제 전환 시 심사 후 라이브 키로 교체

### 5. 환경변수 설정
```bash
cp .env.local.example .env.local
```
`.env.local`에 모든 키 입력

### 6. 실행
```bash
npm run dev
```
http://localhost:3000

### 7. Vercel 배포
```bash
npx vercel
```
Vercel 대시보드 → Settings → Environment Variables에 `.env.local`의 모든 변수 추가

## 프로젝트 구조

```
acture-app/
├── app/
│   ├── page.js              # 메인 (인증 게이트)
│   ├── layout.js             # 루트 레이아웃
│   ├── globals.css            # 글로벌 스타일
│   └── api/
│       ├── analyze/route.js   # Claude Vision 프록시
│       ├── meals/route.js     # 식사 기록 CRUD
│       └── payment/
│           ├── route.js       # 결제 시작
│           └── confirm/route.js # 결제 확인
├── components/
│   ├── ACTureApp.jsx          # 메인 앱 (전체 화면)
│   └── Auth.jsx               # 로그인/회원가입
├── lib/
│   ├── supabase.js            # Supabase 클라이언트
│   └── foods.js               # 음식 DB + 상수
├── supabase-schema.sql        # DB 스키마 (SQL Editor에서 실행)
└── .env.local.example         # 환경변수 템플릿
```

## 요금제

| 플랜 | 가격 | 포함 |
|------|------|------|
| Free | ₩0 | 하루 1회 AI 분석, 기본 대시보드 |
| Pro 월간 | ₩6,900/월 | 무제한 분석, 추천, 리포트 |
| Pro 연간 | ₩2,900/월 (₩34,800/년) | 위와 동일, 58% 할인 |

## 기능

- [x] 온보딩 (나이/키/몸무게/목표)
- [x] AI 식단 사진 분석 (Claude Vision)
- [x] 영양소 대시보드 (칼로리/단백질/탄수화물)
- [x] 부족 영양소 기반 음식 추천
- [x] 캘린더 리포트
- [x] 카카오/구글/이메일 로그인
- [x] Supabase DB 식사 기록 저장
- [x] 구독 페이월 (3일 무료 체험)
- [x] Toss Payments 결제 연동
