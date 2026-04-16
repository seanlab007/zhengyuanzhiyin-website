# 快手广告追踪集成指南

## 概述

本平台已集成快手广告追踪功能，支持快手宏参数自动填充和订单归因。

## 投放链接模板

使用以下链接模板进行快手广告投放：

```
https://zhengyuanzhiyin-cb6tjthv.manus.space/landing?channel=kuaishou&callback=__CALLBACK__&adid=__DID__
```

## 宏参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `__CALLBACK__` | 快手生成的唯一回调ID，用于追踪用户来源 | `DHAJASAL...` |
| `__DID__` | 广告计划ID，用于区分不同的投放计划 | `123456789` |

## 工作流程

### 1. 用户点击广告
- 用户点击快手广告时，快手会自动将`__CALLBACK__`和`__DID__`替换为真实值
- 用户被重定向到落地页：`/landing?callback=XXXXX&adid=YYYYY`

### 2. 落地页处理
- 落地页接收宏参数并创建追踪记录
- 追踪数据存储到数据库
- 用户被重定向到首页

### 3. 订单创建
- 用户填写表单并创建订单时，可以关联之前的追踪数据
- 订单创建时传递`kuaishouCallback`参数
- 系统自动关联订单和追踪记录

### 4. 订单回传
- 支付成功后，系统自动将订单信息回传给快手
- 快手可以据此计算广告ROI和转化率

## API 接口

### 创建追踪记录

```typescript
// 前端调用
trpc.kuaishou.createTracking.mutate({
  callback: "DHAJASAL...",
  adid: "123456789"
});
```

### 关联订单到追踪

```typescript
// 前端调用（订单创建时）
trpc.orders.createAnonymous.mutate({
  productKey: "marriage",
  customerName: "张三",
  customerGender: "男",
  calendarType: "solar",
  birthDate: "1990-01-15",
  birthHour: "子时",
  paymentMethod: "wechat",
  kuaishouCallback: "DHAJASAL..." // 从 sessionStorage 获取
});
```

## 前端集成

### 1. 落地页自动处理
落地页会自动：
- 提取URL中的`callback`和`adid`参数
- 创建追踪记录
- 将追踪数据存储到 sessionStorage
- 重定向到首页

### 2. 订单创建时关联追踪
```typescript
// 从 sessionStorage 获取追踪数据
const kuaishouCallback = sessionStorage.getItem('kuaishou_callback');
const kuaishouAdid = sessionStorage.getItem('kuaishou_adid');

// 创建订单时传递
if (kuaishouCallback) {
  await trpc.orders.createAnonymous.mutate({
    // ... 其他参数
    kuaishouCallback
  });
}
```

## 数据库表结构

```sql
CREATE TABLE `kuaishou_tracking` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `callback` varchar(256) NOT NULL UNIQUE,
  `adid` varchar(128),
  `channel` varchar(64) DEFAULT 'kuaishou',
  `params` text,
  `orderId` int,
  `status` enum('pending','converted','failed') DEFAULT 'pending',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 追踪状态说明

| 状态 | 说明 |
|------|------|
| `pending` | 初始状态，用户已点击广告但未转化 |
| `converted` | 已转化，用户已创建订单 |
| `failed` | 转化失败或已退款 |

## 快手回传接口

当订单支付成功时，系统会自动回传以下数据给快手：

```json
{
  "callback": "DHAJASAL...",
  "orderId": 12345,
  "amount": 9.9,
  "status": "converted",
  "timestamp": 1713268800
}
```

> 注：具体的回传接口地址由快手提供，需要在后续配置中添加。

## 测试链接

使用以下测试链接验证追踪功能：

```
https://zhengyuanzhiyin-cb6tjthv.manus.space/landing?channel=kuaishou&callback=test_callback_123&adid=test_adid_456
```

## 常见问题

### Q: 如何验证追踪是否正常工作？
A: 
1. 访问测试链接
2. 检查数据库中是否创建了追踪记录
3. 创建订单后检查追踪状态是否更新为 "converted"

### Q: 如果用户没有通过落地页访问怎么办？
A: 系统支持直接创建订单，但无法追踪来源。建议所有快手投放都通过落地页进行。

### Q: 追踪数据可以保留多久？
A: 追踪数据永久保存在数据库中，可用于后续分析和对账。

## 支持

如有问题，请联系技术支持。
