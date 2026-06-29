export type FeedFilter = 'trending' | 'new' | 'following' | 'experimental';

export interface SocialProject {
  id: string;
  title: string;
  abstract: string;
  content: string;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar_url?: string | null;
  author_bio?: string | null;
  tags: string[];
  github_url?: string | null;
  dataset_url?: string | null;
  created_at: string;
  updated_at: string;
  resonance_count: number;
  fork_count: number;
  comment_count: number;
  has_resonated: boolean;
  is_following_author: boolean;
  is_trending: boolean;
}

export interface SocialProfile {
  id: string;
  full_name: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  resonance_score: number;
  project_count: number;
  fork_count: number;
  collaborator_count: number;
  is_followed_by_viewer: boolean;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  author_id: string;
  author_name: string;
  author_username: string;
  content: string;
  created_at: string;
}

export interface FeedOptions {
  filter: FeedFilter;
  query: string;
}

const searchableText = (project: SocialProject) =>
  [
    project.title,
    project.abstract,
    project.content,
    project.author_name,
    project.author_username,
    ...project.tags,
  ]
    .join(' ')
    .toLowerCase();

export const filterProjectsForFeed = (projects: SocialProject[], options: FeedOptions): SocialProject[] => {
  const query = options.query.trim().toLowerCase();

  return projects
    .filter((project) => {
      if (query && !searchableText(project).includes(query)) {
        return false;
      }

      if (options.filter === 'following') {
        return project.is_following_author;
      }

      if (options.filter === 'experimental') {
        return project.tags.some((tag) => tag.toLowerCase().includes('experiment'));
      }

      return true;
    })
    .sort((a, b) => {
      if (options.filter === 'new') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      return Number(b.is_trending) - Number(a.is_trending) || b.resonance_count - a.resonance_count;
    });
};

export const toggleResonanceState = (project: SocialProject, shouldResonate: boolean): SocialProject => {
  const delta = shouldResonate === project.has_resonated ? 0 : shouldResonate ? 1 : -1;

  return {
    ...project,
    has_resonated: shouldResonate,
    resonance_count: Math.max(0, project.resonance_count + delta),
  };
};

export const deriveProjectStats = (
  _project: SocialProject,
  relationships: {
    comments: Array<{ id: string }>;
    resonances: Array<{ user_id: string }>;
    forks: Array<{ id: string }>;
    currentUserId?: string | null;
  },
) => ({
  resonance_count: relationships.resonances.length,
  fork_count: relationships.forks.length,
  comment_count: relationships.comments.length,
  has_resonated: Boolean(
    relationships.currentUserId &&
      relationships.resonances.some((resonance) => resonance.user_id === relationships.currentUserId),
  ),
});

export const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  const delta = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (Number.isNaN(date.getTime())) return '';
  if (delta < minute) return 'just now';
  if (delta < hour) return `${Math.floor(delta / minute)}m ago`;
  if (delta < day) return `${Math.floor(delta / hour)}h ago`;
  if (delta < 7 * day) return `${Math.floor(delta / day)}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'R';
