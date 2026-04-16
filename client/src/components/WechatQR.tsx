import { useState } from "react";
import { X, MessageCircle } from "lucide-react";

interface WechatQRProps {
  title?: string;
  description?: string;
  qrImageUrl?: string;
  onClose?: () => void;
  autoClose?: boolean;
}

export function WechatQR({
  title = "企业微信客服",
  description = "扫描二维码联系我们的客服团队",
  qrImageUrl = "https://d2xsxph8kpxj0f.cloudfront.net/310519663494601131/cb6tJthVaUMYyF2mL5LVPm/wechat-qr-placeholder.png",
  onClose,
  autoClose = false,
}: WechatQRProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">{description}</p>

          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-lg border-2 border-border/50">
              <img
                src={qrImageUrl}
                alt="企业微信二维码"
                className="w-48 h-48 object-cover"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            使用微信或企业微信扫描二维码
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-foreground rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              关闭
            </button>
            <a
              href="https://work.weixin.qq.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              打开企业微信
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 text-center text-xs text-muted-foreground border-t border-border/50">
          客服时间：9:00-18:00（工作日）
        </div>
      </div>
    </div>
  );
}

// 浮动按钮版本
export function WechatQRButton({
  onOpen,
  className = "",
}: {
  onOpen?: () => void;
  className?: string;
}) {
  const [showQR, setShowQR] = useState(false);

  const handleOpen = () => {
    setShowQR(true);
    onOpen?.();
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center z-40 ${className}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {showQR && (
        <WechatQR
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  );
}
