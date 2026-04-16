import React, { createContext, useContext, useEffect, useState } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminContext');
  }
  return context;
};

export default function AdminContextProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 检查URL参数
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin');
    const keyParam = params.get('key');

    // 简单的管理员验证：admin=true&key=admin123
    if (adminParam === 'true' && keyParam === 'admin123') {
      setIsAdmin(true);
      // 清理URL参数，避免暴露
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}
