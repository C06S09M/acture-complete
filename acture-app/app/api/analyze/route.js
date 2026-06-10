import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { image, mediaType } = await request.json();

    if (!image || !mediaType) {
      return NextResponse.json({ error: "image and mediaType required" }, { status: 400 });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: image },
              },
              {
                type: "text",
                text: `이 음식 사진을 분석해서 각 음식별 영양성분을 추정해줘. 각 음식의 양(g)도 사진에서 추정해.
반드시 아래 JSON 형식으로만 응답하고, JSON 외에 어떤 텍스트도 포함하지 마:
{"foods":[{"name":"음식명","weight_g":추정무게,"calories":숫자,"protein":숫자,"fat":숫자,"carbs":숫자}],"total":{"calories":숫자,"protein":숫자,"fat":숫자,"carbs":숫자},"feedback":"이 식단에 대한 한줄 피드백 (한국어, 유저의 건강 목표에 맞게)"}`,
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: "API call failed", detail: err }, { status: res.status });
    }

    const data = await res.json();
    const text = data.content?.map((b) => b.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: "Analysis failed", detail: e.message }, { status: 500 });
  }
}
