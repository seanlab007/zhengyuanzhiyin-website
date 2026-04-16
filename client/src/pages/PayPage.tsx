import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Smartphone } from "lucide-react";

export default function PayPage() {
  const params = useParams<{ orderId: string }>();
  const [, navigate] = useLocation();
  const orderId = parseInt(params.orderId || "0");
  const [paymentMethod, setPaymentMethod] = useState<"wechat" | "alipay">("wechat");

  const orderQuery = trpc.orders.getById.useQuery(
    { orderId },
    { enabled: orderId > 0 }
  );

  const simulatePayMutation = trpc.orders.simulatePay.useMutation({
    onSuccess: () => {
      toast.success("支付成功！");
      orderQuery.refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (!orderQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载订单信息...</div>
      </div>
    );
  }

  const order = orderQuery.data;
  const amountNum = parseFloat(order.amount);

  if (order.status === "paid") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="font-serif text-xl font-bold mb-2">支付成功</h2>
        <p className="text-sm text-muted-foreground mb-6">您的订单已完成支付</p>
        <Button
          onClick={() => navigate(`/fortune/${order.productKey}`)}
          className="gradient-primary text-white rounded-full px-8"
        >
          查看结果
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary text-white px-4 pt-10 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1 as any)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-lg font-bold">确认支付</h1>
        </div>
      </div>

      {/* Order info */}
      <div className="px-4 -mt-3 relative z-10">
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">商品名称</span>
            <span className="text-sm font-medium">{order.productName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">支付金额</span>
            <span className="text-2xl font-bold text-primary">¥{amountNum.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 px-1">选择支付方式</h3>
        <div className="space-y-2">
          <PayMethodCard
            icon="💚"
            name="微信支付"
            selected={paymentMethod === "wechat"}
            onClick={() => setPaymentMethod("wechat")}
          />
          <PayMethodCard
            icon="🔵"
            name="支付宝"
            selected={paymentMethod === "alipay"}
            onClick={() => setPaymentMethod("alipay")}
          />
        </div>
      </div>

      {/* Pay button */}
      <div className="px-4 mt-8">
        <Button
          onClick={() => simulatePayMutation.mutate({ orderId })}
          disabled={simulatePayMutation.isPending}
          className="w-full h-12 rounded-xl gradient-primary text-white font-semibold text-base shadow-md"
        >
          {simulatePayMutation.isPending ? (
            <span className="animate-pulse">处理中...</span>
          ) : (
            <span className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              确认支付 ¥{amountNum.toFixed(1)}
            </span>
          )}
        </Button>
        <p className="text-center text-[10px] text-muted-foreground mt-3">
          支付即表示您同意我们的服务条款
        </p>
      </div>
    </div>
  );
}

function PayMethodCard({ icon, name, selected, onClick }: {
  icon: string; name: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-card rounded-xl p-4 flex items-center gap-3 border transition-all ${
        selected ? "border-primary shadow-sm" : "border-border/30"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium flex-1 text-left">{name}</span>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? "border-primary" : "border-muted-foreground/30"
      }`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </div>
    </button>
  );
}
