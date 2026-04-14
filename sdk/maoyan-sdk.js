/**
 * MaoYan Universal SDK v1.0
 * 跨平台 SSO + 积分钱包 SDK
 *
 * 使用方法（HTML 静态站）：
 *   <script src="https://maoyan.vip/sdk/maoyan-sdk.js"></script>
 *   <script>
 *     MaoYan.init({ platform: 'whalepictures' });
 *   </script>
 *
 * 使用方法（React 项目）：
 *   import MaoYan from '@/lib/maoyan-sdk'
 *   MaoYan.init({ platform: 'daiizen' })
 *
 * 数据库：fczherphuixpdjuevzsh.supabase.co（所有平台共享）
 */

(function (global) {
  'use strict';

  // ─── 配置 ──────────────────────────────────────────────────────────────────
  const SUPABASE_URL = 'https://fczherphuixpdjuevzsh.supabase.co';
  const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjemhlcnBodWl4cGRqdWV2enNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDM0OTEsImV4cCI6MjA4OTIxOTQ5MX0.t7FSUWbWDsKIcU-m-1ul65aVVu87RZn0zHleqccDEo4';
  const MAOYAN_HUB_URL = 'https://maoyan.vip';
  const SDK_VERSION = '1.0.0';

  // 本地 storage key
  const TOKEN_KEY = 'maoyan_access_token';
  const REFRESH_KEY = 'maoyan_refresh_token';
  const USER_KEY = 'maoyan_user';

  // ─── 内部工具 ───────────────────────────────────────────────────────────────
  function storage() {
    try {
      return window.localStorage;
    } catch {
      return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
    }
  }

  async function supabaseRequest(path, options = {}) {
    const token = storage().getItem(TOKEN_KEY);
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const res = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description || err.message || `HTTP ${res.status}`);
    }
    return res.json().catch(() => null);
  }

  // ─── SDK 核心 ───────────────────────────────────────────────────────────────
  const MaoYan = {
    _platform: 'unknown',
    _user: null,
    _listeners: {},

    /**
     * 初始化 SDK
     * @param {object} opts
     * @param {string} opts.platform  - 平台标识：'daiizen'|'mcmamoo'|'whalepictures'|'umonfrost'|'lacelle1802'|'maoyan'
     * @param {string} [opts.supabaseUrl]    - 覆盖 Supabase URL（可选）
     * @param {string} [opts.supabaseKey]    - 覆盖 Anon Key（可选）
     * @param {string} [opts.redirectTo]     - 登录后跳转 URL（默认当前页）
     */
    init(opts = {}) {
      this._platform = opts.platform || 'unknown';
      if (opts.supabaseUrl) window._maoyan_supabase_url = opts.supabaseUrl;
      if (opts.supabaseKey) window._maoyan_supabase_key = opts.supabaseKey;

      // 恢复本地 session
      const savedUser = storage().getItem(USER_KEY);
      if (savedUser) {
        try {
          this._user = JSON.parse(savedUser);
        } catch (_) {}
      }

      // 处理 Supabase OAuth 回调（URL hash 含 access_token）
      this._handleOAuthCallback();

      console.log(`[MaoYan SDK v${SDK_VERSION}] platform=${this._platform} initialized`);
      return this;
    },

    _handleOAuthCallback() {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash;
      if (!hash.includes('access_token=')) return;

      const params = new URLSearchParams(hash.replace('#', ''));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken) {
        storage().setItem(TOKEN_KEY, accessToken);
        if (refreshToken) storage().setItem(REFRESH_KEY, refreshToken);

        // 清除 URL hash
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }

        // 获取用户信息
        this.getUser().then(user => {
          if (user) this._emit('signIn', user);
        });
      }
    },

    // ── 认证方法 ──────────────────────────────────────────────────────────────

    /**
     * 邮箱密码登录
     */
    async signInWithEmail(email, password) {
      const data = await supabaseRequest('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.access_token) {
        storage().setItem(TOKEN_KEY, data.access_token);
        storage().setItem(REFRESH_KEY, data.refresh_token);
        const user = await this.getUser();
        this._trackPlatformSession();
        this._emit('signIn', user);
        return user;
      }
      throw new Error(data.error_description || '登录失败');
    },

    /**
     * 邮箱密码注册
     */
    async signUpWithEmail(email, password, metadata = {}) {
      const data = await supabaseRequest('/auth/v1/signup', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          data: {
            ...metadata,
            registered_platform: this._platform,
          },
        }),
      });
      if (data.user) {
        if (data.access_token) {
          storage().setItem(TOKEN_KEY, data.access_token);
          storage().setItem(REFRESH_KEY, data.refresh_token);
        }
        this._emit('signUp', data.user);
        return data.user;
      }
      throw new Error(data.error_description || '注册失败');
    },

    /**
     * Google OAuth 登录（重定向方式）
     */
    signInWithGoogle(redirectTo) {
      const redirect = redirectTo || window.location.href;
      const url =
        `${SUPABASE_URL}/auth/v1/authorize?` +
        `provider=google&redirect_to=${encodeURIComponent(redirect)}`;
      window.location.href = url;
    },

    /**
     * 退出登录
     */
    async signOut() {
      try {
        await supabaseRequest('/auth/v1/logout', { method: 'POST' });
      } catch (_) {}
      storage().removeItem(TOKEN_KEY);
      storage().removeItem(REFRESH_KEY);
      storage().removeItem(USER_KEY);
      this._user = null;
      this._emit('signOut', null);
    },

    /**
     * 获取当前用户（含积分钱包）
     */
    async getUser() {
      const token = storage().getItem(TOKEN_KEY);
      if (!token) return null;

      try {
        const authUser = await supabaseRequest('/auth/v1/user');
        if (!authUser?.id) return null;

        // 获取 unified_profiles
        const profiles = await supabaseRequest(
          `/rest/v1/unified_profiles?id=eq.${authUser.id}&select=*`
        );
        const profile = profiles?.[0] || {};

        // 获取钱包
        const wallets = await supabaseRequest(
          `/rest/v1/maoyan_wallets?user_id=eq.${authUser.id}&select=*`
        );
        const wallet = wallets?.[0] || { mao_balance: 0, total_earned: 0 };

        const user = {
          id: authUser.id,
          email: authUser.email,
          displayName: profile.display_name || authUser.user_metadata?.full_name,
          avatarUrl: profile.avatar_url || authUser.user_metadata?.avatar_url,
          referralCode: profile.referral_code,
          wallet: {
            maoBalance: parseFloat(wallet.mao_balance) || 0,
            totalEarned: parseFloat(wallet.total_earned) || 0,
            totalSpent: parseFloat(wallet.total_spent) || 0,
          },
        };

        this._user = user;
        storage().setItem(USER_KEY, JSON.stringify(user));
        return user;
      } catch (err) {
        console.warn('[MaoYan SDK] getUser failed:', err.message);
        return null;
      }
    },

    /**
     * 当前是否已登录
     */
    isLoggedIn() {
      return !!storage().getItem(TOKEN_KEY);
    },

    /**
     * 获取 Access Token（供后端 API 调用使用）
     */
    getAccessToken() {
      return storage().getItem(TOKEN_KEY);
    },

    // ── 积分方法 ──────────────────────────────────────────────────────────────

    /**
     * 获取积分余额
     */
    async getMaoBalance() {
      const user = await this.getUser();
      return user?.wallet?.maoBalance || 0;
    },

    /**
     * 获取积分流水
     */
    async getTransactions(limit = 20, offset = 0) {
      const token = storage().getItem(TOKEN_KEY);
      if (!token) return [];

      const authUser = await supabaseRequest('/auth/v1/user').catch(() => null);
      if (!authUser?.id) return [];

      const data = await supabaseRequest(
        `/rest/v1/mao_transactions?user_id=eq.${authUser.id}&order=created_at.desc&limit=${limit}&offset=${offset}`
      );
      return data || [];
    },

    /**
     * 提交平台订单（触发 10% 积分返还）
     * 此方法需要后端代理调用（前端只能查询自己的数据）
     * @param {string} orderId - 平台内部订单 ID
     * @param {number} amountUsd - 订单金额（USD）
     * @param {string} [currency] - 货币
     */
    async reportOrder(orderId, amountUsd, currency = 'USD') {
      if (!this.isLoggedIn()) throw new Error('请先登录');
      const token = storage().getItem(TOKEN_KEY);

      // 通过 maoyan.vip 的后端 API 代理提交订单
      const res = await fetch(`${MAOYAN_HUB_URL}/api/orders/cross-platform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          platform: this._platform,
          orderId,
          amountUsd,
          currency,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '提交订单失败');
      }
      const result = await res.json();
      this._emit('orderReported', result);
      return result;
    },

    // ── UI 工具 ───────────────────────────────────────────────────────────────

    /**
     * 渲染登录按钮到目标容器
     * @param {string} containerId - DOM 元素 ID
     * @param {object} opts - { redirectTo, theme: 'dark'|'light', showBalance }
     */
    renderWidget(containerId, opts = {}) {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`[MaoYan SDK] 找不到容器 #${containerId}`);
        return;
      }

      const theme = opts.theme || 'dark';
      const colors = theme === 'dark'
        ? { bg: '#1a1a1a', text: '#f5f0e8', accent: '#C9A84C', border: '#333' }
        : { bg: '#fff', text: '#1a1a1a', accent: '#C9A84C', border: '#e5e5e5' };

      const render = async () => {
        if (this.isLoggedIn()) {
          const user = await this.getUser().catch(() => null);
          if (user) {
            container.innerHTML = `
              <div id="maoyan-widget" style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;background:${colors.bg};border:1px solid ${colors.border};border-radius:6px;cursor:pointer;font-family:sans-serif;" onclick="document.getElementById('maoyan-menu').style.display = document.getElementById('maoyan-menu').style.display==='none'?'block':'none'">
                ${user.avatarUrl ? `<img src="${user.avatarUrl}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">` : `<div style="width:28px;height:28px;border-radius:50%;background:${colors.accent};display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;">${(user.displayName||user.email||'U')[0].toUpperCase()}</div>`}
                <div style="text-align:left;">
                  <div style="font-size:12px;color:${colors.text};font-weight:600;">${user.displayName || user.email?.split('@')[0] || '用户'}</div>
                  ${opts.showBalance !== false ? `<div style="font-size:11px;color:${colors.accent};">🪙 ${user.wallet.maoBalance.toLocaleString()} MAO</div>` : ''}
                </div>
              </div>
              <div id="maoyan-menu" style="display:none;position:absolute;top:calc(100% + 4px);right:0;background:${colors.bg};border:1px solid ${colors.border};border-radius:8px;padding:8px 0;min-width:180px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.2);">
                <div style="padding:8px 16px;font-size:11px;color:#888;border-bottom:1px solid ${colors.border};">积分余额：${user.wallet.maoBalance.toLocaleString()} MAO</div>
                <a href="${MAOYAN_HUB_URL}" target="_blank" style="display:block;padding:8px 16px;font-size:13px;color:${colors.text};text-decoration:none;" onmouseover="this.style.background='${colors.accent}22'" onmouseout="this.style.background='transparent'">🪙 积分钱包</a>
                <a href="${MAOYAN_HUB_URL}/profile" target="_blank" style="display:block;padding:8px 16px;font-size:13px;color:${colors.text};text-decoration:none;" onmouseover="this.style.background='${colors.accent}22'" onmouseout="this.style.background='transparent'">👤 个人中心</a>
                <div style="border-top:1px solid ${colors.border};margin-top:4px;"></div>
                <button onclick="MaoYan.signOut().then(()=>location.reload())" style="display:block;width:100%;padding:8px 16px;font-size:13px;color:#e55;text-align:left;background:none;border:none;cursor:pointer;" onmouseover="this.style.background='#e5555522'" onmouseout="this.style.background='transparent'">退出登录</button>
              </div>
            `;
            // 设置容器 position 使菜单定位正常
            container.style.position = 'relative';
            container.style.display = 'inline-block';
            return;
          }
        }

        // 未登录：显示登录按钮
        const redirectTo = opts.redirectTo || window.location.href;
        container.innerHTML = `
          <div style="display:inline-flex;gap:8px;font-family:sans-serif;">
            <button onclick="MaoYan.showLoginModal()" style="padding:7px 16px;background:${colors.accent};color:#1a1a1a;border:none;border-radius:5px;cursor:pointer;font-size:13px;font-weight:600;">登录 / 注册</button>
          </div>
        `;
      };

      render();
      // 监听登录状态变化后重新渲染
      this.on('signIn', render);
      this.on('signOut', render);
    },

    /**
     * 弹出登录模态框
     */
    showLoginModal(opts = {}) {
      const existing = document.getElementById('maoyan-login-modal');
      if (existing) existing.remove();

      const redirectTo = opts.redirectTo || window.location.href;
      const modal = document.createElement('div');
      modal.id = 'maoyan-login-modal';
      modal.innerHTML = `
        <div style="position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center;">
          <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:32px;width:360px;max-width:90vw;font-family:sans-serif;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
              <h2 style="color:#f5f0e8;font-size:18px;margin:0;">🐱 MaoYan 账户</h2>
              <button onclick="document.getElementById('maoyan-login-modal').remove()" style="background:none;border:none;color:#888;cursor:pointer;font-size:20px;">✕</button>
            </div>
            <p style="color:#888;font-size:12px;margin:0 0 20px;">一个账号，畅游所有平台</p>

            <!-- Google 登录 -->
            <button onclick="MaoYan.signInWithGoogle('${redirectTo}')" style="width:100%;padding:11px;background:#fff;color:#333;border:1px solid #ddd;border-radius:6px;cursor:pointer;font-size:14px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:16px;">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              使用 Google 登录
            </button>

            <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
              <div style="flex:1;height:1px;background:#333;"></div>
              <span style="color:#666;font-size:12px;">或邮箱登录</span>
              <div style="flex:1;height:1px;background:#333;"></div>
            </div>

            <div id="maoyan-auth-form">
              <input id="maoyan-email" type="email" placeholder="邮箱地址" style="width:100%;padding:10px 12px;background:#111;border:1px solid #333;border-radius:6px;color:#f5f0e8;font-size:14px;margin-bottom:10px;box-sizing:border-box;">
              <input id="maoyan-password" type="password" placeholder="密码" style="width:100%;padding:10px 12px;background:#111;border:1px solid #333;border-radius:6px;color:#f5f0e8;font-size:14px;margin-bottom:16px;box-sizing:border-box;">
              <button id="maoyan-submit" onclick="MaoYan._handleEmailLogin()" style="width:100%;padding:11px;background:#C9A84C;color:#1a1a1a;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:700;margin-bottom:12px;">登录</button>
              <div style="text-align:center;">
                <span style="color:#888;font-size:12px;">没有账号？</span>
                <button onclick="MaoYan._toggleRegister()" style="background:none;border:none;color:#C9A84C;font-size:12px;cursor:pointer;text-decoration:underline;">立即注册</button>
              </div>
            </div>

            <p id="maoyan-auth-hint" style="color:#e55;font-size:12px;margin:8px 0 0;min-height:16px;"></p>
            <p style="color:#555;font-size:11px;margin:16px 0 0;text-align:center;">注册即代表同意 <a href="${MAOYAN_HUB_URL}/terms" style="color:#C9A84C;">服务条款</a></p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    _isRegisterMode: false,

    _toggleRegister() {
      this._isRegisterMode = !this._isRegisterMode;
      const btn = document.getElementById('maoyan-submit');
      const hint = document.querySelector('#maoyan-auth-form div:last-child');
      if (btn) btn.textContent = this._isRegisterMode ? '注册' : '登录';
      if (btn) btn.onclick = this._isRegisterMode ? () => MaoYan._handleEmailRegister() : () => MaoYan._handleEmailLogin();
    },

    async _handleEmailLogin() {
      const email = document.getElementById('maoyan-email')?.value;
      const password = document.getElementById('maoyan-password')?.value;
      const hint = document.getElementById('maoyan-auth-hint');
      if (hint) hint.textContent = '';
      if (!email || !password) {
        if (hint) hint.textContent = '请填写邮箱和密码';
        return;
      }
      const btn = document.getElementById('maoyan-submit');
      if (btn) btn.disabled = true;
      try {
        await this.signInWithEmail(email, password);
        document.getElementById('maoyan-login-modal')?.remove();
      } catch (err) {
        if (hint) hint.textContent = err.message || '登录失败，请检查邮箱和密码';
      } finally {
        if (btn) btn.disabled = false;
      }
    },

    async _handleEmailRegister() {
      const email = document.getElementById('maoyan-email')?.value;
      const password = document.getElementById('maoyan-password')?.value;
      const hint = document.getElementById('maoyan-auth-hint');
      if (hint) hint.textContent = '';
      if (!email || !password) {
        if (hint) hint.textContent = '请填写邮箱和密码';
        return;
      }
      if (password.length < 6) {
        if (hint) hint.textContent = '密码至少 6 位';
        return;
      }
      const btn = document.getElementById('maoyan-submit');
      if (btn) btn.disabled = true;
      try {
        await this.signUpWithEmail(email, password);
        if (hint) hint.textContent = '';
        document.getElementById('maoyan-auth-hint').style.color = '#4CAF50';
        document.getElementById('maoyan-auth-hint').textContent = '注册成功！请查收验证邮件';
      } catch (err) {
        if (hint) hint.textContent = err.message || '注册失败';
      } finally {
        if (btn) btn.disabled = false;
      }
    },

    // ── 内部方法 ──────────────────────────────────────────────────────────────

    async _trackPlatformSession() {
      const token = storage().getItem(TOKEN_KEY);
      if (!token) return;
      try {
        const authUser = await supabaseRequest('/auth/v1/user');
        if (!authUser?.id) return;
        await supabaseRequest('/rest/v1/platform_sessions', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            user_id: authUser.id,
            platform: this._platform,
            user_agent: navigator.userAgent,
            last_seen_at: new Date().toISOString(),
          }),
        });
      } catch (_) {}
    },

    // ── 事件系统 ──────────────────────────────────────────────────────────────

    on(event, handler) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(handler);
      return this;
    },

    off(event, handler) {
      if (this._listeners[event]) {
        this._listeners[event] = this._listeners[event].filter(h => h !== handler);
      }
      return this;
    },

    _emit(event, data) {
      (this._listeners[event] || []).forEach(h => {
        try { h(data); } catch (_) {}
      });
    },
  };

  // 暴露到全局
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaoYan;
  } else {
    global.MaoYan = MaoYan;
  }
})(typeof window !== 'undefined' ? window : global);
