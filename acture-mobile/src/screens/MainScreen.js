import React, { useRef, useState } from "react";
import { View, ActivityIndicator, Platform, Share, BackHandler } from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleMealNotifications } from "../utils/notifications";
import { shareToKakao } from "../utils/kakaoShare";

// ⚠️ 배포 후 실제 Vercel URL로 교체하세요
const WEB_APP_URL = "https://acture-app.vercel.app";

export default function MainScreen() {
  const webRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // WebView에서 네이티브 기능 호출 받기
  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        // ── 카카오톡 공유 ──
        case "KAKAO_SHARE": {
          await shareToKakao({
            title: data.title || "ACTure 식단 분석",
            description: data.description || "오늘의 식단을 확인해보세요",
            imageUrl: data.imageUrl,
            buttonTitle: "ACTure에서 보기",
            webUrl: WEB_APP_URL,
          });
          break;
        }

        // ── 일반 공유 (카카오 외) ──
        case "SHARE": {
          await Share.share({
            message: data.message || `오늘의 식단 분석 결과!\n${data.description || ""}\n\nACTure에서 확인: ${WEB_APP_URL}`,
            title: data.title || "ACTure 식단 분석",
          });
          break;
        }

        // ── 알림 시간 변경 ──
        case "SET_NOTIFICATIONS": {
          await AsyncStorage.setItem("notificationTimes", JSON.stringify(data.times));
          await scheduleMealNotifications(data.times);
          // 웹앱에 성공 응답
          webRef.current?.postMessage(JSON.stringify({ type: "NOTIFICATION_SET", success: true }));
          break;
        }

        // ── 알림 시간 요청 ──
        case "GET_NOTIFICATIONS": {
          const saved = await AsyncStorage.getItem("notificationTimes");
          webRef.current?.postMessage(JSON.stringify({ type: "NOTIFICATION_TIMES", times: saved ? JSON.parse(saved) : null }));
          break;
        }

        default:
          break;
      }
    } catch (e) {
      console.log("Message handler error:", e);
    }
  };

  // WebView에 주입할 JS (네이티브 브릿지)
  const injectedJS = `
    (function() {
      // 네이티브 앱 환경임을 웹앱에 알림
      window.isNativeApp = true;

      // 카카오 공유 함수
      window.nativeKakaoShare = function(data) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'KAKAO_SHARE', ...data }));
      };

      // 일반 공유 함수
      window.nativeShare = function(data) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SHARE', ...data }));
      };

      // 알림 설정 함수
      window.nativeSetNotifications = function(times) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SET_NOTIFICATIONS', times }));
      };

      // 알림 시간 가져오기
      window.nativeGetNotifications = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'GET_NOTIFICATIONS' }));
      };

      true;
    })();
  `;

  // Android 뒤로가기 처리
  const handleBack = () => {
    if (webRef.current) {
      webRef.current.goBack();
      return true;
    }
    return false;
  };

  React.useEffect(() => {
    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", handleBack);
      return () => BackHandler.removeEventListener("hardwareBackPress", handleBack);
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webRef}
        source={{ uri: WEB_APP_URL }}
        style={{ flex: 1 }}
        onMessage={handleMessage}
        injectedJavaScript={injectedJS}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState
        // 카메라/갤러리 접근 허용
        allowFileAccess
        allowFileAccessFromFileURLs
        // iOS 설정
        allowsLinkPreview={false}
        sharedCookiesEnabled
      />
      {loading && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", backgroundColor: "#FAFAFA" }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: "#8BC34A", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
            <View style={{ width: 0, height: 0 }} />
          </View>
          <ActivityIndicator size="large" color="#8BC34A" />
        </View>
      )}
    </View>
  );
}
