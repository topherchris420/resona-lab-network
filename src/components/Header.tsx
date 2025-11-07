import { Search, Plus, Bell, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const Header = () => {
  return (
    <header className="w-full retro-panel">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Resona Logo" 
            className="w-8 h-8"
          />
          <span className="text-2xl font-display text-primary hidden sm:block">RESONA</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="SEARCH..."
            className="pl-10 bg-input border-2 border-border focus:ring-0 focus:border-accent"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="retro-button p-2">
            <Bell className="h-5 w-5" />
          </button>
          
          <Link to="/create">
            <button className="retro-button flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">PUBLISH</span>
            </button>
          </Link>

          <Link to="/profile">
            <button className="retro-button p-2">
              <User className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
