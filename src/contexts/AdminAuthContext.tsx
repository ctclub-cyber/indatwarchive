import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AdminUser {
  email: string;
  role: 'dos' | 'teacher';
  name: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};

async function fetchAdminUser(authUser: User): Promise<AdminUser | null> {
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', authUser.id);

  const role = (roles?.[0]?.role as 'dos' | 'teacher') || 'teacher';

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', authUser.id)
    .single();

  return {
    email: authUser.email || '',
    role,
    name: profile?.full_name || authUser.email || '',
  };
}

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const adminUser = await fetchAdminUser(session.user);
        setUser(adminUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Then check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const adminUser = await fetchAdminUser(session.user);
        setUser(adminUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Check your email to confirm your account.' };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
