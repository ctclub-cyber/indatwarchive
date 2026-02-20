import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, FileText, Loader2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');

  const reset = () => {
    setFiles([]);
    setDescription('');
    setClassLevel('');
    setSubject('');
    setProgress(0);
    setCurrentFile('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) {
      setFiles(prev => [...prev, ...selected]);
    }
    // Reset input so same file can be re-added
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUpload = async () => {
    if (files.length === 0 || !classLevel || !subject) {
      toast({ title: 'Missing fields', description: 'Please add files and fill all required fields.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let uploaded = 0;
      const errors: string[] = [];

      for (const file of files) {
        setCurrentFile(file.name);
        const ext = file.name.split('.').pop();
        const docName = file.name.replace(/\.[^/.]+$/, '');
        const filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: storageError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (storageError) {
          errors.push(`${file.name}: ${storageError.message}`);
          uploaded++;
          setProgress(Math.round((uploaded / files.length) * 100));
          continue;
        }

        const { error: dbError } = await supabase.from('documents').insert({
          name: docName,
          description,
          class_level: classLevel,
          subject,
          file_url: filePath,
          file_size: formatSize(file.size),
          file_type: ext || 'unknown',
          uploaded_by: user.id,
          status: 'pending',
        });

        if (dbError) {
          errors.push(`${file.name}: ${dbError.message}`);
        }

        uploaded++;
        setProgress(Math.round((uploaded / files.length) * 100));
      }

      if (errors.length > 0) {
        toast({ title: `${uploaded - errors.length}/${files.length} uploaded`, description: errors.join('\n'), variant: 'destructive' });
      } else {
        toast({ title: 'All documents uploaded', description: `${files.length} document(s) submitted for approval.` });
      }

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
          <DialogTitle className="font-serif">Upload Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File picker */}
          <div>
            <Label>Files *</Label>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" multiple />

            {files.length > 0 && (
              <ScrollArea className="mt-1 max-h-40">
                <div className="space-y-1.5">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeFile(i)} disabled={uploading}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <Button variant="outline" className="mt-1.5 w-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {files.length > 0 ? <><Plus className="mr-2 h-4 w-4" />Add More Files</> : <><Upload className="mr-2 h-4 w-4" />Choose Files</>}
            </Button>
          </div>

          <div>
            <Label>Description (applied to all)</Label>
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

          {uploading && (
            <div className="space-y-1.5">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground truncate">Uploading: {currentFile} ({progress}%)</p>
            </div>
          )}

          <Button onClick={handleUpload} disabled={uploading || files.length === 0} className="w-full">
            {uploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading {files.length} file(s)...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" />Upload {files.length > 0 ? `${files.length} Document(s)` : 'Documents'}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
