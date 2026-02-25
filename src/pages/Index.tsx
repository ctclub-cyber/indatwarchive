import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.jpg';
import { Search, FolderOpen, Download, FileText, ArrowRight, Bell, TrendingUp, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import type { DocRecord } from '@/types/documents';
import { announcements, classLevels } from '@/data/mockData';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentDocs, setRecentDocs] = useState<DocRecord[]>([]);
  const [trendingDocs, setTrendingDocs] = useState<DocRecord[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Recent approved docs
      const { data: recent } = await supabase
        .from('documents')
        .select('*')
        .eq('status', 'approved')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(4);
      if (recent) setRecentDocs(recent as DocRecord[]);

      // Trending by downloads
      const { data: trending } = await supabase
        .from('documents')
        .select('*')
        .eq('status', 'approved')
        .is('deleted_at', null)
        .order('downloads', { ascending: false })
        .limit(4);
      if (trending) setTrendingDocs(trending as DocRecord[]);

      // Stats
      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .is('deleted_at', null);
      setTotalDocs(count || 0);

      // Sum downloads
      const { data: allApproved } = await supabase
        .from('documents')
        .select('downloads')
        .eq('status', 'approved')
        .is('deleted_at', null);
      if (allApproved) setTotalDownloads(allApproved.reduce((s, d) => s + (d.downloads || 0), 0));
    };
    fetchData();
  }, []);

  const handleDownload = async (doc: DocRecord) => {
    if (!doc.file_url) return;
    // Increment download count
    await supabase.rpc('increment_downloads', { doc_id: doc.id });
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.file_url, 120);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const stats = [
    { icon: FileText, label: 'Total Documents', value: totalDocs.toString() },
    { icon: Download, label: 'Total Downloads', value: totalDownloads.toLocaleString() },
    { icon: FolderOpen, label: 'Subjects', value: '10' },
    { icon: Star, label: 'Class Levels', value: '6' },
  ];

  const DocCard = ({ doc }: { doc: DocRecord }) => (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground text-sm truncate">{doc.name}</p>
          {doc.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{doc.description}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{doc.file_size}</span>
        {doc.class_level && <Badge variant="outline" className="text-[10px]">{doc.class_level}</Badge>}
        {doc.subject && <Badge variant="outline" className="text-[10px]">{doc.subject}</Badge>}
        <span className="ml-auto flex items-center gap-1"><Download className="h-3 w-3" />{doc.downloads}</span>
      </div>
      <Button size="sm" variant="outline" className="mt-1" onClick={() => handleDownload(doc)}>
        <Download className="mr-1.5 h-3.5 w-3.5" />Download
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 hero-gradient opacity-85" />
        </div>
        <div className="container text-center relative z-10">
          <h1 className="font-serif text-3xl font-bold text-primary-foreground md:text-5xl text-balance">
            Academic Document Portal
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80 md:text-lg">
            Access past papers, revision notes, and study materials for S1–S6.
          </p>
          <form
            onSubmit={e => { e.preventDefault(); if (searchQuery.trim()) window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`; }}
            className="mx-auto mt-8 flex max-w-lg gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search documents, subjects, years..." className="bg-card pl-10" />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card py-6">
        <div className="container grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <s.icon className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Browse */}
      <section className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-bold text-foreground">Browse by Class</h2>
          <Link to="/browse" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {classLevels.map(cl => (
            <Link key={cl} to={`/browse`}
              className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-all hover:border-accent hover:card-shadow-hover"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">{cl}</div>
              <span className="text-sm font-medium text-foreground">Senior {cl.slice(1)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Announcements + Recent */}
      <section className="bg-muted/30 py-10">
        <div className="container grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="font-serif text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" /> Announcements
            </h2>
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start gap-2">
                    <Badge variant={a.type === 'new' ? 'default' : 'secondary'} className="shrink-0 text-[10px]">
                      {a.type === 'new' ? 'New' : a.type === 'update' ? 'Update' : 'Info'}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{a.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="font-serif text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" /> Recently Uploaded
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {recentDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-2">No approved documents yet.</p>
              ) : recentDocs.map(doc => <DocCard key={doc.id} doc={doc} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="container py-10">
        <h2 className="font-serif text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" /> Most Downloaded
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trendingDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents to show yet.</p>
          ) : trendingDocs.map(doc => <DocCard key={doc.id} doc={doc} />)}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
