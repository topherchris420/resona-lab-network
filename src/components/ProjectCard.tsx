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
    <div className="retro-panel p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {trending && (
              <span className="text-xs text-accent">[TRENDING]</span>
            )}
            <span className="text-xs text-muted-foreground">{createdAt}</span>
          </div>

          <Link to={`/project/${id}`}>
            <h3 className="text-lg font-display text-primary hover:underline">
              {title}
            </h3>
          </Link>

          <p className="text-sm text-muted-foreground">BY: {author}</p>
        </div>
      </div>

      {/* Abstract */}
      <p className="text-sm text-foreground/80 line-clamp-3">{abstract}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="text-xs text-secondary">
            #{tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-dotted border-border">
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
          <button className="retro-button text-xs">RESONATE</button>
          <button className="retro-button text-xs">FORK</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
