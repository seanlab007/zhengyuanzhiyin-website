import { useLocation, Link } from "wouter";
import { Home, Sparkles, User } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "首页" },
  { path: "/features", icon: Sparkles, label: "功能" },
  { path: "/profile", icon: User, label: "我的" },
];

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  // Hide bottom nav on login and pay pages
  const hideNav = location.startsWith("/login") || location.startsWith("/pay/");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)+64px)]">
        {children}
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border/50"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
            {navItems.map(item => {
              const isActive = item.path === "/"
                ? location === "/"
                : location.startsWith(item.path);
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`flex flex-col items-center gap-0.5 py-1 px-4 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}>
                    <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                    <span className={`text-[10px] ${isActive ? "font-semibold" : "font-normal"}`}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
