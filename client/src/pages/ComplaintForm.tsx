import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ComplaintForm() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
    email: "",
    orderNumber: "",
    complaintType: "service",
    description: "",
    attachments: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const complaintTypes = [
    { value: "service", label: "服务质量问题" },
    { value: "accuracy", label: "准确度问题" },
    { value: "payment", label: "支付问题" },
    { value: "technical", label: "技术问题" },
    { value: "other", label: "其他问题" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.description) {
      toast.error("请填写必填项");
      return;
    }

    setIsLoading(true);

    try {
      // 模拟提交投诉
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 这里可以调用后端API保存投诉
      // await trpc.complaints.create.mutate(formData);

      setIsSubmitted(true);
      toast.success("投诉已提交，我们会尽快处理");

      // 3秒后返回首页
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      toast.error("提交失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white border-0 shadow-lg">
          <div className="p-8 text-center">
            <div className="mb-4">
              <CheckCircle2 size={64} className="text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">投诉已提交</h2>
            <p className="text-gray-600 mb-4">
              感谢您的反馈，我们会在24小时内与您联系
            </p>
            <p className="text-sm text-gray-500">
              3秒后自动返回首页...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">客服投诉</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="bg-white border-0 shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-6">
            <h2 className="text-xl font-bold mb-2">我们重视您的反馈</h2>
            <p className="text-sm opacity-90">
              如您对我们的服务有任何意见或建议，欢迎填写以下表单。我们会在24小时内与您联系。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 姓名 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入您的姓名"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* 电话 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                联系电话 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="请输入您的联系电话"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                邮箱地址
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="请输入您的邮箱地址（可选）"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* 订单号 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                订单号
              </label>
              <input
                type="text"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                placeholder="如果是订单相关问题，请输入订单号"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* 投诉类型 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                投诉类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.complaintType}
                onChange={(e) => setFormData({ ...formData, complaintType: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none transition-colors bg-white"
              >
                {complaintTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                问题描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请详细描述您遇到的问题..."
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none transition-colors resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500
              </p>
            </div>

            {/* 附加信息 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                附加信息
              </label>
              <textarea
                value={formData.attachments}
                onChange={(e) => setFormData({ ...formData, attachments: e.target.value })}
                placeholder="如有其他需要补充的信息，请在此输入（可选）"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => navigate("/")}
                variant="outline"
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    提交中...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    提交投诉
                  </>
                )}
              </Button>
            </div>

            {/* 提示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-700">
                💡 <strong>提示：</strong>我们承诺在收到投诉后24小时内与您联系。如有紧急问题，请直接拨打客服热线。
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
