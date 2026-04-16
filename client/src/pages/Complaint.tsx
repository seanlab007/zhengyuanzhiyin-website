import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const SERVICE_COMPLAINTS = [
  '付款没结果',
  '信息填写错误',
  '测试结果不满意',
  '重复购买/二次付款',
];

const RULE_COMPLAINTS = [
  '网页包含欺诈信息（如：假红包）',
  '网页包含政治敏感信息',
  '网页在收集个人隐私信息（如：钓鱼链接）',
  '网页包含诱导分享/关注性质的内容',
  '网页可能包含谣言信息',
  '网页存在虚假宣传',
];

export default function Complaint() {
  const [, navigate] = useLocation();
  const [selectedReason, setSelectedReason] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [detailText, setDetailText] = useState('');

  const handleSelect = (reason: string) => {
    setSelectedReason(reason);
    setShowDetail(true);
  };

  const handleSubmit = () => {
    toast.success('感谢您的反馈，我们会尽快处理！', { duration: 3000 });
    setTimeout(() => navigate('/'), 2000);
  };

  if (showDetail) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b flex items-center px-4 py-3">
          <button onClick={() => setShowDetail(false)} className="text-gray-600">
            <ChevronLeft size={24} />
          </button>
          <h1 className="flex-1 text-center font-bold text-base">投诉详情</h1>
          <div className="w-6" />
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">投诉原因</p>
            <p className="font-medium text-gray-800">{selectedReason}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">补充说明（选填）</p>
            <textarea
              value={detailText}
              onChange={e => setDetailText(e.target.value)}
              placeholder="请描述您遇到的问题..."
              className="w-full h-32 border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-green-500 text-white font-bold rounded-lg text-base"
          >
            提交投诉
          </button>

          <p className="text-center text-gray-400 text-xs">
            您的投诉将在1-3个工作日内处理
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b flex items-center px-4 py-3">
        <button onClick={() => navigate('/')} className="text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-bold text-base">投诉</h1>
        <div className="w-6" />
      </div>

      <div className="p-4">
        <p className="text-gray-600 text-sm mb-4">请选择投诉该网页的原因：</p>

        {/* 服务类 */}
        <p className="text-gray-800 font-bold text-sm mb-2">服务类：</p>
        <div className="space-y-0 mb-6">
          {SERVICE_COMPLAINTS.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSelect(item)}
              className="w-full flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700 text-sm">{item}</span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ))}
        </div>

        {/* 规范类 */}
        <p className="text-gray-800 font-bold text-sm mb-2">规范类：</p>
        <div className="space-y-0">
          {RULE_COMPLAINTS.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSelect(item)}
              className="w-full flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700 text-sm">{item}</span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
