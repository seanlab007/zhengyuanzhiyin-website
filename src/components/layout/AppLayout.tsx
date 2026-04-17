import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const SIDEBAR_W = 240

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const navLinks = [
    { path: '/', icon: '🔮', label: '功能总览' },
    { path: '/fortune/bazi', icon: '🗓️', label: '八字排盘' },
    { path: '/fortune/ziwei', icon: '🌌', label: '紫微斗数' },
    { path: '/fortune/marriage', icon: '💕', label: '姻缘测算' },
    { path: '/fortune/wealth', icon: '💰', label: '财运分析' },
    { path: '/fortune/name', icon: '🌸', label: '姓名测试' },
    { path: '/fortune/daily', icon: '✨', label: '每日运势' },
    { path: '/fortune/dayun', icon: '🌊', label: '大运流年' },
    { path: '/fortune/tarot', icon: '🎴', label: '塔罗占卜' },
  ]

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .apl-sidebar {
            display: flex !important;
            flex-direction: column;
            position: fixed;
            top: 0;
            left: 0;
            width: ${SIDEBAR_W}px;
            height: 100vh;
            overflow-y: auto;
            background: rgba(12,13,16,0.99);
            border-right: 1px solid rgba(255,255,255,0.08);
            z-index: 100;
          }
          .apl-content { margin-left: ${SIDEBAR_W}px; }
          .apl-main { padding: 28px 32px 60px 32px; }
          .apl-mobile-header { display: none !important; }
        }
        @media (max-width: 1023px) {
          .apl-sidebar { display: none !important; }
          .apl-content { margin-left: 0; }
          .apl-main    { padding: 12px 16px 24px 16px; }
          .apl-mobile-header {
            display: flex !important;
            position: sticky;
            top: 0;
            z-index: 200;
            background: rgba(12,13,16,0.97);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255,255,255,0.08);
            padding: 10px 16px;
            align-items: center;
            justify-content: space-between;
          }
        }
        .apl-footer {
          padding: 24px 0;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.05);
          margin-top: 40px;
        }
        .apl-footer-text {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color 0.2s;
        }
        .apl-footer-text:hover {
          color: rgba(255,255,255,0.7);
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="apl-sidebar" style={{ display: 'none' }}>
        <div style={{ padding: '24px 20px 20px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span style={{ fontSize: 28 }}>🔮</span>
            <div style={{ fontSize: 18, fontWeight: 900, background: 'linear-gradient(135deg,#c084fc,#f472b6,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>正缘指引</div>
          </Link>
        </div>
        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navLinks.map(item => {
            const active = isLinkActive(item.path)
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                background: active ? 'rgba(192, 132, 252, 0.1)' : 'transparent',
                border: active ? '1px solid rgba(192, 132, 252, 0.2)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: active ? 700 : 500, color: active ? '#c084fc' : 'var(--text2)' }}>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="apl-content" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        {/* Mobile Header */}
        <header className="apl-mobile-header" style={{ display: 'none' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ fontSize: 24 }}>🔮</span>
            <span style={{ fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg,#c084fc,#f472b6,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>正缘指引</span>
          </Link>
        </header>

        <main className="apl-main">
          {children}
          <footer className="apl-footer">
            <a 
              href="https://beian.miit.gov.cn/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="apl-footer-text"
            >
              淮安观正文化传媒有限公司 | 苏ICP备2026022694号-1 | <a href="https://beian.mps.gov.cn/" target="_blank" rel="noopener noreferrer" style={{color:'inherit',textDecoration:'underline'}}>公安联网备案</a>
            </a>
          </footer>
        </main>

        {/* Footer with ICP */}
        <footer style={{
          textAlign: 'center',
          padding: '20px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          marginTop: 40,
        }}>
          <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.8 }}>
            <span>淮安观正文化传媒有限公司</span>
            <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text3)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text2)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)' }}
            >苏ICP备2026022694号-1</a>
            <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
            <a
              href="https://beian.mps.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text3)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text2)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)' }}
            >公安联网备案</a>
          </p>
        </footer>
      </div>
    </>
  )
}
