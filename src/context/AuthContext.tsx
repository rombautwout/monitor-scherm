import React, { createContext, useContext, useState } from 'react';

export type Role = 'superadmin' | 'user';

export type User = { username: string; role: Role };

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    const uname = username.trim().toLowerCase();
    const pwd = password.trim();
    if (uname === 'admin' && pwd === 'admin2005') {
      setUser({ username: 'admin', role: 'superadmin' });
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
