export interface Product {
  key: string;
  name: string;
  price: number;
  icon: string;
  description: string;
  isFree: boolean;
}

export const PRODUCTS: Product[] = [
  { key: "bazi", name: "八字排盘", price: 19.9, icon: "🗓️", description: "精准八字命盘解析，洞悉先天命格", isFree: false },
  { key: "ziwei", name: "紫微斗数", price: 29.9, icon: "🌌", description: "紫微星盘全面解读，揭示人生运势", isFree: false },
  { key: "marriage", name: "姻缘测算", price: 29.9, icon: "💕", description: "姻缘配对深度分析，寻觅真爱良缘", isFree: false },
  { key: "wealth", name: "财运分析", price: 19.9, icon: "💰", description: "财运走势精准预测，把握财富机遇", isFree: false },
  { key: "name", name: "姓名测试", price: 9.9, icon: "🌸", description: "姓名五格三才解析，了解名字能量", isFree: false },
  { key: "daily", name: "每日运势", price: 0, icon: "✨", description: "每日运势贴心提醒，开启美好一天", isFree: true },
  { key: "dayun", name: "大运流年", price: 39.9, icon: "🌊", description: "十年大运流年详批，规划人生方向", isFree: false },
  { key: "tarot", name: "塔罗占卜", price: 9.9, icon: "🎴", description: "塔罗牌阵专业解读，指引当下抉择", isFree: false },
];

export function getProductByKey(key: string): Product | undefined {
  return PRODUCTS.find(p => p.key === key);
}
