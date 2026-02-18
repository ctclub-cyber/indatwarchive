import { FileText, Download, Eye, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DocumentNode } from '@/data/mockData';

interface DocumentCardProps {
  doc: DocumentNode;
  onPreview?: (doc: DocumentNode) => void;
}

const fileTypeColors: Record<string, string> = {
  PDF: 'bg-destructive/10 text-destructive',
  PPTX: 'bg-warning/10 text-warning',
  DOCX: 'bg-info/10 text-info',
};

const DocumentCard = ({ doc, onPreview }: DocumentCardProps) => (
  <div className="group rounded-lg border border-border bg-card p-4 transition-all hover:card-shadow-hover animate-fade-in">
    <div className="flex items-start gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${fileTypeColors[doc.fileType] || 'bg-muted text-muted-foreground'}`}>
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-foreground truncate text-sm">{doc.name}</h3>
        {doc.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{doc.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />{doc.uploadDate}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />{doc.uploadedBy}
          </span>
          <span>{doc.fileSize}</span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />{doc.downloads}
          </span>
        </div>
        {doc.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {doc.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
    <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onPreview?.(doc)}>
        <Eye className="mr-1 h-3 w-3" />Preview
      </Button>
      <Button size="sm" className="flex-1 text-xs">
        <Download className="mr-1 h-3 w-3" />Download
      </Button>
    </div>
  </div>
);

export default DocumentCard;
