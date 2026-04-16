import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, Loader2, Lock } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const orderId = parseInt(searchParams.get('order_id') || '0', 10);
  
  const [timeLeft, setTimeLeft] = useState(1203); // 20:03
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);

  // 获取订单详情
  const { data: order, isLoading: orderLoading } = trpc.orders.getById.useQuery(
    { orderId },
    { enabled: orderId > 0 }
  );

  // 模拟支付mutation
  const simulatePayMutation = trpc.orders.simulatePay.useMutation();

  // 倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePayment = async (method: 'wechat' | 'alipay') => {
    if (!orderId || !order) return;
    
    setPaymentMethod(method);
    setIsProcessing(true);

    // 模拟支付流程
    setTimeout(async () => {
      try {
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          await simulatePayMutation.mutateAsync({
            orderId,
            paymentMethod: method,
          });
          
          setPaymentStatus('success');
          setTimeout(() => {
            window.location.href = `/fortune/${order.productKey}?order_id=${orderId}`;
          }, 3000);
        } else {
          setPaymentStatus('failed');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Payment error:', error);
        setPaymentStatus('failed');
        setIsProcessing(false);
      }
    }, 2000);
  };

  const handleRetry = () => {
    setPaymentStatus(null);
    setPaymentMethod(null);
  };

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-yellow-300 animate-spin mx-auto mb-4" />
          <p className="text-yellow-100">加载订单信息...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertTriangle size={48} className="text-yellow-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-yellow-100 mb-2">订单不存在</h1>
          <p className="text-yellow-200 mb-4">无法找到您的订单信息，请重新开始</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-yellow-500 hover:bg-yellow-600 text-red-900 font-semibold py-2 px-6 rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-950 pb-32">
      {/* 顶部装饰 */}
      <div className="relative h-32 bg-gradient-to-b from-red-800 to-red-900 flex items-center justify-center overflow-hidden">
        {/* 装饰线条 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-1/4 text-4xl">✦</div>
          <div className="absolute top-8 right-1/4 text-3xl">✦</div>
          <div className="absolute bottom-4 left-1/3 text-2xl">✦</div>
          <div className="absolute bottom-6 right-1/3 text-2xl">✦</div>
        </div>
        
        {/* 标题 */}
        <div className="text-center z-10">
          <h1 className="text-4xl font-bold text-yellow-300 mb-2 drop-shadow-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
            姻缘测试
          </h1>
          <p className="text-yellow-200 text-sm">恋爱波折 | 爱情秘籍 | 婚姻分析</p>
        </div>
      </div>

      {/* 用户数据卡片 */}
      <div className="max-w-md mx-auto px-4 mt-6 mb-6">
        <div className="bg-yellow-50 rounded-lg p-4 text-center shadow-lg border-2 border-yellow-200">
          <p className="text-sm text-red-900 font-semibold mb-1">已为1576576人提供姻缘分析</p>
          <p className="text-lg font-bold text-red-700">97.8%的用户对分析结果非常满意！</p>
        </div>
      </div>

      {/* 你的姻缘分析报告 - 8个核心模块网格 */}
      <div className="max-w-md mx-auto px-4 mb-8">
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <h2 className="text-center text-lg font-bold text-red-900 mb-4">你的姻缘分析报告</h2>
          
          {/* 8个模块网格 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 模块1: 婚前性格 */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md border border-yellow-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">👰</div>
              <p className="text-xs font-bold text-red-900">婚前性格</p>
              <Lock size={16} className="text-yellow-600 mx-auto mt-2" />
            </div>

            {/* 模块2: 姻缘分析 */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md border border-yellow-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">💕</div>
              <p className="text-xs font-bold text-red-900">姻缘分析</p>
              <Lock size={16} className="text-yellow-600 mx-auto mt-2" />
            </div>

            {/* 模块3: 感情发展 */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md border border-yellow-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">📈</div>
              <p className="text-xs font-bold text-red-900">感情发展</p>
              <Lock size={16} className="text-yellow-600 mx-auto mt-2" />
            </div>

            {/* 模块4: 异性魅力 */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md border border-yellow-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-xs font-bold text-red-900">异性魅力</p>
              <Lock size={16} className="text-yellow-600 mx-auto mt-2" />
            </div>

            {/* 模块5: 婚姻建议 */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md border border-yellow-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">💍</div>
              <p className="text-xs font-bold text-red-900">婚姻建议</p>
              <Lock size={16} className="text-yellow-600 mx-auto mt-2" />
            </div>

            {/* 模块6: 缘分指数 */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md border border-yellow-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-xs font-bold text-red-900">缘分指数</p>
              <Lock size={16} className="text-yellow-600 mx-auto mt-2" />
            </div>

            {/* 模块7: 感情困境 */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md border border-yellow-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🔮</div>
              <p className="text-xs font-bold text-red-900">感情困境</p>
              <Lock size={16} className="text-yellow-600 mx-auto mt-2" />
            </div>

            {/* 模块8: 幸福指数 */}
            <div className="bg-white rounded-lg p-4 text-center shadow-md border border-yellow-200 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-xs font-bold text-red-900">幸福指数</p>
              <Lock size={16} className="text-yellow-600 mx-auto mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* 核心卖点模块 - 5个主要内容区 */}
      <div className="max-w-md mx-auto px-4 space-y-4 mb-8">
        {/* 模块1: 个人性格对感情的影响 */}
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <h3 className="text-center text-base font-bold text-red-900 mb-3">个人性格对感情的影响</h3>
          <div className="bg-white rounded-lg p-3 space-y-2 text-sm mb-3">
            <p className="text-gray-800">• 魅力分析</p>
            <p className="text-gray-800">• 婚姻经营</p>
            <p className="text-gray-800">• 感情困境分析</p>
          </div>
          <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-red-900 font-bold py-2 px-4 rounded-lg text-sm transition-all">
            🔓 立即解锁
          </button>
        </div>

        {/* 模块2: 婚姻成长方向 */}
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <h3 className="text-center text-base font-bold text-red-900 mb-3">婚姻成长方向</h3>
          <div className="bg-white rounded-lg p-3 space-y-2 text-sm mb-3">
            <p className="text-gray-800">• 姻缘情况</p>
            <p className="text-gray-800">• 择偶倾向</p>
            <p className="text-gray-800">• 婚配点评</p>
          </div>
          <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-red-900 font-bold py-2 px-4 rounded-lg text-sm transition-all">
            🔓 立即解锁
          </button>
        </div>

        {/* 模块3: 你的婚姻格局 */}
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <h3 className="text-center text-base font-bold text-red-900 mb-3">你的婚姻格局</h3>
          <div className="bg-white rounded-lg p-3 space-y-2 text-sm mb-3">
            <p className="text-gray-800">• 对象条件</p>
            <p className="text-gray-800">• 婚后生活</p>
            <p className="text-gray-800">• 相处技巧</p>
          </div>
          <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-red-900 font-bold py-2 px-4 rounded-lg text-sm transition-all">
            🔓 立即解锁
          </button>
        </div>

        {/* 模块4: 你最应了解的婚配要点 */}
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <h3 className="text-center text-base font-bold text-red-900 mb-3">你最应了解的婚配要点</h3>
          <div className="bg-white rounded-lg p-3 space-y-2 text-sm mb-3">
            <p className="text-gray-800">• 早婚晚婚</p>
            <p className="text-gray-800">• 亲密策略</p>
            <p className="text-gray-800">• 配对评估</p>
          </div>
          <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-red-900 font-bold py-2 px-4 rounded-lg text-sm transition-all">
            🔓 立即解锁
          </button>
        </div>

        {/* 模块5: 2026年爱情幸福秘箱 */}
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <h3 className="text-center text-base font-bold text-red-900 mb-3">2026年爱情幸福秘箱</h3>
          <div className="bg-white rounded-lg p-3 space-y-2 text-sm mb-3">
            <p className="text-gray-800">• 拍拖</p>
            <p className="text-gray-800">• 人缘</p>
            <p className="text-gray-800">• 甜蜜</p>
            <p className="text-gray-800">• 防变心</p>
          </div>
          <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-red-900 font-bold py-2 px-4 rounded-lg text-sm transition-all">
            🔓 立即解锁
          </button>
        </div>
      </div>

      {/* 价格和支付区域 */}
      <div className="max-w-md mx-auto px-4 mb-8">
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          {/* 价格信息 */}
          <div className="text-center mb-4">
            <div className="inline-block bg-red-600 text-yellow-100 px-4 py-2 rounded-lg mb-2">
              <p className="text-xs font-semibold">限时特惠：</p>
              <p className="text-2xl font-bold">¥{order.amount}</p>
            </div>
            <p className="text-sm text-gray-600 line-through">原价：¥{(parseFloat(order.amount) * 2.67).toFixed(1)}</p>
          </div>

          {/* 倒计时 */}
          <div className="bg-red-600 text-yellow-100 rounded-lg p-3 text-center mb-4">
            <p className="text-xs font-semibold mb-1">距优惠结束</p>
            <div className="text-2xl font-mono font-bold">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* 支付提示 */}
          <p className="text-center text-xs text-gray-700 mb-4 font-semibold">
            本测试为{order.amount}元付费测试，付费后直接查看答案
          </p>

          {/* 支付方式 */}
          {paymentStatus === null && (
            <div className="space-y-3">
              <button
                onClick={() => handlePayment('wechat')}
                disabled={isProcessing}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>微信支付</span>
              </button>
              
              <button
                onClick={() => handlePayment('alipay')}
                disabled={isProcessing}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>支付宝支付</span>
              </button>
            </div>
          )}

          {/* 处理中状态 */}
          {isProcessing && paymentStatus === null && (
            <div className="text-center py-4">
              <Loader2 size={32} className="text-red-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">正在处理支付...</p>
            </div>
          )}

          {/* 成功状态 */}
          {paymentStatus === 'success' && (
            <div className="text-center py-4">
              <CheckCircle2 size={40} className="text-green-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-green-700">支付成功！</p>
              <p className="text-xs text-green-600 mt-1">正在跳转到结果页面...</p>
            </div>
          )}

          {/* 失败状态 */}
          {paymentStatus === 'failed' && (
            <div className="text-center py-4">
              <AlertTriangle size={40} className="text-red-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-red-700 mb-3">支付失败</p>
              <button
                onClick={handleRetry}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                重新支付
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 核心卖点详细说明表格 */}
      <div className="max-w-md mx-auto px-4 mb-8">
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <p className="text-center text-sm font-bold text-red-900 mb-4">
            我已经将竞品的所有核心卖点完整集成到支付页面中：
          </p>
          
          <div className="bg-white rounded-lg overflow-hidden border border-yellow-300">
            {/* 表头 */}
            <div className="grid grid-cols-2 gap-0 bg-gray-200">
              <div className="p-3 font-bold text-sm text-gray-800 border-r border-yellow-300">模块</div>
              <div className="p-3 font-bold text-sm text-gray-800">内容</div>
            </div>
            
            {/* 表行 */}
            <div className="divide-y divide-yellow-300">
              <div className="grid grid-cols-2 gap-0">
                <div className="p-3 text-xs text-gray-800 border-r border-yellow-300 font-semibold">1. 你的姻缘分析报告</div>
                <div className="p-3 text-xs text-gray-700">8个分析维度（婚前性格、姻缘分析、感情发展等）</div>
              </div>
              <div className="grid grid-cols-2 gap-0">
                <div className="p-3 text-xs text-gray-800 border-r border-yellow-300 font-semibold">2. 个人性格对感情的影响</div>
                <div className="p-3 text-xs text-gray-700">魅力分析、婚姻经营、感情困境分析</div>
              </div>
              <div className="grid grid-cols-2 gap-0">
                <div className="p-3 text-xs text-gray-800 border-r border-yellow-300 font-semibold">3. 婚姻成长方向</div>
                <div className="p-3 text-xs text-gray-700">姻缘情况、择偶倾向、婚配点评</div>
              </div>
              <div className="grid grid-cols-2 gap-0">
                <div className="p-3 text-xs text-gray-800 border-r border-yellow-300 font-semibold">4. 婚姻格局</div>
                <div className="p-3 text-xs text-gray-700">对象条件、婚后生活、相处技巧</div>
              </div>
              <div className="grid grid-cols-2 gap-0">
                <div className="p-3 text-xs text-gray-800 border-r border-yellow-300 font-semibold">5. 婚配要点</div>
                <div className="p-3 text-xs text-gray-700">早婚晚婚、亲密策略、配对评估</div>
              </div>
              <div className="grid grid-cols-2 gap-0">
                <div className="p-3 text-xs text-gray-800 border-r border-yellow-300 font-semibold">6. 2026年爱情幸福秘箱</div>
                <div className="p-3 text-xs text-gray-700">拍拖、人缘、甜蜜、防变心</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 安全和信息说明 */}
      <div className="max-w-md mx-auto px-4 mb-8">
        <div className="bg-yellow-100 rounded-lg p-4 shadow-lg border-2 border-yellow-300">
          <div className="text-center space-y-2 text-xs text-gray-800">
            <p className="font-semibold">支付系统已经经过安全联盟认证请放心使用</p>
            <hr className="border-yellow-300" />
            <p className="font-semibold text-red-900">测试结果/算法来自于专业老师团队</p>
            <p className="text-gray-700">该测试为{order.amount}元起付费测试，测试结果将直接以网页形式呈现</p>
            <p className="text-gray-700">测试结果仅供参考及该测试为付费幸福指数测试</p>
          </div>
        </div>
      </div>

      {/* 底部客服 */}
      <div className="fixed bottom-0 left-0 right-0 bg-red-900 border-t-4 border-yellow-400 p-4 max-w-md mx-auto">
        <div className="text-center">
          <p className="text-xs text-yellow-200 mb-2 font-semibold">如需帮助点此</p>
          <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold py-2 px-4 rounded-lg text-sm transition-all">
            请联系专属售后客服
          </button>
        </div>
      </div>
    </div>
  );
}
