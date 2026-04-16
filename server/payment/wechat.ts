import crypto from 'crypto';
import { getDb } from '../db';
import { eq } from 'drizzle-orm';
import { orders } from '../../drizzle/schema';

/**
 * 微信支付配置
 */
const WECHAT_CONFIG = {
  mchId: process.env.WECHAT_MERCHANT_ID || '1111291395',
  apiV2Key: process.env.WECHAT_API_V2_KEY || 'bqc123def456ghi787jkl012mno366pq',
  apiV3Key: process.env.WECHAT_API_V3_KEY || 'aqc123def456ghi787jkl012mno345pq',
  appId: process.env.WECHAT_APP_ID || 'wx411431aeb832204f',
  notifyUrl: process.env.WECHAT_NOTIFY_URL || 'https://www.zhengyuanzhiyin.com/api/wechat/callback',
};

/**
 * 生成微信支付签名 (MD5)
 */
export function generateWechatSignature(data: Record<string, any>): string {
  const keys = Object.keys(data).sort();
  let str = '';

  for (const key of keys) {
    if (data[key] !== '' && data[key] !== null && data[key] !== undefined && key !== 'sign') {
      str += `${key}=${data[key]}&`;
    }
  }

  str += `key=${WECHAT_CONFIG.apiV2Key}`;

  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex')
    .toUpperCase();
}

/**
 * 生成随机字符串
 */
export function generateNonceStr(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * 构建XML请求体
 */
function buildXml(data: Record<string, any>): string {
  let xml = '<xml>';
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      if (typeof data[key] === 'string') {
        xml += `<${key}><![CDATA[${data[key]}]]></${key}>`;
      } else {
        xml += `<${key}>${data[key]}</${key}>`;
      }
    }
  }
  xml += '</xml>';
  return xml;
}

/**
 * 解析XML响应
 */
function parseXml(xml: string): Record<string, any> {
  const result: Record<string, any> = {};
  const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>(.*?)<\/\3>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const key = match[1] || match[3];
    const value = match[2] || match[4];
    result[key] = value;
  }
  return result;
}

/**
 * 创建微信支付订单 (NATIVE扫码支付)
 * @param orderNo - 商户订单号 (用作out_trade_no)
 * @param amount - 金额(元)
 * @param description - 商品描述
 * @param clientIp - 客户端IP
 */
export async function createWechatPayment(
  orderNo: string,
  amount: number,
  description: string,
  clientIp: string
) {
  const nonceStr = generateNonceStr();

  const paymentData: Record<string, any> = {
    appid: WECHAT_CONFIG.appId,
    mch_id: WECHAT_CONFIG.mchId,
    nonce_str: nonceStr,
    body: description,
    out_trade_no: orderNo,
    total_fee: Math.round(amount * 100), // 转换为分
    spbill_create_ip: clientIp,
    notify_url: WECHAT_CONFIG.notifyUrl,
    trade_type: 'NATIVE', // 扫码支付
  };

  // 生成签名
  const sign = generateWechatSignature(paymentData);
  paymentData.sign = sign;

  const xmlBody = buildXml(paymentData);

  try {
    console.log('[WechatPay] Creating payment for order:', orderNo, 'amount:', amount);
    const response = await fetch('https://api.mch.weixin.qq.com/pay/unifiedorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xmlBody,
    });

    const responseText = await response.text();
    console.log('[WechatPay] Response:', responseText.substring(0, 500));
    const result = parseXml(responseText);

    if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
      return {
        success: true as const,
        prepayId: result.prepay_id,
        codeUrl: result.code_url, // 扫码支付的二维码链接
        orderNo,
        amount,
      };
    } else {
      console.error('[WechatPay] Failed:', result.return_msg, result.err_code_des);
      return {
        success: false as const,
        error: result.err_code_des || result.return_msg || '支付请求失败',
      };
    }
  } catch (error) {
    console.error('[WechatPay] Request error:', error);
    return {
      success: false as const,
      error: '支付请求异常',
    };
  }
}

/**
 * 验证微信支付回调签名
 */
export function verifyWechatCallback(data: Record<string, any>): boolean {
  const sign = data.sign;
  const dataCopy = { ...data };
  delete dataCopy.sign;
  const calculatedSign = generateWechatSignature(dataCopy);
  return sign === calculatedSign;
}

/**
 * 处理微信支付回调
 * 注意：out_trade_no 是 orderNo，不是数据库id
 */
export async function handleWechatCallback(xmlData: string) {
  try {
    const data = parseXml(xmlData);

    // 验证签名
    if (!verifyWechatCallback(data)) {
      console.error('[WechatPay] Callback signature verification failed');
      return { success: false, message: '签名验证失败' };
    }

    if (data.return_code !== 'SUCCESS' || data.result_code !== 'SUCCESS') {
      return { success: false, message: data.err_code_des || data.return_msg || '支付失败' };
    }

    const orderNo = data.out_trade_no;
    const transactionId = data.transaction_id;

    console.log('[WechatPay] Callback received for order:', orderNo, 'transaction:', transactionId);

    // 通过orderNo查找订单并更新状态
    const db = await getDb();
    if (db) {
      await db
        .update(orders)
        .set({
          status: 'paid',
          paymentId: transactionId,
          paidAt: new Date(),
        })
        .where(eq(orders.orderNo, orderNo));
    }

    return { success: true, message: '支付成功' };
  } catch (error) {
    console.error('[WechatPay] Callback processing error:', error);
    return { success: false, message: '处理回调异常' };
  }
}

/**
 * 查询微信支付订单状态
 */
export async function queryWechatOrder(orderNo: string) {
  const queryData: Record<string, any> = {
    appid: WECHAT_CONFIG.appId,
    mch_id: WECHAT_CONFIG.mchId,
    out_trade_no: orderNo,
    nonce_str: generateNonceStr(),
  };

  const sign = generateWechatSignature(queryData);
  queryData.sign = sign;

  const xmlBody = buildXml(queryData);

  try {
    const response = await fetch('https://api.mch.weixin.qq.com/pay/orderquery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xmlBody,
    });

    const responseText = await response.text();
    const result = parseXml(responseText);

    if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
      return {
        success: true as const,
        tradeState: result.trade_state,
        transactionId: result.transaction_id,
      };
    } else {
      return {
        success: false as const,
        error: result.err_code_des || '查询失败',
      };
    }
  } catch (error) {
    console.error('[WechatPay] Query error:', error);
    return {
      success: false as const,
      error: '查询异常',
    };
  }
}
