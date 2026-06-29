import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import {
  deriveProjectStats,
  type ProjectComment,
  type SocialProfile,
  type SocialProject,
} from './social';

type SupabaseAny = typeof supabase & {
  from: (table: string) => any;
};

const db = supabase as SupabaseAny;

const projectSelect = `
  id,
  title,
  abstract,
  content,
  tags,
  github_url,
  dataset_url,
  author_id,
  source_project_id,
  created_at,
  updated_at,
  author:profiles!projects_author_id_fkey(id, full_name, username, bio, avatar_url),
  project_comments(id),
  project_resonances(user_id),
  project_forks(id, author_id, forked_project_id)
`;

const commentSelect = `
  id,
  project_id,
  author_id,
  content,
  created_at,
  author:profiles!project_comments_author_id_fkey(id, full_name, username, avatar_url)
`;

const normalizeUsername = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '')
    .slice(0, 24);

const makeUsername = (user: User) => {
  const metadataUsername = String(user.user_metadata?.username || '');
  const emailPrefix = user.email?.split('@')[0] || 'resona';
  const base = normalizeUsername(metadataUsername || emailPrefix) || 'resona';

  return `${base}_${user.id.slice(0, 6)}`;
};

const authorFromRow = (row: any) => {
  const author = Array.isArray(row.author) ? row.author[0] : row.author;

  return {
    name: author?.full_name || 'Resona Researcher',
    username: author?.username || 'resona',
    avatar_url: author?.avatar_url || null,
    bio: author?.bio || null,
  };
};

const mapProjectRow = (row: any, currentUserId?: string | null, followingIds: Set<string> = new Set()): SocialProject => {
  const stats = deriveProjectStats(
    {
      id: row.id,
      title: row.title,
      abstract: row.abstract,
      content: row.content,
      author_id: row.author_id,
      author_name: '',
      author_username: '',
      tags: row.tags || [],
      created_at: row.created_at,
      updated_at: row.updated_at,
      resonance_count: 0,
      fork_count: 0,
      comment_count: 0,
      has_resonated: false,
      is_following_author: false,
      is_trending: false,
    },
    {
      comments: row.project_comments || [],
      resonances: row.project_resonances || [],
      forks: row.project_forks || [],
      currentUserId,
    },
  );
  const author = authorFromRow(row);

  return {
    id: row.id,
    title: row.title,
    abstract: row.abstract,
    content: row.content,
    author_id: row.author_id,
    author_name: author.name,
    author_username: author.username,
    author_avatar_url: author.avatar_url,
    author_bio: author.bio,
    tags: row.tags || [],
    github_url: row.github_url,
    dataset_url: row.dataset_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    is_following_author: currentUserId === row.author_id || followingIds.has(row.author_id),
    is_trending: stats.resonance_count + stats.comment_count + stats.fork_count >= 3,
    ...stats,
  };
};

const mapCommentRow = (row: any): ProjectComment => {
  const author = authorFromRow(row);

  return {
    id: row.id,
    project_id: row.project_id,
    author_id: row.author_id,
    author_name: author.name,
    author_username: author.username,
    content: row.content,
    created_at: row.created_at,
  };
};

const getFollowingIds = async (currentUserId?: string | null) => {
  if (!currentUserId) return new Set<string>();

  const { data } = await db.from('follows').select('following_id').eq('follower_id', currentUserId);

  return new Set((data || []).map((row: any) => row.following_id));
};

const createNotification = async (input: {
  recipientId?: string | null;
  actorId: string;
  projectId?: string | null;
  kind: 'comment' | 'resonance' | 'fork' | 'follow';
}) => {
  if (!input.recipientId || input.recipientId === input.actorId) return;

  await db.from('notifications').insert({
    recipient_id: input.recipientId,
    actor_id: input.actorId,
    project_id: input.projectId,
    kind: input.kind,
  });
};

export const ensureProfile = async (user: User) => {
  const username = makeUsername(user);
  const fullName = String(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Resona Researcher');

  const { data, error } = await db
    .from('profiles')
    .upsert(
      {
        id: user.id,
        username,
        full_name: fullName,
        avatar_url: user.user_metadata?.avatar_url || null,
      },
      { onConflict: 'id' },
    )
    .select('*')
    .single();

  if (error) throw error;

  return data as SocialProfile;
};

export const fetchProjects = async (currentUserId?: string | null) => {
  const followingIds = await getFollowingIds(currentUserId);
  const { data, error } = await db
    .from('projects')
    .select(projectSelect)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => mapProjectRow(row, currentUserId, followingIds));
};

