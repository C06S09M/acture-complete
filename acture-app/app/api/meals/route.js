import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 식사 기록 저장
export async function POST(request) {
  try {
    const { userId, foods, total, feedback, imageUrl } = await request.json();

    const { data, error } = await supabaseAdmin.from("meals").insert({
      user_id: userId,
      foods,
      total_calories: total.calories,
      total_protein: total.protein,
      total_fat: total.fat,
      total_carbs: total.carbs,
      feedback,
      image_url: imageUrl,
    }).select().single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 오늘의 식사 기록 불러오기
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const { data, error } = await supabaseAdmin
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .eq("meal_date", date)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
