import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import FolderSidebar from '@/components/FolderSidebar';
import FolderCard from '@/components/FolderCard';
import DocumentCard from '@/components/DocumentCard';
import DocumentPreviewModal from '@/components/DocumentPreviewModal';
import { folderTree, allDocuments, type FolderNode, type DocumentNode } from '@/data/mockData';
import { FolderOpen } from 'lucide-react';

const findFolder = (node: FolderNode, id: string): FolderNode | null => {
  if (node.id === id) return node;
  for (const child of node.children) {
    if (child.type === 'folder') {
      const found = findFolder(child, id);
      if (found) return found;
    }
  }
  return null;
};

const Browse = () => {
  const { folderId } = useParams();
  const [previewDoc, setPreviewDoc] = useState<DocumentNode | null>(null);

  const currentFolder = useMemo(() => {
    if (!folderId) return folderTree;
    return findFolder(folderTree, folderId) || folderTree;
  }, [folderId]);

  const breadcrumbs = currentFolder.path.map((p, i) => {
    // find folder id for this path segment
    const pathUpTo = currentFolder.path.slice(0, i + 1);
    // simplified: just use label
    return { label: p };
  });

  const subFolders = currentFolder.children.filter(c => c.type === 'folder') as FolderNode[];

  // Get documents that belong to this folder (by matching subject + class from path)
  const folderDocs = useMemo(() => {
    const path = currentFolder.path;
    return allDocuments.filter(doc => {
      // Simple matching based on path content
      for (const segment of path) {
        const s = segment.toLowerCase();
        if (['s1','s2','s3','s4','s5','s6'].includes(s) && doc.classLevel?.toLowerCase() !== s) return false;
        if (doc.subject && doc.subject.toLowerCase() === s) return true;
      }
      return path.length >= 3; // show docs at deeper levels
    }).slice(0, 8);
  }, [currentFolder]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <FolderSidebar tree={folderTree} />
        <main className="flex-1 p-6">
          <Breadcrumbs items={[{ label: 'Documents', href: '/browse' }, ...breadcrumbs]} />

          <div className="mt-4 flex items-center gap-3 mb-6">
            <FolderOpen className="h-6 w-6 text-accent" />
            <h1 className="font-serif text-2xl font-bold text-foreground">{currentFolder.name}</h1>
          </div>

          {subFolders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Folders</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subFolders.map(f => (
                  <FolderCard key={f.id} id={f.id} name={f.name} itemCount={f.children.length} />
                ))}
              </div>
            </div>
          )}

          {folderDocs.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Documents</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {folderDocs.map(doc => (
                  <DocumentCard key={doc.id} doc={doc} onPreview={setPreviewDoc} />
                ))}
              </div>
            </div>
          )}

          {subFolders.length === 0 && folderDocs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <FolderOpen className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">This folder is empty</p>
              <p className="text-sm">Documents will appear here once uploaded.</p>
            </div>
          )}
        </main>
      </div>
      <Footer />
      <DocumentPreviewModal doc={previewDoc} open={!!previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
};

export default Browse;
