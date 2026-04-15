# 正缘指引 - 命理测算商业平台 完整实现方案

## 项目现状

已完成的功能：
- ✅ 女性化粉紫主题样式（`client/src/index.css`）
- ✅ 欢迎页面（`client/src/pages/Home.tsx`）
- ✅ 手机号登录/注册系统（`client/src/pages/Login.tsx`）
- ✅ 管理员硬编码账号：13800138000 / 123456（`server/db.ts` 中 `upsertUser` 逻辑）
- ✅ 8个命理功能页面（`client/src/pages/FortuneDetail.tsx` 动态路由）
- ✅ 阶梯定价系统（`shared/products.ts`）
- ✅ 订单管理与数据库（`drizzle/schema.ts`）
- ✅ LLM 命理结果生成（`server/routers.ts` 中 `fortune.generate`）
- ✅ 模拟支付流程（`server/routers.ts` 中 `orders.simulatePay`）
- ✅ 移动端底部导航布局（`client/src/components/MobileLayout.tsx`）

待完成的功能：
- 🔲 微信支付集成（H5 & 扫码）
- 🔲 支付宝支付集成（H5 & 扫码）
- 🔲 企业微信二维码组件与真实资源
- 🔲 移动端适配优化（微信/手机浏览器）
- 🔲 "made with manus" 品牌标识清理

---

## 1. 微信支付集成方案

### 1.1 架构设计

**支付流程：**
```
用户点击"支付 ¥X.X 解锁" 
  ↓
创建订单 (POST /api/trpc/orders.create)
  ↓
跳转到支付页面 (/pay/:orderId)
  ↓
调用微信支付 API 获取支付参数
  ↓
前端调用 WechatJSBridge 或 JSAPI 发起支付
  ↓
用户完成支付
  ↓
微信服务器回调后端 (POST /api/wechat/notify)
  ↓
后端验证签名 → 更新订单状态为 "paid"
  ↓
前端轮询或 WebSocket 监听订单状态
  ↓
订单状态变为 "paid" 时自动解锁结果
```

### 1.2 后端实现（Node.js/Express）

**需要的 npm 包：**
```bash
pnpm add wechatpay-node-sdk axios crypto
```

**环境变量配置（需要在 webdev_request_secrets 中添加）：**
```
WECHAT_APPID=your_app_id
WECHAT_MCH_ID=your_merchant_id
WECHAT_API_KEY=your_api_key
WECHAT_CERT_PATH=/path/to/cert.pem
WECHAT_KEY_PATH=/path/to/key.pem
```

**后端路由实现位置：** `server/routers.ts` 中的 `orders` router

**需要添加的 tRPC 过程：**

```typescript
// 1. 获取微信支付参数 (H5 支付)
orders.getWechatPayParams: protectedProcedure
  .input(z.object({ orderId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    // 验证订单所有权
    // 调用微信统一下单 API
    // 返回 prepay_id 和支付参数
    // 返回格式: { prepayId, appId, timeStamp, nonceStr, package, signType, paySign }
  })

// 2. 处理微信支付回调
// 注意：这是 Express 路由，不是 tRPC 过程
// 路由：POST /api/wechat/notify
// 需要：
//   - 验证微信签名
//   - 解密加密信息
//   - 更新订单状态
//   - 返回成功响应 (200 + XML)
```

**关键实现细节：**

1. **统一下单 API 调用** - 调用微信的 `/v3/pay/transactions/h5` 端点
2. **签名验证** - 使用 SHA256-RSA 验证回调签名
3. **幂等性处理** - 同一订单多次回调时只更新一次
4. **数据库事务** - 更新订单状态时使用事务确保一致性

### 1.3 前端实现

**PayPage.tsx 需要的修改：**

```typescript
// 1. 调用后端获取支付参数
const getWechatParamsMutation = trpc.orders.getWechatPayParams.useMutation()

// 2. 调用微信 JSAPI 发起支付
const handleWechatPay = async () => {
  const params = await getWechatParamsMutation.mutateAsync({ orderId })
  
  // 检查是否在微信环境
  if (typeof window !== 'undefined' && window.wx) {
    window.wx.choosePayment({
      timestamp: params.timeStamp,
      nonceStr: params.nonceStr,
      package: params.package,
      signType: params.signType,
      paySign: params.paySign,
      success: () => {
        // 支付成功，轮询订单状态
        pollOrderStatus()
      },
      fail: () => {
        toast.error('支付失败，请重试')
      }
    })
  }
}

// 3. 轮询订单状态
const pollOrderStatus = () => {
  const interval = setInterval(async () => {
    const order = await trpc.orders.getById.useQuery({ orderId })
    if (order.status === 'paid') {
      clearInterval(interval)
      // 自动跳转到结果页或显示结果
    }
  }, 2000) // 每 2 秒轮询一次
}
```

