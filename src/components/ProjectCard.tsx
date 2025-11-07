import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Radio, GitFork, MessageSquare, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  id: string;
  title: string;
  abstract: string;
  author: string;
  authorAvatar?: string;
  tags: string[];
  resonanceCount: number;
  forkCount: number;
  commentCount: number;
  trending?: boolean;
  createdAt: string;
}

const ProjectCard = ({
  id,
  title,
  abstract,
  author,
  tags,
  resonanceCount,
  forkCount,
  commentCount,
  trending,
  createdAt,
}: ProjectCardProps) => {
  return (
    <div className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all group">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {trending && (
                <Badge className="bg-success/20 text-success border-success/30 gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">{createdAt}</span>
            </div>
            
            <Link to={`/project/${id}`}>
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
            </Link>
            
            <p className="text-sm text-muted-foreground">by {author}</p>
          </div>
        </div>

        {/* Abstract */}
        <p className="text-foreground/80 line-clamp-3">{abstract}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Radio className="h-4 w-4" />
              {resonanceCount}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-4 w-4" />
              {forkCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {commentCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 hover:text-primary hover:bg-primary/10"
            >
              <Radio className="h-4 w-4" />
              Resonate
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 hover:text-secondary hover:bg-secondary/10"
            >
              <GitFork className="h-4 w-4" />
              Fork
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
