import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Download, Share2, Home, MessageCircle } from 'lucide-react';
import { WechatQRButton } from '@/components/WechatQR';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || 'UNKNOWN';
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white pb-20">
      {/* 顶部成功横幅 */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-12 px-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
            <CheckCircle2 size={64} className="relative" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">支付成功！</h1>
        <p className="text-sm opacity-90">您的姻缘测算已激活</p>
      </div>

      {/* 主要内容 */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* 订单信息 */}
        <Card className="mb-6 bg-white border-0 shadow-lg">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-600 mb-1">订单号</p>
                <p className="text-sm font-mono font-semibold text-gray-800">{orderId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">支付金额</p>
                <p className="text-lg font-bold text-green-600">¥29.9</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">支付状态</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span className="text-sm font-semibold text-green-600">已支付</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 获得内容 */}
        <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-md">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">您已获得</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">完整的姻缘分析报告</p>
                  <p className="text-xs text-gray-600">包含感情运势、桃花运、婚配指数等</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">专业建议与指导</p>
                  <p className="text-xs text-gray-600">针对您的情感状况给出实用建议</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">永久保存权限</p>
                  <p className="text-xs text-gray-600">随时可查看，不会过期</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 后续步骤 */}
        <Card className="mb-6 bg-white border-0 shadow-md">
          <div className="p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-3">接下来</h3>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
                <span className="text-gray-700">点击下方"查看结果"按钮</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
                <span className="text-gray-700">系统将为您生成详细分析报告</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
                <span className="text-gray-700">您可以分享结果给朋友</span>
              </li>
            </ol>
          </div>
        </Card>

        {/* 行动按钮 */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            查看完整结果
          </button>
          
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: '姻缘测算结果',
                  text: '我刚完成了专业的姻缘测算，结果很准确！',
                  url: window.location.href
                });
              } else {
                alert('分享链接: ' + window.location.href);
              }
            }}
            className="w-full bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Share2 size={18} />
            分享给朋友
          </button>
        </div>

        {/* 自动跳转提示 */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600">
            {countdown > 0 ? (
              <>将在 <span className="font-bold text-gray-800">{countdown}</span> 秒后自动跳转</>
            ) : (
              <>正在跳转中...</>
            )}
          </p>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
        <p className="text-xs text-center text-gray-600">
          有任何问题？
          <button className="text-green-600 font-semibold hover:underline ml-1">
            联系客服
          </button>
        </p>
      </div>

      {/* 企业微信客服浮动按钮 */}
      <WechatQRButton />
    </div>
  );
}