**关键点：**
- 检测微信环境：`window.wx` 存在时才调用微信 API
- 非微信环境（手机浏览器）：显示二维码让用户扫描支付
- 支付成功后需要轮询或 WebSocket 监听订单状态变化

---

## 2. 支付宝支付集成方案

### 2.1 架构设计

**支付流程与微信类似，但使用支付宝 API：**

```
用户点击支付 
  ↓
创建订单
  ↓
调用支付宝 API 获取支付表单/参数
  ↓
H5 环境：显示支付宝支付表单或跳转
  非 H5：显示二维码
  ↓
用户完成支付
  ↓
支付宝服务器回调后端 (POST /api/alipay/notify)
  ↓
后端验证签名 → 更新订单状态
  ↓
前端监听订单状态变化
```

### 2.2 后端实现

**需要的 npm 包：**
```bash
pnpm add alipay-sdk
```

**环境变量配置：**
```
ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=your_public_key
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do (生产)
```

**后端路由实现位置：** `server/routers.ts` 中的 `orders` router

**需要添加的 tRPC 过程：**

```typescript
// 1. 获取支付宝支付表单 (H5 支付)
orders.getAlipayForm: protectedProcedure
  .input(z.object({ orderId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    // 验证订单所有权
    // 调用支付宝 pageExecute API
    // 返回 HTML 表单字符串
    // 返回格式: { form: '<form>...</form>' }
  })

// 2. 处理支付宝支付回调
// 注意：这是 Express 路由
// 路由：POST /api/alipay/notify
// 需要：
//   - 验证支付宝签名
//   - 检查交易状态
//   - 更新订单状态
//   - 返回成功响应 ('success')
```

### 2.3 前端实现

```typescript
// PayPage.tsx 中添加支付宝支付逻辑

const handleAlipayPay = async () => {
  const result = await getAlipayFormMutation.mutateAsync({ orderId })
  
  // 创建隐藏的 form 并提交
  const form = document.createElement('div')
  form.innerHTML = result.form
  document.body.appendChild(form)
  form.querySelector('form')?.submit()
  
  // 支付后轮询订单状态
  pollOrderStatus()
}
```

---

## 3. 企业微信客服二维码组件

### 3.1 组件设计

**文件位置：** `client/src/components/WechatQRCode.tsx`

**功能需求：**
- 显示企业微信二维码图片
- 支持自定义大小和样式
- 可在结果页、功能页等多处复用
- 支持长按保存二维码

**实现思路：**

```typescript
interface WechatQRCodeProps {
  size?: number // 二维码大小，默认 200px
  title?: string // 标题文案
  description?: string // 描述文案
  showSaveHint?: boolean // 是否显示"长按保存"提示
}

export function WechatQRCode({
  size = 200,
  title = "想要更详细的解读？",
  description = "添加专家微信，获得一对一深度分析",
  showSaveHint = true
}: WechatQRCodeProps) {
  return (
    <div className="text-center">
      <h4 className="font-semibold text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      <div className="flex justify-center">
        <img 
          src={WECHAT_QR_CODE_URL} // CDN 上的二维码图片 URL
          alt="企业微信二维码"
          style={{ width: size, height: size }}
          className="rounded-lg border border-border/30"
        />
      </div>
      {showSaveHint && (
        <p className="text-[10px] text-muted-foreground mt-2">💡 长按二维码保存或扫描</p>
      )}
    </div>
  )
}
```

### 3.2 集成位置

**1. 结果页面（FortuneDetail.tsx）**
```typescript
// 在结果显示后添加
<WechatQRCode 
  title="想要更详细的解读？"
  description="添加专家微信，获得一对一深度分析"
/>
```

**2. 支付页面（PayPage.tsx）**
```typescript
// 在支付失败或需要人工处理时显示
<WechatQRCode 
  title="支付遇到问题？"
  description="联系客服微信，我们为您解决"
/>
```

