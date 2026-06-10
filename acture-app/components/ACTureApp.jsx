"use client";
import { useState, useRef, useEffect } from "react";
import { Home, Camera, BarChart3, Sparkles, ChevronLeft, Settings, Plus, Upload, X, Check, Minus, Crown, Lock, Shield, LogOut } from "lucide-react";
import { FOODS, GOALS, INTRO_SLIDES, PRICING } from "@/lib/foods";
import NotificationSettings, { scheduleNotifications } from "@/components/NotificationSettings";

const C = { green: "#8BC34A", greenDk: "#689F38", greenLt: "#F1F8E9", bg: "#FAFAFA", card: "#fff", txt: "#212121", sub: "#9E9E9E", border: "#EEEEEE" };

/* ── Reusable Components ── */
const Ring = ({ pct, size = 180, sw = 14 }) => {
  const r = (size - sw) / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8E8E8" strokeWidth={sw} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.green} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={circ*(1-Math.min(Math.max(pct,0),1))} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
};

const Bar = ({ label, cur, max, color }) => (
  <div style={{ flex: 1, textAlign: "center" }}>
    <div style={{ fontSize: 12, color: C.sub, marginBottom: 4 }}>{label}</div>
    <div style={{ height: 6, background: "#E8E8E8", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min((cur/max)*100,100)}%`, background: color, borderRadius: 3, transition: "width 0.4s" }} />
    </div>
    <div style={{ fontSize: 12, marginTop: 4 }}><b style={{ color: C.txt }}>{Math.round(cur)}</b><span style={{ color: C.sub }}>/{max}g</span></div>
  </div>
);

const NCard = ({ label, cur, max, color }) => (
  <div style={{ background: C.card, borderRadius: 14, padding: "14px 16px", border: `2px solid ${color}22` }}>
    <div style={{ fontSize: 14, fontWeight: 600, color: C.txt }}>{label}</div>
    <div style={{ fontSize: 13, color: C.sub, marginBottom: 8 }}>{Math.round(cur)} / {max}</div>
    <div style={{ height: 6, background: "#E8E8E8", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min((cur/max)*100,100)}%`, background: color, borderRadius: 3 }} />
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, color: C.txt, marginTop: 6 }}>{max > 0 ? Math.round((cur/max)*100) : 0}%</div>
  </div>
);

const Btn = ({ children, onClick, full, disabled, style: s }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: full ? "100%" : "auto", padding: "14px 24px", borderRadius: 12, border: "none",
    background: disabled ? "#ccc" : C.green, color: "#fff", fontSize: 15, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s", ...s,
  }}>{children}</button>
);

