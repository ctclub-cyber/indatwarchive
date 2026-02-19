import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, RotateCcw, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DeletedDoc {
  id: string;
  name: string;
  file_type: string;
  file_size: string;
  deleted_at: string;
}

const AdminTrash = () => {
  const { t } = useTranslation();
  const [docs, setDocs] = useState<DeletedDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeleted = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('id, name, file_type, file_size, deleted_at')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (!error) setDocs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDeleted(); }, []);

  const restore = async (id: string) => {
    const { error } = await supabase
      .from('documents')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Restored', description: 'Document restored successfully' });
      fetchDeleted();
    }
  };

  const deletePermanently = async (id: string) => {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Document permanently deleted' });
      fetchDeleted();
    }
  };

  const daysRemaining = (deletedAt: string) => {
    const deleted = new Date(deletedAt);
    const expiry = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
    const diff = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">{t('trash.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('trash.subtitle')}</p>
      </div>

      <div className="rounded-xl border border-border bg-card card-shadow">
        {loading ? (
          <div className="px-5 py-12 text-center text-muted-foreground">{t('common.loading')}</div>
        ) : docs.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Trash2 className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{t('trash.noItems')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {docs.map(d => {
              const days = daysRemaining(d.deleted_at);
              return (
                <div key={d.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('trash.deletedOn')} {new Date(d.deleted_at).toLocaleDateString()} · {d.file_size}
                    </p>
                    {days <= 7 && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="h-3 w-3" />
                        {t('trash.daysRemaining', { days })}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => restore(d.id)}>
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                      {t('trash.restore')}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deletePermanently(d.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      {t('trash.deletePermanently')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTrash;
