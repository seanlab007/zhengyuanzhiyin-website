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
      title: '婚前性格',
      borderColor: 'border-red-500/50',
      titleColor: 'text-yellow-300',
      items: ['分析你潜在吸引异性的个人魅力', '如何经营幸福稳定的婚姻生活？', '分析哪些因素对你的感情不利'],
    },
    {
      icon: '🌸',
      title: '探索婚姻成长方向',
      borderColor: 'border-pink-500/50',
      titleColor: 'text-pink-300',
      items: ['解析你的姻缘情况', '了解你的择偶倾向与感情特质', '专业点评适合你的婚配对象'],
    },
    {
      icon: '👑',
      title: '你的婚姻格局',
      borderColor: 'border-red-500/50',
      titleColor: 'text-yellow-300',
      items: ['婚姻对象的条件和特征', '婚后感情生活分析', '根据伴侣性格和谐相处的技巧'],
    },
    {
      icon: '🔑',
      title: '你最应了解的婚配要点',
      borderColor: 'border-red-500/50',
      titleColor: 'text-red-300',
      items: ['你适合早婚还是晚婚？', '守护婚姻长期亲密的策略', '老师专业点评适合你的婚配对象！'],
    },
    {
      icon: '🎁',
      title: '2026年爱情幸福秘箱',
      borderColor: 'border-red-500/50',
      titleColor: 'text-orange-300',
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
      productKey: 'marriage',
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

      {/* Hero Section - 欢迎页面 */}
      <div className="relative pt-8 pb-0 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-white text-2xl font-bold mb-2">姻缘测试</h1>
          <p className="text-gray-400 text-sm mb-6">恋爱婚姻 · 爱情秘籍 · 婚姻分析</p>
          
          {/* Hero Image with Form Overlay */}
          <div className="relative rounded-3xl overflow-hidden border-4 border-yellow-400/50 shadow-2xl">
            <img 
              src={HERO_IMG} 
              alt="Marriage Test" 
              className="w-full h-auto"
            />
            {/* 半透明覆盖层 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
            
            {/* 表单覆盖在图片中间 - 不覆盖头部 */}
            <div className="absolute top-2/3 left-0 right-0 px-3 py-1 transform -translate-y-1/2">
              {/* 表单 */}
              <div ref={formRef} className="rounded-2xl overflow-hidden mb-2" style={{ background: 'linear-gradient(135deg, #fef9f0, #fdf3e7)', border: '2px solid #e8c99b' }}>
                <div className="px-3 py-2 space-y-2">
                  {/* 姓名 */}
                  <div className="flex items-center gap-1">
                    <label className="text-red-700 font-bold text-[11px] whitespace-nowrap min-w-[45px]">您的姓名：</label>
                    <input
                      type="text"
                      placeholder="请输入姓名（汉字）"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="flex-1 bg-transparent border-b border-gray-300 py-0.5 text-gray-700 text-[11px] placeholder:text-gray-400 outline-none focus:border-red-400 transition-colors"
                    />
                  </div>

                  {/* 性别 */}
                  <div className="flex items-center gap-1">
                    <label className="text-red-700 font-bold text-[11px] whitespace-nowrap min-w-[45px]">您的性别：</label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setGender('男')}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${gender === '男' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-300 bg-white text-gray-500'}`}
                      >
                        男
                      </button>
                      <button
                        onClick={() => setGender('女')}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${gender === '女' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-300 bg-white text-gray-500'}`}
                      >
                        女
                      </button>
                    </div>
                  </div>

                  {/* 出生日期 */}
                  <div className="flex items-center gap-1">
                    <label className="text-red-700 font-bold text-[11px] whitespace-nowrap min-w-[45px]">出生日期：</label>
                    <button
                      onClick={() => setShowDatePicker(true)}
                      className="flex-1 bg-transparent border-b border-gray-300 py-0.5 text-left text-[11px] outline-none"
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
              
              {/* 立即测算按预 */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 font-bold text-sm hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 transition-all shadow-lg mb-1"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-1">
                    <Loader2 size={14} className="animate-spin" />
                    处理中...
                  </span>
                ) : (
                  '立即测算'
                )}
              </button>
              
              {/* 隐私协议 */}
              <div className="flex items-center justify-center gap-1 mb-1">
                <button
                  onClick={() => setAgreePrivacy(!agreePrivacy)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    agreePrivacy ? 'border-red-500 bg-red-500' : 'border-gray-400'
                  }`}
                >
                  {agreePrivacy && <span className="text-white text-[6px]">✓</span>}
                </button>
                <span className="text-gray-400 text-[10px]">
                  同意《<span className="text-blue-400">用户隐私协议</span>》
                </span>
              </div>
              
              {/* 查询订单 */}
              <div className="text-center">
                <button
                  onClick={() => navigate('/orders')}
                  className="text-blue-400 text-[10px] underline"
                >
                  查询我的订单 &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
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
            {/* 立即解锁按钮 */}
            <button
              onClick={() => {
                navigate(`/payment?product=marriage&name=${name}&gender=${gender}`);
              }}
              className="w-full mt-4 py-2.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold text-sm hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Lock size={14} />
              立即解锁
            </button>
          </div>
        </div>
      </div>

      {/* 核心卖点模块 */}
      <div className="px-4 py-6 max-w-md mx-auto space-y-3" style={{ background: 'linear-gradient(135deg, rgba(40,20,50,0.8), rgba(30,15,40,0.9))' }}>
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
            className={`rounded-2xl overflow-hidden border-2 ${mod.borderColor}`}
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
              {/* 立即解锁按钮 */}
              <button
                onClick={() => {
                  if (!name.trim()) {
                    toast.error('请先输入姓名');
                    return;
                  }
                  if (!birthData) {
                    toast.error('请先选择出生日期');
                    return;
                  }
                  setIsSubmitting(true);
                  // 创建订单后跳转到支付页面
                  createOrderMutation.mutate({
                    productKey: 'marriage',
                    customerName: name,
                    customerGender: gender,
                    calendarType: birthData.calendarType,
                    birthDate: `${birthData.year}-${String(birthData.month).padStart(2, '0')}-${String(birthData.day).padStart(2, '0')}`,
                    birthHour: birthData.hour,
                    paymentMethod: 'wechat',
                    lunarDateStr: birthData.displayStr,
                  });
                }}
                disabled={isSubmitting}
                className="w-full mt-3 py-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold text-sm hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2 border-2 border-dashed border-pink-300"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-1">
                    <Loader2 size={14} className="animate-spin" />
                    处理中...
                  </span>
                ) : (
                  <>
                    <Lock size={14} />
                    立即解锁
                  </>
                )}
              </button>
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