const NumPicker = ({ value, onChange, min, max, unit, label, hint }) => (
  <div style={{ textAlign: "center", padding: "40px 0" }}>
    <h2 style={{ fontSize: 22, fontWeight: 600, color: C.txt, margin: "0 0 8px" }}>{label}</h2>
    <p style={{ fontSize: 14, color: C.sub, margin: "0 0 40px" }}>{hint}</p>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <button onClick={() => onChange(Math.max(min, value - 1))} style={{ width: 48, height: 48, borderRadius: 24, border: `1px solid ${C.border}`, background: C.card, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Minus size={18} />
      </button>
      <div>
        <div style={{ fontSize: 52, fontWeight: 700, color: C.txt, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 16, color: C.sub, marginTop: 4 }}>{unit}</div>
      </div>
      <button onClick={() => onChange(Math.min(max, value + 1))} style={{ width: 48, height: 48, borderRadius: 24, border: `1px solid ${C.border}`, background: C.card, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Plus size={18} />
      </button>
    </div>
  </div>
);

/* ── Main App ── */
export default function ACTureApp({ user, profile, updateProfile, signOut }) {
  const hasOnboarded = profile?.onboarding_done;
  const [scr, setScr] = useState(hasOnboarded ? "main" : "intro");
  const [slide, setSlide] = useState(0);
  const [pStep, setPStep] = useState(0);
  const [prof, setProf] = useState({
    age: profile?.age || 26,
    height: profile?.height_cm || 173,
    weight: profile?.weight_kg || 78,
    goal: profile?.goal || null,
  });
  const [tab, setTab] = useState(0);
  const [meals, setMeals] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [err, setErr] = useState(null);
  const [saved, setSaved] = useState(false);
  const [isPro, setIsPro] = useState(profile?.is_pro || false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallPlan, setPaywallPlan] = useState("yearly");
  const [dailyFreeUsed, setDailyFreeUsed] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const fRef = useRef(null);

  // 알림 자동 스케줄 (로그인 시)
  useEffect(() => {
    if (profile?.notification_times && typeof window !== "undefined") {
      try { scheduleNotifications(JSON.parse(profile.notification_times)); } catch {}
    }
  }, [profile]);

  // 오늘의 식사 기록 불러오기
  useEffect(() => {
    if (user && hasOnboarded) {
      fetch(`/api/meals?userId=${user.id}&date=${new Date().toISOString().split("T")[0]}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            const mapped = data.map(m => ({
              calories: m.total_calories, protein: m.total_protein,
              fat: m.total_fat, carbs: m.total_carbs,
              foods: m.foods, feedback: m.feedback,
              time: m.meal_time?.slice(0, 5) || "", img: m.image_url,
            }));
            setMeals(mapped);
            setDailyFreeUsed(mapped.length);
          }
        }).catch(() => {});
    }
  }, [user, hasOnboarded]);

  const tgt = prof.goal ? GOALS[prof.goal].t : GOALS.healthy.t;
  const tot = meals.reduce((a, m) => ({ calories: a.calories + m.calories, protein: a.protein + m.protein, fat: a.fat + m.fat, carbs: a.carbs + m.carbs }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
  const calPct = tgt.calories > 0 ? tot.calories / tgt.calories : 0;
  const today = new Date();
  const dateStr = `${today.getMonth()+1}/${today.getDate()}`;

  /* ── API Call ── */
  const analyze = async (b64, mt) => {
    if (!isPro && dailyFreeUsed >= 1) { setShowPaywall(true); return; }
    setBusy(true); setErr(null); setResult(null); setSaved(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: b64, mediaType: mt }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setResult(data);
      if (!isPro) setDailyFreeUsed(prev => prev + 1);
    } catch (e) { setErr("분석에 실패했어요. 다시 시도해주세요."); }
    finally { setBusy(false); }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!isPro && dailyFreeUsed >= 1) { setShowPaywall(true); return; }
    const reader = new FileReader();
    reader.onload = () => { setPreview(reader.result); analyze(reader.result.split(",")[1], f.type); };
    reader.readAsDataURL(f);
  };

  const saveMeal = async () => {
    if (!result) return;
    const time = `${today.getHours()}:${String(today.getMinutes()).padStart(2,"0")}`;
    const meal = { ...result.total, foods: result.foods, feedback: result.feedback, time, img: preview };
    setMeals(prev => [...prev, meal]);
    setSaved(true);

    // Supabase에 저장
    if (user) {
      fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, foods: result.foods, total: result.total, feedback: result.feedback }),
      }).catch(() => {});
    }

    setTimeout(() => { setTab(0); setResult(null); setPreview(null); setSaved(false); }, 800);
  };

  // 온보딩 완료 시 프로필 저장
  const completeOnboarding = () => {
    if (updateProfile) {
      updateProfile({ age: prof.age, height_cm: prof.height, weight_kg: prof.weight, goal: prof.goal, onboarding_done: true });
    }
    setScr("main");
  };

  const getRecs = () => {
    const gaps = { protein: tgt.protein - tot.protein, fat: tgt.fat - tot.fat, carbs: tgt.carbs - tot.carbs };
    const defs = Object.entries(gaps).filter(([,v]) => v > 0).sort((a,b) => b[1] - a[1]);
    if (!defs.length) return { nutrient: null, gap: 0, foods: [] };
    const [nut, gap] = defs[0];
    const key = nut === "protein" ? "pro" : nut === "carbs" ? "carb" : "fat";
    const sorted = [...FOODS].sort((a,b) => b[key] - a[key]).slice(0, 6);
    const labels = { protein: "단백질", carbs: "탄수화물", fat: "지방" };
    return { nutrient: labels[nut], gap: Math.round(gap), foods: sorted };
  };

  /* ── Shell ── */
  const wrap = (children, nav = false) => (
    <div style={{ width: "100%", maxWidth: 420, background: C.bg, minHeight: "100dvh", display: "flex", flexDirection: "column", position: "relative" }}>
      {children}
      {nav && (
        <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, background: C.card, padding: "8px 0 max(12px, env(safe-area-inset-bottom))" }}>
          {[{ icon: Home, label: "홈" }, { icon: Camera, label: "분석" }, { icon: BarChart3, label: "리포트" }, { icon: Sparkles, label: "추천" }].map((t, i) => (
            <button key={i} onClick={() => { if (!isPro && (i === 2 || i === 3)) { setShowPaywall(true); return; } setTab(i); setResult(null); setPreview(null); }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 0", color: tab === i ? C.greenDk : C.sub, transition: "color 0.2s" }}>
              <t.icon size={22} strokeWidth={tab === i ? 2.2 : 1.5} />
              <span style={{ fontSize: 10, fontWeight: tab === i ? 600 : 400 }}>{t.label}</span>
              {!isPro && (i === 2 || i === 3) && <Lock size={8} style={{ position: "absolute", marginTop: -2, marginLeft: 20 }} />}
            </button>
          ))}
        </div>
      )}
      {showPaywall && <Paywall plan={paywallPlan} setPlan={setPaywallPlan} onClose={() => setShowPaywall(false)} onSubscribe={() => { setIsPro(true); setShowPaywall(false); }} />}
    </div>
  );

  const header = (
    <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", background: C.card }}>
      <ChevronLeft size={22} color={C.txt} />
      <span style={{ flex: 1, textAlign: "center", fontSize: 17, fontWeight: 600 }}>Acture</span>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setShowSettings(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Settings size={18} color={C.sub} /></button>
        {signOut && <button onClick={signOut} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><LogOut size={18} color={C.sub} /></button>}
      </div>
    </div>
  );

  // 설정 화면
  if (showSettings) return wrap(
    <NotificationSettings
      profile={profile}
      onSave={(notifTimes) => { if (updateProfile) updateProfile({ notification_times: notifTimes }); }}
      onBack={() => setShowSettings(false)}
    />
  );

  /* ── INTRO ── */
  if (scr === "intro") {
    const s = INTRO_SLIDES[slide];
    return wrap(
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 32 }}>{s.visual}</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.txt, lineHeight: 1.4, margin: "0 0 16px", whiteSpace: "pre-line" }}>{s.title}</h1>
          <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>{s.desc}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
          {INTRO_SLIDES.map((_,i) => <div key={i} style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 4, background: i === slide ? C.green : "#DDD", transition: "all 0.3s" }} />)}
        </div>
        <Btn full onClick={() => slide < 3 ? setSlide(slide+1) : setScr("profile")}>{slide < 3 ? "다음" : "시작하기"}</Btn>
        {slide < 3 && <button onClick={() => setScr("profile")} style={{ background: "none", border: "none", color: C.sub, fontSize: 14, marginTop: 12, cursor: "pointer" }}>건너뛰기</button>}
      </div>
    );
  }

  /* ── PROFILE ── */
  if (scr === "profile") {
    const steps = [
      { label: "나이가 몇 세이신가요?", key: "age", min: 10, max: 80, unit: "세", hint: "본인의 나이를 입력해주세요" },
      { label: "키는 어떻게 되시나요?", key: "height", min: 100, max: 220, unit: "cm", hint: "키를 입력해주세요" },
      { label: "몸무게는 어떻게 되시나요?", key: "weight", min: 30, max: 200, unit: "kg", hint: "몸무게를 입력해주세요" },
    ];
    if (pStep < 3) {
      const st = steps[pStep];
      return wrap(
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "16px 20px" }}>
            <button onClick={() => pStep > 0 ? setPStep(pStep-1) : setScr("intro")} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><ChevronLeft size={24} color={C.txt} /></button>
            <span style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 600 }}>Acture</span>
            <div style={{ width: 32 }} />
          </div>
          <div style={{ flex: 1 }}><NumPicker label={st.label} hint={st.hint} value={prof[st.key]} onChange={v => setProf({...prof, [st.key]: v})} min={st.min} max={st.max} unit={st.unit} /></div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: i === pStep ? 24 : 8, height: 8, borderRadius: 4, background: i === pStep ? C.green : "#DDD", transition: "all 0.3s" }} />)}
          </div>
          <div style={{ padding: "0 24px 24px" }}><Btn full onClick={() => setPStep(pStep+1)}>NEXT</Btn></div>
        </div>
      );
    }
    return wrap(
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px" }}>
          <button onClick={() => setPStep(2)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><ChevronLeft size={24} color={C.txt} /></button>
          <span style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 600 }}>Acture</span>
          <div style={{ width: 32 }} />
        </div>
        <div style={{ padding: "20px 24px", flex: 1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>목표를 선택해주세요</h2>
          <p style={{ fontSize: 14, color: C.sub, margin: "0 0 24px" }}>당신에게 맞는 식단을 추천해드릴게요</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(GOALS).map(([k, v]) => (
              <button key={k} onClick={() => setProf({...prof, goal: k})} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 14, border: prof.goal === k ? `2px solid ${C.green}` : `1.5px solid ${C.border}`, background: prof.goal === k ? C.greenLt : C.card, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                <span style={{ fontSize: 28 }}>{v.emoji}</span>
                <div><div style={{ fontSize: 16, fontWeight: 600, color: C.txt }}>{v.label}</div><div style={{ fontSize: 13, color: C.sub }}>{v.desc}</div></div>
                {prof.goal === k && <Check size={20} color={C.green} style={{ marginLeft: "auto" }} />}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "0 24px 24px" }}><Btn full disabled={!prof.goal} onClick={completeOnboarding}>시작하기</Btn></div>
      </div>
    );
  }

  /* ── HOME ── */
  if (tab === 0) return wrap(
    <>
      {header}
      <div style={{ flex: 1, padding: "0 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 24, padding: "12px 0 20px" }}>
          <span style={{ fontSize: 14, color: C.sub }}>{today.getMonth()+1}/{today.getDate()-1}</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.txt }}>{dateStr}</span>
          <span style={{ fontSize: 14, color: C.sub }}>{today.getMonth()+1}/{today.getDate()+1}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", position: "relative", marginBottom: 8 }}>
          <Ring pct={calPct} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
            {meals.length === 0 ? (
              <button onClick={() => setTab(1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: C.greenLt, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={22} color={C.greenDk} /></div>
                <span style={{ fontSize: 13, color: C.sub }}>식사 사진을 찍어주세요</span>
              </button>
            ) : (
              <><div style={{ fontSize: 28, fontWeight: 700, color: C.txt }}>{Math.round(calPct*100)}%</div><div style={{ fontSize: 12, color: C.sub }}>{Math.round(tot.calories)}/{tgt.calories}kcal</div></>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <Bar label="칼로리" cur={tot.calories} max={tgt.calories} color={C.green} />
          <Bar label="단백질" cur={tot.protein} max={tgt.protein} color="#42A5F5" />
          <Bar label="탄수화물" cur={tot.carbs} max={tgt.carbs} color="#FFA726" />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 12px" }}>식사기록</h3>
        {meals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: C.sub, fontSize: 14 }}>아직 기록이 없어요.<br/>분석 탭에서 음식 사진을 올려보세요!</div>
        ) : meals.map((m, i) => (
          <div key={i} style={{ background: C.card, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, marginBottom: 12 }}>
            {m.img && <div style={{ height: 140, background: `url(${m.img}) center/cover`, position: "relative" }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,.7))", padding: "24px 14px 10px", color: "#fff" }}>
                <div style={{ display: "flex", gap: 16, fontSize: 12 }}><span>칼로리 <b>{Math.round(m.calories)}kcal</b></span><span>단백질 <b>{Math.round(m.protein)}g</b></span><span>탄수화물 <b>{Math.round(m.carbs)}g</b></span></div>
              </div>
            </div>}
            <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: C.sub }}>{m.time}</span>
              <span style={{ fontSize: 12, color: C.sub, fontStyle: "italic" }}>{m.feedback}</span>
            </div>
          </div>
        ))}
      </div>
    </>, true
  );

  /* ── ANALYZE ── */
  if (tab === 1) return wrap(
    <>
      {header}
      <div style={{ flex: 1, padding: "0 20px 20px" }}>
        <input ref={fRef} type="file" accept="image/*" onChange={handleFile} />
        {!preview ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
            <div style={{ width: 200, height: 200, borderRadius: 100, background: C.greenLt, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: `3px dashed ${C.green}44` }}>
              <Camera size={56} color={C.green} strokeWidth={1.2} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>식사 사진을 올려주세요</h3>
            <p style={{ fontSize: 14, color: C.sub, margin: "0 0 32px", textAlign: "center" }}>음식 사진을 업로드하면<br/>AI가 영양성분을 분석해줘요</p>
            {!isPro && <p style={{ fontSize: 13, color: C.greenDk, marginBottom: 12 }}>무료 분석 {Math.max(0, 1-dailyFreeUsed)}회 남음</p>}
            <Btn onClick={() => fRef.current?.click()}><Upload size={16} style={{ marginRight: 6, verticalAlign: -2 }} />갤러리에서 선택</Btn>
          </div>
        ) : (
          <div>
            <div style={{ borderRadius: 16, overflow: "hidden", marginTop: 12, marginBottom: 16, position: "relative" }}>
              <img src={preview} alt="food" style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }} />
              <button onClick={() => { setPreview(null); setResult(null); setErr(null); }} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: 16, background: "rgba(0,0,0,.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color="#fff" /></button>
            </div>
            {busy && <div style={{ textAlign: "center", padding: "24px 0" }}><div style={{ display: "inline-block", width: 36, height: 36, border: `3px solid ${C.border}`, borderTopColor: C.green, borderRadius: "50%" }} className="animate-spin" /><p style={{ fontSize: 14, color: C.sub, marginTop: 12 }}>AI가 음식을 분석하고 있어요...</p></div>}
            {err && <div style={{ textAlign: "center", padding: 20, color: "#E53935", fontSize: 14 }}>{err}</div>}
            {result && (
              <>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>{result.foods.map(f => f.name).join(", ")}</h3>
                <p style={{ fontSize: 14, color: C.sub, margin: "0 0 16px", lineHeight: 1.5 }}>{result.feedback}</p>
                {result.foods.length > 1 && <div style={{ marginBottom: 16 }}>{result.foods.map((f,i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < result.foods.length-1 ? `1px solid ${C.border}` : "none", fontSize: 13 }}>
                    <span>{f.name} <span style={{ color: C.sub }}>({f.weight_g}g)</span></span><span style={{ color: C.sub }}>{Math.round(f.calories)}kcal</span>
                  </div>
                ))}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <NCard label="Calories" cur={result.total.calories} max={tgt.calories} color="#42A5F5" />
                  <NCard label="Protein" cur={result.total.protein} max={tgt.protein} color={C.green} />
                  <NCard label="Carbs" cur={result.total.carbs} max={tgt.carbs} color="#FFA726" />
                  <NCard label="Fat" cur={result.total.fat} max={tgt.fat} color="#EF5350" />
                </div>
                <div style={{ marginTop: 20 }}>
                  {saved ? <div style={{ textAlign: "center", padding: 14, background: C.greenLt, borderRadius: 12, color: C.greenDk, fontWeight: 600 }}><Check size={18} style={{ verticalAlign: -3, marginRight: 6 }} />저장 완료!</div>
                  : <Btn full onClick={saveMeal}>식단에 추가하기</Btn>}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>, true
  );

  /* ── REPORT ── */
  if (tab === 2) {
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    return wrap(
      <>
        {header}
        <div style={{ flex: 1, padding: "0 20px 20px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ padding: "8px 20px", borderRadius: 17, background: C.green, color: "#fff", fontSize: 13, fontWeight: 600 }}>식단</div>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, textAlign: "center", margin: "0 0 20px" }}>{today.getFullYear()}년 {today.getMonth()+1}월</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 24, textAlign: "center" }}>
            {days.map(d => <div key={d} style={{ fontSize: 11, color: d === "Sun" ? "#E53935" : d === "Sat" ? "#42A5F5" : C.sub, fontWeight: 500, padding: "4px 0" }}>{d}</div>)}
            {Array.from({ length: new Date(today.getFullYear(), today.getMonth(), 1).getDay() }, (_,i) => <div key={`e${i}`} />)}
            {Array.from({ length: new Date(today.getFullYear(), today.getMonth()+1, 0).getDate() }, (_,i) => {
              const d = i+1, isToday = d === today.getDate();
              return <div key={d} style={{ padding: "6px 0", borderRadius: 8, background: isToday ? C.greenLt : "transparent", fontWeight: isToday ? 700 : 400, fontSize: 13, color: isToday ? C.greenDk : C.txt }}>{d}{isToday && meals.length > 0 && <div style={{ width: 5, height: 5, borderRadius: 3, background: C.green, margin: "2px auto 0" }} />}</div>;
            })}
          </div>
          <div style={{ background: C.card, borderRadius: 14, padding: 20, border: `1px solid ${C.border}` }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>오늘의 목표 달성률</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 8, background: "#E8E8E8", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(calPct*100,100)}%`, background: C.green, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.greenDk }}>{Math.round(calPct*100)}%</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <NCard label="Protein" cur={tot.protein} max={tgt.protein} color={C.green} />
              <NCard label="Carbs" cur={tot.carbs} max={tgt.carbs} color="#FFA726" />
              <NCard label="Fat" cur={tot.fat} max={tgt.fat} color="#EF5350" />
              <NCard label="Sodium" cur={0} max={2000} color="#AB47BC" />
            </div>
          </div>
        </div>
      </>, true
    );
  }

  /* ── RECOMMEND ── */
  if (tab === 3) {
    const rec = getRecs();
    return wrap(
      <>
        {header}
        <div style={{ flex: 1, padding: "0 20px 20px" }}>
          {meals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <Sparkles size={48} color={C.green} strokeWidth={1.2} style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>식단을 먼저 기록해주세요</h3>
              <p style={{ fontSize: 14, color: C.sub }}>오늘 먹은 음식을 분석하면<br/>부족한 영양소에 맞는 음식을 추천해드려요</p>
              <div style={{ marginTop: 24 }}><Btn onClick={() => setTab(1)}>음식 분석하러 가기</Btn></div>
            </div>
          ) : rec.nutrient ? (
            <>
              <div style={{ background: C.greenLt, borderRadius: 16, padding: 20, marginTop: 12, marginBottom: 20, textAlign: "center" }}>
                <Ring pct={rec.nutrient === "단백질" ? tot.protein/tgt.protein : rec.nutrient === "탄수화물" ? tot.carbs/tgt.carbs : tot.fat/tgt.fat} size={120} sw={10} />
                <div style={{ fontSize: 15, color: C.greenDk, fontWeight: 600, marginTop: 8 }}>부족한 {rec.nutrient}: {rec.gap}g</div>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 12px" }}>추천 음식</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {rec.foods.map((f, i) => (
                  <div key={i} style={{ background: C.card, borderRadius: 14, padding: 14, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 28, marginBottom: 8, textAlign: "center" }}>{f.cat === "pro" ? "🥩" : f.cat === "carb" ? "🍚" : f.cat === "fat" ? "🥑" : f.cat === "kor" ? "🍲" : "🥦"}</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{f.name}</div>
                    <div style={{ fontSize: 12, color: C.sub, marginBottom: 6 }}>{f.por}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.sub }}><span>P {f.pro}g</span><span>F {f.fat}g</span><span>C {f.carb}g</span></div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.greenDk, marginTop: 6 }}>{f.cal} kcal</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>오늘 목표를 달성했어요!</h3>
              <p style={{ fontSize: 14, color: C.sub }}>모든 영양소 섭취를 완료했습니다</p>
            </div>
          )}
        </div>
      </>, true
    );
  }

  return wrap(<div style={{ flex: 1 }} />, true);
}

