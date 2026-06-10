import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// 알림 표시 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 푸시 알림 권한 요청 + 토큰 발급
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log("Push notifications need a physical device");
    return null;
  }

  // 권한 확인
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission denied");
    return null;
  }

  // Android 채널 설정
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("meals", {
      name: "식사 알림",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#8BC34A",
      sound: "default",
    });
  }

  // Expo Push Token (서버 푸시용)
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "YOUR_EAS_PROJECT_ID", // eas.json에서 설정한 값
    });
    return token.data;
  } catch {
    return null;
  }
}

// 식사 시간 알림 스케줄
export async function scheduleMealNotifications(times) {
  // 기존 스케줄 모두 취소
  await Notifications.cancelAllScheduledNotificationsAsync();

  const messages = {
    breakfast: { title: "좋은 아침! ☀️", body: "아침 식사를 기록해보세요" },
    lunch: { title: "점심시간이에요! 🍱", body: "오늘 점심 뭐 드셨나요?" },
    dinner: { title: "저녁 식사 시간! 🍽️", body: "저녁 식단을 기록해보세요" },
    snack: { title: "야식 타임? 🌙", body: "먹기 전에 한 번 체크해보세요" },
  };

  for (const [key, val] of Object.entries(times)) {
    if (!val.enabled) continue;

    const msg = messages[key] || { title: "ACTure", body: "식사를 기록해보세요!" };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        sound: "default",
        data: { screen: "analyze", meal: key },
      },
      trigger: {
        type: "daily",
        hour: val.hour,
        minute: val.minute,
        channelId: "meals",
      },
    });

    console.log(`Scheduled ${key} notification at ${val.hour}:${val.minute}`);
  }
}
