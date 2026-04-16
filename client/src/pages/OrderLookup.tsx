import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Search, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function OrderLookup() {
  const [, navigate] = useLocation();
  const [orderNo, setOrderNo] = useState('');
  const [searching, setSearching] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const lookupQuery = trpc.orders.lookupByOrderNo.useQuery(
    { orderNo: orderNo.trim() },
    { enabled: false }
  );

  const handleSearch = async () => {
    if (!orderNo.trim()) {
      toast.error('请输入订单号');
      return;
    }
    setSearching(true);
    setNotFound(false);
    setOrderResult(null);

    try {
      const result = await lookupQuery.refetch();
      if (result.data) {
        setOrderResult(result.data);
      } else {
        setNotFound(true);
      }
    } catch (err: any) {
      if (err?.data?.code === 'NOT_FOUND') {
        setNotFound(true);
      } else {
        toast.error('查询失败，请重试');
      }
    } finally {
      setSearching(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return '已支付';
      case 'pending': return '待支付';
      case 'failed': return '支付失败';
      case 'refunded': return '已退款';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #2d0a1e 0%, #1a0612 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#2d0a1e] border-b border-pink-900/30 flex items-center px-4 py-3">
        <button onClick={() => navigate('/')} className="text-pink-200">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-base text-white">查询我的订单</h1>
        <div className="w-6" />
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* Search box */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="请输入订单号"
            value={orderNo}
            onChange={e => setOrderNo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-white/10 border border-pink-800/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 text-sm outline-none focus:border-pink-400 transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-5 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-xl font-medium text-sm flex items-center gap-1 disabled:opacity-60"
          >
            {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            查询
          </button>
        </div>

        {/* Not found */}
        {notFound && (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400 text-sm">未找到该订单</p>
            <p className="text-gray-500 text-xs mt-1">请检查订单号是否正确</p>
          </div>
        )}

        {/* Order result */}
        {orderResult && (
          <div className="bg-white/5 border border-pink-800/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold">{orderResult.productName}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderResult.status)}`}>
                {getStatusText(orderResult.status)}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">订单号</span>
                <span className="text-gray-200 font-mono text-xs">{orderResult.orderNo}</span>
              </div>
              {orderResult.customerName && (
                <div className="flex justify-between">
                  <span className="text-gray-400">姓名</span>
                  <span className="text-gray-200">{orderResult.customerName}</span>
                </div>
              )}
              {orderResult.customerGender && (
                <div className="flex justify-between">
                  <span className="text-gray-400">性别</span>
                  <span className="text-gray-200">{orderResult.customerGender}</span>
                </div>
              )}
              {orderResult.lunarDateStr && (
                <div className="flex justify-between">
                  <span className="text-gray-400">出生日期</span>
                  <span className="text-gray-200">{orderResult.lunarDateStr}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">金额</span>
                <span className="text-red-400 font-bold">¥{orderResult.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">创建时间</span>
                <span className="text-gray-200 text-xs">{new Date(orderResult.createdAt).toLocaleString('zh-CN')}</span>
              </div>
            </div>

            {/* Actions */}
            {orderResult.status === 'pending' && (
              <button
                onClick={() => navigate(`/payment?order_id=${orderResult.id}&order_no=${orderResult.orderNo}`)}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl text-sm"
              >
                继续支付
              </button>
            )}

            {orderResult.status === 'paid' && (
              <button
                onClick={() => navigate(`/result/${orderResult.id}`)}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-xl text-sm"
              >
                查看测算结果
              </button>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">订单号在支付页面和支付成功后均可获取</p>
          <p className="text-gray-500 text-xs mt-1">如有问题请联系在线客服</p>
        </div>
      </div>
    </div>
  );
}