**3. 功能页面（FortuneDetail.tsx 表单上方）**
```typescript
// 可选：在表单顶部显示"有疑问？"入口
<div className="mb-4 p-3 bg-primary/5 rounded-lg text-center">
  <p className="text-xs text-muted-foreground mb-2">有任何疑问？</p>
  <WechatQRCode size={120} showSaveHint={false} />
</div>
```

### 3.3 二维码图片资源

**需要您提供：**
- 企业微信二维码图片（PNG 格式，建议 300x300px 以上）
- 上传到 CDN 后，将 URL 配置到 `shared/const.ts`

```typescript
// shared/const.ts 中添加
export const WECHAT_QR_CODE_URL = 'https://cdn.../wechat-qrcode.png'
```

---

## 4. 支付页面（PayPage.tsx）完整实现

### 4.1 页面结构

```typescript
export default function PayPage() {
  const params = useParams<{ orderId: string }>()
  const orderId = parseInt(params.orderId || '0')
  
  // 1. 获取订单信息
  const orderQuery = trpc.orders.getById.useQuery({ orderId })
  
  // 2. 支付方法状态
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat')
  
  // 3. 支付相关 mutations
  const wechatMutation = trpc.orders.getWechatPayParams.useMutation()
  const alipayMutation = trpc.orders.getAlipayForm.useMutation()
  
  // 4. 订单状态轮询
  useEffect(() => {
    const interval = setInterval(() => {
      orderQuery.refetch()
    }, 2000)
    
    if (orderQuery.data?.status === 'paid') {
      clearInterval(interval)
      navigate(`/fortune/${orderQuery.data.productKey}`)
    }
    
    return () => clearInterval(interval)
  }, [orderQuery.data?.status])
  
  const handlePay = async () => {
    if (paymentMethod === 'wechat') {
      // 调用微信支付
      const params = await wechatMutation.mutateAsync({ orderId })
      // 发起微信支付...
    } else {
      // 调用支付宝支付
      const form = await alipayMutation.mutateAsync({ orderId })
      // 提交支付宝表单...
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* 订单信息 */}
      <div className="p-4">
        <h1>订单支付</h1>
        <div className="mt-4 p-4 bg-card rounded-lg">
          <p>产品：{orderQuery.data?.productName}</p>
          <p className="text-xl font-bold mt-2">¥{orderQuery.data?.amount}</p>
        </div>
      </div>
      
      {/* 支付方法选择 */}
      <div className="p-4">
        <h3 className="font-semibold mb-3">选择支付方式</h3>
        <div className="space-y-2">
          <button 
            onClick={() => setPaymentMethod('wechat')}
            className={`w-full p-3 rounded-lg border-2 ${
              paymentMethod === 'wechat' 
                ? 'border-primary bg-primary/5' 
                : 'border-border'
            }`}
          >
            💚 微信支付
          </button>
          <button 
            onClick={() => setPaymentMethod('alipay')}
            className={`w-full p-3 rounded-lg border-2 ${
              paymentMethod === 'alipay' 
                ? 'border-primary bg-primary/5' 
                : 'border-border'
            }`}
          >
            🔵 支付宝支付
          </button>
        </div>
      </div>
      
      {/* 支付按钮 */}
      <div className="p-4">
        <Button 
          onClick={handlePay}
          disabled={wechatMutation.isPending || alipayMutation.isPending}
          className="w-full h-12 gradient-primary text-white"
        >
          {wechatMutation.isPending || alipayMutation.isPending 
            ? '处理中...' 
            : `确认支付 ¥${orderQuery.data?.amount}`}
        </Button>
      </div>
      
      {/* 客服支持 */}
      <div className="p-4">
        <WechatQRCode 
          title="支付遇到问题？"
          description="联系我们的客服团队"
        />
      </div>
    </div>
  )
}
```

---

## 5. 移动端适配优化方案

### 5.1 微信内置浏览器适配

**需要处理的问题：**
1. **状态栏与安全区域** - 使用 `viewport-fit=cover` 和 CSS 安全区域变量
2. **微信 JS-SDK** - 初始化微信 JSAPI 以支持支付、分享等功能
3. **返回按钮** - 处理微信返回按钮事件

**实现位置：** `client/index.html` 和 `client/src/main.tsx`

