import { useEffect, useState } from 'react';
import { Search, Plus, Bell, User, FlaskConical, Atom } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { useAuth } from '@/hooks/use-auth';
import { fetchUnreadNotificationCount } from '@/lib/socialApi';

interface HeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const Header = ({ searchValue, onSearchChange }: HeaderProps) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    void fetchUnreadNotificationCount(user?.id).then(setUnreadCount);
  }, [user?.id]);

  return (
    <header className="w-full retro-panel sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Resona home">
          <img src={logo} alt="Resona Logo" className="w-8 h-8" />
          <span className="text-2xl font-display text-primary hidden sm:block">RESONA</span>
        </Link>

        <div className="flex-1 max-w-xl relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="SEARCH..."
            value={onSearchChange ? searchValue || '' : undefined}
            onChange={(event) => onSearchChange?.(event.target.value)}
            className="pl-10 bg-input border-2 border-border focus:ring-0 focus:border-accent"
            aria-label="Search projects"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="ghost" className="retro-button">
            <Link to="/labs" aria-label="Labs">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">LABS</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" className="retro-button">
            <Link to="/catalyst" aria-label="Catalyst research compiler">
              <Atom className="h-4 w-4" />
              <span className="hidden md:inline">CATALYST</span>
            </Link>
          </Button>

          <Button variant="ghost" className="retro-button p-2 relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-accent px-1 text-[10px] leading-5 text-accent-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          <Button asChild variant="ghost" className="retro-button">
            <Link to={user ? '/create' : '/auth'} aria-label="Publish project">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">PUBLISH</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" className="retro-button p-2">
            <Link to={user ? `/profile/${user.id}` : '/auth'} aria-label={user ? 'User profile' : 'Sign in'}>
              <User className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;