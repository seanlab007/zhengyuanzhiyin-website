import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderHistory() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const ordersQuery = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">请先登录查看订单</p>
        <Button onClick={() => navigate("/login")} className="gradient-primary text-white rounded-full px-8">
          去登录
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="gradient-primary text-white px-4 pt-10 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/profile")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-lg font-bold">我的订单</h1>
        </div>
      </div>

      {/* Orders list */}
      <div className="px-4 mt-4 space-y-3">
        {ordersQuery.isLoading ? (
          <div className="text-center py-12 text-muted-foreground animate-pulse">加载中...</div>
        ) : !ordersQuery.data?.length ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">暂无订单记录</p>
          </div>
        ) : (
          ordersQuery.data.map((order: any) => (
            <div key={order.id} className="bg-card rounded-2xl p-4 shadow-sm border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{order.productKey}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  order.status === "completed" ? "bg-green-100 text-green-700" :
                  order.status === "paid" ? "bg-blue-100 text-blue-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {order.status === "completed" ? "已完成" :
                   order.status === "paid" ? "已支付" : "待支付"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>¥{(order.amount / 100).toFixed(1)}</span>
                <span>{new Date(order.createdAt).toLocaleString("zh-CN")}</span>
              </div>
              {order.status === "pending" && (
                <Button
                  size="sm"
                  onClick={() => navigate(`/pay/${order.id}`)}
                  className="mt-3 w-full gradient-primary text-white rounded-lg text-xs"
                >
                  去支付
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
