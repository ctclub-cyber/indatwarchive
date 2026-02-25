import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import FolderCard from '@/components/FolderCard';
import { supabase } from '@/integrations/supabase/client';
import type { FolderRecord, DocRecord } from '@/types/documents';
import { FolderOpen, FileText, Download, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Browse = () => {
  const { folderId } = useParams();
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      // Fetch subfolders
      const parentFilter = folderId || null;
      let folderQuery = supabase.from('folders').select('*').is('deleted_at', null).order('name');
      if (parentFilter) {
        folderQuery = folderQuery.eq('parent_id', parentFilter);
      } else {
        folderQuery = folderQuery.is('parent_id', null);
      }
      const { data: f } = await folderQuery;
      setFolders((f || []) as FolderRecord[]);

      // Fetch docs in this folder (approved only)
      if (folderId) {
        const { data: d } = await supabase
          .from('documents')
          .select('*')
          .eq('folder_id', folderId)
          .eq('status', 'approved')
          .is('deleted_at', null)
          .order('created_at', { ascending: false });
        setDocs((d || []) as DocRecord[]);
      } else {
        setDocs([]);
      }
      setLoading(false);
    };
    fetch();
  }, [folderId]);

  // Build breadcrumb path by walking up parents
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; href?: string }[]>([]);
  useEffect(() => {
    if (!folderId) { setBreadcrumbs([]); return; }
    const buildPath = async () => {
      const path: { label: string; href: string }[] = [];
      let currentId: string | null = folderId;
      while (currentId) {
        const { data } = await supabase.from('folders').select('id, name, parent_id').eq('id', currentId).single();
        if (!data) break;
        path.unshift({ label: data.name, href: `/browse/${data.id}` });
        currentId = data.parent_id;
      }
      setBreadcrumbs(path);
    };
    buildPath();
  }, [folderId]);

  const currentName = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Documents';

  const handleDownload = async (doc: DocRecord) => {
    if (!doc.file_url) return;
    await supabase.rpc('increment_downloads', { doc_id: doc.id });
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.file_url, 120);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container py-6">
        <Breadcrumbs items={[{ label: 'Documents', href: '/browse' }, ...breadcrumbs]} />

        <div className="mt-4 flex items-center gap-3 mb-6">
          <FolderOpen className="h-6 w-6 text-accent" />
          <h1 className="font-serif text-2xl font-bold text-foreground">{currentName}</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {folders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Folders</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {folders.map(f => (
                    <FolderCard key={f.id} id={f.id} name={f.name} itemCount={0} />
                  ))}
                </div>
              </div>
            )}

            {docs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Documents</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {docs.map(doc => (
                    <div key={doc.id} className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm truncate">{doc.name}</p>
                          {doc.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{doc.description}</p>}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{doc.file_size}</span>
                        {doc.class_level && <Badge variant="outline" className="text-[10px]">{doc.class_level}</Badge>}
                        {doc.subject && <Badge variant="outline" className="text-[10px]">{doc.subject}</Badge>}
                        <span className="ml-auto flex items-center gap-1"><Download className="h-3 w-3" />{doc.downloads}</span>
                      </div>
                      <Button size="sm" variant="outline" className="mt-1" onClick={() => handleDownload(doc)}>
                        <Download className="mr-1.5 h-3.5 w-3.5" />Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {folders.length === 0 && docs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <FolderOpen className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">This folder is empty</p>
                <p className="text-sm">Documents will appear here once uploaded and approved.</p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Browse;
