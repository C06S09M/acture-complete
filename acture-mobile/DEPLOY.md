# ACTure 앱 배포 가이드

## 전체 순서 (처음부터 끝까지)

### Step 0: 필요한 계정 만들기
| 계정 | 비용 | 링크 |
|------|------|------|
| Expo | 무료 | https://expo.dev/signup |
| Apple Developer | $99/년 | https://developer.apple.com/programs/enroll |
| Google Play Developer | $25 (1회) | https://play.google.com/console |
| Kakao Developers | 무료 | https://developers.kakao.com |
| Vercel | 무료 | https://vercel.com/signup |

### Step 1: 웹 앱 배포 (Vercel)
```bash
# acture-app 폴더에서
cd acture-app
npm install

# GitHub에 올리기 (처음 한 번)
git init
git add .
git commit -m "first commit"
# GitHub에서 레포 만들고 push

# Vercel 연결
npx vercel
# → Vercel이 자동 배포하고 URL을 줌 (예: acture-app.vercel.app)
```

Vercel 대시보드(https://vercel.com) → Settings → Environment Variables에 추가:
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TOSS_CLIENT_KEY`
- `TOSS_SECRET_KEY`

### Step 2: 배포된 URL을 모바일 앱에 설정
`acture-mobile/src/screens/MainScreen.js` 파일에서:
```javascript
const WEB_APP_URL = "https://여기에-실제-vercel-url.vercel.app";
```

### Step 3: 모바일 앱 빌드
```bash
cd acture-mobile
npm install

# Expo 로그인 (처음 한 번)
npx expo login

# EAS 프로젝트 초기화 (처음 한 번)
npx eas init

# Android APK 빌드 (테스트용)
npx eas build --platform android --profile preview
# → 빌드 완료되면 APK 다운로드 링크가 나옴
# → 폰에 직접 설치해서 테스트 가능

# iOS 빌드 (Apple Developer 계정 필요)
npx eas build --platform ios --profile preview
```

### Step 4: 테스트
- Android: APK를 폰에 설치해서 테스트
- iOS: TestFlight에 올려서 테스트 (EAS가 자동으로 처리)

### Step 5: 앱스토어 제출
```bash
# 프로덕션 빌드
npx eas build --platform android --profile production
npx eas build --platform ios --profile production

# 스토어 제출
npx eas submit --platform android
npx eas submit --platform ios
```

Android: Google Play Console에서 심사 (보통 1~3일)
iOS: App Store Connect에서 심사 (보통 1~7일)

### Step 6: 카카오 공유 설정
1. https://developers.kakao.com → 내 애플리케이션 → 앱 추가
2. 앱 키 복사 (JavaScript 키)
3. `src/utils/kakaoShare.js`에서 `YOUR_KAKAO_JAVASCRIPT_KEY` 교체
4. 플랫폼 등록:
   - Android: 패키지명 `com.acture.app` + 키 해시
   - iOS: 번들 ID `com.acture.app`
5. 카카오링크 → 활성화

## 앱 아이콘 만들기
1024x1024 PNG 이미지를 `assets/icon.png`로 저장
(Figma에서 ACTure 로고를 1024x1024로 내보내기)

## 문제 해결

### "Node.js가 없습니다"
→ https://nodejs.org 에서 LTS 버전 설치

### "eas command not found"
→ `npm install -g eas-cli`

### iOS 빌드 실패
→ Apple Developer 계정이 활성화되어 있는지 확인
→ eas.json의 appleId, appleTeamId 입력

### Android 빌드 실패
→ google-service-account.json이 있는지 확인
→ Google Play Console에서 서비스 계정 설정
