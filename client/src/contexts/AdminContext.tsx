import React, { createContext, useContext, useEffect, useState } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);
const ADMIN_STORAGE_KEY = 'zhengyuan_admin_mode';

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminContext');
  }
  return context;
};

export default function AdminContextProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdminState] = useState(false);

  useEffect(() => {
    // 首先检查sessionStorage中是否已有管理员状态
    const storedAdmin = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (storedAdmin === 'true') {
      setIsAdminState(true);
      return;
    }

    // 检查URL参数
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin');
    const keyParam = params.get('key');

    // 简单的管理员验证：admin=true&key=admin123
    if (adminParam === 'true' && keyParam === 'admin123') {
      setIsAdminState(true);
      // 持久化到sessionStorage
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      // 清理URL参数，避免暴露
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const setIsAdmin = (value: boolean) => {
    setIsAdminState(value);
    if (value) {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  };

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}
