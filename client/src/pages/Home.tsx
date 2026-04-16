import React from 'react';
import { useLocation, Link } from 'wouter';
import { Heart, Star, Zap, Lock, ChevronRight, Shield, Users } from 'lucide-react';
import { PRODUCTS } from '@shared/products';

export default function Home() {
  const [, navigate] = useLocation();
  const [timeLeft, setTimeLeft] = React.useState(1203);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const handleUnlock = () => navigate('/payment?order_id=1');

  const coreModules = [
    {
      icon: '💫',
      title: '解析个人性格对感情的影响',
      items: ['分析你潜在吸引异性的个人魅力', '如何经营幸福稳定的婚姻生活？', '分析哪些因素对你的感情不利'],
    },
    {
      icon: '🌸',
      title: '探索婚姻成长方向',
      items: ['解析你的姻缘情况', '了解你的择偶倾向与感情特质', '专业点评适合你的婚配对象'],
    },
    {
      icon: '👑',
      title: '你的婚姻格局',
      items: ['婚姻对象的条件和特征', '婚后感情生活分析', '根据伴侣性格和谐相处的技巧'],
    },
    {
      icon: '🔑',
      title: '你最应了解的婚配要点',
      items: ['你适合早婚还是晚婚？', '守护婚姻长期亲密的策略', '老师专业点评适合你的婚配对象！'],
    },
    {
      icon: '🎁',
      title: '2026年爱情幸福秘箱',
      items: ['我要拍拖', '我要提升人缘', '我要爱情更加甜蜜', '防止爱人变心！'],
    },
  ];

  const lockedProducts = PRODUCTS.filter(p => p.isLocked);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 30%, #1a0a0a 100%)' }}>

      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #8b1a1a 0%, #c0392b 40%, #8b1a1a 100%)' }}>
        {/* 装饰纹理 */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #ffd700 1px, transparent 1px), radial-gradient(circle at 80% 50%, #ffd700 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        {/* 顶部金色光晕 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 opacity-30" style={{ background: 'radial-gradient(ellipse, #ffd700 0%, transparent 70%)' }} />

        <div className="relative z-10 px-5 pt-10 pb-12 text-center max-w-md mx-auto">
          {/* 金色装饰线 */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-400 opacity-60" />
            <span className="text-yellow-400 text-xs tracking-widest font-medium">姻 缘 测 试</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-400 opacity-60" />
          </div>

          <h1 className="text-5xl font-bold mb-2" style={{ color: '#ffd700', textShadow: '0 2px 20px rgba(255,215,0,0.4)' }}>
            姻缘测试
          </h1>
          <p className="text-red-200 text-sm tracking-widest mb-8">恋爱波折 · 爱情秘籍 · 婚姻分析</p>

          {/* 核心图标 */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full opacity-30 animate-pulse" style={{ background: 'radial-gradient(circle, #ffd700, transparent)' }} />
            <div className="relative w-28 h-28 rounded-full flex items-center justify-center border-2 border-yellow-400 border-opacity-50" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,100,100,0.15))' }}>
              <Heart size={52} className="text-yellow-400" fill="rgba(255,215,0,0.3)" />
            </div>
          </div>

          {/* 数据统计 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 border border-yellow-400 border-opacity-30" style={{ background: 'rgba(255,215,0,0.08)' }}>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users size={14} className="text-yellow-400" />
                <span className="text-yellow-400 text-xs font-medium">服务人数</span>
              </div>
              <p className="text-white font-bold text-lg">1,576,576</p>
            </div>
            <div className="rounded-xl p-3 border border-yellow-400 border-opacity-30" style={{ background: 'rgba(255,215,0,0.08)' }}>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Star size={14} className="text-yellow-400" fill="currentColor" />
                <span className="text-yellow-400 text-xs font-medium">用户满意度</span>
              </div>
              <p className="text-white font-bold text-lg">97.8%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 核心卖点模块 */}
      <div className="px-4 py-8 max-w-2xl mx-auto space-y-4">
        <div className="text-center mb-6">
          <p className="text-yellow-400 text-xs tracking-widest mb-1">付费后获取完整报告</p>
          <h2 className="text-white text-xl font-bold">你的姻缘分析报告包含</h2>
        </div>

        {coreModules.map((mod, idx) => (
          <div
            key={idx}
            className="rounded-2xl overflow-hidden border border-opacity-20 border-yellow-400"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,215,0,0.03))' }}
          >
            <div className="px-5 py-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{mod.icon}</span>
                <h3 className="text-yellow-300 font-bold text-base">{mod.title}</h3>
              </div>
              <div className="space-y-2 mb-4 pl-2">
                {mod.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-yellow-500 text-xs mt-1">▸</span>
                    <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUnlock}
                className="w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #c0392b, #e74c3c)', color: '#ffd700', boxShadow: '0 4px 15px rgba(192,57,43,0.4)' }}
              >
                🔓 立即解锁
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 价格区域 */}
      <div className="px-4 pb-8 max-w-2xl mx-auto">
        <div className="rounded-3xl overflow-hidden border border-yellow-400 border-opacity-30" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(192,57,43,0.08))' }}>
          <div className="px-6 py-8">
            {/* 价格展示 */}
            <div className="text-center mb-6">
              <div className="inline-flex items-baseline gap-2 mb-2">
                <span className="text-gray-400 text-sm line-through">¥79.9</span>
                <span className="text-yellow-400 text-xs font-medium px-2 py-0.5 rounded-full border border-yellow-400 border-opacity-50">限时特惠</span>
              </div>
              <div className="text-6xl font-black text-white mb-1">
                <span className="text-2xl text-yellow-400">¥</span>29.9
              </div>
              <p className="text-gray-400 text-sm">付费后直接查看完整分析报告</p>
            </div>

            {/* 倒计时 */}
            <div className="flex items-center justify-center gap-3 mb-6 p-3 rounded-xl" style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)' }}>
              <Zap size={16} className="text-red-400" />
              <span className="text-red-300 text-sm font-medium">距优惠结束</span>
              <span className="text-white font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
            </div>

            {/* 支付按钮 */}
            <div className="space-y-3">
              <button
                onClick={handleUnlock}
                className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-3"
                style={{ background: 'linear-gradient(135deg, #07c160, #06ad56)', boxShadow: '0 6px 20px rgba(7,193,96,0.4)' }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.5 13c1.933 0 3.5-1.567 3.5-3.5S10.433 6 8.5 6 5 7.567 5 9.5 6.567 13 8.5 13zm6-6h5v1h-5zm0 3h5v1h-5zm0 3h5v1h-5z"/></svg>
                微信支付
              </button>
              <button
                onClick={handleUnlock}
                className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-3"
                style={{ background: 'linear-gradient(135deg, #1677ff, #0958d9)', boxShadow: '0 6px 20px rgba(22,119,255,0.4)' }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                支付宝支付
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
      <div className="px-4 pb-8 max-w-2xl mx-auto">
        <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #4a1a8a, #7b2d8b)' }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="relative px-6 py-6 flex items-center justify-between">
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
              className="flex-shrink-0 bg-white text-purple-700 font-bold py-2 px-4 rounded-xl text-sm transition-all active:scale-95 shadow-lg"
            >
              查看 →
            </button>
          </div>
        </div>
      </div>

      {/* 其他待解锁功能 */}
      <div className="px-4 pb-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gray-700" />
          <h2 className="text-gray-400 text-sm font-medium whitespace-nowrap flex items-center gap-2">
            <Lock size={14} />
            更多功能（待解锁）
          </h2>
          <div className="h-px flex-1 bg-gray-700" />
        </div>
        <div className="space-y-2">
          {lockedProducts.map((product) => (
            <div
              key={product.key}
              className="rounded-xl p-4 flex items-center gap-3 border border-gray-800 opacity-60"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div className="text-2xl">{product.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-300 text-sm">{product.name}</h4>
                <p className="text-xs text-gray-600 truncate">{product.description}</p>
              </div>
              <span className="text-xs text-gray-600 flex items-center gap-1 flex-shrink-0">
                <Lock size={11} />
                待解锁
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 页脚 */}
      <div className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <button className="text-blue-400 hover:text-blue-300 text-sm underline">
            联系专属售后客服
          </button>
          <div className="flex justify-center gap-3">
            {['诚信网站', '可信网站', '360安全'].map(label => (
              <span key={label} className="text-xs text-gray-600 border border-gray-700 rounded px-2 py-1">{label}</span>
            ))}
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 text-xs">苏州费汀娜教育科技有限公司</p>
            <p className="text-gray-700 text-xs">苏ICP备2021048491号-4</p>
          </div>
        </div>
      </div>
    </div>
  );
}
