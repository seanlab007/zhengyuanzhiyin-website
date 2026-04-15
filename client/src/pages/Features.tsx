import { Link } from "wouter";
import { PRODUCTS } from "@shared/products";
import { ChevronRight } from "lucide-react";

export default function Features() {
  const paidProducts = PRODUCTS.filter(p => !p.isFree);
  const freeProducts = PRODUCTS.filter(p => p.isFree);

  return (
    <div className="min-h-screen pb-4">
      {/* Header */}
      <div className="gradient-primary text-white px-6 pt-10 pb-8">
        <h1 className="font-serif text-xl font-bold">全部功能</h1>
        <p className="text-white/70 text-sm mt-1">专业命理分析，助您洞悉人生</p>
      </div>

      {/* Free section */}
      {freeProducts.length > 0 && (
        <section className="px-4 mt-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">免费体验</h3>
          <div className="space-y-2.5">
            {freeProducts.map(product => (
              <ProductCard key={product.key} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Paid section */}
      <section className="px-4 mt-5">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">精品服务</h3>
        <div className="space-y-2.5">
          {paidProducts.map(product => (
            <ProductCard key={product.key} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: typeof PRODUCTS[number] }) {
  return (
    <Link href={`/fortune/${product.key}`}>
      <div className="bg-card rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all border border-border/30 active:scale-[0.98]">
        <div className="w-14 h-14 rounded-xl gradient-soft flex items-center justify-center text-3xl shrink-0 shadow-inner">
          {product.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">{product.name}</h4>
            {product.isFree && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-semibold">
                免费
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{product.description}</p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          {!product.isFree && (
            <span className="text-base font-bold text-primary">¥{product.price}</span>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
        </div>
      </div>
    </Link>
  );
}
