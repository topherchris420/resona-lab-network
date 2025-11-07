import { Button } from './ui/button';
import { Flame, Clock, Users, Sparkles } from 'lucide-react';

interface FeedFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'new', label: 'New', icon: Clock },
  { id: 'following', label: 'Following', icon: Users },
  { id: 'experimental', label: 'Experimental', icon: Sparkles },
];

const FeedFilters = ({ activeFilter, onFilterChange }: FeedFiltersProps) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        
        return (
          <Button
            key={filter.id}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className={`gap-2 whitespace-nowrap ${
              isActive
                ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground'
                : 'hover:bg-muted/50'
            }`}
          >
            <Icon className="h-4 w-4" />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
};

export default FeedFilters;
