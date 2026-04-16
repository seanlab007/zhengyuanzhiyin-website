import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Users, Shield, Zap, Loader2, Lock, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import LunarDatePicker from '@/components/LunarDatePicker';
import FloatingButtons from '@/components/FloatingButtons';
import { useAdmin } from '@/contexts/AdminContext';

const HERO_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663494601131/cb6tJthVaUMYyF2mL5LVPm/marriage-hero-bg-9eGPiLxodHioWaYizX3qxd.webp';

export default function Home() {
  const [, navigate] = useLocation();
  const { isAdmin } = useAdmin();

  // Form state
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'男' | '女'>('男');
  const [birthDisplay, setBirthDisplay] = useState('');
  const [birthData, setBirthData] = useState<{
    calendarType: 'solar' | 'lunar';
    year: number;
    month: number;
    day: number;
    hour: string;
    displayStr: string;
  } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // 5个核心卖点模块
  const coreModules = [
    {
      icon: '💫',
      title: '解析个人性格对感情的影响',
      color: 'from-pink-500/20 to-rose-500/10',
      borderColor: 'border-pink-400/30',
      titleColor: 'text-pink-300',
      items: ['分析你潜在吸引异性的个人魅力', '如何经营幸福稳定的婚姻生活？', '分析哪些因素对你的感情不利'],
    },
    {
      icon: '🌸',
      title: '探索婚姻成长方向',
      color: 'from-fuchsia-500/20 to-pink-500/10',
      borderColor: 'border-fuchsia-400/30',
      titleColor: 'text-fuchsia-300',
      items: ['解析你的姻缘情况', '了解你的择偶倾向与感情特质', '专业点评适合你的婚配对象'],
    },
    {
      icon: '👑',
      title: '你的婚姻格局',
      color: 'from-amber-500/20 to-orange-500/10',
      borderColor: 'border-amber-400/30',
      titleColor: 'text-amber-300',
      items: ['婚姻对象的条件和特征', '婚后感情生活分析', '根据伴侣性格和谐相处的技巧'],
    },
    {
      icon: '🔑',
      title: '你最应了解的婚配要点',
      color: 'from-rose-500/20 to-red-500/10',
      borderColor: 'border-rose-400/30',
      titleColor: 'text-rose-300',
      items: ['你适合早婚还是晚婚？', '守护婚姻长期亲密的策略', '老师专业点评适合你的婚配对象！'],
    },
    {
      icon: '🎁',
      title: '2026年爱情幸福秘箱',
      color: 'from-violet-500/20 to-purple-500/10',
      borderColor: 'border-violet-400/30',
      titleColor: 'text-violet-300',
      items: ['我要拍拖', '我要提升人缘', '我要爱情更加甜蜜', '防止爱人变心！'],
    },
  ];

  // Countdown timer
  const [timeLeft, setTimeLeft] = React.useState(72063);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const createOrderMutation = trpc.orders.createAnonymous.useMutation({
    onSuccess: (data) => {
      setIsSubmitting(false);
      // Navigate to payment page with order info
      navigate(`/payment?order_id=${data.orderId}&order_no=${data.orderNo}`);
    },
    onError: (err) => {
      setIsSubmitting(false);
      toast.error(err.message || '创建订单失败');
    },
  });

  const handleDateConfirm = (data: any) => {
    setBirthData(data);
    setBirthDisplay(data.displayStr);
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('请输入姓名');
      return;
    }
    if (!birthData) {
      toast.error('请选择出生日期');
      return;
    }
    if (!agreePrivacy) {
      toast.error('请同意隐私协议');
      return;
    }

    setIsSubmitting(true);

    // If admin, skip payment and go directly to result
    if (isAdmin) {
      navigate(`/fortune?name=${encodeURIComponent(name)}&gender=${gender}&birth=${encodeURIComponent(JSON.stringify(birthData))}&admin=true`);
      return;
    }

    createOrderMutation.mutate({
      productKey: 'marriage-analysis',
      customerName: name,
      customerGender: gender,
      calendarType: birthData.calendarType,
      birthDate: `${birthData.year}-${String(birthData.month).padStart(2, '0')}-${String(birthData.day).padStart(2, '0')}`,
      birthHour: birthData.hour,
      paymentMethod: 'wechat',
      lunarDateStr: birthData.displayStr,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-900/20 via-purple-900/10 to-black">
      {/* Floating buttons */}
      <FloatingButtons />

      {/* 姓名测算入口 */}
      <div className="px-4 py-2 max-w-md mx-auto">
        <button
          onClick={() => navigate('/name-test')}
          className="w-full py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          姓名测算
        </button>
      </div>

      {/* Hero Section - 欢迎页面 */}
      <div className="relative pt-4 pb-6 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-white text-2xl font-bold mb-2">姻缘测试</h1>
          <p className="text-gray-400 text-sm mb-6">恋爱婚姻 · 爱情秘籍 · 婚姻分析</p>
          
          {/* Hero Image - 只显示上半部分 */}
          <div className="relative mb-4 rounded-3xl overflow-hidden border-4 border-yellow-400/50 shadow-2xl h-32">
            <img 
              src={HERO_IMG} 
              alt="Marriage Test" 
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>

          {/* Stats */}
          <div className="rounded-2xl bg-pink-900/30 border border-pink-400/30 px-4 py-3 mb-4">
            <p className="text-white text-sm font-semibold mb-1">👥 已为 1,576,576 人提供姻缘分析</p>
            <p className="text-gray-300 text-xs">97.8%的用户对分析结果非常满意！</p>
          </div>

          <p className="text-center text-gray-400 text-xs mb-4">
            想作为生活、工作之指导。平台产品拒绝向未成年人提供服务，如未成年人请自行离开。
          </p>
        </div>
      </div>

      {/* 信息输入表单 - 紧凑设计 */}
      <div ref={formRef} className="px-4 py-3 max-w-md mx-auto">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #fef9f0, #fdf3e7)', border: '2px solid #e8c99b' }}>
          <div className="px-5 py-4 space-y-4">
            {/* 姓名 */}
            <div className="flex items-center gap-2">
              <label className="text-red-700 font-bold text-sm whitespace-nowrap min-w-[60px]">您的姓名：</label>
              <input
                type="text"
                placeholder="请输入姓名（汉字）"
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 bg-transparent border-b border-gray-300 py-1.5 text-gray-700 text-sm placeholder:text-gray-400 outline-none focus:border-red-400 transition-colors"
              />
            </div>

            {/* 性别 */}
            <div className="flex items-center gap-2">
              <label className="text-red-700 font-bold text-sm whitespace-nowrap min-w-[60px]">您的性别：</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGender('男')}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                    gender === '男'
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  男
                </button>
                <button
                  onClick={() => setGender('女')}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                    gender === '女'
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  女
                </button>
              </div>
            </div>

            {/* 出生日期 */}
            <div className="flex items-center gap-2">
              <label className="text-red-700 font-bold text-sm whitespace-nowrap min-w-[60px]">出生日期：</label>
              <button
                onClick={() => setShowDatePicker(true)}
                className="flex-1 bg-transparent border-b border-gray-300 py-1.5 text-left text-sm outline-none"
              >
                {birthDisplay ? (
                  <span className="text-gray-700">{birthDisplay}</span>
                ) : (
                  <span className="text-gray-400">请选择出生日期</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 立即测算按钮 - 突出显示 */}
      <div className="px-4 py-3 max-w-md mx-auto">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 font-bold text-lg hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 transition-all shadow-lg"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              处理中...
            </span>
          ) : (
            '立即测算'
          )}
        </button>
      </div>

      {/* 隐私协议 */}
      <div className="px-4 py-2 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setAgreePrivacy(!agreePrivacy)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              agreePrivacy ? 'border-red-500 bg-red-500' : 'border-gray-400'
            }`}
          >
            {agreePrivacy && <span className="text-white text-[8px]">✓</span>}
          </button>
          <span className="text-gray-400 text-xs">
            同意《<span className="text-blue-400">用户隐私协议</span>》
          </span>
        </div>
      </div>

      {/* 查询订单链接 */}
      <div className="px-4 py-2 max-w-md mx-auto text-center">
        <button
          onClick={() => navigate('/orders')}
          className="text-blue-400 text-xs underline"
        >
          查询我的订单 &gt;
        </button>
      </div>

      {/* 底部信息 - 紧凑排列 */}
      <div className="px-4 py-3 max-w-md mx-auto text-center space-y-1 border-t border-gray-800/50 mt-2">
        <p className="text-gray-500 text-xs">需付费后方可查看结果，结果纯属娱乐仅供参考</p>
        <p className="text-gray-600 text-xs">联系电话：18888251399</p>
        <p className="text-gray-600 text-xs">苏州费汀娜教育科技有限公司</p>
        <p className="text-gray-700 text-xs">苏ICP备2021048491号-4</p>
      </div>

      {/* 你的姻缘分析报告 - 8个锁定项目网格 */}
      <div className="px-4 pt-4 pb-2 max-w-md mx-auto">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,182,213,0.05))' }}>
          <div className="px-5 py-4">
            <h2 className="text-center text-white font-bold text-base mb-3">你的姻缘分析报告</h2>
            <div className="grid grid-cols-4 gap-2">
              {['婚前性格', '姻缘分析', '感情发展', '异性缘分析', '爱情分析', '婚姻分析', '婚配要点', '幸福秘箱'].map((label, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center relative" style={{
                    background: i < 3 ? 'linear-gradient(135deg, #e8a0b8, #d4688e)' : 'linear-gradient(135deg, #f0c0d0, #e8a0b8)',
                    boxShadow: '0 3px 10px rgba(212,104,142,0.3)'
                  }}>
                    <span className="text-white text-xs font-bold text-center leading-tight">{label}</span>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-pink-900/80 flex items-center justify-center">
                      <Lock size={6} className="text-pink-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 核心卖点模块 */}
      <div className="px-4 py-3 max-w-md mx-auto space-y-3">
        <div className="text-center mb-1">
          <div className="inline-flex items-center gap-2 mb-1">
            <Sparkles size={12} className="text-pink-400" />
            <span className="text-pink-400 text-xs tracking-widest">付费后获取完整报告</span>
            <Sparkles size={12} className="text-pink-400" />
          </div>
          <h2 className="text-white text-base font-bold">你的姻缘分析报告包含</h2>
        </div>
        {coreModules.map((mod, idx) => (
          <div
            key={idx}
            className={`rounded-2xl overflow-hidden border ${mod.borderColor}`}
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{mod.icon}</span>
                <h3 className={`${mod.titleColor} font-bold text-sm`}>{mod.title}</h3>
              </div>
              <ul className="space-y-1">
                {mod.items.map((item, i) => (
                  <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                    <span className="text-pink-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Date Picker Modal */}
      <LunarDatePicker
        visible={showDatePicker}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
      />
    </div>
  );
}
