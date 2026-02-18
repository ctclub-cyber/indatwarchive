import { useState } from 'react';
import { FolderPlus, Folder, FolderOpen, MoreVertical, Pencil, Trash2, Move, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { folderTree, type FolderNode } from '@/data/mockData';

const FolderTreeItem = ({ node, level = 0, isDos }: { node: FolderNode; level?: number; isDos: boolean }) => {
  const [open, setOpen] = useState(level < 1);
  const folders = node.children.filter(c => c.type === 'folder') as FolderNode[];
  const hasChildren = folders.length > 0;

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
              <DropdownMenuItem><FolderPlus className="mr-2 h-4 w-4" />New Subfolder</DropdownMenuItem>
              <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" />Rename</DropdownMenuItem>
              <DropdownMenuItem><Move className="mr-2 h-4 w-4" />Move</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {open && folders.map(child => (
        <FolderTreeItem key={child.id} node={child} level={level + 1} isDos={isDos} />
      ))}
    </div>
  );
};

const AdminFolders = () => {
  const { user } = useAdminAuth();
  const isDos = user?.role === 'dos';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Folder Management</h1>
          <p className="text-sm text-muted-foreground">Create and organize the directory structure</p>
        </div>
        {isDos && (
          <div className="flex gap-2">
            <Button variant="outline">Use Template</Button>
            <Button><FolderPlus className="mr-2 h-4 w-4" />New Folder</Button>
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
          {(folderTree.children.filter(c => c.type === 'folder') as FolderNode[]).map(node => (
            <FolderTreeItem key={node.id} node={node} isDos={isDos} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminFolders;
