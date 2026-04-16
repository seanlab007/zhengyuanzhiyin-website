import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { PRODUCTS } from "@shared/products";
import { Sparkles, ChevronRight, Star, Moon, Heart } from "lucide-react";
import { motion } from "framer-motion";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663494601131/cb6tJthVaUMYyF2mL5LVPm/hero-banner-n32V32NkERGTouP7NeQpNR.webp";
const CONSTELLATION_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663494601131/cb6tJthVaUMYyF2mL5LVPm/constellation-bg-ZfLzF2P2WncdXSsKp4MzoB.webp";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // 主推姻缘测算和每日运势
  const featuredProducts = PRODUCTS.filter(p =>
    ["marriage", "daily"].includes(p.key)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with background image */}
      <section className="relative overflow-hidden min-h-[420px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-background" />

        <div className="relative z-10 px-6 pt-10 pb-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-serif text-2xl font-bold text-white drop-shadow-lg tracking-wider">
                正缘指引
              </h1>
              <p className="text-white/80 text-[11px] mt-0.5 tracking-wide">
                探索命运 · 遇见真我
              </p>
            </div>
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/profile")}
                className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-sm font-semibold text-white border border-white/30 shadow-lg"
              >
                {user?.name?.charAt(0) || "我"}
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium text-white border border-white/30 shadow-lg hover:bg-white/30 transition-colors"
              >
                登录
              </button>
            )}
          </div>

          {/* Hero content */}
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} custom={0}>
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white/90 text-xs mb-5 border border-white/20">
                <Moon className="w-3 h-3" />
                <span>千年命理智慧 · 现代科技赋能</span>
              </div>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-serif text-3xl font-bold text-white drop-shadow-lg mb-3 leading-tight"
            >
              揭开命运的面纱
              <br />
              <span className="text-white/90" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>遇见最好的自己</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-white/75 text-sm leading-relaxed max-w-[280px] mx-auto mb-6"
            >
              专业姻缘配对分析，助您寻觅真爱良缘
            </motion.p>

            <motion.div variants={fadeUp} custom={3}>
              <button
                onClick={() => navigate("/features")}
                className="px-8 py-3 bg-white text-primary rounded-full text-sm font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                立即开始测算
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products - Floating cards */}
      <section className="px-4 -mt-8 relative z-10">
        <motion.div
          className="grid grid-cols-4 gap-2.5"
          initial="hidden"
          animate="visible"
        >
          {featuredProducts.map((product, i) => (
            <motion.div key={product.key} variants={fadeUp} custom={i + 4}>
              <Link href={`/fortune/${product.key}`}>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 text-center shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 border border-white/50">
                  <div className="text-2xl mb-1.5">{product.icon}</div>
                  <p className="text-[11px] font-semibold text-foreground leading-tight">
                    {product.name}
                  </p>
                  <p className="text-[10px] font-bold mt-1" style={{ color: product.isFree ? "#10b981" : "oklch(0.65 0.15 350)" }}>
                    {product.isFree ? "免费" : `¥${product.price}`}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* All Services */}
      <section
        className="px-4 mt-8 pb-4"
        style={{
          backgroundImage: `url(${CONSTELLATION_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full gradient-primary" />
            <h3 className="font-serif text-lg font-bold text-foreground">
              全部服务
            </h3>
          </div>
          <Link href="/features">
            <span className="text-xs text-primary flex items-center gap-0.5 font-medium">
              更多 <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        <div className="space-y-2.5">
          {PRODUCTS.map((product, i) => (
            <motion.div
              key={product.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" as const }}
            >
              <Link href={`/fortune/${product.key}`}>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all border border-white/60 hover:-translate-y-0.5">
                  <div className="w-11 h-11 rounded-xl gradient-soft flex items-center justify-center text-xl shrink-0 shadow-sm">
                    {product.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground text-sm">
                        {product.name}
                      </h4>
                      {product.isFree && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] rounded-full font-semibold border border-emerald-100">
                          免费
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    {!product.isFree && (
                      <span className="text-sm font-bold text-primary">
                        ¥{product.price}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 mt-0.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust & Social Proof */}
      <section className="px-4 py-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
          <div className="flex items-center justify-around text-center">
            <div>
              <div className="flex items-center justify-center gap-0.5 text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">
                专业团队
              </p>
            </div>
            <div className="w-px h-10 bg-border/40" />
            <div>
              <p className="text-base font-bold text-foreground">10万+</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                用户信赖
              </p>
            </div>
            <div className="w-px h-10 bg-border/40" />
            <div>
              <p className="text-base font-bold text-foreground">99.8%</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                好评率
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expert consultation CTA */}
      <section className="px-4 pb-6">
        <div className="gradient-primary rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Heart className="w-4 h-4 text-rose-200" />
                <h4 className="font-serif font-bold text-base">专家一对一详批</h4>
              </div>
              <p className="text-white/75 text-xs leading-relaxed">
                资深命理师为您深度解读，提供个性化人生建议
              </p>
            </div>
            <button
              onClick={() => navigate("/features")}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold border border-white/30 whitespace-nowrap hover:bg-white/30 transition-colors"
            >
              立即咨询
            </button>
          </div>
        </div>
      </section>

      {/* ICP Footer */}
      <footer className="text-center pb-24 px-4">
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
          苏州费汀娜教育科技有限公司 |{" "}
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            苏ICP备2021048491号-4
          </a>
          {" "} |{" "}
          <a
            href="https://work.weixin.qq.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            客服投诉
          </a>
        </p>
      </footer>
    </div>
  );
}
