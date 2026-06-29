import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Radio, GitFork, Users, TrendingUp } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { fetchProfile, forkProject, setProfileFollow, setProjectResonance } from '@/lib/socialApi';
import { getInitials, toggleResonanceState, type SocialProfile, type SocialProject } from '@/lib/social';

const ResonanceGraph3D = lazy(() => import('@/components/ResonanceGraph3D'));

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [projects, setProjects] = useState<SocialProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileId = id || user?.id;
  const isOwnProfile = Boolean(user && profile?.id === user.id);

  useEffect(() => {
    if (authLoading) return;

    if (!profileId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchProfile(profileId, user?.id)
      .then(({ profile: nextProfile, projects: nextProjects }) => {
        setProfile(nextProfile);
        setProjects(nextProjects);
        setError(null);
      })
      .catch((profileError) => {
        console.error('Failed to fetch profile:', profileError);
        setError('Profile not found or the social tables are not migrated yet.');
      })
      .finally(() => setLoading(false));
  }, [authLoading, profileId, user?.id]);

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

  const handleFollow = async () => {
    if (!profile || !requireAuth() || isOwnProfile) return;

    const shouldFollow = !profile.is_followed_by_viewer;
    setProfile({
      ...profile,
      is_followed_by_viewer: shouldFollow,
      collaborator_count: Math.max(0, profile.collaborator_count + (shouldFollow ? 1 : -1)),
    });

    try {
      await setProfileFollow(profile, user!.id, shouldFollow);
    } catch (followError) {
      console.error('Failed to update follow:', followError);
      setProfile(profile);
      toast({ title: 'Could not update follow', variant: 'destructive' });
    }
  };

  if (!authLoading && !profileId) {
    return (
      <div className="min-h-screen bg-background">
        <ParticleBackground />
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="retro-panel p-8 text-center">
            <h1 className="text-3xl font-display text-primary">SIGN IN TO VIEW YOUR PROFILE</h1>
            <p className="mt-4 text-muted-foreground">Profiles show real projects, forks, and resonance from the board.</p>
            <Button asChild className="retro-button mt-8">
              <Link to="/auth">Login or Sign Up</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ParticleBackground />
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="retro-panel p-12 text-center text-muted-foreground">Loading profile...</div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <ParticleBackground />
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="retro-panel p-12 text-center">
            <h1 className="text-2xl font-display text-primary">PROFILE UNAVAILABLE</h1>
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

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="retro-panel p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Avatar className="h-32 w-32 border-4 border-primary/30">
              <AvatarImage src={profile.avatar_url || undefined} alt="" />
              <AvatarFallback className="bg-card text-primary text-4xl">{getInitials(profile.full_name)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-1">{profile.full_name}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>

                <div className="flex gap-2">
                  {!isOwnProfile && (
                    <Button className="retro-button" onClick={handleFollow} aria-pressed={profile.is_followed_by_viewer}>
                      {profile.is_followed_by_viewer ? 'Following' : 'Follow'}
                    </Button>
                  )}
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await signOut();
                        navigate('/');
                      }}
                    >
                      Sign Out
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-foreground/80 leading-relaxed max-w-2xl">
                {profile.bio || 'No bio yet. Publish a project and let the work speak first.'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Radio className="h-5 w-5" />
                    <span className="text-2xl font-bold">{profile.resonance_score}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Resonance Score</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-2xl font-bold">{profile.project_count}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Projects</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-secondary">
                    <GitFork className="h-5 w-5" />
                    <span className="text-2xl font-bold">{profile.fork_count}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Forks</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-accent">
                    <Users className="h-5 w-5" />
                    <span className="text-2xl font-bold">{profile.collaborator_count}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="retro-panel">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="forks">Forks</TabsTrigger>
            <TabsTrigger value="collabs">Collaborations</TabsTrigger>
            <TabsTrigger value="graph">Resonance Graph</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            {projects.length > 0 ? (
              projects.map((project) => (
                <ProjectCard key={project.id} project={project} onResonate={handleResonate} onFork={handleFork} />
              ))
            ) : (
              <div className="retro-panel p-12 text-center">
                <p className="text-muted-foreground">No projects yet.</p>
                {isOwnProfile && (
                  <Button asChild className="retro-button mt-6">
                    <Link to="/create">Publish your first project</Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="forks" className="space-y-6">
            <div className="retro-panel p-12 text-center">
              <GitFork className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Fork records are counted in the profile stats. A dedicated fork timeline is next.</p>
            </div>
          </TabsContent>

          <TabsContent value="collabs" className="space-y-6">
            <div className="retro-panel p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Followers and lab collaborators will appear here as the network grows.</p>
            </div>
          </TabsContent>

          <TabsContent value="graph" className="space-y-6">
            <div className="retro-panel p-4">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-foreground">Resonance Graph</h3>
                <p className="text-sm text-muted-foreground">Prototype graph view. The feed and project relationships are now the source of truth.</p>
              </div>
              <Suspense fallback={<div className="w-full h-[500px] bg-background/50 flex items-center justify-center text-muted-foreground animate-pulse">Loading 3D visualization...</div>}>
                <ResonanceGraph3D />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;