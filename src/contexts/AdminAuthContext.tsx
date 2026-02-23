import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'dos' | 'teacher';
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
  // Fetch role — must exist due to trigger, but handle gracefully
  const { data: roleRow, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', authUser.id)
    .maybeSingle();

  if (roleError) {
    console.error('Failed to fetch role:', roleError);
    return null;
  }

  // Normalize to lowercase for safety
  const rawRole = roleRow?.role;
  const role: 'dos' | 'teacher' =
    typeof rawRole === 'string' && rawRole.toLowerCase() === 'dos' ? 'dos' : 'teacher';

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', authUser.id)
    .maybeSingle();

  return {
    id: authUser.id,
    email: authUser.email || '',
    name: profile?.full_name || authUser.email || '',
    role,
  };
}

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        const adminUser = await fetchAdminUser(session.user);
        if (!cancelled) setUser(adminUser);
      } else {
        if (!cancelled) setUser(null);
      }
      if (!cancelled) setLoading(false);
    });

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        const adminUser = await fetchAdminUser(session.user);
        if (!cancelled) setUser(adminUser);
      }
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    // Role will be loaded via onAuthStateChange
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
