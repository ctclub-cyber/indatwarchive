import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AdminUser {
  email: string;
  role: 'dos' | 'teacher';
  name: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};

// NOTE: This is a placeholder auth system for UI demonstration.
// Real authentication must be implemented with Lovable Cloud (Supabase Auth)
// and server-side role validation. Never rely on client-side auth for production.
const DEMO_ACCOUNTS = [
  { email: 'dos@school.edu', password: 'admin123', role: 'dos' as const, name: 'Director of Studies' },
  { email: 'teacher@school.edu', password: 'teacher123', role: 'teacher' as const, name: 'Mr. Kamanzi' },
];

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 800));
    const found = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (found) {
      setUser({ email: found.email, role: found.role, name: found.name });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
