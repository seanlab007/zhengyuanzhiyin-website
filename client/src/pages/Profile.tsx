import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronRight, LogOut, ShoppingBag, MessageCircle, Shield } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-5xl mb-4">🔮</div>
        <h2 className="font-serif text-xl font-semibold mb-2">登录后查看更多</h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">登录后可查看订单记录、已购功能等</p>
        <Button
          onClick={() => navigate("/login")}
          className="gradient-primary text-white rounded-full px-8 py-2.5"
        >
          立即登录
        </Button>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    toast.success("已退出登录");
    navigate("/");
  };

  const menuItems = [
    { icon: ShoppingBag, label: "我的订单", href: "/orders", desc: "查看历史订单记录" },
    { icon: MessageCircle, label: "联系客服", href: "#wechat", desc: "专家一对一详批" },
  ];

  return (
    <div className="min-h-screen">
      {/* Profile header */}
      <div className="gradient-primary text-white px-6 pt-10 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-serif font-bold backdrop-blur-sm">
            {user?.name?.charAt(0) || "用"}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user?.name || "用户"}</h2>
            <p className="text-white/70 text-sm">{user?.phone || user?.email || ""}</p>
            {user?.role === "admin" && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-medium">
                <Shield className="w-3 h-3" /> 管理员
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="px-4 mt-4 space-y-2">
        {menuItems.map(item => (
          item.href === "#wechat" ? (
            <WechatContactCard key={item.label} item={item} />
          ) : (
            <Link key={item.label} href={item.href}>
              <div className="bg-card rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-border/30 active:scale-[0.98] transition-transform">
                <div className="w-10 h-10 rounded-xl gradient-soft flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">{item.label}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          )
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 mt-8">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full rounded-xl h-11 text-muted-foreground border-border/50"
        >
          <LogOut className="w-4 h-4 mr-2" /> 退出登录
        </Button>
      </div>

      {/* ICP Footer */}
      <footer className="text-center mt-8 pb-20 px-4">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          苏州费汀娜教育科技有限公司 |{" "}
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">
            苏ICP备2021048491号-4
          </a>
          {" "} |{" "}
          <a href="https://work.weixin.qq.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">
            客服投诉
          </a>
        </p>
      </footer>
    </div>
  );
}

function WechatContactCard({ item }: { item: { icon: any; label: string; desc: string } }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/30">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl gradient-soft flex items-center justify-center">
          <item.icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-foreground">{item.label}</h4>
          <p className="text-xs text-muted-foreground">{item.desc}</p>
        </div>
      </div>
      <div className="mt-3 p-3 bg-muted/50 rounded-xl text-center">
        <p className="text-xs text-muted-foreground mb-2">长按识别二维码，添加专家微信</p>
        <div className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center border border-border/30">
          <span className="text-xs text-muted-foreground">企业微信二维码</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">工作时间：9:00-21:00</p>
      </div>
    </div>
  );
}
