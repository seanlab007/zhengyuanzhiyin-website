import React from 'react';
import { useLocation } from 'wouter';

// 企业微信客服链接 - 替换为实际链接
const WECHAT_CS_URL = 'https://work.weixin.qq.com/kfid/kfcb1d1953ee2c5a4e2';

export default function FloatingButtons() {
  const [, navigate] = useLocation();

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-0">
      {/* 投诉按钮 */}
      <button
        onClick={() => navigate('/complaint')}
        className="flex flex-col items-center justify-center px-1.5 py-3 text-white text-xs font-medium rounded-l-lg shadow-lg"
        style={{ background: 'rgba(100,100,100,0.85)', writingMode: 'vertical-rl', letterSpacing: '2px' }}
      >
        <span className="mb-1">⚠️</span>
        投诉
      </button>

      {/* 在线客服按钮 */}
      <button
        onClick={() => window.open(WECHAT_CS_URL, '_blank')}
        className="flex flex-col items-center justify-center px-1.5 py-3 text-white text-xs font-medium rounded-l-lg shadow-lg mt-1"
        style={{ background: 'rgba(7,193,96,0.9)', writingMode: 'vertical-rl', letterSpacing: '2px' }}
      >
        <span className="mb-1">💬</span>
        在线客服
      </button>
    </div>
  );
}
