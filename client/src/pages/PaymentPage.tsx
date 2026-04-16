import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useSearch } from 'wouter';
import { ChevronLeft, Loader2, Shield, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import FloatingButtons from '@/components/FloatingButtons';

export default function PaymentPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const orderId = Number(params.get('order_id'));
  const orderNoParam = params.get('order_no') || '';

  const [payStep, setPayStep] = useState<'info' | 'qrcode' | 'polling' | 'success' | 'failed'>('info');
  const [codeUrl, setCodeUrl] = useState('');
  const [isCreatingPay, setIsCreatingPay] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer for urgency
  const [timeLeft, setTimeLeft] = useState(1800);
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Fetch order
  const { data: order, isLoading, error } = trpc.orders.getById.useQuery(
    { orderId },
    { enabled: !!orderId }
  );

  // Create WeChat payment mutation
  const createPayMutation = trpc.orders.createWechatPay.useMutation({
    onSuccess: (data) => {
      setIsCreatingPay(false);
      if (data.alreadyPaid) {
        setPayStep('success');
        setTimeout(() => navigate(`/result/${orderId}`), 2000);
        return;
      }
      if (data.codeUrl) {
        setCodeUrl(data.codeUrl);
        setPayStep('qrcode');
        // Start polling for payment status
        startPolling();
      } else {
        toast.error('获取支付二维码失败');
        setPayStep('failed');
      }
    },
    onError: (err) => {
      setIsCreatingPay(false);
      toast.error(err.message || '创建支付失败');
      setPayStep('failed');
    },
  });

  // Check payment status
  const checkStatusQuery = trpc.orders.checkPayStatus.useQuery(
    { orderId },
    { enabled: false }
  );

  const startPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const result = await checkStatusQuery.refetch();
        if (result.data?.paid) {
          stopPolling();
          setPayStep('success');
          toast.success('支付成功！');
          setTimeout(() => navigate(`/result/${orderId}`), 2000);
        }
      } catch (e) {
        // Ignore polling errors
      }
    }, 3000); // Poll every 3 seconds
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => stopPolling();
  }, []);

  const handlePay = () => {
    if (!orderId) return;
    setIsCreatingPay(true);
    setPayStep('info');
    createPayMutation.mutate({ orderId });
  };

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #8b2252 0%, #4a1028 100%)' }}>
        <div className="text-center text-white">
          <AlertTriangle size={48} className="mx-auto mb-4 text-pink-300" />
          <p className="text-lg mb-2">订单信息无效</p>
          <button onClick={() => navigate('/')} className="text-pink-200 underline text-sm">返回首页</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #8b2252 0%, #4a1028 100%)' }}>
        <Loader2 size={32} className="animate-spin text-white" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #8b2252 0%, #4a1028 100%)' }}>
        <div className="text-center text-white">
          <AlertTriangle size={48} className="mx-auto mb-4 text-pink-300" />
          <p className="text-lg mb-2">订单不存在</p>
          <button onClick={() => navigate('/')} className="text-pink-200 underline text-sm">返回首页</button>
        </div>
      </div>
    );
  }

  // If already paid, redirect to result
  if (order.status === 'paid') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #8b2252 0%, #4a1028 100%)' }}>
        <div className="text-center text-white space-y-4">
          <CheckCircle size={48} className="mx-auto text-green-400" />
          <p className="text-lg font-bold">该订单已支付</p>
          <button
            onClick={() => navigate(`/result/${orderId}`)}
            className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl"
          >
            查看测算结果
          </button>
        </div>
      </div>
    );
  }

  const customerName = order.customerName || '用户';
  const customerGender = order.customerGender || '';
  const lunarDateStr = order.lunarDateStr || '';

  return (
    <div className="min-h-screen pb-8" style={{ background: 'linear-gradient(180deg, #8b2252 0%, #6b1a3a 50%, #4a1028 100%)' }}>
      <FloatingButtons />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#8b2252] border-b border-pink-700/30 flex items-center px-4 py-3">
        <button onClick={() => { stopPolling(); navigate('/'); }} className="text-pink-200">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-base text-white">{order.productName}</h1>
        <div className="w-6" />
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* User info card */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-pink-200 text-sm mb-3">
            亲爱的{customerName}
          </p>
          <p className="text-white text-base">
            通过分析你的 <span className="text-yellow-300 font-bold">个人姻缘</span>，看你的姻缘状况
          </p>
        </div>

        {/* Info summary */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,200,150,0.15)', border: '1px solid rgba(255,200,150,0.2)' }}>
          <div className="space-y-2 text-sm">
            <div className="flex gap-4">
              <span className="text-pink-200">姓名：</span>
              <span className="text-white font-medium">{customerName}</span>
              <span className="text-pink-200 ml-4">性别：</span>
              <span className="text-white font-medium">{customerGender}</span>
            </div>
            {lunarDateStr && (
              <div className="flex gap-4">
                <span className="text-pink-200">农(阴)历：</span>
                <span className="text-white font-medium">{lunarDateStr}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price section */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">限时优惠</span>
              <span className="text-white text-2xl font-black">¥{order.amount}</span>
              <span className="text-white text-2xl font-black">元</span>
            </div>
            <div className="text-right">
              <p className="text-pink-300 text-xs">距优惠结束</p>
              <p className="text-red-400 font-mono font-bold text-lg">{formatCountdown(timeLeft)}</p>
            </div>
          </div>
          <p className="text-gray-400 text-xs line-through">原价：¥99.00元</p>
        </div>

        <div className="border-t border-pink-800/30" />

        {/* Trust text */}
        <p className="text-center text-pink-200 text-sm">
          报告生成后，只有您自己能查看，请放心领取！
        </p>

        {/* QR Code display */}
        {payStep === 'qrcode' && codeUrl && (
          <div className="text-center space-y-4">
            <div className="bg-white rounded-2xl p-6 mx-auto inline-block">
              <QRCodeSVG value={codeUrl} size={200} />
            </div>
            <p className="text-white font-bold text-base">请使用微信扫码支付</p>
            <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
              <Loader2 size={16} className="animate-spin" />
              <span>等待支付中...</span>
            </div>
            <button
              onClick={() => {
                stopPolling();
                setPayStep('info');
                setCodeUrl('');
              }}
              className="text-pink-300 text-xs underline"
            >
              取消支付
            </button>
          </div>
        )}

        {/* Pay button - show when no QR code yet */}
        {payStep === 'info' && !isCreatingPay && (
          <button
            onClick={handlePay}
            className="w-full py-4 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-3 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #07C160, #06ad56)', boxShadow: '0 6px 20px rgba(7,193,96,0.4)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
            </svg>
            点此微信支付
          </button>
        )}

        {/* Creating payment loading */}
        {isCreatingPay && (
          <div className="text-center py-6">
            <Loader2 size={48} className="text-green-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-bold text-lg">正在创建支付订单...</p>
          </div>
        )}

        {/* Success */}
        {payStep === 'success' && (
          <div className="text-center py-6">
            <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
            <p className="text-white font-bold text-xl">支付成功！</p>
            <p className="text-pink-200 text-sm mt-2">正在跳转到结果页面...</p>
          </div>
        )}

        {/* Failed */}
        {payStep === 'failed' && (
          <div className="text-center py-6">
            <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-white font-bold text-lg mb-2">支付创建失败</p>
            <p className="text-pink-300 text-sm mb-4">可能是微信支付配置问题，请联系客服</p>
            <button
              onClick={() => { setPayStep('info'); }}
              className="py-3 px-8 rounded-2xl font-bold text-white flex items-center justify-center gap-2 mx-auto"
              style={{ background: 'linear-gradient(135deg, #d4688e, #c0547a)' }}
            >
              <RefreshCw size={16} />
              重新支付
            </button>
          </div>
        )}

        {/* Order number */}
        <div className="text-center">
          <p className="text-gray-400 text-xs">
            订单号：{order.orderNo || orderNoParam}
            <button
              onClick={() => {
                navigator.clipboard.writeText(order.orderNo || orderNoParam);
                toast.success('订单号已复制');
              }}
              className="ml-2 text-blue-400 underline"
            >
              复制
            </button>
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 py-3">
          <div className="flex items-center gap-1 text-green-400 text-xs">
            <Shield size={14} />
            <span>安全联盟实名验证</span>
          </div>
          <div className="flex items-center gap-1 text-blue-400 text-xs">
            <Shield size={14} />
            <span>网上交易保障中心</span>
          </div>
        </div>

        <p className="text-center text-red-400 text-xs font-medium">
          支付系统已通过安全联盟认证请放心使用
        </p>

        {/* Bottom info */}
        <div className="border-t border-pink-800/30 pt-4 text-center space-y-1">
          <p className="text-gray-500 text-xs">结果内容仅供参考，请理性付费</p>
          <p className="text-gray-600 text-xs">联系电话：18888251399</p>
        </div>
      </div>
    </div>
  );
}
