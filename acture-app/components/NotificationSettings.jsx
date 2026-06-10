"use client";
import { useState, useEffect } from "react";
import { Bell, BellOff, ChevronLeft, Moon, Sun, Coffee, Utensils } from "lucide-react";

const C = { green: "#8BC34A", greenDk: "#689F38", greenLt: "#F1F8E9", bg: "#FAFAFA", card: "#fff", txt: "#212121", sub: "#9E9E9E", border: "#EEEEEE" };

const DEFAULT_TIMES = {
  breakfast: { enabled: true, hour: 6, minute: 0, label: "아침", icon: Coffee, color: "#FFA726" },
  lunch: { enabled: true, hour: 12, minute: 0, label: "점심", icon: Sun, color: "#42A5F5" },
  dinner: { enabled: true, hour: 18, minute: 0, label: "저녁", icon: Utensils, color: "#66BB6A" },
  snack: { enabled: false, hour: 22, minute: 0, label: "야식", icon: Moon, color: "#AB47BC" },
};

export default function NotificationSettings({ profile, onSave, onBack }) {
  const [times, setTimes] = useState(() => {
    if (profile?.notification_times) {
      try { return { ...DEFAULT_TIMES, ...JSON.parse(profile.notification_times) }; }
      catch { return DEFAULT_TIMES; }
    }
    return DEFAULT_TIMES;
  });
  const [permission, setPermission] = useState("default");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      // 서비스 워커 등록
      if ("serviceWorker" in navigator) {
        try { await navigator.serviceWorker.register("/sw.js"); }
        catch (e) { console.log("SW registration failed", e); }
      }
    }
  };

  const toggle = (key) => {
    setTimes(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  };

  const setTime = (key, field, value) => {
    setTimes(prev => ({ ...prev, [key]: { ...prev[key], [field]: parseInt(value) || 0 } }));
  };

  const handleSave = () => {
    if (onSave) onSave(JSON.stringify(times));
    setSaved(true);
    // 알림 스케줄 시작
    scheduleNotifications(times);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", background: C.card }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ChevronLeft size={24} color={C.txt} />
        </button>
        <span style={{ flex: 1, textAlign: "center", fontSize: 17, fontWeight: 600 }}>알림 설정</span>
        <div style={{ width: 32 }} />
      </div>

      <div style={{ flex: 1, padding: "0 20px 20px" }}>
        {/* Permission banner */}
        {permission !== "granted" && (
          <button onClick={requestPermission} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
            background: C.greenLt, borderRadius: 14, border: "none", cursor: "pointer", marginTop: 12, marginBottom: 20, textAlign: "left"
          }}>
            <Bell size={22} color={C.greenDk} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.txt }}>알림 권한을 허용해주세요</div>
              <div style={{ fontSize: 13, color: C.sub }}>식사 시간에 맞춰 리마인더를 보내드려요</div>
            </div>
          </button>
        )}

        {permission === "granted" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0 8px" }}>
            <Bell size={16} color={C.green} />
            <span style={{ fontSize: 13, color: C.greenDk, fontWeight: 500 }}>알림이 활성화되어 있어요</span>
          </div>
        )}

        <h3 style={{ fontSize: 17, fontWeight: 700, margin: "12px 0 16px" }}>식사 알림 시간</h3>

        {/* Time cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.entries(times).map(([key, val]) => {
            const Icon = val.icon || Bell;
            return (
              <div key={key} style={{ background: C.card, borderRadius: 14, padding: "16px 20px", border: `1px solid ${C.border}`, opacity: val.enabled ? 1 : 0.5, transition: "opacity 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: val.enabled ? 12 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${val.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} color={val.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: C.txt }}>{val.label}</div>
                      <div style={{ fontSize: 13, color: C.sub }}>
                        {val.enabled ? `${String(val.hour).padStart(2,"0")}:${String(val.minute).padStart(2,"0")}` : "꺼짐"}
                      </div>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button onClick={() => toggle(key)} style={{
                    width: 50, height: 28, borderRadius: 14, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s",
                    background: val.enabled ? C.green : "#DDD",
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 11, background: "#fff", position: "absolute", top: 3, transition: "left 0.2s",
                      left: val.enabled ? 25 : 3, boxShadow: "0 1px 3px rgba(0,0,0,.2)"
                    }} />
                  </button>
                </div>

                {/* Time picker */}
                {val.enabled && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 52 }}>
                    <select value={val.hour} onChange={e => setTime(key, "hour", e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, fontWeight: 600, background: C.bg, color: C.txt, cursor: "pointer" }}>
                      {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, "0")}</option>)}
                    </select>
                    <span style={{ fontSize: 18, fontWeight: 600, color: C.txt }}>:</span>
                    <select value={val.minute} onChange={e => setTime(key, "minute", e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, fontWeight: 600, background: C.bg, color: C.txt, cursor: "pointer" }}>
                      {[0, 15, 30, 45].map(m => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Save */}
        <button onClick={handleSave} style={{
          width: "100%", padding: "15px", borderRadius: 12, border: "none", marginTop: 24,
          background: saved ? C.greenLt : C.green, color: saved ? C.greenDk : "#fff",
          fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
        }}>
          {saved ? "✓ 저장 완료" : "저장하기"}
        </button>

        <p style={{ fontSize: 12, color: C.sub, textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
          웹 알림은 브라우저가 열려 있을 때 작동해요.<br />
          앱 버전에서는 백그라운드 알림도 지원할 예정이에요.
        </p>
      </div>
    </div>
  );
}

/* ── 클라이언트 알림 스케줄러 ── */
export function scheduleNotifications(times) {
  // 기존 스케줄 정리
  if (window.__actureTimers) window.__actureTimers.forEach(clearTimeout);
  window.__actureTimers = [];

  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const now = new Date();
  Object.entries(times).forEach(([key, val]) => {
    if (!val.enabled) return;

    const target = new Date();
    target.setHours(val.hour, val.minute, 0, 0);

    // 이미 지난 시간이면 내일로
    if (target <= now) target.setDate(target.getDate() + 1);

    const delay = target.getTime() - now.getTime();
    const messages = {
      breakfast: "좋은 아침! ☀️ 아침 식사 사진을 찍어보세요",
      lunch: "점심시간이에요! 🍱 오늘 뭐 드셨나요?",
      dinner: "저녁 식사 시간! 🍽️ 식단을 기록해보세요",
      snack: "야식 타임? 🌙 먹기 전에 한 번 체크해보세요",
    };

    const timer = setTimeout(() => {
      new Notification("ACTure", {
        body: messages[key] || "식사를 기록해보세요!",
        icon: "/icon-192.png",
        tag: `acture-${key}`,
      });
      // 다음 날 다시 스케줄
      scheduleNotifications(times);
    }, delay);

    window.__actureTimers.push(timer);
  });
}
