import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'wouter';
import { CheckCircle2, AlertTriangle, Loader2, Lock, Shield, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const orderId = parseInt(searchParams.get('order_id') || '0', 10);

  const [timeLeft, setTimeLeft] = useState(1203);
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
      setTimeLeft(prev => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const handlePayment = async (method: 'wechat' | 'alipay') => {
    if (!orderId || !order) return;
    setIsProcessing(true);

    try {
      await simulatePayMutation.mutateAsync({
        orderId,
        paymentMethod: method,
      });
      setPaymentStatus('success');
      setTimeout(() => {
        window.location.href = `/fortune/${order.productKey}?order_id=${orderId}`;
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setPaymentStatus(null);
    setIsProcessing(false);
  };

  // 加载中
  if (orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #2d0a1e 0%, #1a0612 100%)' }}>
        <div className="text-center">
          <Loader2 size={48} className="text-pink-400 animate-spin mx-auto mb-4" />
          <p className="text-pink-200">加载订单信息...</p>
        </div>
      </div>
    );
  }

  // 无效订单
  if (!orderId || (!orderLoading && !order)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #2d0a1e 0%, #1a0612 100%)' }}>
        <div className="text-center max-w-md px-4">
          <AlertTriangle size={48} className="text-pink-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">订单不存在</h1>
          <p className="text-pink-200 mb-4">无法找到您的订单信息，请重新开始</p>
          <button
            onClick={() => window.location.href = '/'}
            className="py-3 px-8 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #d4688e, #c0547a)' }}
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 已支付
  if (order && order.status === 'paid') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #2d0a1e 0%, #1a0612 100%)' }}>
        <div className="text-center max-w-md px-4">
          <CheckCircle2 size={64} className="text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">支付成功！</h1>
          <p className="text-pink-200 mb-6">您的订单已完成支付</p>
          <button
            onClick={() => window.location.href = `/fortune/${order.productKey}?order_id=${order.id}`}
            className="py-3 px-8 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #d4688e, #c0547a)' }}
          >
            查看测算结果
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8" style={{ background: 'linear-gradient(180deg, #2d0a1e 0%, #1a0612 50%, #120410 100%)' }}>
      {/* 顶部 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #8b2252 0%, #6b1a3a 100%)' }} />
        <div className="relative z-10 px-5 pt-8 pb-6 text-center max-w-md mx-auto">
          <button onClick={() => window.history.back()} className="absolute left-4 top-8 text-pink-200 text-sm">← 返回</button>
          <h1 className="text-2xl font-bold text-white mb-1">确认支付</h1>
          <p className="text-pink-200 text-sm">完成支付即可查看完整姻缘分析报告</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        {/* 订单信息卡片 */}
        <div className="rounded-2xl overflow-hidden border border-pink-400/30 mb-6" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-pink-300 text-sm">订单商品</span>
              <span className="text-white font-bold">{order?.productName || '姻缘测算'}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-pink-300 text-sm">订单编号</span>
              <span className="text-gray-400 text-sm">#{orderId}</span>
            </div>
            <div className="h-px bg-pink-400/20 my-3" />
            <div className="flex items-center justify-between">
              <span className="text-pink-300 text-sm">应付金额</span>
              <div className="text-right">
                <span className="text-3xl font-black text-white"><span className="text-lg text-pink-400">¥</span>{order?.amount || '29.9'}</span>
                <span className="text-gray-500 text-xs line-through ml-2">¥99</span>
              </div>
            </div>
          </div>
        </div>

        {/* 倒计时 */}
        <div className="flex items-center justify-center gap-3 mb-6 p-3 rounded-xl" style={{ background: 'rgba(212,104,142,0.15)', border: '1px solid rgba(212,104,142,0.3)' }}>
          <Zap size={16} className="text-pink-400" />
          <span className="text-pink-300 text-sm font-medium">优惠倒计时</span>
          <span className="text-white font-mono font-bold text-lg tracking-wider">{formatTime(timeLeft)}</span>
        </div>

        {/* 支付按钮区域 */}
        {paymentStatus === null && !isProcessing && (
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handlePayment('wechat')}
              className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg, #07c160, #06ad56)', boxShadow: '0 6px 20px rgba(7,193,96,0.4)' }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 8.056 4.229.884 0 1.754-.122 2.59-.368a.79.79 0 01.654.089l1.735 1.015a.297.297 0 00.152.05.267.267 0 00.265-.268c0-.066-.027-.13-.044-.194l-.355-1.352a.54.54 0 01.194-.607c1.67-1.23 2.696-3.048 2.696-5.04C24 8.708 21.133 5.91 16.938 8.858z"/>
              </svg>
              微信支付
            </button>
            <button
              onClick={() => handlePayment('alipay')}
              className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg, #1677ff, #0958d9)', boxShadow: '0 6px 20px rgba(22,119,255,0.4)' }}
            >
              支付宝支付
            </button>
          </div>
        )}

        {/* 处理中 */}
        {isProcessing && paymentStatus === null && (
          <div className="text-center py-8 mb-6">
            <Loader2 size={48} className="text-pink-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-bold text-lg">正在处理支付...</p>
            <p className="text-pink-200 text-sm mt-1">请稍候</p>
          </div>
        )}

        {/* 成功 */}
        {paymentStatus === 'success' && (
          <div className="text-center py-8 mb-6">
            <CheckCircle2 size={64} className="text-green-400 mx-auto mb-4" />
            <p className="text-white font-bold text-xl">支付成功！</p>
            <p className="text-pink-200 text-sm mt-2">正在跳转到结果页面...</p>
          </div>
        )}

        {/* 失败 */}
        {paymentStatus === 'failed' && (
          <div className="text-center py-8 mb-6">
            <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-white font-bold text-lg mb-2">支付失败</p>
            <p className="text-pink-200 text-sm mb-4">请重试或选择其他支付方式</p>
            <button
              onClick={handleRetry}
              className="py-3 px-8 rounded-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #d4688e, #c0547a)' }}
            >
              重新支付
            </button>
          </div>
        )}

        {/* 安全说明 */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield size={14} className="text-gray-500" />
          <p className="text-gray-500 text-xs">支付系统已通过安全联盟认证，请放心使用</p>
        </div>

        {/* 底部客服 */}
        <div className="text-center pt-4 border-t border-gray-800/50">
          <p className="text-gray-500 text-xs mb-2">如需帮助请联系客服</p>
          <button
            onClick={() => window.location.href = '/complaint'}
            className="text-blue-400 text-xs underline"
          >
            联系专属售后客服
          </button>
        </div>
      </div>
    </div>
  );
}
