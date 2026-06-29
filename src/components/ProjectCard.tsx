import { Radio, GitFork, MessageSquare, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatRelativeTime, getInitials, type SocialProject } from '@/lib/social';

interface ProjectCardProps {
  project: SocialProject;
  onResonate?: (project: SocialProject) => void;
  onFork?: (project: SocialProject) => void;
}

const ProjectCard = ({ project, onResonate, onFork }: ProjectCardProps) => {
  return (
    <article className="retro-panel p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <Link to={`/profile/${project.author_id}`} aria-label={`${project.author_name} profile`}>
            <Avatar className="h-10 w-10 border-2 border-border">
              <AvatarImage src={project.author_avatar_url || undefined} alt="" />
              <AvatarFallback className="bg-card text-primary text-xs">
                {getInitials(project.author_name)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {project.is_trending && (
                <span className="inline-flex items-center gap-1 text-xs text-accent">
                  <TrendingUp className="h-3 w-3" /> TRENDING
                </span>
              )}
              <span className="text-xs text-muted-foreground">{formatRelativeTime(project.created_at)}</span>
            </div>

            <Link to={`/project/${project.id}`}>
              <h3 className="text-lg font-display text-primary hover:underline leading-relaxed">
                {project.title}
              </h3>
            </Link>

            <p className="text-sm text-muted-foreground">
              BY:{' '}
              <Link to={`/profile/${project.author_id}`} className="hover:text-primary hover:underline">
                {project.author_name} @{project.author_username}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-foreground/80 line-clamp-3">{project.abstract}</p>

      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="text-xs text-secondary">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-4 pt-4 border-t-2 border-dotted border-border sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1" aria-label={`${project.resonance_count} resonances`}>
            <Radio className="h-4 w-4" />
            {project.resonance_count}
          </span>
          <span className="flex items-center gap-1" aria-label={`${project.fork_count} forks`}>
            <GitFork className="h-4 w-4" />
            {project.fork_count}
          </span>
          <Link to={`/project/${project.id}#discussion`} className="flex items-center gap-1 hover:text-primary" aria-label={`${project.comment_count} comments`}>
            <MessageSquare className="h-4 w-4" />
            {project.comment_count}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="retro-button text-xs"
            onClick={() => onResonate?.(project)}
            aria-pressed={project.has_resonated}
          >
            {project.has_resonated ? 'RESONATED' : 'RESONATE'}
          </button>
          <button type="button" className="retro-button text-xs" onClick={() => onFork?.(project)}>
            FORK
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;