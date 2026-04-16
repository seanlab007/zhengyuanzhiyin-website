import React from 'react';
import { useLocation } from 'wouter';
import { Heart, Star, Zap } from 'lucide-react';

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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleUnlock = () => {
    navigate('/payment?order_id=1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-900">
      {/* 顶部装饰和标题 */}
      <div className="relative pt-8 pb-12 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-300 mb-2">姻缘测试</h1>
          <p className="text-yellow-100 text-sm">恋爱波折 | 爱情秘籍 | 婚姻分析</p>
        </div>

        <div className="relative max-w-md mx-auto mb-8">
          <div className="bg-gradient-to-b from-orange-200 to-pink-200 rounded-full w-32 h-40 mx-auto flex items-center justify-center shadow-lg">
            <div className="text-center">
              <Heart size={48} className="text-red-600 mx-auto mb-2" />
              <p className="text-red-900 font-bold text-sm">姻缘测试</p>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 mb-8 border border-yellow-200">
          <p className="text-center text-yellow-100 text-sm mb-2">已为1576576人提供姻缘分析</p>
          <p className="text-center text-yellow-300 font-bold text-lg">97.8%的用户对分析结果非常满意！</p>
        </div>
      </div>

      {/* 核心卖点模块 - 5个主要内容区 */}
      <div className="max-w-md mx-auto px-4 space-y-4 mb-8">
        {/* 模块1: 个人性格对感情的影响 */}
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <h3 className="text-center text-base font-bold text-red-900 mb-3">解析个人性格对感情的影响</h3>
          <div className="bg-white rounded-lg p-3 space-y-2 text-sm mb-3">
            <p className="text-gray-800">• 分析你潜在吸引异性的个人魅力</p>
            <p className="text-gray-800">• 如何经营幸福稳定的婚姻生活？</p>
            <p className="text-gray-800">• 分析哪些因素对你的感情不利</p>
          </div>
          <button
            onClick={handleUnlock}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-red-900 font-bold py-2 px-4 rounded-lg text-sm transition-all"
          >
            🔓 立即解锁
          </button>
        </div>

        {/* 模块2: 婚姻成长方向 */}
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <h3 className="text-center text-base font-bold text-red-900 mb-3">探索婚姻成长方向</h3>
          <div className="bg-white rounded-lg p-3 space-y-2 text-sm mb-3">
            <p className="text-gray-800">• 解析你的姻缘情况</p>
            <p className="text-gray-800">• 了解你的择偶倾向与感情特质</p>
            <p className="text-gray-800">• 专业点评适合你的婚配对象</p>
          </div>
          <button
            onClick={handleUnlock}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-red-900 font-bold py-2 px-4 rounded-lg text-sm transition-all"
          >
            🔓 立即解锁
          </button>
        </div>

        {/* 模块3: 你的婚姻格局 */}
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <h3 className="text-center text-base font-bold text-red-900 mb-3">你的婚姻格局</h3>
          <div className="bg-white rounded-lg p-3 space-y-2 text-sm mb-3">
            <p className="text-gray-800">• 婚姻对象的条件和特征</p>
            <p className="text-gray-800">• 婚后感情生活分析</p>
            <p className="text-gray-800">• 根据伴侣性格和谐相处的技巧</p>
          </div>
          <button
            onClick={handleUnlock}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-red-900 font-bold py-2 px-4 rounded-lg text-sm transition-all"
          >
            🔓 立即解锁
          </button>
        </div>

        {/* 模块4: 你最应了解的婚配要点 */}
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <h3 className="text-center text-base font-bold text-red-900 mb-3">你最应了解的婚配要点</h3>
          <div className="bg-white rounded-lg p-3 space-y-2 text-sm mb-3">
            <p className="text-gray-800">• 你适合早婚还是晚婚？</p>
            <p className="text-gray-800">• 守护婚姻长期亲密的策略</p>
            <p className="text-gray-800">• 老师专业点评适合你的婚配对象！</p>
          </div>
          <button
            onClick={handleUnlock}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-red-900 font-bold py-2 px-4 rounded-lg text-sm transition-all"
          >
            🔓 立即解锁
          </button>
        </div>

        {/* 模块5: 2026年爱情幸福秘箱 */}
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <h3 className="text-center text-base font-bold text-red-900 mb-3">2026年爱情幸福秘箱</h3>
          <div className="bg-white rounded-lg p-3 space-y-2 text-sm mb-3">
            <p className="text-gray-800">• 我要拍拖</p>
            <p className="text-gray-800">• 我要提升人缘</p>
            <p className="text-gray-800">• 我要爱情更加甜蜜</p>
            <p className="text-gray-800">• 防止爱人变心！</p>
          </div>
          <button
            onClick={handleUnlock}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-red-900 font-bold py-2 px-4 rounded-lg text-sm transition-all"
          >
            🔓 立即解锁
          </button>
        </div>
      </div>

      {/* 价格和支付区域 */}
      <div className="max-w-md mx-auto px-4 mb-8">
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <div className="text-center mb-4">
            <div className="inline-block bg-red-600 text-yellow-100 px-4 py-2 rounded-lg mb-2">
              <p className="text-xs font-semibold">限时特惠：</p>
              <p className="text-2xl font-bold">¥29.9</p>
            </div>
            <p className="text-sm text-gray-600 line-through">原价：¥79.9</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Zap size={16} className="text-red-600" />
              <p className="text-sm font-bold text-red-600">距优惠结束 {formatTime(timeLeft)}</p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-700 mb-4 font-semibold">
            本测试为29.9元付费测试，付费后直接查看答案
          </p>

          <button
            onClick={handleUnlock}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg text-base transition-all flex items-center justify-center gap-2"
          >
            ✓ 微信支付
          </button>

          <button
            onClick={handleUnlock}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg text-base transition-all mt-2 flex items-center justify-center gap-2"
          >
            ✓ 支付宝支付
          </button>
        </div>
      </div>

      {/* 免费功能 - 每日运势 */}
      <div className="max-w-md mx-auto px-4 mb-8">
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg p-4 shadow-lg border-2 border-purple-300">
          <div className="text-center mb-4">
            <Star size={32} className="text-white mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white mb-2">每日运势 - 免费</h3>
            <p className="text-sm text-white mb-4">每日运势贴心提醒，开启美好一天</p>
          </div>
          <button
            onClick={() => navigate('/fortune/daily')}
            className="w-full bg-white text-purple-600 font-bold py-2 px-4 rounded-lg text-sm transition-all hover:bg-gray-100"
          >
            ✨ 查看今日运势
          </button>
        </div>
      </div>

      {/* 安全和信息说明 */}
      <div className="max-w-md mx-auto px-4 mb-8">
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <div className="text-center space-y-2 text-xs text-gray-800">
            <p className="font-semibold">支付系统已经经过安全联盟认证请放心使用</p>
            <hr className="border-yellow-300" />
            <p className="font-semibold text-red-900">测试结果/算法来自于专业老师团队</p>
            <p className="text-gray-700">该测试为29.9元起付费测试，测试结果将直接以网页形式呈现</p>
            <p className="text-gray-700">测试结果仅供参考及该测试为付费幸福指数测试</p>
          </div>
        </div>
      </div>

      {/* 页脚 - 客服入口 */}
      <div className="max-w-md mx-auto px-4 pb-8 text-center">
        <p className="text-yellow-100 text-xs mb-2">如需帮助点此</p>
        <button className="text-yellow-300 hover:text-yellow-200 font-semibold text-sm underline">
          请联系专属售后客服
        </button>
        <div className="mt-4 flex justify-center gap-4">
          <div className="bg-white bg-opacity-20 rounded px-2 py-1">
            <p className="text-yellow-100 text-xs font-bold">诚信网站</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded px-2 py-1">
            <p className="text-yellow-100 text-xs font-bold">可信网站</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded px-2 py-1">
            <p className="text-yellow-100 text-xs font-bold">360</p>
          </div>
        </div>
      </div>
    </div>
  );
}
