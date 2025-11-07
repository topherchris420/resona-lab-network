import { Search, Plus, Bell, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">R</span>
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:block">Resona</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search experiments, researchers, topics..."
            className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-muted/50">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Link to="/create">
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Publish</span>
            </Button>
          </Link>

          <Link to="/profile">
            <Button variant="ghost" size="icon" className="hover:bg-muted/50">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
