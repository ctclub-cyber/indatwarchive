import { FileText, Download, Upload, Users, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { allDocuments } from '@/data/mockData';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const statCards = [
  { label: 'Total Documents', value: '12', icon: FileText, change: '+3 this month' },
  { label: 'Total Downloads', value: '3,022', icon: Download, change: '+245 this week' },
  { label: 'Pending Approvals', value: '3', icon: Clock, change: 'Requires action' },
  { label: 'Active Teachers', value: '8', icon: Users, change: '2 uploads today' },
];

const recentActivity = [
  { action: 'uploaded', user: 'Mr. Kamanzi', item: 'Mathematics Final Exam 2024.pdf', time: '2 hours ago', icon: Upload },
  { action: 'approved', user: 'DOS', item: 'Physics Paper 1 - Mechanics.pdf', time: '5 hours ago', icon: CheckCircle },
  { action: 'uploaded', user: 'Mrs. Uwimana', item: 'Chemistry Lab Report Template.docx', time: '1 day ago', icon: Upload },
  { action: 'rejected', user: 'DOS', item: 'Draft Notes (incomplete).pdf', time: '1 day ago', icon: AlertCircle },
  { action: 'downloaded', user: 'Student', item: 'Biology - Cell Division Slides.pptx', time: '2 days ago', icon: Download },
];

const pendingApprovals = allDocuments.slice(0, 3).map((d, i) => ({
  ...d,
  status: 'pending' as const,
  uploadedBy: ['Mr. Kamanzi', 'Mrs. Uwimana', 'Ms. Mutesi'][i],
}));

const AdminDashboard = () => {
  const { user } = useAdminAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of the academic document system</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 card-shadow">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <s.icon className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent activity */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card card-shadow">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-serif text-lg font-bold text-foreground">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  a.action === 'approved' ? 'bg-success/10 text-success' :
                  a.action === 'rejected' ? 'bg-destructive/10 text-destructive' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">
                    <span className="font-medium">{a.user}</span> {a.action} <span className="text-muted-foreground">{a.item}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending approvals */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card card-shadow">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-serif text-lg font-bold text-foreground">Pending Approvals</h2>
            <Badge variant="secondary">{pendingApprovals.length}</Badge>
          </div>
          <div className="divide-y divide-border">
            {pendingApprovals.map(d => (
              <div key={d.id} className="px-5 py-3">
                <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">by {d.uploadedBy} · {d.fileSize}</p>
                {user?.role === 'dos' && (
                  <div className="mt-2 flex gap-2">
                    <button className="rounded bg-success/10 px-2.5 py-1 text-xs font-medium text-success hover:bg-success/20 transition-colors">
                      Approve
                    </button>
                    <button className="rounded bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top downloads chart placeholder */}
      <div className="rounded-xl border border-border bg-card p-5 card-shadow">
        <h2 className="font-serif text-lg font-bold text-foreground mb-4">Monthly Upload Trend</h2>
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="mx-auto h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">Chart will render with real data</p>
            <p className="text-xs">Connect Lovable Cloud to enable analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
