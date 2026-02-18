import { GraduationCap } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-border bg-primary text-primary-foreground">
    <div className="container py-8">
      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          <span className="font-serif font-bold">Academic Document Portal</span>
        </div>
        <p className="text-sm opacity-75">
          © {new Date().getFullYear()} Secondary School Academic Archive. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
