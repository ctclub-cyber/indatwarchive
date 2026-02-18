import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar, User, HardDrive, Tag } from 'lucide-react';
import type { DocumentNode } from '@/data/mockData';

interface Props {
  doc: DocumentNode | null;
  open: boolean;
  onClose: () => void;
}

const DocumentPreviewModal = ({ doc, open, onClose }: Props) => {
  if (!doc) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-3 text-left">
            <FileText className="h-6 w-6 shrink-0 text-primary mt-0.5" />
            <span className="text-base">{doc.name}</span>
          </DialogTitle>
        </DialogHeader>

        {doc.description && (
          <p className="text-sm text-muted-foreground">{doc.description}</p>
        )}

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{doc.uploadDate}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{doc.uploadedBy}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              <span>{doc.fileSize} · {doc.fileType}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Download className="h-4 w-4" />
              <span>{doc.downloads} downloads</span>
            </div>
          </div>

          {(doc.classLevel || doc.subject || doc.year) && (
            <div className="flex flex-wrap gap-2">
              {doc.classLevel && <Badge>{doc.classLevel}</Badge>}
              {doc.subject && <Badge variant="outline">{doc.subject}</Badge>}
              {doc.year && <Badge variant="outline">{doc.year}</Badge>}
            </div>
          )}

          {doc.tags.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {doc.tags.map(t => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview placeholder */}
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
          <div className="text-center text-muted-foreground">
            <FileText className="mx-auto h-10 w-10 mb-2 opacity-40" />
            <p className="text-sm">Document preview</p>
            <p className="text-xs">Preview available after backend setup</p>
          </div>
        </div>

        <Button className="w-full">
          <Download className="mr-2 h-4 w-4" />Download {doc.name}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;
