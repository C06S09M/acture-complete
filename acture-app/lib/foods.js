export const FOODS = [
  { name: "닭가슴살", por: "100g", cal: 165, pro: 31, fat: 3.6, carb: 0, cat: "pro" },
  { name: "삶은 계란", por: "2개", cal: 143, pro: 13, fat: 9.5, carb: 1, cat: "pro" },
  { name: "그릭 요거트", por: "150g", cal: 100, pro: 17, fat: 0.7, carb: 6, cat: "pro" },
  { name: "연어 스테이크", por: "150g", cal: 280, pro: 39, fat: 13, carb: 0, cat: "pro" },
  { name: "두부", por: "반모", cal: 130, pro: 14, fat: 7.5, carb: 3, cat: "pro" },
  { name: "참치캔", por: "135g", cal: 110, pro: 25, fat: 1, carb: 0, cat: "pro" },
  { name: "프로틴 쉐이크", por: "1잔", cal: 130, pro: 25, fat: 2, carb: 7, cat: "pro" },
  { name: "소고기 안심", por: "150g", cal: 250, pro: 36, fat: 12, carb: 0, cat: "pro" },
  { name: "새우", por: "150g", cal: 130, pro: 28, fat: 1.5, carb: 1, cat: "pro" },
  { name: "북어구이", por: "1인분", cal: 287, pro: 46.5, fat: 5.9, carb: 10.5, cat: "pro" },
  { name: "현미밥", por: "1공기", cal: 300, pro: 6, fat: 1.5, carb: 65, cat: "carb" },
  { name: "고구마", por: "중 1개", cal: 130, pro: 2, fat: 0.1, carb: 30, cat: "carb" },
  { name: "오트밀", por: "1컵", cal: 307, pro: 11, fat: 5, carb: 55, cat: "carb" },
  { name: "바나나", por: "1개", cal: 105, pro: 1.3, fat: 0.4, carb: 27, cat: "carb" },
  { name: "통밀빵", por: "2장", cal: 160, pro: 8, fat: 2, carb: 28, cat: "carb" },
  { name: "감자", por: "중 1개", cal: 160, pro: 4, fat: 0.2, carb: 37, cat: "carb" },
  { name: "옥수수", por: "1개", cal: 90, pro: 3, fat: 1.5, carb: 19, cat: "carb" },
  { name: "아보카도", por: "반개", cal: 160, pro: 2, fat: 15, carb: 9, cat: "fat" },
  { name: "아몬드", por: "30g", cal: 173, pro: 6, fat: 15, carb: 6, cat: "fat" },
  { name: "올리브오일", por: "1큰술", cal: 120, pro: 0, fat: 14, carb: 0, cat: "fat" },
  { name: "땅콩버터", por: "2큰술", cal: 188, pro: 8, fat: 16, carb: 6, cat: "fat" },
  { name: "브로콜리", por: "1컵", cal: 55, pro: 3.7, fat: 0.6, carb: 11, cat: "veg" },
  { name: "시금치", por: "1컵", cal: 41, pro: 5, fat: 0.5, carb: 7, cat: "veg" },
  { name: "불고기", por: "150g", cal: 330, pro: 28, fat: 18, carb: 12, cat: "kor" },
  { name: "비빔밥", por: "1인분", cal: 530, pro: 18, fat: 13, carb: 85, cat: "kor" },
  { name: "된장찌개", por: "1인분", cal: 85, pro: 6.5, fat: 3.5, carb: 7, cat: "kor" },
  { name: "김치찌개", por: "1인분", cal: 165, pro: 11, fat: 8, carb: 12, cat: "kor" },
  { name: "잡채", por: "1인분", cal: 285, pro: 8, fat: 10, carb: 43, cat: "kor" },
  { name: "제육볶음", por: "1인분", cal: 380, pro: 25, fat: 22, carb: 18, cat: "kor" },
  { name: "순두부찌개", por: "1인분", cal: 120, pro: 10, fat: 6, carb: 8, cat: "kor" },
];

export const GOALS = {
  diet: { label: "다이어트", desc: "체중 감량 목표", emoji: "🔥", t: { calories: 1500, protein: 120, fat: 50, carbs: 130 } },
  bulk: { label: "벌크업", desc: "근육량 증가 목표", emoji: "💪", t: { calories: 2800, protein: 180, fat: 90, carbs: 300 } },
  healthy: { label: "건강식 유지", desc: "균형 잡힌 영양 섭취", emoji: "🌿", t: { calories: 2000, protein: 100, fat: 65, carbs: 250 } },
  custom: { label: "직접 설정", desc: "나만의 목표", emoji: "⚙️", t: { calories: 2000, protein: 100, fat: 65, carbs: 250 } },
};

export const INTRO_SLIDES = [
  { title: "당신의 요즘 목표는\n무엇인가요?", desc: "ACTure는 최소한 목표를 설정해주고,\n개인 맞춤 스타일을 관리해줄게요", visual: "🎯" },
  { title: "목표를 달성하기 위해선\n건강한 몸이 필요해요", desc: "건강한 라이프 스타일을 유지할 수 있게\n당신에게 맞는 식단을 추천해줄게요", visual: "💪" },
  { title: "ACTure는 음식을\n분석해줘요", desc: "매일 먹는 음식 사진을 찍고\n업로드 하면, 음식성분을 분석해줘요", visual: "📸" },
  { title: "이번 달에는,\n이렇게 먹었습니다", desc: "ACTure는 매일 식단을 읽어\n영양성분 섭취 리포트를 정리해드려요", visual: "📊" },
];

export const PRICING = {
  monthly: { price: 6900, label: "₩6,900", period: "/월" },
  yearly: { price: 2900, label: "₩2,900", period: "/월", total: 34800, discount: "58% 절약" },
};
