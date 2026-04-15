import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Phone, Lock, ArrowLeft, UserPlus, LogIn } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.phoneLogin.useMutation({
    onSuccess: () => {
      toast.success("登录成功");
      utils.auth.me.invalidate();
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const registerMutation = trpc.auth.phoneRegister.useMutation({
    onSuccess: () => {
      toast.success("注册成功");
      utils.auth.me.invalidate();
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length !== 11) {
      toast.error("请输入正确的手机号");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("密码至少6位");
      return;
    }

    if (mode === "login") {
      loginMutation.mutate({ phone, password });
    } else {
      registerMutation.mutate({ phone, password, name: name || undefined });
    }
  };

  return (
    <div className="min-h-screen gradient-soft flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4">
        <button onClick={() => navigate("/")} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl">🔮</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">正缘指引</h1>
          <p className="text-sm text-muted-foreground mt-1">探索命运的奥秘</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-white/80 border-border/50 focus:border-primary"
              maxLength={11}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="请输入密码（至少6位）"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-white/80 border-border/50 focus:border-primary"
            />
          </div>

          {mode === "register" && (
            <div className="relative">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="昵称（选填）"
                value={name}
                onChange={e => setName(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-white/80 border-border/50 focus:border-primary"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl gradient-primary text-white font-semibold text-base shadow-md hover:shadow-lg transition-shadow"
          >
            {isLoading ? (
              <span className="animate-pulse">处理中...</span>
            ) : mode === "login" ? (
              <span className="flex items-center gap-2"><LogIn className="w-4 h-4" /> 登录</span>
            ) : (
              <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> 注册</span>
            )}
          </Button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-sm text-primary font-medium"
          >
            {mode === "login" ? "没有账号？立即注册" : "已有账号？立即登录"}
          </button>
        </div>

        {/* Footer hint */}
        <p className="mt-8 text-xs text-muted-foreground text-center leading-relaxed">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
