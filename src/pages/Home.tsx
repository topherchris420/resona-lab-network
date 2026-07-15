import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import FeedFilters from '@/components/FeedFilters';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useProjectRealtime } from '@/hooks/use-project-realtime';
import { fetchProjects, forkProject, setProjectResonance } from '@/lib/socialApi';
import { filterProjectsForFeed, toggleResonanceState, type FeedFilter, type SocialProject } from '@/lib/social';

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<SocialProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('trending');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  const handleFilterChange = (filter: FeedFilter) => {
    setActiveFilter(filter);
    setVisibleCount(8);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setVisibleCount(8);
  };

  useEffect(() => {
    if (authLoading) return;

    setLoading(true);
    fetchProjects(user?.id)
      .then((nextProjects) => {
        setProjects(nextProjects);
        setError(null);
      })
      .catch((fetchError) => {
        console.error('Failed to fetch projects:', fetchError);
        setError('The social feed is not available yet. Apply the Supabase migrations, then refresh.');
      })
      .finally(() => setLoading(false));
  }, [authLoading, user?.id]);

  // Live-sync resonance and fork counts across every open session.
  useProjectRealtime(user?.id, (projectId, stats) => {
    setProjects((current) =>
      current.map((item) =>
        item.id === projectId
          ? {
              ...item,
              resonance_count: stats.resonance_count,
              fork_count: stats.fork_count,
              comment_count: stats.comment_count,
              has_resonated: stats.has_resonated,
              is_trending: stats.resonance_count + stats.comment_count + stats.fork_count >= 3,
            }
          : item,
      ),
    );
  });

  const featuredProjects = useMemo(
    () => filterProjectsForFeed(projects, { filter: 'trending', query: '' }).slice(0, 3),
    [projects],
  );
  const filteredProjects = useMemo(
    () => filterProjectsForFeed(projects, { filter: activeFilter, query }),
    [projects, activeFilter, query],
  );
  const visibleProjects = filteredProjects.slice(0, visibleCount);

  const requireAuth = () => {
    if (user) return true;
    navigate('/auth');
    return false;
  };

  const handleResonate = async (project: SocialProject) => {
    if (!requireAuth()) return;

    const shouldResonate = !project.has_resonated;
    setProjects((current) => current.map((item) => (item.id === project.id ? toggleResonanceState(item, shouldResonate) : item)));

    try {
      await setProjectResonance(project, user!.id, shouldResonate);
    } catch (resonanceError) {
      console.error('Failed to update resonance:', resonanceError);
      setProjects((current) => current.map((item) => (item.id === project.id ? toggleResonanceState(item, project.has_resonated) : item)));
      toast({ title: 'Could not update resonance', variant: 'destructive' });
    }
  };

  const handleFork = async (project: SocialProject) => {
    if (!requireAuth()) return;

    try {
      const forkedProjectId = await forkProject(project, user!.id);
      toast({ title: 'Fork created' });
      navigate(`/project/${forkedProjectId}`);
    } catch (forkError) {
      console.error('Failed to fork project:', forkError);
      toast({ title: 'Could not fork project', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background scanline-overlay">
      <AnimatedBackground />
      <Header searchValue={query} onSearchChange={handleQueryChange} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="retro-panel p-8 text-center">
          <h1 className="text-3xl md:text-5xl font-display text-primary tracking-widest">RESONA</h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">A NETWORK FOR OPEN SCIENCE & CREATION</p>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">PUBLISH EXPERIMENTS. COMMENT. FORK. BUILD IN PUBLIC.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button asChild className="retro-button">
              <Link to={user ? '/create' : '/auth'}>{user ? 'Publish A Project' : 'Join The Board'}</Link>
            </Button>
            <Button asChild className="retro-button">
              <a href="#live-feed">Browse The Feed</a>
            </Button>
          </div>
        </section>

        {error && (
          <section className="retro-panel p-6 text-center text-destructive">
            <p>{error}</p>
          </section>
        )}

        {featuredProjects.length > 0 && (
          <>
            <div className="text-center text-accent font-display text-lg">-=[ &#x269B; ]=-</div>
            <section className="retro-panel p-8">
              <h2 className="text-xl md:text-2xl font-display text-center text-accent">FEATURED EXPERIMENTS</h2>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} onResonate={handleResonate} onFork={handleFork} />
                ))}
              </div>
            </section>
          </>
        )}

        <div className="text-center text-accent font-display text-lg">-=[ &#x269B; ]=-</div>

        <section className="retro-panel p-8 text-center">
          <p className="text-base md:text-lg text-muted-foreground">LIVE SOCIAL PROOF FROM THE BOARD</p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-16">
            <div>
              <p className="text-3xl md:text-4xl font-display text-primary">{projects.length}</p>
              <p className="text-sm md:text-base text-muted-foreground">PROJECTS PUBLISHED</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-display text-primary">
                {projects.reduce((total, project) => total + project.comment_count, 0)}
              </p>
              <p className="text-sm md:text-base text-muted-foreground">COMMENTS POSTED</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-display text-primary">
                {projects.reduce((total, project) => total + project.fork_count, 0)}
              </p>
              <p className="text-sm md:text-base text-muted-foreground">FORKS CREATED</p>
            </div>
          </div>
        </section>

        <div className="text-center text-accent font-display text-lg">-=[ &#x269B; ]=-</div>

        <section id="live-feed" className="retro-panel p-8">
          <div className="flex flex-col gap-4 text-center sm:text-left md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-display text-accent">LIVE FEED</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {query ? `${filteredProjects.length} result${filteredProjects.length === 1 ? '' : 's'} for "${query}"` : 'Fresh experiments from the network'}
              </p>
            </div>
            <Button asChild className="retro-button">
              <Link to={user ? '/create' : '/auth'}>PUBLISH</Link>
            </Button>
          </div>

          <div className="mt-8 space-y-6">
            <div className="retro-panel p-4">
              <FeedFilters activeFilter={activeFilter} onFilterChange={(filter) => handleFilterChange(filter as FeedFilter)} />
            </div>

            {loading ? (
              <div className="retro-panel p-12 text-center text-muted-foreground">Loading the board...</div>
            ) : visibleProjects.length > 0 ? (
              <div className="space-y-6">
                {visibleProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} onResonate={handleResonate} onFork={handleFork} />
                ))}
              </div>
            ) : (
              <div className="retro-panel p-12 text-center">
                <h3 className="text-xl font-display text-primary">NO PROJECTS FOUND</h3>
                <p className="mt-4 text-muted-foreground">
                  {projects.length === 0 ? 'Be the first researcher on the board.' : 'Try a different search or filter.'}
                </p>
                <Button asChild className="retro-button mt-6">
                  <Link to={user ? '/create' : '/auth'}>{projects.length === 0 ? 'Publish First Project' : 'Publish Something New'}</Link>
                </Button>
              </div>
            )}

            {visibleCount < filteredProjects.length && (
              <div className="text-center pt-8">
                <button type="button" className="retro-button" onClick={() => setVisibleCount((count) => count + 8)}>
                  LOAD_MORE
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;