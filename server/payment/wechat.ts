import crypto from 'crypto';
import { getDb } from '../db';
import { eq } from 'drizzle-orm';
import { orders } from '../../drizzle/schema';

/**
 * 微信支付配置
 */
const WECHAT_CONFIG = {
  mchId: process.env.WECHAT_MERCHANT_ID || '',
  apiKey: process.env.WECHAT_API_KEY || '',
  appId: process.env.WECHAT_APP_ID || '',
  notifyUrl: process.env.WECHAT_NOTIFY_URL || '',
};

/**
 * 生成微信支付签名
 */
export function generateWechatSignature(data: Record<string, any>): string {
  const keys = Object.keys(data).sort();
  let str = '';
  
  for (const key of keys) {
    if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
      str += `${key}=${data[key]}&`;
    }
  }
  
  str += `key=${WECHAT_CONFIG.apiKey}`;
  
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
 * 创建微信支付订单
 */
export async function createWechatPayment(
  orderId: string,
  amount: number,
  description: string,
  clientIp: string
) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = generateNonceStr();
  
  const paymentData = {
    appid: WECHAT_CONFIG.appId,
    mch_id: WECHAT_CONFIG.mchId,
    nonce_str: nonceStr,
    body: description,
    out_trade_no: orderId,
    total_fee: Math.round(amount * 100), // 转换为分
    spbill_create_ip: clientIp,
    notify_url: WECHAT_CONFIG.notifyUrl,
    trade_type: 'H5',
    scene_info: JSON.stringify({
      h5_info: {
        type: 'WECHAT_PAY',
        client_ip: clientIp,
      },
    }),
  };
  
  // 生成签名
  const sign = generateWechatSignature(paymentData);
  (paymentData as any).sign = sign;
  
  // 构建XML请求体
  const xmlBody = buildXml(paymentData);
  
  try {
    // 调用微信支付API
    const response = await fetch('https://api.mch.weixin.qq.com/pay/unifiedorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
      },
      body: xmlBody,
    });
    
    const responseText = await response.text();
    const result = parseXml(responseText);
    
    if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
      return {
        success: true,
        prepayId: result.prepay_id,
        codeUrl: result.code_url,
      };
    } else {
      return {
        success: false,
        error: result.err_code_des || '支付请求失败',
      };
    }
  } catch (error) {
    console.error('微信支付请求失败:', error);
    return {
      success: false,
      error: '支付请求异常',
    };
  }
}

/**
 * 验证微信支付回调签名
 */
export function verifyWechatCallback(data: Record<string, any>): boolean {
  const sign = data.sign;
  delete data.sign;
  
  const calculatedSign = generateWechatSignature(data);
  
  return sign === calculatedSign;
}

/**
 * 处理微信支付回调
 */
export async function handleWechatCallback(xmlData: string) {
  try {
    const data = parseXml(xmlData);
    
    // 验证签名
    if (!verifyWechatCallback(data)) {
      return {
        success: false,
        message: '签名验证失败',
      };
    }
    
    // 检查支付状态
    if (data.return_code !== 'SUCCESS') {
      return {
        success: false,
        message: data.return_msg,
      };
    }
    
    if (data.result_code !== 'SUCCESS') {
      return {
        success: false,
        message: data.err_code_des,
      };
    }
    
    const orderId = data.out_trade_no;
    const transactionId = data.transaction_id;
    
    // 更新订单状态
    const db = await getDb();
    if (db) {
      await db
        .update(orders)
        .set({
          status: 'paid',
          paidAt: new Date(),
        })
        .where(eq(orders.id, orderId));
    }
    
    return {
      success: true,
      message: '支付成功',
    };
  } catch (error) {
    console.error('处理微信支付回调失败:', error);
    return {
      success: false,
      message: '处理回调异常',
    };
  }
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
  
  // 简单的XML解析
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
 * 查询微信支付订单状态
 */
export async function queryWechatOrder(orderId: string) {
  const queryData = {
    appid: WECHAT_CONFIG.appId,
    mch_id: WECHAT_CONFIG.mchId,
    out_trade_no: orderId,
    nonce_str: generateNonceStr(),
  };
  
  const sign = generateWechatSignature(queryData);
  (queryData as any).sign = sign;
  
  const xmlBody = buildXml(queryData);
  
  try {
    const response = await fetch('https://api.mch.weixin.qq.com/pay/orderquery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
      },
      body: xmlBody,
    });
    
    const responseText = await response.text();
    const result = parseXml(responseText);
    
    if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
      return {
        success: true,
        tradeState: result.trade_state,
        transactionId: result.transaction_id,
      };
    } else {
      return {
        success: false,
        error: result.err_code_des || '查询失败',
      };
    }
  } catch (error) {
    console.error('查询微信支付订单失败:', error);
    return {
      success: false,
      error: '查询异常',
    };
  }
}
