import { Share, Linking, Platform } from "react-native";

/**
 * 카카오톡 공유하기
 *
 * 사전 설정:
 * 1. https://developers.kakao.com 에서 앱 등록
 * 2. 플랫폼 등록 (iOS: Bundle ID, Android: Package Name + Key Hash)
 * 3. 카카오링크 활성화
 *
 * 이 구현은 카카오톡 URL Scheme을 사용합니다.
 * 카카오 네이티브 SDK를 쓰려면 react-native-kakao-share 패키지를 추가하세요.
 */

export async function shareToKakao({ title, description, imageUrl, buttonTitle, webUrl }) {
  try {
    // 카카오톡 커스텀 URL Scheme으로 공유
    // 실제 프로덕션에서는 Kakao JavaScript SDK 또는 react-native-kakao-share 사용 권장
    const kakaoLinkUrl = buildKakaoShareUrl({ title, description, imageUrl, buttonTitle, webUrl });

    const canOpen = await Linking.canOpenURL("kakaolink://");

    if (canOpen) {
      // 카카오톡이 설치되어 있으면 카카오링크로 공유
      await Linking.openURL(kakaoLinkUrl);
    } else {
      // 카카오톡이 없으면 일반 공유로 폴백
      await fallbackShare({ title, description, webUrl });
    }
  } catch (e) {
    console.log("Kakao share error:", e);
    // 에러 시 일반 공유로 폴백
    await fallbackShare({ title, description, webUrl });
  }
}

// 카카오 공유 URL 빌드
function buildKakaoShareUrl({ title, description, imageUrl, buttonTitle, webUrl }) {
  // 카카오 JavaScript Key (Kakao Developers에서 발급)
  const KAKAO_JS_KEY = "YOUR_KAKAO_JAVASCRIPT_KEY";

  const templateArgs = encodeURIComponent(JSON.stringify({
    title: title || "ACTure 식단 분석",
    description: description || "AI로 식단을 분석해보세요",
    imageUrl: imageUrl || "",
    buttonTitle: buttonTitle || "ACTure에서 보기",
    webUrl: webUrl || "https://acture-app.vercel.app",
  }));

  return `kakaolink://send?appkey=${KAKAO_JS_KEY}&template_id=custom&template_args=${templateArgs}`;
}

// 일반 공유 (카카오톡 미설치 시)
async function fallbackShare({ title, description, webUrl }) {
  try {
    await Share.share({
      title: title || "ACTure 식단 분석",
      message: `${description || "AI로 내 식단을 분석해봤어요!"}\n\n지금 확인하기: ${webUrl || "https://acture-app.vercel.app"}`,
      url: webUrl, // iOS only
    });
  } catch (e) {
    console.log("Share error:", e);
  }
}

/**
 * 식단 분석 결과를 공유용 메시지로 포맷
 */
export function formatMealShareMessage(result) {
  if (!result) return null;

  const foods = result.foods?.map(f => f.name).join(", ") || "음식";
  const cal = Math.round(result.total?.calories || 0);
  const pro = Math.round(result.total?.protein || 0);
  const carb = Math.round(result.total?.carbs || 0);

  return {
    title: `오늘의 식단: ${foods}`,
    description: `칼로리 ${cal}kcal | 단백질 ${pro}g | 탄수화물 ${carb}g\n${result.feedback || ""}`,
  };
}
