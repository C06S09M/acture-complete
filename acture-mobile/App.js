import React, { useEffect, useState, useRef } from "react";
import { View, StatusBar, Platform, Alert, Linking } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import MainScreen from "./src/screens/MainScreen";
import { registerForPushNotifications, scheduleMealNotifications } from "./src/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // 푸시 알림 등록
        const token = await registerForPushNotifications();
        if (token) await AsyncStorage.setItem("pushToken", token);

        // 저장된 알림 시간 로드 + 스케줄
        const savedTimes = await AsyncStorage.getItem("notificationTimes");
        if (savedTimes) {
          scheduleMealNotifications(JSON.parse(savedTimes));
        } else {
          // 기본 알림 시간 설정
          const defaults = {
            breakfast: { enabled: true, hour: 6, minute: 0 },
            lunch: { enabled: true, hour: 12, minute: 0 },
            dinner: { enabled: true, hour: 18, minute: 0 },
            snack: { enabled: false, hour: 22, minute: 0 },
          };
          await AsyncStorage.setItem("notificationTimes", JSON.stringify(defaults));
          scheduleMealNotifications(defaults);
        }
      } catch (e) {
        console.log("Init error:", e);
      } finally {
        setReady(true);
        await SplashScreen.hideAsync();
      }
    }
    init();
  }, []);

  if (!ready) return null;

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <MainScreen />
    </View>
  );
}
