import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Users, Shield, Zap, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import LunarDatePicker from '@/components/LunarDatePicker';
import FloatingButtons from '@/components/FloatingButtons';

const HERO_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663494601131/cb6tJthVaUMYyF2mL5LVPm/marriage-hero-bg-9eGPiLxodHioWaYizX3qxd.webp';

export default function Home() {
  const [, navigate] = useLocation();

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
      toast.error(err.message || '提交失败，请重试');
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('请输入您的姓名');
      return;
    }
    if (!birthData) {
      toast.error('请选择出生日期');
      return;
    }
    if (!agreePrivacy) {
      toast.error('请先同意用户隐私协议');
      return;
    }

    setIsSubmitting(true);

    const birthDateStr = birthData.calendarType === 'solar'
      ? `${birthData.year}-${String(birthData.month).padStart(2, '0')}-${String(birthData.day).padStart(2, '0')}`
      : `${birthData.year}-${birthData.month}-${birthData.day}`;

    createOrderMutation.mutate({
      productKey: 'marriage',
      customerName: name.trim(),
      customerGender: gender,
      calendarType: birthData.calendarType,
      birthDate: birthDateStr,
      birthHour: birthData.hour,
      lunarDateStr: birthData.displayStr,
      paymentMethod: 'wechat',
    });
  };

  const handleDateConfirm = (data: {
    calendarType: 'solar' | 'lunar';
    year: number;
    month: number;
    day: number;
    hour: string;
    displayStr: string;
  }) => {
    setBirthData(data);
    setBirthDisplay(data.displayStr);
    setShowDatePicker(false);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #2d0a1e 0%, #1a0612 50%, #120410 100%)' }}>
      {/* Floating buttons */}
      <FloatingButtons />

      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #8b2252 0%, #c0547a 30%, #d4688e 50%, #c0547a 70%, #6b1a3a 100%)' }} />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 15% 25%, #ffd4e8 1px, transparent 1px), radial-gradient(circle at 85% 35%, #ffd4e8 1px, transparent 1px), radial-gradient(circle at 50% 15%, #fff 1px, transparent 1px)',
          backgroundSize: '80px 80px, 60px 60px, 100px 100px'
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 opacity-30" style={{ background: 'radial-gradient(ellipse, #ffb6d5 0%, transparent 70%)' }} />

        <div className="relative z-10 px-5 pt-8 pb-6 text-center max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-pink-300 opacity-60" />
            <span className="text-pink-200 text-xs tracking-[0.3em] font-medium">姻 缘 测 试</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-pink-300 opacity-60" />
          </div>

          <h1 className="text-4xl font-black mb-1" style={{ color: '#fff', textShadow: '0 2px 20px rgba(255,182,213,0.5)' }}>
            姻缘测试
          </h1>
          <p className="text-pink-200 text-sm tracking-widest mb-5">恋爱波折 · 爱情秘籍 · 婚姻分析</p>

          <div className="relative mx-auto mb-5" style={{ maxWidth: '280px' }}>
            <div className="absolute inset-0 rounded-2xl opacity-40" style={{ background: 'radial-gradient(circle, #ffb6d5, transparent)', filter: 'blur(20px)' }} />
            <img
              src={HERO_IMG}
              alt="姻缘测试"
              className="relative w-full rounded-2xl shadow-2xl"
              style={{ boxShadow: '0 10px 40px rgba(139,34,82,0.5)' }}
            />
          </div>

          <div className="flex items-center justify-center gap-4 px-4 py-3 rounded-2xl mx-auto" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', maxWidth: '340px' }}>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-pink-200" />
              <span className="text-pink-100 text-xs">已为</span>
              <span className="text-white font-bold text-sm">1,576,576</span>
              <span className="text-pink-100 text-xs">人提供姻缘分析</span>
            </div>
          </div>
          <p className="text-pink-200 text-xs mt-2 opacity-80">97.8%的用户对分析结果非常满意！</p>
        </div>
      </div>

      {/* 提示条 */}
      <div className="max-w-md mx-auto px-4 py-2">
        <p className="text-center text-gray-400 text-xs">
          想作为生活、工作之指导。平台产品拒绝向未成年人提供服务，如未成年人请自行离开。
        </p>
      </div>

      {/* 信息输入表单 */}
      <div ref={formRef} className="px-4 py-4 max-w-md mx-auto">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #fef9f0, #fdf3e7)', border: '2px solid #e8c99b' }}>
          <div className="px-5 py-6 space-y-5">
            {/* 姓名 */}
            <div className="flex items-center gap-3">
              <label className="text-red-700 font-bold text-sm whitespace-nowrap min-w-[70px]">您的姓名：</label>
              <input
                type="text"
                placeholder="请输入姓名（汉字）"
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 bg-transparent border-b border-gray-300 py-2 text-gray-700 text-sm placeholder:text-gray-400 outline-none focus:border-red-400 transition-colors"
              />
            </div>

            {/* 性别 */}
            <div className="flex items-center gap-3">
              <label className="text-red-700 font-bold text-sm whitespace-nowrap min-w-[70px]">您的性别：</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setGender('男')}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                    gender === '男'
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  男
                </button>
                <button
                  onClick={() => setGender('女')}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
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
            <div className="flex items-center gap-3">
              <label className="text-red-700 font-bold text-sm whitespace-nowrap min-w-[70px]">出生日期：</label>
              <button
                onClick={() => setShowDatePicker(true)}
                className="flex-1 bg-transparent border-b border-gray-300 py-2 text-left text-sm outline-none"
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

      {/* 提示文字 */}
      <div className="max-w-md mx-auto px-4 mb-3">
        <p className="text-center text-gray-400 text-xs">
          用户您好，订单/产品问题可通过点击页面内[客服]，浮窗处理
        </p>
      </div>

      {/* 立即测算按钮 */}
      <div className="px-4 max-w-md mx-auto mb-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #e8a050, #d4883c)', boxShadow: '0 6px 20px rgba(228,160,80,0.4)' }}
        >
          {isSubmitting ? (
            <><Loader2 size={20} className="animate-spin" /> 提交中...</>
          ) : (
            '立即测算'
          )}
        </button>
      </div>

      {/* 隐私协议 */}
      <div className="max-w-md mx-auto px-4 mb-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setAgreePrivacy(!agreePrivacy)}
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
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

      {/* 查询我的订单 */}
      <div className="max-w-md mx-auto px-4 mb-4 text-center">
        <button
          onClick={() => navigate('/orders')}
          className="text-blue-400 text-sm underline"
        >
          查询我的订单 &gt;
        </button>
      </div>

      {/* 底部信息 */}
      <div className="border-t border-gray-800/50 py-6 px-4">
        <div className="max-w-md mx-auto text-center space-y-2">
          <p className="text-gray-500 text-xs">需付费后方可查看结果，结果纯属娱乐仅供参考</p>
          <p className="text-gray-500 text-xs">匠心打造精品在线测算</p>
          <p className="text-gray-600 text-xs">联系电话：18888251399</p>
          <p className="text-gray-600 text-xs">苏州费汀娜教育科技有限公司</p>
          <p className="text-gray-700 text-xs">苏ICP备2021048491号-4</p>
        </div>
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