export const fetchProjectDetails = async (projectId: string, currentUserId?: string | null) => {
  const followingIds = await getFollowingIds(currentUserId);
  const { data: projectRow, error: projectError } = await db
    .from('projects')
    .select(projectSelect)
    .eq('id', projectId)
    .single();

  if (projectError) throw projectError;

  const { data: comments, error: commentsError } = await db
    .from('project_comments')
    .select(commentSelect)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (commentsError) throw commentsError;

  return {
    project: mapProjectRow(
      {
        ...projectRow,
        project_comments: comments || [],
      },
      currentUserId,
      followingIds,
    ),
    comments: (comments || []).map(mapCommentRow),
  };
};

export const createProject = async (
  userId: string,
  input: {
    title: string;
    abstract: string;
    content: string;
    tags: string[];
    github_url?: string | null;
    dataset_url?: string | null;
    source_project_id?: string | null;
  },
) => {
  const { data, error } = await db
    .from('projects')
    .insert({
      author_id: userId,
      title: input.title.trim(),
      abstract: input.abstract.trim(),
      content: input.content.trim(),
      tags: input.tags,
      github_url: input.github_url || null,
      dataset_url: input.dataset_url || null,
      source_project_id: input.source_project_id || null,
    })
    .select('id')
    .single();

  if (error) throw error;

  return data.id as string;
};

export const addProjectComment = async (project: SocialProject, userId: string, content: string) => {
  const { data, error } = await db
    .from('project_comments')
    .insert({
      project_id: project.id,
      author_id: userId,
      content: content.trim(),
    })
    .select(commentSelect)
    .single();

  if (error) throw error;

  await createNotification({
    recipientId: project.author_id,
    actorId: userId,
    projectId: project.id,
    kind: 'comment',
  });

  return mapCommentRow(data);
};

export const setProjectResonance = async (project: SocialProject, userId: string, shouldResonate: boolean) => {
  if (shouldResonate) {
    const { error } = await db.from('project_resonances').upsert({
      project_id: project.id,
      user_id: userId,
    });

    if (error) throw error;

    await createNotification({
      recipientId: project.author_id,
      actorId: userId,
      projectId: project.id,
      kind: 'resonance',
    });
    return;
  }

  const { error } = await db.from('project_resonances').delete().eq('project_id', project.id).eq('user_id', userId);

  if (error) throw error;
};

export const forkProject = async (project: SocialProject, userId: string) => {
  const forkedProjectId = await createProject(userId, {
    title: `Fork of ${project.title}`,
    abstract: project.abstract,
    content: project.content,
    tags: project.tags,
    github_url: project.github_url,
    dataset_url: project.dataset_url,
    source_project_id: project.id,
  });

  const { error } = await db.from('project_forks').insert({
    source_project_id: project.id,
    forked_project_id: forkedProjectId,
    author_id: userId,
  });

  if (error) throw error;

  await createNotification({
    recipientId: project.author_id,
    actorId: userId,
    projectId: project.id,
    kind: 'fork',
  });

  return forkedProjectId;
};

export const fetchProfile = async (profileId: string, currentUserId?: string | null) => {
  const { data: profile, error: profileError } = await db.from('profiles').select('*').eq('id', profileId).single();

  if (profileError) throw profileError;

  const [{ data: projects }, { data: forks }, { data: followers }] = await Promise.all([
    db.from('projects').select(projectSelect).eq('author_id', profileId).eq('visibility', 'public').order('created_at', {
      ascending: false,
    }),
    db.from('project_forks').select('id').eq('author_id', profileId),
    db.from('follows').select('follower_id').eq('following_id', profileId),
  ]);

  const isFollowed =
    Boolean(currentUserId) && (followers || []).some((follow: any) => follow.follower_id === currentUserId);
  const mappedProjects = (projects || []).map((row: any) => mapProjectRow(row, currentUserId));

  return {
    profile: {
      id: profile.id,
      full_name: profile.full_name,
      username: profile.username,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      resonance_score: mappedProjects.reduce((score, project) => score + project.resonance_count, 0),
      project_count: mappedProjects.length,
      fork_count: (forks || []).length,
      collaborator_count: (followers || []).length,
      is_followed_by_viewer: isFollowed,
    } satisfies SocialProfile,
    projects: mappedProjects,
  };
};

export const setProfileFollow = async (profile: SocialProfile, currentUserId: string, shouldFollow: boolean) => {
  if (shouldFollow) {
    const { error } = await db.from('follows').upsert({
      follower_id: currentUserId,
      following_id: profile.id,
    });

    if (error) throw error;

    await createNotification({
      recipientId: profile.id,
      actorId: currentUserId,
      kind: 'follow',
    });
    return;
  }

  const { error } = await db.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', profile.id);

  if (error) throw error;
};

export const fetchUnreadNotificationCount = async (currentUserId?: string | null) => {
  if (!currentUserId) return 0;

  const { count, error } = await db
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', currentUserId)
    .is('read_at', null);

  if (error) return 0;

  return count || 0;
};
