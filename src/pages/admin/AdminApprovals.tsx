import { CheckCircle, XCircle, Eye, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { allDocuments } from '@/data/mockData';

const pendingDocs = allDocuments.slice(0, 3).map((d, i) => ({
  ...d,
  status: 'pending' as const,
  submittedAt: ['2 hours ago', '1 day ago', '3 days ago'][i],
}));

const AdminApprovals = () => {
  const { user } = useAdminAuth();
  const isDos = user?.role === 'dos';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground">
          {isDos ? 'Review and approve teacher uploads' : 'Track the status of your uploads'}
        </p>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" /> {pendingDocs.length} Pending
        </Badge>
      </div>

      <div className="space-y-4">
        {pendingDocs.map(doc => (
          <div key={doc.id} className="rounded-xl border border-border bg-card p-5 card-shadow">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-foreground">{doc.name}</h3>
                {doc.description && (
                  <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>Uploaded by <span className="font-medium text-foreground">{doc.uploadedBy}</span></span>
                  <span>·</span>
                  <span>{doc.submittedAt}</span>
                  <span>·</span>
                  <span>{doc.fileSize}</span>
                  {doc.classLevel && <Badge variant="outline" className="text-[10px]">{doc.classLevel}</Badge>}
                  {doc.subject && <Badge variant="outline" className="text-[10px]">{doc.subject}</Badge>}
                </div>
                {doc.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {doc.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                  </div>
                )}
              </div>
            </div>

            {isDos && (
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                <Button variant="outline" size="sm"><Eye className="mr-1.5 h-3.5 w-3.5" />Preview</Button>
                <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />Approve
                </Button>
                <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminApprovals;
