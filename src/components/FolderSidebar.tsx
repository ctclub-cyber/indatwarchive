import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import type { FolderNode } from '@/data/mockData';

interface TreeItemProps {
  node: FolderNode;
  activeId?: string;
  level?: number;
}

const TreeItem = ({ node, activeId, level = 0 }: TreeItemProps) => {
  const isActive = node.id === activeId;
  const hasChildren = node.children.filter(c => c.type === 'folder').length > 0;
  const [open, setOpen] = useState(level < 1);

  const folders = node.children.filter(c => c.type === 'folder') as FolderNode[];

  return (
    <div>
      <div
        className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer ${
          isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button onClick={() => setOpen(!open)} className="shrink-0 p-0.5">
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="w-[18px]" />
        )}
        <Link to={`/browse/${node.id}`} className="flex items-center gap-2 min-w-0 flex-1">
          {isActive ? <FolderOpen className="h-4 w-4 shrink-0 text-sidebar-primary" /> : <Folder className="h-4 w-4 shrink-0" />}
          <span className="truncate">{node.name}</span>
        </Link>
      </div>
      {open && folders.map(child => (
        <TreeItem key={child.id} node={child} activeId={activeId} level={level + 1} />
      ))}
    </div>
  );
};

interface FolderSidebarProps {
  tree: FolderNode;
}

const FolderSidebar = ({ tree }: FolderSidebarProps) => {
  const { folderId } = useParams();

  return (
    <aside className="hidden lg:block w-64 shrink-0 border-r border-border bg-sidebar overflow-y-auto scrollbar-thin">
      <div className="p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
          Directory
        </h2>
        {(tree.children.filter(c => c.type === 'folder') as FolderNode[]).map(node => (
          <TreeItem key={node.id} node={node} activeId={folderId} />
        ))}
      </div>
    </aside>
  );
};

export default FolderSidebar;
