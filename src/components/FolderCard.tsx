import { Folder } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FolderCardProps {
  id: string;
  name: string;
  itemCount?: number;
}

const FolderCard = ({ id, name, itemCount }: FolderCardProps) => (
  <Link
    to={`/browse/${id}`}
    className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-accent hover:card-shadow-hover animate-fade-in"
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
      <Folder className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <p className="font-medium text-foreground truncate">{name}</p>
      {itemCount !== undefined && (
        <p className="text-xs text-muted-foreground">{itemCount} items</p>
      )}
    </div>
  </Link>
);

export default FolderCard;
