import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocumentCard from '@/components/DocumentCard';
import DocumentPreviewModal from '@/components/DocumentPreviewModal';
import { allDocuments, subjects, classLevels, years, tags, type DocumentNode } from '@/data/mockData';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [classFilter, setClassFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<DocumentNode | null>(null);

  const results = useMemo(() => {
    let filtered = [...allDocuments];

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.subject?.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (classFilter !== 'all') filtered = filtered.filter(d => d.classLevel === classFilter);
    if (subjectFilter !== 'all') filtered = filtered.filter(d => d.subject === subjectFilter);
    if (yearFilter !== 'all') filtered = filtered.filter(d => d.year === yearFilter);
    if (selectedTags.length > 0) filtered = filtered.filter(d => selectedTags.some(t => d.tags.includes(t)));

    switch (sortBy) {
      case 'oldest': filtered.sort((a, b) => a.uploadDate.localeCompare(b.uploadDate)); break;
      case 'downloads': filtered.sort((a, b) => b.downloads - a.downloads); break;
      case 'az': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: filtered.sort((a, b) => b.uploadDate.localeCompare(a.uploadDate));
    }

    return filtered;
  }, [query, classFilter, subjectFilter, yearFilter, selectedTags, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const clearFilters = () => {
    setClassFilter('all');
    setSubjectFilter('all');
    setYearFilter('all');
    setSelectedTags([]);
    setSortBy('newest');
  };

  const hasFilters = classFilter !== 'all' || subjectFilter !== 'all' || yearFilter !== 'all' || selectedTags.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="container flex-1 py-8">
        {/* Search bar */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground mb-4">Search Documents</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, subject, keyword..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />Filters
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 rounded-lg border border-border bg-card p-4 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Class</label>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classLevels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Year</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="downloads">Most Downloaded</SelectItem>
                    <SelectItem value="az">A–Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {hasFilters && (
              <Button variant="ghost" size="sm" className="mt-3 text-xs" onClick={clearFilters}>
                <X className="mr-1 h-3 w-3" /> Clear all filters
              </Button>
            )}
          </div>
        )}

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {results.length} document{results.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(doc => (
              <DocumentCard key={doc.id} doc={doc} onPreview={setPreviewDoc} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <SearchIcon className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">No documents found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </main>
      <Footer />
      <DocumentPreviewModal doc={previewDoc} open={!!previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
};

export default SearchPage;
