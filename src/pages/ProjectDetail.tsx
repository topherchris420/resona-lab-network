import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import MarkdownContent from '@/components/MarkdownContent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Radio, GitFork, MessageSquare, Share2, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { addProjectComment, fetchProjectDetails, forkProject, setProjectResonance } from '@/lib/socialApi';
import { formatRelativeTime, getInitials, toggleResonanceState, type ProjectComment, type SocialProject } from '@/lib/social';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<SocialProject | null>(null);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!id || authLoading) return;

    setLoading(true);
    fetchProjectDetails(id, user?.id)
      .then(({ project: nextProject, comments: nextComments }) => {
        setProject(nextProject);
        setComments(nextComments);
        setError(null);
      })
      .catch((fetchError) => {
        console.error('Failed to fetch project:', fetchError);
        setError('Project not found or the social tables are not migrated yet.');
      })
      .finally(() => setLoading(false));
  }, [authLoading, id, user?.id]);

  const requireAuth = () => {
    if (user) return true;
    navigate('/auth');
    return false;
  };

  const handleResonate = async () => {
    if (!project || !requireAuth()) return;

    const previousProject = project;
    const shouldResonate = !project.has_resonated;
    setProject(toggleResonanceState(project, shouldResonate));

    try {
      await setProjectResonance(project, user!.id, shouldResonate);
    } catch (resonanceError) {
      console.error('Failed to update resonance:', resonanceError);
      setProject(previousProject);
      toast({ title: 'Could not update resonance', variant: 'destructive' });
    }
  };

  const handleFork = async () => {
    if (!project || !requireAuth()) return;

    try {
      const forkedProjectId = await forkProject(project, user!.id);
      toast({ title: 'Fork created' });
      navigate(`/project/${forkedProjectId}`);
    } catch (forkError) {
      console.error('Failed to fork project:', forkError);
      toast({ title: 'Could not fork project', variant: 'destructive' });
    }
  };

  const handleShare = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    toast({ title: 'Project link copied' });
  };

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!project || !requireAuth() || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const comment = await addProjectComment(project, user!.id, commentText);
      setComments((current) => [...current, comment]);
      setProject({ ...project, comment_count: project.comment_count + 1 });
      setCommentText('');
    } catch (commentError) {
      console.error('Failed to comment:', commentError);
      toast({ title: 'Could not post comment', variant: 'destructive' });
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ParticleBackground />
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="retro-panel p-12 text-center text-muted-foreground">Loading project...</div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <ParticleBackground />
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="retro-panel p-12 text-center">
            <h1 className="text-2xl font-display text-primary">PROJECT UNAVAILABLE</h1>
            <p className="mt-4 text-muted-foreground">{error}</p>
            <Button asChild className="retro-button mt-8">
              <Link to="/">Back to feed</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{project.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <Link to={`/profile/${project.author_id}`} className="flex items-center gap-2 hover:text-primary">
                <Avatar className="h-10 w-10 border-2 border-primary/30">
                  <AvatarImage src={project.author_avatar_url || undefined} alt="" />
                  <AvatarFallback className="bg-card text-primary">{getInitials(project.author_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{project.author_name}</p>
                  <p className="text-sm">@{project.author_username}</p>
                </div>
              </Link>
              <span className="text-sm">•</span>
              <span className="text-sm">{formatRelativeTime(project.created_at)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="border-border/50">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="retro-panel p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  {project.resonance_count} Resonance{project.resonance_count === 1 ? '' : 's'}
                </span>
                <span className="flex items-center gap-2">
                  <GitFork className="h-5 w-5" />
                  {project.fork_count} Fork{project.fork_count === 1 ? '' : 's'}
                </span>
                <a href="#discussion" className="flex items-center gap-2 hover:text-primary">
                  <MessageSquare className="h-5 w-5" />
                  {comments.length} Comment{comments.length === 1 ? '' : 's'}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Button className="retro-button gap-2" onClick={handleResonate} aria-pressed={project.has_resonated}>
                  <Radio className="h-4 w-4" />
                  {project.has_resonated ? 'Resonated' : 'Resonate'}
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleFork}>
                  <GitFork className="h-4 w-4" />
                  Fork
                </Button>
                <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share project">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="retro-panel p-6">
            <h2 className="text-xl font-semibold mb-3 text-foreground">Abstract</h2>
            <p className="text-foreground/80 leading-relaxed">{project.abstract}</p>
          </div>

          {(project.github_url || project.dataset_url) && (
            <div className="retro-panel p-4 flex flex-wrap gap-3">
              {project.github_url && (
                <Button asChild variant="outline" className="gap-2">
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> Repository
                  </a>
                </Button>
              )}
              {project.dataset_url && (
                <Button asChild variant="outline" className="gap-2">
                  <a href={project.dataset_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> Dataset
                  </a>
                </Button>
              )}
            </div>
          )}

          <div className="retro-panel p-8 prose prose-invert prose-cyan max-w-none">
            <MarkdownContent content={project.content} />
          </div>

          <section id="discussion" className="retro-panel p-6 scroll-mt-24">
            <h2 className="text-xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Discussion ({comments.length})
            </h2>

            {user ? (
              <form onSubmit={handleAddComment} className="mb-8 space-y-3">
                <Textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Add a replication note, question, or build idea..."
                  className="bg-background/50 min-h-28"
                />
                <div className="flex justify-end">
                  <Button type="submit" className="retro-button" disabled={submittingComment || !commentText.trim()}>
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mb-8 border border-border p-4 text-center text-muted-foreground">
                <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to join the discussion.
              </div>
            )}

            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No comments yet. Start the conversation.</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border border-border p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <Link to={`/profile/${comment.author_id}`} className="font-semibold text-primary hover:underline">
                        {comment.author_name} @{comment.author_username}
                      </Link>
                      <span className="text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
                    </div>
                    <p className="mt-3 text-foreground/85 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </article>
    </div>
  );
};

export default ProjectDetail;