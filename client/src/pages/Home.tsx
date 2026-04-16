import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Heart, Star, Zap, Lock, Shield, Users, Sparkles, Loader2 } from 'lucide-react';
import { PRODUCTS } from '@shared/products';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const HERO_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663494601131/cb6tJthVaUMYyF2mL5LVPm/marriage-hero-bg-9eGPiLxodHioWaYizX3qxd.webp';

export default function Home() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [timeLeft, setTimeLeft] = React.useState(72063); // ~20 hours
  const [isPayLoading, setIsPayLoading] = useState(false);

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

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      setIsPayLoading(false);
      if (data.isFree) {
        toast.success('已解锁！');
        navigate(`/fortune/marriage`);
      } else {
        navigate(`/payment?order_id=${data.orderId}`);
      }
    },
    onError: (err) => {
      setIsPayLoading(false);
      toast.error(err.message || '创建订单失败');
    },
  });

  const handlePay = (method: 'wechat' | 'alipay') => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setIsPayLoading(true);
    createOrderMutation.mutate({
      productKey: 'marriage',
      inputData: JSON.stringify({}),
      paymentMethod: method,
    });
  };

  const handleUnlock = () => {
    const el = document.getElementById('payment-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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

  const lockedProducts = PRODUCTS.filter(p => p.isLocked);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #2d0a1e 0%, #1a0612 50%, #120410 100%)' }}>

      {/* Hero Banner - 粉色古风 */}
      <div className="relative overflow-hidden">
        {/* 背景渐变 */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #8b2252 0%, #c0547a 30%, #d4688e 50%, #c0547a 70%, #6b1a3a 100%)' }} />
        {/* 装饰光点 */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 15% 25%, #ffd4e8 1px, transparent 1px), radial-gradient(circle at 85% 35%, #ffd4e8 1px, transparent 1px), radial-gradient(circle at 50% 15%, #fff 1px, transparent 1px)',
          backgroundSize: '80px 80px, 60px 60px, 100px 100px'
        }} />
        {/* 顶部光晕 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 opacity-30" style={{ background: 'radial-gradient(ellipse, #ffb6d5 0%, transparent 70%)' }} />

        <div className="relative z-10 px-5 pt-8 pb-6 text-center max-w-md mx-auto">
          {/* 标题 */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-pink-300 opacity-60" />
            <span className="text-pink-200 text-xs tracking-[0.3em] font-medium">姻 缘 测 试</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-pink-300 opacity-60" />
          </div>

          <h1 className="text-4xl font-black mb-1" style={{ color: '#fff', textShadow: '0 2px 20px rgba(255,182,213,0.5)' }}>
            姻缘测试
          </h1>
          <p className="text-pink-200 text-sm tracking-widest mb-5">恋爱波折 · 爱情秘籍 · 婚姻分析</p>

          {/* AI生成的插画 */}
          <div className="relative mx-auto mb-5" style={{ maxWidth: '280px' }}>
            <div className="absolute inset-0 rounded-2xl opacity-40" style={{ background: 'radial-gradient(circle, #ffb6d5, transparent)', filter: 'blur(20px)' }} />
            <img
              src={HERO_IMG}
              alt="姻缘测试"
              className="relative w-full rounded-2xl shadow-2xl"
              style={{ boxShadow: '0 10px 40px rgba(139,34,82,0.5)' }}
            />
          </div>

          {/* 数据统计 */}
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

      {/* 你的姻缘分析报告 - 8个锁定项目网格 */}
      <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,182,213,0.05))' }}>
          <div className="px-5 py-5">
            <h2 className="text-center text-white font-bold text-lg mb-4">你的姻缘分析报告</h2>
            <div className="grid grid-cols-4 gap-3">
              {['婚前性格', '姻缘分析', '感情发展', '异性缘分析', '爱情分析', '婚姻分析', '婚配要点', '幸福秘箱'].map((label, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center relative" style={{
                    background: i < 3 ? 'linear-gradient(135deg, #e8a0b8, #d4688e)' : 'linear-gradient(135deg, #f0c0d0, #e8a0b8)',
                    boxShadow: '0 3px 10px rgba(212,104,142,0.3)'
                  }}>
                    <span className="text-white text-xs font-bold text-center leading-tight">{label}</span>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-pink-900/80 flex items-center justify-center">
                      <Lock size={8} className="text-pink-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 核心卖点模块 */}
      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-pink-400" />
            <span className="text-pink-400 text-xs tracking-widest">付费后获取完整报告</span>
            <Sparkles size={14} className="text-pink-400" />
          </div>
          <h2 className="text-white text-lg font-bold">你的姻缘分析报告包含</h2>
        </div>

        {coreModules.map((mod, idx) => (
          <div
            key={idx}
            className={`rounded-2xl overflow-hidden border ${mod.borderColor}`}
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="px-5 py-4">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-xl">{mod.icon}</span>
                <h3 className={`${mod.titleColor} font-bold text-base`}>{mod.title}</h3>
              </div>
              <div className="space-y-2 mb-4 pl-1">
                {mod.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-pink-400 text-xs mt-1">·</span>
                    <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUnlock}
                className="w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #d4688e, #c0547a)', color: '#fff', boxShadow: '0 4px 15px rgba(212,104,142,0.4)' }}
              >
                🔓 立即解锁
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 价格区域 */}
      <div className="px-4 py-6 max-w-md mx-auto">
        <div id="payment-section" className="rounded-3xl overflow-hidden border border-pink-400/30" style={{ background: 'linear-gradient(135deg, rgba(212,104,142,0.15), rgba(139,34,82,0.1))' }}>
          <div className="px-6 py-6">
            {/* 价格展示 */}
            <div className="text-center mb-5">
              <div className="inline-flex items-baseline gap-2 mb-2">
                <span className="text-gray-400 text-sm line-through">¥99</span>
                <span className="text-pink-300 text-xs font-medium px-2 py-0.5 rounded-full border border-pink-400/50">限时特惠</span>
              </div>
              <div className="text-5xl font-black text-white mb-1">
                <span className="text-2xl text-pink-400">¥</span>29.9
              </div>
              <p className="text-gray-400 text-sm">本测试为29.9元付费测试，付费后直接查看答案</p>
            </div>

            {/* 倒计时 */}
            <div className="flex items-center justify-center gap-3 mb-5 p-3 rounded-xl" style={{ background: 'rgba(212,104,142,0.15)', border: '1px solid rgba(212,104,142,0.3)' }}>
              <Zap size={16} className="text-pink-400" />
              <span className="text-pink-300 text-sm font-medium">距优惠结束</span>
              <span className="text-white font-mono font-bold text-lg tracking-wider">{formatTime(timeLeft)}</span>
            </div>

            {/* 支付按钮 */}
            <div className="space-y-3">
              <button
                onClick={() => handlePay('wechat')}
                disabled={isPayLoading}
                className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #07c160, #06ad56)', boxShadow: '0 6px 20px rgba(7,193,96,0.4)' }}
              >
                {isPayLoading ? (
                  <><Loader2 size={20} className="animate-spin" /> 处理中...</>
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 8.056 4.229.884 0 1.754-.122 2.59-.368a.79.79 0 01.654.089l1.735 1.015a.297.297 0 00.152.05.267.267 0 00.265-.268c0-.066-.027-.13-.044-.194l-.355-1.352a.54.54 0 01.194-.607c1.67-1.23 2.696-3.048 2.696-5.04C24 8.708 21.133 5.91 16.938 8.858z"/>
                    </svg>
                    微信支付
                  </>
                )}
              </button>
              <button
                onClick={() => handlePay('alipay')}
                disabled={isPayLoading}
                className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1677ff, #0958d9)', boxShadow: '0 6px 20px rgba(22,119,255,0.4)' }}
              >
                {isPayLoading ? (
                  <><Loader2 size={20} className="animate-spin" /> 处理中...</>
                ) : (
                  <>支付宝支付</>
                )}
              </button>
            </div>

            {/* 安全说明 */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Shield size={14} className="text-gray-500" />
              <p className="text-gray-500 text-xs">支付系统已通过安全联盟认证，请放心使用</p>
            </div>
          </div>
        </div>
      </div>

      {/* 免费每日运势 */}
      <div className="px-4 pb-6 max-w-md mx-auto">
        <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #4a1a6a, #7b2d8b)' }}>
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="relative px-5 py-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star size={18} className="text-yellow-400" fill="currentColor" />
                <h3 className="text-white font-bold text-lg">每日运势</h3>
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">免费</span>
              </div>
              <p className="text-purple-200 text-sm">每日运势贴心提醒，开启美好一天</p>
            </div>
            <button
              onClick={() => navigate('/fortune/daily')}
              className="flex-shrink-0 bg-white text-purple-700 font-bold py-2.5 px-5 rounded-xl text-sm transition-all active:scale-95 shadow-lg"
            >
              查看 →
            </button>
          </div>
        </div>
      </div>

      {/* 其他待解锁功能 */}
      <div className="px-4 pb-6 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gray-700/50" />
          <h2 className="text-gray-500 text-xs font-medium whitespace-nowrap flex items-center gap-1.5">
            <Lock size={12} />
            更多功能（即将上线）
          </h2>
          <div className="h-px flex-1 bg-gray-700/50" />
        </div>
        <div className="space-y-2">
          {lockedProducts.map((product) => (
            <div
              key={product.key}
              className="rounded-xl p-3.5 flex items-center gap-3 border border-gray-800/50 opacity-50"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="text-xl">{product.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-400 text-sm">{product.name}</h4>
                <p className="text-xs text-gray-600 truncate">{product.description}</p>
              </div>
              <span className="text-xs text-gray-600 flex items-center gap-1 flex-shrink-0">
                <Lock size={10} />
                待解锁
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 页脚 */}
      <div className="border-t border-gray-800/50 py-8 px-4">
        <div className="max-w-md mx-auto text-center space-y-3">
          <p className="text-pink-400 text-xs">测试结果/算法来自于专业老师团队</p>
          <p className="text-gray-500 text-xs">该测试为29.9元起付费测试，测试结果将直接以网页形式呈现</p>
          <p className="text-gray-600 text-xs">测试结果仅供参考及该测试为付费幸福指数测试</p>
          <button
            onClick={() => navigate('/complaint')}
            className="text-blue-400 hover:text-blue-300 text-xs underline"
          >
            如需帮助点此 请联系专属售后客服
          </button>
          <div className="flex justify-center gap-3 pt-2">
            {['诚信网站', '可信网站', '安全联盟'].map(label => (
              <span key={label} className="text-xs text-gray-600 border border-gray-700/50 rounded px-2 py-1">{label}</span>
            ))}
          </div>
          <div className="space-y-1 pt-2">
            <p className="text-gray-600 text-xs">苏州费汀娜教育科技有限公司</p>
            <p className="text-gray-700 text-xs">苏ICP备2021048491号-4</p>
          </div>
        </div>
      </div>
    </div>
  );
}
