import { useState, useEffect, useCallback } from 'react';
import { Search, Upload, MoreVertical, FileText, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import UploadDocumentDialog from '@/components/UploadDocumentDialog';
import { toast } from 'sonner';

const CLASS_LEVELS = ['1ère Année', '2ème Année', '3ème Année', '4ème Année', '5ème Année', '6ème Année'];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'French', 'English', 'History', 'Geography', 'Philosophy', 'Computer Science'];

const statusColors: Record<string, string> = {
  approved: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  rejected: 'bg-destructive/10 text-destructive',
};

interface Doc {
  id: string;
  name: string;
  file_size: string;
  file_type: string;
  file_url: string | null;
  class_level: string | null;
  subject: string | null;
  status: string;
  downloads: number;
  created_at: string;
  uploaded_by: string | null;
}

const AdminDocuments = () => {
  const { user } = useAdminAuth();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [docs, setDocs] = useState<Doc[]>([]);
  const [total, setTotal] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchDocs = useCallback(async () => {
    let query = supabase
      .from('documents')
      .select('id, name, file_size, file_type, file_url, class_level, subject, status, downloads, created_at, uploaded_by')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (search) query = query.ilike('name', `%${search}%`);
    if (classFilter !== 'all') query = query.eq('class_level', classFilter);
    if (subjectFilter !== 'all') query = query.eq('subject', subjectFilter);

    const { data, error } = await query;
    if (!error && data) setDocs(data);

    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);
    setTotal(count || 0);
  }, [search, classFilter, subjectFilter]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handlePreview = async (doc: Doc) => {
    if (!doc.file_url) { toast.error('No file attached'); return; }
    const { data, error } = await supabase.storage.from('documents').createSignedUrl(doc.file_url, 300);
    if (error || !data?.signedUrl) { toast.error('Could not generate preview URL'); return; }
    window.open(data.signedUrl, '_blank');
  };

  const handleSoftDelete = async (doc: Doc) => {
    const { error } = await supabase.from('documents').update({ deleted_at: new Date().toISOString() }).eq('id', doc.id);
    if (error) { toast.error('Delete failed'); return; }
    toast.success(`"${doc.name}" moved to trash`);
    fetchDocs();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground">Manage all uploaded documents</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />Upload Files
        </Button>
      </div>

      <UploadDocumentDialog open={uploadOpen} onOpenChange={setUploadOpen} onUploaded={fetchDocs} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="pl-10" />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASS_LEVELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Document</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Class</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Subject</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Downloads</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {docs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No documents yet. Upload your first document!</td></tr>
              ) : docs.map(doc => (
                <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate max-w-[250px]">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.file_size} · {formatDate(doc.created_at)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="outline">{doc.class_level || '—'}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{doc.subject || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[doc.status] || ''}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{doc.downloads}</td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(doc)}><Eye className="mr-2 h-4 w-4" />Preview</DropdownMenuItem>
                        {user?.role === 'dos' && (
                          <DropdownMenuItem className="text-destructive" onClick={() => handleSoftDelete(doc)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Showing {docs.length} of {total} documents
        </div>
      </div>
    </div>
  );
};

export default AdminDocuments;
