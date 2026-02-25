import { useState, useEffect, useCallback } from 'react';
import { FolderPlus, Folder, FolderOpen, MoreVertical, Pencil, Trash2, ChevronRight, ChevronDown, Loader2, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { FolderRecord } from '@/types/documents';

// Build tree structure from flat list
interface TreeFolder extends FolderRecord {
  children: TreeFolder[];
}

function buildTree(folders: FolderRecord[]): TreeFolder[] {
  const map = new Map<string, TreeFolder>();
  const roots: TreeFolder[] = [];
  folders.forEach(f => map.set(f.id, { ...f, children: [] }));
  folders.forEach(f => {
    const node = map.get(f.id)!;
    if (f.parent_id && map.has(f.parent_id)) {
      map.get(f.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

// Default template structure
const TEMPLATE: { name: string; children?: { name: string }[] }[] = [
  { name: 'Past Papers', children: [{ name: '2024' }, { name: '2023' }] },
  { name: 'Notes & Study Materials', children: [
    { name: 'S1' }, { name: 'S2' }, { name: 'S3' }, { name: 'S4' }, { name: 'S5' }, { name: 'S6' },
  ]},
  { name: 'National Examinations', children: [{ name: '2024' }, { name: '2023' }, { name: '2022' }] },
];

const FolderTreeItem = ({
  node, level = 0, isDos, onRefresh, allFolders,
}: {
  node: TreeFolder; level?: number; isDos: boolean; onRefresh: () => void; allFolders: FolderRecord[];
}) => {
  const [open, setOpen] = useState(level < 1);
  const hasChildren = node.children.length > 0;

  const handleDelete = async () => {
    const { error } = await supabase.from('folders').update({ deleted_at: new Date().toISOString() }).eq('id', node.id);
    if (error) { toast.error('Delete failed'); return; }
    toast.success(`Folder "${node.name}" moved to trash`);
    onRefresh();
  };

  const handleRename = async () => {
    const newName = prompt('New folder name:', node.name);
    if (!newName || newName === node.name) return;
    const { error } = await supabase.from('folders').update({ name: newName }).eq('id', node.id);
    if (error) { toast.error('Rename failed'); return; }
    onRefresh();
  };

  return (
    <div>
      <div
        className="group flex items-center gap-1 rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {hasChildren ? (
          <button onClick={() => setOpen(!open)} className="shrink-0 p-0.5 text-muted-foreground">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-5" />
        )}
        {open && hasChildren ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-accent" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-accent" />
        )}
        <span className="flex-1 text-sm font-medium text-foreground ml-1">{node.name}</span>
        <span className="text-xs text-muted-foreground mr-2">{node.children.length} items</span>

        {isDos && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRename}><Pencil className="mr-2 h-4 w-4" />Rename</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {open && node.children.map(child => (
        <FolderTreeItem key={child.id} node={child} level={level + 1} isDos={isDos} onRefresh={onRefresh} allFolders={allFolders} />
      ))}
    </div>
  );
};

const AdminFolders = () => {
  const { user } = useAdminAuth();
  const isDos = user?.role === 'dos';
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParent, setNewFolderParent] = useState<string>('none');
  const [creating, setCreating] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  const fetchFolders = useCallback(async () => {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .is('deleted_at', null)
      .order('name');
    if (!error && data) setFolders(data as FolderRecord[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  const tree = buildTree(folders);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) { toast.error('Folder name is required'); return; }
    setCreating(true);
    const parentId = newFolderParent === 'none' ? null : newFolderParent;

    // Check duplicate under same parent
    const dup = folders.find(f => f.name.toLowerCase() === newFolderName.trim().toLowerCase() && f.parent_id === parentId);
    if (dup) { toast.error('A folder with this name already exists here'); setCreating(false); return; }

    const { error } = await supabase.from('folders').insert({
      name: newFolderName.trim(),
      parent_id: parentId,
      created_by: user?.id,
    });
    setCreating(false);
    if (error) { toast.error('Failed to create folder: ' + error.message); return; }
    toast.success(`Folder "${newFolderName.trim()}" created`);
    setNewFolderOpen(false);
    setNewFolderName('');
    setNewFolderParent('none');
    fetchFolders();
  };

  const handleUseTemplate = async () => {
    setTemplateLoading(true);
    try {
      for (const top of TEMPLATE) {
        // Find or create top-level
        let existing = folders.find(f => f.name === top.name && !f.parent_id);
        let parentId: string;
        if (existing) {
          parentId = existing.id;
        } else {
          const { data, error } = await supabase.from('folders').insert({ name: top.name, parent_id: null, created_by: user?.id }).select('id').single();
          if (error || !data) { toast.error(`Failed to create "${top.name}"`); continue; }
          parentId = data.id;
        }
        if (top.children) {
          for (const child of top.children) {
            // Refetch to get latest after inserts
            const { data: existingChild } = await supabase
              .from('folders')
              .select('id')
              .eq('name', child.name)
              .eq('parent_id', parentId)
              .is('deleted_at', null)
              .maybeSingle();
            if (!existingChild) {
              await supabase.from('folders').insert({ name: child.name, parent_id: parentId, created_by: user?.id });
            }
          }
        }
      }
      toast.success('Template folders created successfully');
      fetchFolders();
    } catch (e) {
      toast.error('Template creation failed');
    }
    setTemplateLoading(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Folder Management</h1>
          <p className="text-sm text-muted-foreground">Create and organize the directory structure</p>
        </div>
        {isDos && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleUseTemplate} disabled={templateLoading}>
              {templateLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LayoutTemplate className="mr-2 h-4 w-4" />}
              Use Template
            </Button>
            <Button onClick={() => setNewFolderOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />New Folder
            </Button>
          </div>
        )}
      </div>

      {!isDos && (
        <div className="rounded-lg border border-border bg-warning/5 p-4 text-sm text-muted-foreground">
          Folder management is restricted to the Director of Studies. You can browse the structure below.
        </div>
      )}

      <div className="rounded-xl border border-border bg-card card-shadow">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Directory Structure</h2>
        </div>
        <div className="p-3">
          {tree.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Folder className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No folders yet. Create one or use a template.</p>
            </div>
          ) : (
            tree.map(node => (
              <FolderTreeItem key={node.id} node={node} isDos={isDos} onRefresh={fetchFolders} allFolders={folders} />
            ))
          )}
        </div>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Folder Name</Label>
              <Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="e.g. Mathematics" />
            </div>
            <div>
              <Label>Parent Folder</Label>
              <Select value={newFolderParent} onValueChange={setNewFolderParent}>
                <SelectTrigger><SelectValue placeholder="Root (top level)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Root (top level)</SelectItem>
                  {folders.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={creating}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FolderPlus className="mr-2 h-4 w-4" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFolders;
