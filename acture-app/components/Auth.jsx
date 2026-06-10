"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const C = { green: "#8BC34A", greenDk: "#689F38", greenLt: "#F1F8E9", txt: "#212121", sub: "#9E9E9E", border: "#EEEEEE", card: "#fff" };

export default function Auth({ onAuth }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signInWithEmail = async () => {
    if (!email) return;
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  const signInWithSocial = async (provider) => {
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#FAFAFA", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 24px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: `linear-gradient(135deg, ${C.green}, ${C.greenDk})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28, color: "#fff", fontWeight: 700 }}>A</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.txt, margin: "0 0 6px" }}>Acture</h1>
          <p style={{ fontSize: 14, color: C.sub, margin: 0 }}>AI로 당신의 식단을 분석해드려요</p>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: 24, background: C.greenLt, borderRadius: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>이메일을 확인해주세요</h3>
            <p style={{ fontSize: 14, color: C.sub, margin: 0, lineHeight: 1.5 }}><b>{email}</b>으로<br />로그인 링크를 보냈어요</p>
            <button onClick={() => setSent(false)} style={{ marginTop: 16, background: "none", border: "none", color: C.greenDk, fontSize: 14, cursor: "pointer" }}>다른 이메일로 시도</button>
          </div>
        ) : (
          <>
            {/* Social logins */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              <button onClick={() => signInWithSocial("kakao")} disabled={loading} style={{
                width: "100%", padding: "14px 20px", borderRadius: 12, border: "none", background: "#FEE500", color: "#191919",
                fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}>
                <span style={{ fontSize: 18 }}>💬</span> 카카오로 시작하기
              </button>
              <button onClick={() => signInWithSocial("google")} disabled={loading} style={{
                width: "100%", padding: "14px 20px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.card, color: C.txt,
                fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}>
                <span style={{ fontSize: 18 }}>G</span> Google로 시작하기
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 13, color: C.sub }}>또는</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            {/* Email login */}
            <div style={{ marginBottom: 12 }}>
              <input type="email" placeholder="이메일 주소" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && signInWithEmail()}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 15, outline: "none", background: C.card, boxSizing: "border-box" }}
              />
            </div>
            <button onClick={signInWithEmail} disabled={loading || !email} style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: !email ? "#ccc" : C.green, color: "#fff", fontSize: 15, fontWeight: 600,
              cursor: !email ? "not-allowed" : "pointer"
            }}>
              {loading ? "처리 중..." : "이메일로 시작하기"}
            </button>

            {error && <p style={{ color: "#E53935", fontSize: 13, textAlign: "center", marginTop: 12 }}>{error}</p>}

            <p style={{ fontSize: 12, color: C.sub, textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
              시작하면 <span style={{ textDecoration: "underline", cursor: "pointer" }}>서비스 이용약관</span> 및 <span style={{ textDecoration: "underline", cursor: "pointer" }}>개인정보 처리방침</span>에 동의하게 됩니다
            </p>
          </>
        )}
      </div>
    </div>
  );
}
