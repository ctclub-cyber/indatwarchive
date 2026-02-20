import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Download, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = [
  'hsl(215, 60%, 22%)', 'hsl(42, 92%, 55%)', 'hsl(152, 60%, 40%)',
  'hsl(200, 80%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(38, 92%, 50%)',
];

const AdminAnalytics = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ total: 0, month: 0, week: 0, today: 0 });
  const [topDocs, setTopDocs] = useState<{ name: string; downloads: number }[]>([]);
  const [bySubject, setBySubject] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; downloads: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [docCount, setDocCount] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      const { data: docs } = await supabase
        .from('documents')
        .select('name, downloads, subject, created_at')
        .is('deleted_at', null);

      if (!docs || docs.length === 0) {
        setDocCount(0);
        setLoading(false);
        return;
      }

      setDocCount(docs.length);
      const total = docs.reduce((sum, d) => sum + (d.downloads || 0), 0);

      const sorted = [...docs].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5);
      setTopDocs(sorted.map(d => ({ name: d.name, downloads: d.downloads || 0 })));

      const subjectMap = new Map<string, number>();
      docs.forEach(d => {
        const s = d.subject || 'Other';
        subjectMap.set(s, (subjectMap.get(s) || 0) + (d.downloads || 0));
      });
      setBySubject(Array.from(subjectMap.entries()).map(([name, value]) => ({ name, value })));

      const months: { month: string; downloads: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleString('default', { month: 'short' });
        const count = docs.filter(doc => {
          const cd = new Date(doc.created_at);
          return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
        }).length;
        months.push({ month: label, downloads: count });
      }
      setMonthlyData(months);

      setStats({ total, month: 0, week: 0, today: 0 });

      // Download log stats
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const { count: monthCount } = await supabase.from('download_logs').select('*', { count: 'exact', head: true }).gte('downloaded_at', startOfMonth);
        const { count: weekCount } = await supabase.from('download_logs').select('*', { count: 'exact', head: true }).gte('downloaded_at', startOfWeek.toISOString());
        const { count: dayCount } = await supabase.from('download_logs').select('*', { count: 'exact', head: true }).gte('downloaded_at', startOfDay.toISOString());

        setStats({ total, month: monthCount || 0, week: weekCount || 0, today: dayCount || 0 });
      } catch {
        // download_logs may fail for non-DOS users
      }

      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const statCards = [
    { label: t('analytics.totalDownloads'), value: stats.total, icon: Download },
    { label: t('analytics.thisMonth'), value: stats.month, icon: TrendingUp },
    { label: t('analytics.thisWeek'), value: stats.week, icon: BarChart3 },
    { label: t('analytics.today'), value: stats.today, icon: FileText },
  ];

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <AlertCircle className="h-8 w-8 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">{t('analytics.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('analytics.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 card-shadow">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <s.icon className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{loading ? '—' : s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {docCount === 0 && !loading && (
        <div className="rounded-xl border border-border bg-card p-8 card-shadow text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <h3 className="font-serif text-lg font-semibold text-foreground">No data yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Upload documents from the Documents page to see analytics here.</p>
        </div>
      )}

      {docCount > 0 && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 card-shadow">
              <h2 className="font-serif text-lg font-bold text-foreground mb-4">{t('analytics.downloadsOverTime')}</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip />
                    <Bar dataKey="downloads" fill="hsl(215, 60%, 22%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 card-shadow">
              <h2 className="font-serif text-lg font-bold text-foreground mb-4">{t('analytics.bySubject')}</h2>
              <div className="h-64">
                {bySubject.length > 0 && bySubject.some(s => s.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={bySubject} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                        {bySubject.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message="No downloads recorded yet" />
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card card-shadow">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-serif text-lg font-bold text-foreground">{t('analytics.topDocuments')}</h2>
            </div>
            <div className="divide-y divide-border">
              {topDocs.length === 0 ? (
                <div className="px-5 py-8 text-center text-muted-foreground text-sm">No documents yet</div>
              ) : (
                topDocs.map((d, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                      <span className="text-sm font-medium text-foreground">{d.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{d.downloads} downloads</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
