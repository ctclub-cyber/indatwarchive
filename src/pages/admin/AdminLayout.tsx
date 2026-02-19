import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import {
  LayoutDashboard, FileText, FolderTree, CheckCircle, Users,
  BarChart3, Trash2, LogOut, GraduationCap, Bell, ChevronLeft,
  Sun, Moon, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminLayout = () => {
  const { isAuthenticated, user, logout } = useAdminAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: t('admin.dashboard'), icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: t('admin.documents'), icon: FileText, href: '/admin/documents' },
    { label: t('admin.folders'), icon: FolderTree, href: '/admin/folders' },
    { label: t('admin.approvals'), icon: CheckCircle, href: '/admin/approvals', badge: 3 },
    { label: t('admin.users'), icon: Users, href: '/admin/users' },
    { label: t('admin.analytics'), icon: BarChart3, href: '/admin/analytics' },
    { label: t('admin.recycleBin'), icon: Trash2, href: '/admin/trash' },
  ];

  if (!isAuthenticated) return <Navigate to="/admin" replace />;

  const switchLang = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex items-center gap-3 border-b border-sidebar-border p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-sidebar-foreground truncate">{t('admin.adminPanel')}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.name}</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => {
            const active = location.pathname === item.href;
            const restricted = user?.role !== 'dos' && ['Users', 'Analytics', 'Recycle Bin'].includes(item.label);
            // Check against English labels for role gating
            const restrictedKeys = ['/admin/users', '/admin/analytics', '/admin/trash'];
            const isRestricted = user?.role !== 'dos' && restrictedKeys.includes(item.href);
            if (isRestricted) return null;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge className="h-5 min-w-[20px] justify-center bg-sidebar-primary text-sidebar-primary-foreground text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('admin.backToPortal')}
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t('admin.signOut')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-6 py-3 header-shadow">
          <div className="lg:hidden flex items-center gap-2">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-serif font-bold text-sm">{t('admin.adminPanel')}</span>
            </Link>
          </div>

          {/* Mobile nav */}
          <nav className="flex items-center gap-1 overflow-x-auto lg:hidden">
            {navItems.slice(0, 4).map(item => {
              const active = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}
                  className={`shrink-0 rounded-md px-2 py-1 text-xs ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-foreground">
              {t('admin.welcomeBack', { name: user?.name })}
            </h2>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'dos' ? t('admin.dos') : t('admin.teacher')} · {user?.email}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => switchLang('en')}>
                  🇬🇧 English {i18n.language === 'en' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchLang('fr')}>
                  🇫🇷 Français {i18n.language === 'fr' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
