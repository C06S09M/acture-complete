import "./globals.css";

export const metadata = {
  title: "ACTure - AI 식단 분석",
  description: "사진 한 장으로 영양성분을 분석하고, 맞춤 식단을 추천받으세요",
  manifest: "/manifest.json",
  themeColor: "#8BC34A",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ display: "flex", justifyContent: "center", minHeight: "100dvh" }}>
        {children}
      </body>
    </html>
  );
}
