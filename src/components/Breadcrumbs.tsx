import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto py-1">
    <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0">
      <Home className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Home</span>
    </Link>
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1 shrink-0">
        <ChevronRight className="h-3.5 w-3.5" />
        {item.href ? (
          <Link to={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
        ) : (
          <span className="font-medium text-foreground">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export default Breadcrumbs;
