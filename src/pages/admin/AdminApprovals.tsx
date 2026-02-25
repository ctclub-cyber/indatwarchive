import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Eye, FileText, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { DocRecord } from '@/types/documents';

const AdminApprovals = () => {
  const { user } = useAdminAuth();
  const isDos = user?.role === 'dos';
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reject modal state
  const [rejectDoc, setRejectDoc] = useState<DocRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('status', 'pending')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (!error && data) setDocs(data as DocRecord[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleApprove = async (doc: DocRecord) => {
    setActionLoading(doc.id);
    const { error } = await supabase
      .from('documents')
      .update({ status: 'approved', approved_by: user?.id, approved_at: new Date().toISOString() })
      .eq('id', doc.id);
    setActionLoading(null);
    if (error) { toast.error('Failed to approve: ' + error.message); return; }
    toast.success(`"${doc.name}" approved`);
    setDocs(prev => prev.filter(d => d.id !== doc.id));
  };

  const handleRejectSubmit = async () => {
    if (!rejectDoc) return;
    setActionLoading(rejectDoc.id);
    const { error } = await supabase
      .from('documents')
      .update({
        status: 'rejected',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectReason || null,
      })
      .eq('id', rejectDoc.id);
    setActionLoading(null);
    if (error) { toast.error('Failed to reject: ' + error.message); return; }
    toast.success(`"${rejectDoc.name}" rejected`);
    setDocs(prev => prev.filter(d => d.id !== rejectDoc.id));
    setRejectDoc(null);
    setRejectReason('');
  };

  const handlePreview = async (doc: DocRecord) => {
    if (!doc.file_url) { toast.error('No file attached'); return; }
    const { data, error } = await supabase.storage.from('documents').createSignedUrl(doc.file_url, 300);
    if (error || !data?.signedUrl) { toast.error('Could not generate preview URL'); return; }
    window.open(data.signedUrl, '_blank');
  };

  const formatTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <Clock className="h-3 w-3" /> {docs.length} Pending
        </Badge>
      </div>

      {docs.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No pending documents</p>
          <p className="text-sm">All uploads have been reviewed.</p>
        </div>
      )}

      <div className="space-y-4">
        {docs.map(doc => (
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
                  <span>{formatTime(doc.created_at)}</span>
                  <span>·</span>
                  <span>{doc.file_size}</span>
                  {doc.class_level && <Badge variant="outline" className="text-[10px]">{doc.class_level}</Badge>}
                  {doc.subject && <Badge variant="outline" className="text-[10px]">{doc.subject}</Badge>}
                </div>
                {doc.tags && doc.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {doc.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                  </div>
                )}
              </div>
            </div>

            {isDos && (
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                <Button variant="outline" size="sm" onClick={() => handlePreview(doc)} disabled={actionLoading === doc.id}>
                  <Eye className="mr-1.5 h-3.5 w-3.5" />Preview
                </Button>
                <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground"
                  onClick={() => handleApprove(doc)} disabled={actionLoading === doc.id}>
                  {actionLoading === doc.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="mr-1.5 h-3.5 w-3.5" />}
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => { setRejectDoc(doc); setRejectReason(''); }} disabled={actionLoading === doc.id}>
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reject modal */}
      <Dialog open={!!rejectDoc} onOpenChange={open => { if (!open) setRejectDoc(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Rejecting <span className="font-medium text-foreground">"{rejectDoc?.name}"</span>
          </p>
          <Textarea
            placeholder="Reason for rejection (optional)..."
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDoc(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectSubmit} disabled={actionLoading === rejectDoc?.id}>
              {actionLoading === rejectDoc?.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApprovals;
