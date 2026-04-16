import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getProductByKey, PRODUCTS } from "@shared/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Lock, Sparkles, MessageCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Streamdown } from "streamdown";
import { useAdmin } from "@/contexts/AdminContext";

export default function FortuneDetail() {
  const params = useParams<{ key: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { isAdmin } = useAdmin();
  const productKey = params.key || "";
  const product = useMemo(() => getProductByKey(productKey), [productKey]);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const accessQuery = trpc.orders.checkAccess.useQuery(
    { productKey },
    { enabled: (isAuthenticated || isAdmin) && !!productKey }
  );

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      if (data.isFree) {
        setCurrentOrderId(data.orderId);
        generateMutation.mutate({
          orderId: data.orderId,
          productKey,
        });
      } else {
        // 使用新的支付页面
        navigate(`/payment?order_id=${data.orderId}`);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const generateMutation = trpc.fortune.generate.useMutation({
    onSuccess: () => {
      setShowResult(true);
    },
    onError: (err) => toast.error(err.message),
  });

  const resultQuery = trpc.orders.getResult.useQuery(
    { orderId: currentOrderId! },
    { enabled: !!currentOrderId && showResult }
  );

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">功能不存在</p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!isAuthenticated && !isAdmin) {
      window.location.href = getLoginUrl();
      return;
    }

    // Validate form
    const fields = getFormFields(productKey);
    for (const field of fields) {
      if (field.required && !formData[field.key]) {
        toast.error(`请填写${field.label}`);
        return;
      }
    }

    createOrderMutation.mutate({
      productKey,
      inputData: JSON.stringify(formData),
      paymentMethod: "wechat",
    });
  };

  const isLoading = createOrderMutation.isPending || generateMutation.isPending;

  // If user already has access and result
  if (showResult && resultQuery.data?.resultData) {
    return (
      <div className="min-h-screen">
        <div className="gradient-primary text-white px-4 pt-10 pb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowResult(false); setCurrentOrderId(null); }} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-lg font-bold">{product.name} - 分析结果</h1>
          </div>
        </div>
        <div className="px-4 py-6">
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/30 prose prose-sm max-w-none">
            <Streamdown>{resultQuery.data.resultData}</Streamdown>
          </div>

          {/* WeChat CTA */}
          <div className="mt-6 bg-card rounded-2xl p-4 shadow-sm border border-border/30 text-center">
            <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold text-sm mb-1">想要更详细的解读？</h4>
            <p className="text-xs text-muted-foreground mb-3">添加专家微信，获得一对一深度分析</p>
            <div className="w-28 h-28 mx-auto bg-muted/50 rounded-lg flex items-center justify-center border border-border/30">
              <span className="text-[10px] text-muted-foreground">企业微信二维码</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fields = getFormFields(productKey);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="gradient-primary text-white px-4 pt-10 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1 as any)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-lg font-bold">{product.name}</h1>
        </div>
        <p className="text-white/75 text-sm">{product.description}</p>
        <div className="mt-3 flex items-center gap-2">
          {product.isFree ? (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">免费体验</span>
          ) : (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">¥{product.price}</span>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border/30">
          <h3 className="font-semibold text-foreground mb-4">请填写信息</h3>
          <div className="space-y-3">
            {/* 整合姓名、性别、生日到一个卡片 */}
            {fields.some(f => ["name", "fullName", "gender", "birthDate"].includes(f.key)) && (
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-5 border border-primary/20">
                <div className="space-y-4">
                  {/* 姓名 */}
                  {fields.find(f => ["name", "fullName"].includes(f.key)) && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block font-medium">
                        {fields.find(f => ["name", "fullName"].includes(f.key))?.label}
                        <span className="text-destructive ml-1">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder={fields.find(f => ["name", "fullName"].includes(f.key))?.placeholder}
                        value={formData[fields.find(f => ["name", "fullName"].includes(f.key))?.key || ""] || ""}
                        onChange={e => setFormData(prev => ({ ...prev, [fields.find(f => ["name", "fullName"].includes(f.key))?.key || ""]: e.target.value }))}
                        className="h-11 rounded-xl bg-white border-border/50 focus:border-primary"
                      />
                    </div>
                  )}

                  {/* 性别 */}
                  {fields.find(f => f.key === "gender") && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block font-medium">
                        {fields.find(f => f.key === "gender")?.label}
                        <span className="text-destructive ml-1">*</span>
                      </label>
                      <div className="flex gap-3">
                        {fields.find(f => f.key === "gender")?.options?.map(opt => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="radio"
                              name="gender"
                              value={opt.value}
                              checked={formData.gender === opt.value}
                              onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                              className="w-4 h-4 accent-primary"
                            />
                            <span className="text-sm text-foreground">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 生日 */}
                  {fields.find(f => f.key === "birthDate") && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block font-medium">
                        {fields.find(f => f.key === "birthDate")?.label}
                        <span className="text-destructive ml-1">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.birthDate || ""}
                        onChange={e => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="h-11 rounded-xl bg-white border-border/50 focus:border-primary"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 其他字段 */}
            {fields.map(field => {
              // 跳过已整合的字段
              if (["name", "fullName", "gender", "birthDate"].includes(field.key)) return null;
              
              return (
                <div key={field.key}>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </label>
                {field.type === "select" ? (
                  <select
                    className="w-full h-11 rounded-xl border border-border/50 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                    value={formData[field.key] || ""}
                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  >
                    <option value="">{field.placeholder}</option>
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    className="w-full rounded-xl border border-border/50 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
                    rows={3}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ""}
                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  />
                ) : (
                  <Input
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ""}
                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="h-11 rounded-xl bg-white border-border/50 focus:border-primary"
                  />
                )}
              </div>
              );
              })}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full mt-5 h-12 rounded-xl gradient-primary text-white font-semibold text-base shadow-md"
          >
            {isLoading ? (
              <span className="animate-pulse">处理中...</span>
            ) : product.isFree || isAdmin || (isAuthenticated && user?.role === "admin") ? (
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> 立即测算</span>
            ) : (
              <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> 支付 ¥{product.price} 解锁</span>
            )}
          </Button>
        </div>
      </div>

      {/* Preview section for paid products */}
      {!product.isFree && (
        <div className="px-4 mt-4 mb-8">
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/30">
            <h4 className="font-semibold text-sm mb-3">测算后您将了解</h4>
            <div className="space-y-2">
              {getPreviewItems(productKey).map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-primary text-sm mt-0.5">✦</span>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface FormField {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  type?: string;
  options?: { value: string; label: string }[];
}

function getFormFields(productKey: string): FormField[] {
  const commonBirthFields: FormField[] = [
    { key: "name", label: "您的姓名", placeholder: "请输入姓名（必须汉字）", required: true },
    { key: "gender", label: "性别", placeholder: "请选择性别", required: true, type: "select", options: [{ value: "male", label: "男" }, { value: "female", label: "女" }] },
    { key: "birthDate", label: "出生日期", placeholder: "例如：1990-01-15", required: true, type: "date" },
    { key: "birthTime", label: "出生时辰", placeholder: "请选择时辰", required: false, type: "select", options: [
      { value: "子时", label: "子时 (23:00-01:00)" }, { value: "丑时", label: "丑时 (01:00-03:00)" },
      { value: "寅时", label: "寅时 (03:00-05:00)" }, { value: "卯时", label: "卯时 (05:00-07:00)" },
      { value: "辰时", label: "辰时 (07:00-09:00)" }, { value: "巳时", label: "巳时 (09:00-11:00)" },
      { value: "午时", label: "午时 (11:00-13:00)" }, { value: "未时", label: "未时 (13:00-15:00)" },
      { value: "申时", label: "申时 (15:00-17:00)" }, { value: "酉时", label: "酉时 (17:00-19:00)" },
      { value: "戌时", label: "戌时 (19:00-21:00)" }, { value: "亥时", label: "亥时 (21:00-23:00)" },
    ]},
  ];

  const fieldMap: Record<string, FormField[]> = {
    bazi: commonBirthFields,
    ziwei: commonBirthFields,
    marriage: [
      ...commonBirthFields,
      { key: "partnerName", label: "Ta的姓名", placeholder: "请输入Ta的姓名（选填）", required: false },
      { key: "partnerBirthDate", label: "Ta的出生日期", placeholder: "例如：1992-05-20", required: false, type: "date" },
    ],
    wealth: commonBirthFields,
    name: [
      { key: "fullName", label: "姓名", placeholder: "请输入要测试的姓名", required: true },
      { key: "gender", label: "性别", placeholder: "请选择性别", required: true, type: "select", options: [{ value: "male", label: "男" }, { value: "female", label: "女" }] },
    ],
    daily: [
      { key: "zodiac", label: "生肖", placeholder: "请选择生肖", required: true, type: "select", options: [
        { value: "鼠", label: "鼠" }, { value: "牛", label: "牛" }, { value: "虎", label: "虎" },
        { value: "兔", label: "兔" }, { value: "龙", label: "龙" }, { value: "蛇", label: "蛇" },
        { value: "马", label: "马" }, { value: "羊", label: "羊" }, { value: "猴", label: "猴" },
        { value: "鸡", label: "鸡" }, { value: "狗", label: "狗" }, { value: "猪", label: "猪" },
      ]},
      { key: "constellation", label: "星座", placeholder: "请选择星座", required: false, type: "select", options: [
        { value: "白羊座", label: "白羊座" }, { value: "金牛座", label: "金牛座" }, { value: "双子座", label: "双子座" },
        { value: "巨蟹座", label: "巨蟹座" }, { value: "狮子座", label: "狮子座" }, { value: "处女座", label: "处女座" },
        { value: "天秤座", label: "天秤座" }, { value: "天蝎座", label: "天蝎座" }, { value: "射手座", label: "射手座" },
        { value: "摩羯座", label: "摩羯座" }, { value: "水瓶座", label: "水瓶座" }, { value: "双鱼座", label: "双鱼座" },
      ]},
    ],
    dayun: commonBirthFields,
    tarot: [
      { key: "question", label: "您的问题", placeholder: "请描述您想占卜的问题...", required: true, type: "textarea" },
      { key: "name", label: "您的称呼", placeholder: "请输入您的称呼", required: false },
    ],
  };

  return fieldMap[productKey] || commonBirthFields;
}

function getPreviewItems(productKey: string): string[] {
  const previewMap: Record<string, string[]> = {
    bazi: ["四柱八字详细排盘", "五行旺衰分析", "十神格局解读", "大运流年走势", "事业财运婚姻建议"],
    ziwei: ["紫微星盘全面解读", "十二宫位详细分析", "主星副星影响", "人生关键转折点", "开运改运建议"],
    marriage: ["姻缘配对指数", "感情运势走向", "最佳配偶特征", "桃花运分析", "婚姻时机建议"],
    wealth: ["正财偏财分析", "财运旺衰周期", "投资方向建议", "破财风险提醒", "开运招财方法"],
    name: ["五格数理分析", "三才配置解读", "字义能量分析", "名字对运势影响", "改名建议参考"],
    dayun: ["十年大运详批", "每步运势特征", "关键年份提醒", "事业发展建议", "健康注意事项"],
    tarot: ["三张牌阵解读", "过去现在未来", "牌面深层含义", "问题指引方向", "行动建议"],
  };
  return previewMap[productKey] || ["专业分析报告", "详细解读建议"];
}
