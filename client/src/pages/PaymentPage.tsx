import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
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
        // 模拟支付成功（90%概率）或失败（10%概率）
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          // 调用后端API确认支付
          await simulatePayMutation.mutateAsync({
            orderId,
            paymentMethod: method,
          });
          
          setPaymentStatus('success');
          // 3秒后跳转到结果页面
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
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载订单信息...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">订单不存在</h1>
          <p className="text-gray-600 mb-4">无法找到您的订单信息，请重新开始</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white pb-20">
      {/* 顶部横幅 */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">{order.productName}</h1>
        <p className="text-sm opacity-90">已为 1,576,576 人提供专业分析</p>
        <p className="text-xs opacity-80 mt-1">97.8% 的用户对分析结果非常满意</p>
      </div>

      {/* 主要内容 */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* 用户评价卡片 */}
        <Card className="mb-6 bg-white border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 border-b border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⭐</span>
              <span className="font-semibold text-gray-800">用户好评</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              "测算结果非常准确，对我的生活有很大帮助！"
            </p>
            <p className="text-xs text-gray-600 mt-2">— 用户好评</p>
          </div>
        </Card>

        {/* 价格卡片 */}
        <Card className="mb-6 bg-white border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">限时特惠价</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-rose-500">¥{order.amount}</span>
                <span className="text-lg text-gray-400 line-through">¥{(parseFloat(order.amount) * 2.67).toFixed(1)}</span>
              </div>
              <p className="text-xs text-rose-500 font-semibold mt-2">
                节省 ¥{(parseFloat(order.amount) * 1.67).toFixed(1)}
              </p>
            </div>

            {/* 倒计时 */}
            <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock size={16} className="text-purple-500" />
                <span className="text-xs text-gray-600">优惠倒计时</span>
              </div>
              <div className="text-2xl font-mono font-bold text-rose-500">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </Card>

        {/* 功能说明 */}
        <Card className="mb-6 bg-white border-0 shadow-md">
          <div className="p-4 space-y-3">
            <div className="flex gap-3">
              <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-800">即时获取结果</p>
                <p className="text-xs text-gray-600">付费后立即查看完整分析报告</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-800">专业团队分析</p>
                <p className="text-xs text-gray-600">由资深命理师团队精心打造</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-800">永久保存</p>
                <p className="text-xs text-gray-600">结果永久保存，随时可查看</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 支付方式 */}
        {paymentStatus === null && (
          <>
            <p className="text-center text-sm text-gray-600 mb-4 font-semibold">选择支付方式</p>
            
            <div className="space-y-3 mb-6">
              {/* 微信支付 */}
              <button
                onClick={() => handlePayment('wechat')}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                </svg>
                <span>微信支付</span>
              </button>

              {/* 支付宝支付 */}
              <button
                onClick={() => handlePayment('alipay')}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
                </svg>
                <span>支付宝支付</span>
              </button>
            </div>
          </>
        )}

        {/* 处理中状态 */}
        {isProcessing && paymentStatus === null && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center mb-6">
            <div className="inline-block">
              <Loader2 size={32} className="text-blue-500 animate-spin mb-3" />
            </div>
            <p className="text-sm font-semibold text-gray-800">正在处理支付...</p>
            <p className="text-xs text-gray-600 mt-1">请稍候，不要关闭页面</p>
          </div>
        )}

        {/* 成功状态 */}
        {paymentStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-6">
            <div className="mb-3">
              <CheckCircle2 size={48} className="text-green-500 mx-auto" />
            </div>
            <p className="text-lg font-bold text-green-700 mb-1">支付成功！</p>
            <p className="text-sm text-green-600 mb-4">正在跳转到结果页面...</p>
            <div className="text-xs text-green-600">
              <p>订单号：{orderId}</p>
            </div>
          </div>
        )}

        {/* 失败状态 */}
        {paymentStatus === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex gap-3 mb-4">
              <AlertTriangle size={24} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-700">支付失败</p>
                <p className="text-sm text-red-600 mt-1">支付过程中出现错误，请重试</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              重新支付
            </button>
          </div>
        )}

        {/* 安全提示 */}
        <Card className="bg-blue-50 border border-blue-200 shadow-none">
          <div className="p-4">
            <div className="flex gap-2 mb-2">
              <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-blue-800">安全保障</p>
            </div>
            <p className="text-xs text-blue-700 leading-relaxed">
              支付系统已通过安全联盟认证，您的信息完全保密。支付过程由微信/支付宝官方处理，我们不会保存您的支付信息。
            </p>
          </div>
        </Card>
      </div>

      {/* 底部客服 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
        <p className="text-xs text-center text-gray-600">
          遇到问题？
          <button className="text-rose-500 font-semibold hover:underline ml-1">
            联系客服
          </button>
        </p>
      </div>
    </div>
  );
}
