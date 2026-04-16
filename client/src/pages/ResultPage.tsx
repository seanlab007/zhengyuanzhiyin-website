import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { ChevronLeft, Copy, Loader2, MessageCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Streamdown } from 'streamdown';
import { PRODUCTS } from '@shared/products';
import FloatingButtons from '@/components/FloatingButtons';

// 企业微信客服链接
const WECHAT_CS_URL = 'https://work.weixin.qq.com/kfid/kfcb1d1953ee2c5a4e2';

export default function ResultPage() {
  const params = useParams<{ orderId: string }>();
  const [, navigate] = useLocation();
  const orderId = parseInt(params.orderId || '0');

  // Fetch order details
  const { data: order, isLoading: orderLoading } = trpc.orders.getById.useQuery(
    { orderId },
    { enabled: orderId > 0 }
  );

  // Generate fortune result
  const generateMutation = trpc.fortune.generate.useMutation();

  // Trigger generation when order is loaded and paid
  useEffect(() => {
    if (order && order.status === 'paid' && !order.resultData) {
      generateMutation.mutate({
        orderId,
        productKey: order.productKey,
      });
    }
  }, [order?.id, order?.status]);

  if (orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #2d0a1e 0%, #1a0612 100%)' }}>
        <Loader2 size={32} className="animate-spin text-white" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #2d0a1e 0%, #1a0612 100%)' }}>
        <div className="text-center text-white">
          <p className="text-lg mb-2">订单不存在</p>
          <button onClick={() => navigate('/')} className="text-pink-200 underline text-sm">返回首页</button>
        </div>
      </div>
    );
  }

  if (order.status !== 'paid') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #2d0a1e 0%, #1a0612 100%)' }}>
        <div className="text-center text-white space-y-4">
          <p className="text-lg">该订单尚未支付</p>
          <button
            onClick={() => navigate(`/payment?order_id=${orderId}&order_no=${order.orderNo}`)}
            className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl"
          >
            去支付
          </button>
        </div>
      </div>
    );
  }

  const resultData = generateMutation.data?.result || order.resultData || '';
  const isGenerating = generateMutation.isPending;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #2d0a1e 0%, #1a0612 50%, #120410 100%)' }}>
      <FloatingButtons />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#2d0a1e] border-b border-pink-900/30 flex items-center px-4 py-3">
        <button onClick={() => navigate('/')} className="text-pink-200">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-base text-white">订单报告</h1>
        <div className="w-6" />
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 清玄老师 header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">清玄老师</span>
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">在线解答</span>
          </div>
          <button
            onClick={() => window.open(WECHAT_CS_URL, '_blank')}
            className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
          >
            请教老师
          </button>
        </div>

        {/* 基本信息卡片 */}
        <div className="rounded-2xl p-5 border-2 border-green-400/30" style={{ background: 'rgba(255,255,255,0.95)' }}>
          <h3 className="text-center text-gray-800 font-bold text-base mb-4 border-b pb-3">您的基本信息</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex gap-4">
              <span className="text-gray-500 min-w-[50px]">姓名：</span>
              <span className="font-medium">{order.customerName || '用户'}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-500 min-w-[50px]">性别：</span>
              <span className="font-medium">{order.customerGender || '未知'}</span>
            </div>
            {order.lunarDateStr && (
              <div className="flex gap-4">
                <span className="text-gray-500 min-w-[50px]">生日：</span>
                <span className="font-medium">{order.lunarDateStr}</span>
              </div>
            )}
            <div className="flex gap-4 items-center">
              <span className="text-gray-500 min-w-[50px]">订单号：</span>
              <span className="font-mono text-xs text-blue-600">{order.orderNo}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(order.orderNo);
                  toast.success('已复制');
                }}
                className="ml-1 border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100"
              >
                复制
              </button>
            </div>
          </div>
        </div>

        {/* 点击咨询按钮 */}
        <button
          onClick={() => window.open(WECHAT_CS_URL, '_blank')}
          className="w-full py-3.5 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #07C160, #06ad56)', boxShadow: '0 4px 15px rgba(7,193,96,0.4)' }}
        >
          <MessageCircle size={20} />
          点击咨询
        </button>

        {/* 引导文字 */}
        <div className="text-center space-y-3">
          <p className="text-red-400 text-sm font-medium">
            点击上方"立即咨询按钮"添加微信"领取测算结果"
          </p>
          <p className="text-yellow-300 text-lg font-bold">"领取查看测算结果"</p>
          <div className="space-y-1">
            <p className="text-yellow-200 font-bold text-base">老师免费一对一解答</p>
            <p className="text-yellow-200 font-bold text-base">老师精准解答分析</p>
          </div>
        </div>

        {/* 第二个咨询按钮 */}
        <button
          onClick={() => window.open(WECHAT_CS_URL, '_blank')}
          className="w-full py-3.5 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #07C160, #06ad56)', boxShadow: '0 4px 15px rgba(7,193,96,0.4)' }}
        >
          <MessageCircle size={20} />
          立即咨询
        </button>

        {/* 测算结果（如果有的话） */}
        {isGenerating && (
          <div className="text-center py-8">
            <Loader2 size={32} className="animate-spin text-pink-400 mx-auto mb-3" />
            <p className="text-pink-200 text-sm">正在生成测算报告...</p>
          </div>
        )}

        {resultData && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.95)' }}>
            <h3 className="text-center text-gray-800 font-bold text-base mb-4 border-b pb-3">测算报告</h3>
            <div className="prose prose-sm max-w-none text-gray-700">
              <Streamdown>{resultData}</Streamdown>
            </div>
          </div>
        )}

        {/* 测算大全 - 更多功能 */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <span className="text-white text-lg">🔮</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-base">测算大全</h3>
              <p className="text-pink-300 text-xs">免费解读报告（99%用户选择）</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PRODUCTS.filter(p => p.key !== order.productKey).map(product => (
              <button
                key={product.key}
                onClick={() => navigate('/')}
                className="rounded-xl p-4 text-left transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="text-2xl mb-2">{product.icon}</div>
                <h4 className="text-white font-bold text-sm mb-1">{product.name}</h4>
                <p className="text-gray-400 text-xs line-clamp-2">{product.description}</p>
                <div className="mt-2">
                  <span className="text-red-400 text-xs font-bold">¥{product.price}</span>
                  <span className="text-gray-500 text-xs line-through ml-1">¥99</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 py-3 px-4 flex items-center gap-3" style={{ background: 'linear-gradient(90deg, #f5f0e8, #fff8f0)' }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔮</span>
            <span className="text-gray-700 text-xs font-bold">测算大全</span>
          </div>
          <button
            onClick={() => window.open(WECHAT_CS_URL, '_blank')}
            className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #ff4444, #cc3333)' }}
          >
            免费解读报告（99%用户选择）
          </button>
        </div>

        {/* Spacer for bottom bar */}
        <div className="h-16" />
      </div>
    </div>
  );
}
