import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, MessageSquare, FileText, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lab {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

const Labs = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabName, setNewLabName] = useState('');
  const [newLabDescription, setNewLabDescription] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    const { data, error } = await supabase
      .from('labs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching labs:', error);
    } else {
      setLabs(data || []);
    }
    setLoading(false);
  };

  const createLab = async () => {
    if (!newLabName.trim()) {
      toast({ title: 'Please enter a lab name', variant: 'destructive' });
      return;
    }

    const { data, error } = await supabase
      .from('labs')
      .insert({ name: newLabName, description: newLabDescription })
      .select()
      .single();

    if (error) {
      console.error('Error creating lab:', error);
      toast({ title: 'Failed to create lab', variant: 'destructive' });
    } else {
      setLabs([data, ...labs]);
      setNewLabName('');
      setNewLabDescription('');
      setDialogOpen(false);
      toast({ title: 'Lab created successfully!' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatedBackground />
      <Header />
      
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Collaboration Labs
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time spaces for teams to work together on projects
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Create Lab
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/20">
              <DialogHeader>
                <DialogTitle>Create New Lab</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Lab name"
                  value={newLabName}
                  onChange={(e) => setNewLabName(e.target.value)}
                  className="bg-background/50"
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newLabDescription}
                  onChange={(e) => setNewLabDescription(e.target.value)}
                  className="bg-background/50"
                />
                <Button onClick={createLab} className="w-full bg-gradient-to-r from-primary to-accent">
                  Create Lab
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-muted rounded w-full mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-8 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : labs.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No labs yet</h2>
            <p className="text-muted-foreground mb-6">Create your first collaboration lab to get started</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-primary to-accent">
              <Plus className="w-4 h-4 mr-2" />
              Create Lab
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs.map((lab) => (
              <Link key={lab.id} to={`/labs/${lab.id}`}>
                <div className="glass-card rounded-xl p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-glow group cursor-pointer h-full">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {lab.name}
                  </h3>
                  {lab.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {lab.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>Docs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Palette className="w-4 h-4" />
                      <span>Whiteboard</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Labs;
