import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Search, MoreVertical, Shield, UserCheck, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from '@/hooks/use-toast';

interface UserWithRole {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminUsers = () => {
  const { t } = useTranslation();
  const { user } = useAdminAuth();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const isDos = user?.role === 'dos';

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, email, created_at');

    if (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

    setUsers(
      (profiles || []).map(p => ({
        user_id: p.user_id,
        full_name: p.full_name,
        email: p.email,
        role: (roleMap.get(p.user_id) as string) || 'teacher',
        created_at: p.created_at,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'dos' ? 'teacher' : 'dos';
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Role updated', description: `User role changed to ${newRole}` });
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">{t('users.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('users.subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('users.searchUsers')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('users.name')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('users.email')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('users.role')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('users.joined')}</th>
              {isDos && <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">{t('users.actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">{t('common.loading')}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">{t('users.noUsers')}</td></tr>
            ) : (
              filtered.map(u => (
                <tr key={u.user_id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{u.full_name || 'Unnamed'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === 'dos' ? 'default' : 'secondary'} className="capitalize">
                      {u.role === 'dos' ? <Shield className="h-3 w-3 mr-1" /> : <UserCheck className="h-3 w-3 mr-1" />}
                      {u.role === 'dos' ? t('admin.dos') : t('admin.teacher')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  {isDos && (
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleRole(u.user_id, u.role)}>
                            <Shield className="h-4 w-4 mr-2" />{t('users.editRole')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
