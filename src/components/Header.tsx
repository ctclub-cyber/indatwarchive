import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, GraduationCap, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card header-shadow">
      {/* Top bar */}
      <div className="hero-gradient">
        <div className="container flex items-center justify-between py-2 text-primary-foreground">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Academic Document Management Portal</span>
            <span className="sm:hidden">ADMP</span>
          </div>
          <Link to="/admin" className="flex items-center gap-1.5 text-sm opacity-90 transition-opacity hover:opacity-100">
            <LogIn className="h-3.5 w-3.5" />
            <span>Staff Login</span>
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold leading-tight text-foreground">Document Portal</h1>
            <p className="text-xs text-muted-foreground">Secondary School Academic Archive</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/" className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Home
          </Link>
          <Link to="/browse" className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Browse
          </Link>
          <Link to="/search" className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Search
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2 animate-slide-in-right">
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-48 md:w-64"
                autoFocus
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="border-t border-border bg-card p-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">Home</Link>
            <Link to="/browse" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">Browse Documents</Link>
            <Link to="/search" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">Search</Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