```html
<!-- client/index.html 中的 viewport meta 标签 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">
```

```typescript
// client/src/main.tsx 中初始化微信 SDK
import { initWechatSDK } from '@/lib/wechat'

initWechatSDK()
```

**创建文件：** `client/src/lib/wechat.ts`

```typescript
export function initWechatSDK() {
  if (typeof window === 'undefined') return
  
  // 检查是否在微信环境
  const ua = navigator.userAgent.toLowerCase()
  const isWeChat = /micromessenger/.test(ua)
  
  if (!isWeChat) return
  
  // 加载微信 JSAPI
  const script = document.createElement('script')
  script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'
  script.onload = () => {
    // 初始化 JSAPI
    // 需要从后端获取签名参数
    window.wx?.config({
      debug: false,
      appId: 'your_app_id',
      timestamp: 'signature_timestamp',
      nonceStr: 'signature_nonce_str',
      signature: 'signature_string',
      jsApiList: ['choosePayment', 'showMenuItems', 'hideMenuItems']
    })
  }
  document.head.appendChild(script)
}
```

### 5.2 安全区域处理

**CSS 修改：** `client/src/index.css`

```css
@layer base {
  /* 处理 iPhone 刘海屏和 Android 挖孔屏 */
  body {
    padding-top: max(env(safe-area-inset-top), 1rem);
    padding-bottom: max(env(safe-area-inset-bottom), 1rem);
    padding-left: max(env(safe-area-inset-left), 1rem);
    padding-right: max(env(safe-area-inset-right), 1rem);
  }
  
  /* 底部导航栏适配 */
  .mobile-nav {
    padding-bottom: max(env(safe-area-inset-bottom), 1rem);
  }
}
```

### 5.3 手机浏览器适配

**关键点：**
1. **触摸反馈** - 使用 `active:` 伪类替代 `hover:`
2. **输入框焦点** - 避免键盘弹起时页面抖动
3. **图片加载** - 使用 `loading="lazy"` 延迟加载

**实现示例：**

```typescript
// 在 FortuneDetail.tsx 中处理输入框焦点
const handleInputFocus = () => {
  // 确保输入框在视口内
  setTimeout(() => {
    const input = document.activeElement as HTMLInputElement
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}
```

---

## 6. 后端 Express 路由配置

### 6.1 支付回调路由

**文件位置：** `server/_core/index.ts`（Express 应用配置）

```typescript
// 添加微信支付回调路由
app.post('/api/wechat/notify', async (req, res) => {
  try {
    // 1. 验证微信签名
    const signature = req.headers['wechatpay-signature']
    const timestamp = req.headers['wechatpay-timestamp']
    const nonce = req.headers['wechatpay-nonce']
    
    // 2. 验证签名逻辑（使用 wechatpay-node-sdk）
    // ...
    
    // 3. 解密加密信息
    const decrypted = decrypt(req.body.resource.ciphertext)
    const data = JSON.parse(decrypted)
    
    // 4. 更新订单状态
    if (data.trade_state === 'SUCCESS') {
      await db.update(orders)
        .set({ status: 'paid', updatedAt: new Date() })
        .where(eq(orders.id, data.out_trade_no))
    }
    
    // 5. 返回成功响应
    res.json({ code: 'SUCCESS', message: '成功' })
  } catch (error) {
    console.error('微信回调处理失败:', error)
    res.status(500).json({ code: 'FAIL', message: '失败' })
  }
})

// 添加支付宝支付回调路由
app.post('/api/alipay/notify', async (req, res) => {
  try {
    // 1. 验证支付宝签名
    const isValid = alipay.verifySign(req.body)
    if (!isValid) {
      return res.send('fail')
    }
    
    // 2. 检查交易状态
    if (req.body.trade_status === 'TRADE_SUCCESS') {
      await db.update(orders)
        .set({ status: 'paid', updatedAt: new Date() })
        .where(eq(orders.id, req.body.out_trade_no))
    }
    
    // 3. 返回成功响应
    res.send('success')
  } catch (error) {
    console.error('支付宝回调处理失败:', error)
    res.send('fail')
  }
})
```

---

## 7. 数据库迁移

### 7.1 订单表扩展

**如需添加支付相关字段，更新 `drizzle/schema.ts`：**

