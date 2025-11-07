import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio, GitFork, Users, TrendingUp } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';

const Profile = () => {
  const user = {
    name: 'Dr. Sarah Chen',
    username: '@sarahchen',
    bio: 'Quantum Computing Researcher | AI Scientist | Building the future at the intersection of quantum mechanics and machine learning.',
    resonanceScore: 2847,
    projects: 12,
    forks: 156,
    collaborators: 34,
  };

  const userProjects = [
    {
      id: '1',
      title: 'Quantum Entanglement Visualization',
      abstract: 'Real-time visualization of quantum entangled states in neural networks.',
      author: 'Dr. Sarah Chen',
      tags: ['Quantum', 'Neural Networks'],
      resonanceCount: 342,
      forkCount: 45,
      commentCount: 78,
      createdAt: '2 hours ago',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Profile Header */}
        <div className="glass-card rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-primary/30">
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-4xl">
                SC
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">{user.name}</h1>
                <p className="text-muted-foreground">{user.username}</p>
              </div>

              <p className="text-foreground/80 leading-relaxed max-w-2xl">{user.bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Radio className="h-5 w-5" />
                    <span className="text-2xl font-bold">{user.resonanceScore}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Resonance Score</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-2xl font-bold">{user.projects}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Projects</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-secondary">
                    <GitFork className="h-5 w-5" />
                    <span className="text-2xl font-bold">{user.forks}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Forks</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-accent">
                    <Users className="h-5 w-5" />
                    <span className="text-2xl font-bold">{user.collaborators}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Collaborators</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="glass-card">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="forks">Forks</TabsTrigger>
            <TabsTrigger value="collabs">Collaborations</TabsTrigger>
            <TabsTrigger value="graph">Resonance Graph</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            {userProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </TabsContent>

          <TabsContent value="forks" className="space-y-6">
            <div className="glass-card rounded-xl p-12 text-center">
              <GitFork className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No forks yet</p>
            </div>
          </TabsContent>

          <TabsContent value="collabs" className="space-y-6">
            <div className="glass-card rounded-xl p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No collaborations yet</p>
            </div>
          </TabsContent>

          <TabsContent value="graph" className="space-y-6">
            <div className="glass-card rounded-xl p-12 text-center">
              <div className="space-y-4">
                <div className="text-6xl">🕸️</div>
                <h3 className="text-xl font-semibold text-foreground">Resonance Graph</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Interactive visualization of your scientific connections and collaborative network. Coming soon.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