/* ── PAYWALL COMPONENT ── */
function Paywall({ plan, setPlan, onClose, onSubscribe }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 420, background: "#111", borderRadius: "24px 24px 0 0", padding: "32px 24px max(24px, env(safe-area-inset-bottom))", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 16, background: "rgba(255,255,255,.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color="#fff" /></button>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(139,195,74,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Crown size={24} color="#8BC34A" /></div>
          <h2 style={{ fontSize: 21, fontWeight: 700, color: "#fff", lineHeight: 1.35, margin: "0 0 6px" }}>3일 무료 체험으로<br/>모든 기능을 경험하세요</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", margin: 0 }}>언제든 해지 가능</p>
        </div>

        {/* Timeline */}
        {[{ day: "오늘", title: "무료 체험 시작", icon: "🔓", color: "#8BC34A" },
          { day: "2일 후", title: "리마인더 발송", icon: "🔔", color: "#FFA726" },
          { day: "3일 후", title: "결제 시작", icon: "💳", color: "#EF5350" }
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 0 : 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: i === 0 ? s.color : "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{s.icon}</div>
              {i < 2 && <div style={{ width: 1.5, height: 28, background: "rgba(255,255,255,.1)", margin: "3px 0" }} />}
            </div>
            <div style={{ paddingTop: 4, paddingBottom: i < 2 ? 10 : 0 }}>
              <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.day} </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{s.title}</span>
            </div>
          </div>
        ))}

        {/* Pricing */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button onClick={() => setPlan("monthly")} style={{ flex: 1, padding: "14px 12px", borderRadius: 14, cursor: "pointer", textAlign: "center", border: plan === "monthly" ? "2px solid #8BC34A" : "1.5px solid rgba(255,255,255,.15)", background: plan === "monthly" ? "rgba(139,195,74,.15)" : "rgba(255,255,255,.05)" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginBottom: 4, letterSpacing: 1 }}>MONTHLY</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>₩6,900<span style={{ fontSize: 12, fontWeight: 400 }}>/월</span></div>
          </button>
          <button onClick={() => setPlan("yearly")} style={{ flex: 1, padding: "14px 12px", borderRadius: 14, cursor: "pointer", textAlign: "center", position: "relative", border: plan === "yearly" ? "2px solid #8BC34A" : "1.5px solid rgba(255,255,255,.15)", background: plan === "yearly" ? "rgba(139,195,74,.15)" : "rgba(255,255,255,.05)" }}>
            <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#8BC34A", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8, whiteSpace: "nowrap" }}>3일 무료</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginBottom: 4, letterSpacing: 1 }}>YEARLY</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>₩2,900<span style={{ fontSize: 12, fontWeight: 400 }}>/월</span></div>
            <div style={{ fontSize: 11, color: "#8BC34A", marginTop: 2 }}>연 ₩34,800 (58% 절약)</div>
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>✓ 지금 결제되지 않습니다</span>
        </div>
        <button onClick={onSubscribe} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "#8BC34A", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          3일 무료 체험 시작하기
        </button>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 16 }}>
          <span>서비스 이용약관</span><span>개인정보 처리방침</span><span>구입 내역 복원</span>
        </div>
      </div>
    </div>
  );
}