```typescript
export const orders = mysqlTable('orders', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  productKey: varchar('productKey', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['pending', 'paid', 'failed', 'refunded']).default('pending'),
  
  // 支付相关字段
  paymentMethod: mysqlEnum('paymentMethod', ['wechat', 'alipay']).notNull(),
  transactionId: varchar('transactionId', { length: 100 }), // 微信/支付宝交易号
  
  // 订单数据
  inputData: text('inputData'), // JSON 格式的用户输入
  resultData: text('resultData'), // JSON 格式的命理结果
  
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  paidAt: timestamp('paidAt'), // 支付完成时间
})
```

然后运行：
```bash
pnpm drizzle-kit generate
# 查看生成的 SQL，确认无误后应用
```

---

## 8. 环境变量配置清单

**需要通过 `webdev_request_secrets` 添加的环境变量：**

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `WECHAT_APPID` | 微信应用 ID | `wx1234567890abcdef` |
| `WECHAT_MCH_ID` | 微信商户号 | `1234567890` |
| `WECHAT_API_KEY` | 微信 API 密钥 | `abc123...` |
| `WECHAT_CERT_PATH` | 微信证书路径 | `/etc/certs/wechat.pem` |
| `ALIPAY_APP_ID` | 支付宝应用 ID | `2021001234567890` |
| `ALIPAY_PRIVATE_KEY` | 支付宝私钥 | `MIIEvQIBADANBg...` |
| `ALIPAY_PUBLIC_KEY` | 支付宝公钥 | `MIIBIjANBgkqhk...` |
| `WECHAT_QR_CODE_URL` | 企业微信二维码 CDN URL | `https://cdn.../qrcode.png` |

---

## 9. 测试清单

### 9.1 单元测试

**添加到 `server/features.test.ts`：**

```typescript
describe('支付系统', () => {
  it('应该正确创建微信支付订单', async () => {
    // 测试逻辑
  })
  
  it('应该正确验证微信支付回调签名', async () => {
    // 测试逻辑
  })
  
  it('应该正确处理支付宝回调', async () => {
    // 测试逻辑
  })
})
```

### 9.2 集成测试

**手动测试流程：**

1. **微信支付流程**
   - [ ] 在微信浏览器中打开应用
   - [ ] 选择付费功能
   - [ ] 点击"支付"按钮
   - [ ] 验证支付参数正确
   - [ ] 完成支付后订单状态更新

2. **支付宝支付流程**
   - [ ] 选择支付宝支付方式
   - [ ] 验证支付表单正确生成
   - [ ] 完成支付后订单状态更新

3. **移动端适配**
   - [ ] iPhone 刘海屏显示正常
   - [ ] Android 挖孔屏显示正常
   - [ ] 底部导航栏不被键盘遮挡
   - [ ] 触摸反馈正常

---

## 10. 代码提交流程

### 10.1 开发完成后

```bash
# 1. 确保所有测试通过
pnpm test

# 2. 检查 TypeScript 编译
pnpm check

# 3. 提交代码到 Git
git add .
git commit -m "feat: 完成微信支付、支付宝支付和企业微信客服集成"

# 4. 推送到 GitHub（由 Manus AI 负责）
git push origin main
```

### 10.2 部署验证

- GitHub Actions 自动构建和部署
- 检查 CDN 缓存是否已刷新
- 在测试环境验证所有功能

---

## 11. 常见问题与解决方案

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 微信支付按钮无反应 | 不在微信环境或 JSAPI 未初始化 | 检查 `window.wx` 是否存在，确保 JSAPI 签名正确 |
| 支付回调未触发 | 回调 URL 未正确配置或签名验证失败 | 检查微信/支付宝后台回调 URL 配置，验证签名逻辑 |
| 订单状态未更新 | 数据库连接问题或事务失败 | 检查数据库日志，确保事务正确提交 |
| 移动端键盘遮挡输入框 | 未处理安全区域 | 添加 `scrollIntoView` 逻辑 |

---

## 12. 后续优化建议

1. **支付重试机制** - 支付失败时自动重试或提示用户重新支付
2. **订单超时处理** - 30 分钟内未支付的订单自动取消
3. **发票功能** - 支付成功后提供电子发票下载
4. **优惠券系统** - 支持优惠券和折扣码
5. **支付统计** - 后台管理员可查看支付数据和收入统计

---

**文档编写时间：** 2026-04-15  
**适用版本：** v1.0  
**维护者：** Manus AI
