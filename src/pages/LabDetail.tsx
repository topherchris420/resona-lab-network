import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import AnimatedBackground from '@/components/AnimatedBackground';
import LabChat from '@/components/labs/LabChat';
import LabDocument from '@/components/labs/LabDocument';
import LabWhiteboard from '@/components/labs/LabWhiteboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, FileText, Palette, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface Lab {
  id: string;
  name: string;
  description: string | null;
}

const LabDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchLab = async () => {
      const { data, error } = await supabase.from('labs').select('*').eq('id', id).single();
      if (cancelled) return;

      if (error) {
        console.error('Error fetching lab:', error);
      } else {
        setLab(data);
      }
      setLoading(false);
    };

    fetchLab();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id || !user) {
      setActiveUsers([]);
      return;
    }

    const username = profile?.username || profile?.full_name || 'Researcher';
    const channel = supabase
      .channel(`lab_presence:${id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state)
          .flat()
          .map((presence: any) => presence.username)
          .filter(Boolean);
        setActiveUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ username, user_id: user.id });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, profile?.full_name, profile?.username, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AnimatedBackground />
        <Header />
        <main className="relative z-10 container mx-auto px-4 pt-24">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AnimatedBackground />
        <Header />
        <main className="relative z-10 container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Lab not found</h1>
          <Link to="/labs">
            <Button>Back to Labs</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatedBackground />
      <Header />

      <main className="relative z-10 container mx-auto px-4 pt-24 pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/labs">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10" aria-label="Back to labs">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{lab.name}</h1>
              {lab.description && <p className="text-muted-foreground text-sm">{lab.description}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{activeUsers.length} active</span>
            <div className="flex -space-x-2">
              {activeUsers.slice(0, 5).map((activeUser, index) => (
                <div key={`${activeUser}-${index}`} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground border-2 border-background">
                  {activeUser.charAt(0).toUpperCase()}
                </div>
              ))}
              {activeUsers.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                  +{activeUsers.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>

        {!user && (
          <div className="retro-panel p-4 mb-4 text-center text-muted-foreground">
            <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to chat, edit docs, and save whiteboards.
          </div>
        )}

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="retro-panel mb-4">
            <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
              <MessageSquare className="w-4 h-4" /> Chat
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
              <FileText className="w-4 h-4" /> Document
            </TabsTrigger>
            <TabsTrigger value="whiteboard" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
              <Palette className="w-4 h-4" /> Whiteboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-0">
            <LabChat labId={id!} />
          </TabsContent>

          <TabsContent value="document" className="mt-0">
            <LabDocument labId={id!} />
          </TabsContent>

          <TabsContent value="whiteboard" className="mt-0">
            <LabWhiteboard labId={id!} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LabDetail;