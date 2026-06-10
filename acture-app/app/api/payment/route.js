import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { userId, plan } = await request.json();

    const amount = plan === "yearly" ? 34800 : 6900;
    const orderId = `acture_${plan}_${userId.slice(0, 8)}_${Date.now()}`;
    const orderName = plan === "yearly" ? "ACTure Pro 연간 구독" : "ACTure Pro 월간 구독";

    // Supabase에 주문 기록 생성
    await supabaseAdmin.from("subscriptions").insert({
      user_id: userId,
      plan,
      status: "trial",
      order_id: orderId,
      amount,
      trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 후
      started_at: new Date().toISOString(),
    });

    // 클라이언트에서 Toss SDK로 결제 진행할 정보 반환
    return NextResponse.json({
      orderId,
      orderName,
      amount,
      clientKey: process.env.TOSS_CLIENT_KEY,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
