import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { paymentKey, orderId, amount } = await request.json();

    // Toss Payments 결제 승인
    const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    if (!tossRes.ok) {
      const err = await tossRes.json();
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const payment = await tossRes.json();

    // 구독 정보 업데이트
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (!sub) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const expiresAt = sub.plan === "yearly"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 구독 활성화
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "active", payment_key: paymentKey, expires_at: expiresAt.toISOString() })
      .eq("order_id", orderId);

    // 유저 프로필 Pro 전환
    await supabaseAdmin
      .from("profiles")
      .update({ is_pro: true, pro_plan: sub.plan, pro_expires_at: expiresAt.toISOString() })
      .eq("id", sub.user_id);

    return NextResponse.json({ success: true, plan: sub.plan, expiresAt });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
