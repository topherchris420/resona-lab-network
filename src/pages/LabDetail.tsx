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

interface Lab {
  id: string;
  name: string;
  description: string | null;
}

const LabDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchLab();
      setupPresence();
    }
  }, [id]);

  const fetchLab = async () => {
    const { data, error } = await supabase
      .from('labs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching lab:', error);
    } else {
      setLab(data);
    }
    setLoading(false);
  };

  const setupPresence = () => {
    const username = `User_${Math.random().toString(36).substr(2, 5)}`;
    
    const channel = supabase.channel(`lab_presence:${id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat().map((p: any) => p.username);
        setActiveUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ username });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AnimatedBackground />
        <Header />
        <main className="relative z-10 container mx-auto px-4 pt-24">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-muted rounded"></div>
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
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{lab.name}</h1>
              {lab.description && (
                <p className="text-muted-foreground text-sm">{lab.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{activeUsers.length} active</span>
            <div className="flex -space-x-2">
              {activeUsers.slice(0, 5).map((user, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-medium text-primary-foreground border-2 border-background"
                >
                  {user.charAt(0).toUpperCase()}
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

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="glass-card border-primary/20 mb-4">
            <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
              <FileText className="w-4 h-4" />
              Document
            </TabsTrigger>
            <TabsTrigger value="whiteboard" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
              <Palette className="w-4 h-4" />
              Whiteboard
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
