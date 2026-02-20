import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const CLASS_LEVELS = ['1ère Année', '2ème Année', '3ème Année', '4ème Année', '5ème Année', '6ème Année'];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'French', 'English', 'History', 'Geography', 'Philosophy', 'Computer Science'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded?: () => void;
}

export default function UploadDocumentDialog({ open, onOpenChange, onUploaded }: Props) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    setFile(null);
    setName('');
    setDescription('');
    setClassLevel('');
    setSubject('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (!name) setName(f.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUpload = async () => {
    if (!file || !name || !classLevel || !subject) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from('documents').insert({
        name,
        description,
        class_level: classLevel,
        subject,
        file_url: filePath,
        file_size: formatSize(file.size),
        file_type: ext || 'unknown',
        uploaded_by: user.id,
        status: 'pending',
      });

      if (dbError) throw dbError;

      toast({ title: 'Document uploaded', description: 'Your document has been submitted for approval.' });
      reset();
      onOpenChange(false);
      onUploaded?.();
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Upload Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File picker */}
          <div>
            <Label>File *</Label>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" />
            {file ? (
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="mt-1 w-full" onClick={() => fileRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />Choose File
              </Button>
            )}
          </div>

          <div>
            <Label>Document Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Class Level *</Label>
              <Select value={classLevel} onValueChange={setClassLevel}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {CLASS_LEVELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject *</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleUpload} disabled={uploading} className="w-full">
            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : <><Upload className="mr-2 h-4 w-4" />Upload Document</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
