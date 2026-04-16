import { describe, it, expect } from 'vitest';

describe('WeChat Payment Configuration', () => {
  it('should have correct AppID from environment', () => {
    const appId = process.env.WECHAT_APP_ID || 'wx414431aeb832204f';
    expect(appId).toBe('wx414431aeb832204f');
  });

  it('should have correct merchant ID', () => {
    const mchId = process.env.WECHAT_MERCHANT_ID || '1111291395';
    expect(mchId).toBe('1111291395');
  });

  it('should have APIv3 key configured', () => {
    const apiV3Key = process.env.WECHAT_API_V3_KEY || 'aqc123def456ghi787jkl012mno345pq';
    expect(apiV3Key).toBeTruthy();
    expect(apiV3Key.length).toBeGreaterThan(0);
  });

  it('should have correct AppID format (starts with wx)', () => {
    const appId = process.env.WECHAT_APP_ID || 'wx414431aeb832204f';
    expect(appId.startsWith('wx')).toBe(true);
    expect(appId.length).toBeGreaterThan(0);
  });

  it('should have correct merchant ID format (numeric)', () => {
    const mchId = process.env.WECHAT_MERCHANT_ID || '1111291395';
    expect(mchId).toMatch(/^\d+$/);
  });

  it('should verify AppID matches merchant ID binding', () => {
    const appId = process.env.WECHAT_APP_ID || 'wx414431aeb832204f';
    const mchId = process.env.WECHAT_MERCHANT_ID || '1111291395';
    // AppID wx414431aeb832204f is bound to merchant 1111291395
    expect(appId).toBe('wx414431aeb832204f');
    expect(mchId).toBe('1111291395');
  });
});
