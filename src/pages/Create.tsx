import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { createProject } from '@/lib/socialApi';

const keywordTags: Array<[string, string]> = [
  ['quantum', 'Quantum Computing'],
  ['neural', 'Neural Networks'],
  ['ai', 'AI'],
  ['machine learning', 'Machine Learning'],
  ['biology', 'Biology'],
  ['genome', 'Genomics'],
  ['physics', 'Physics'],
  ['chemistry', 'Chemistry'],
  ['robot', 'Robotics'],
  ['dataset', 'Dataset'],
  ['protocol', 'Protocol'],
  ['experiment', 'Experiment'],
  ['simulation', 'Simulation'],
  ['visualization', 'Visualization'],
  ['open source', 'Open Source'],
];

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [content, setContent] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [datasetUrl, setDatasetUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const suggestedTags = useMemo(() => {
    const text = `${title} ${abstract} ${content}`.toLowerCase();
    return keywordTags
      .filter(([keyword, tag]) => text.includes(keyword) && !tags.includes(tag))
      .map(([, tag]) => tag)
      .slice(0, 5);
  }, [abstract, content, tags, title]);

  const handleAddTag = (nextTag = tagInput) => {
    const cleanedTag = nextTag.trim();
    if (cleanedTag && !tags.includes(cleanedTag)) {
      setTags([...tags, cleanedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSuggestTags = () => {
    if (suggestedTags.length === 0) {
      toast({ title: 'Add more title or abstract detail for tag suggestions.' });
      return;
    }

    setTags([...tags, ...suggestedTags]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }

    setSubmitting(true);
    try {
      const projectId = await createProject(user.id, {
        title,
        abstract,
        content,
        tags,
        github_url: githubUrl || null,
        dataset_url: datasetUrl || null,
      });
      toast({ title: 'Project published' });
      navigate(`/project/${projectId}`);
    } catch (error) {
      console.error('Failed to publish project:', error);
      toast({ title: 'Could not publish project', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <ParticleBackground />
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="retro-panel p-8 text-center">
            <h1 className="text-3xl font-display text-primary">SIGN IN TO PUBLISH</h1>
            <p className="mt-4 text-muted-foreground">Research posts need a real profile so comments, forks, and credit can attach to the right person.</p>
            <Button asChild className="retro-button mt-8">
              <Link to="/auth">Login or Sign Up</Link>
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

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Publish Your Research</h1>
            <p className="text-muted-foreground">Share an experiment, code path, dataset, or research note with the board.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="retro-panel p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Quantum Entanglement Visualization..."
                  className="bg-muted/50 border-border/50 text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract">Abstract</Label>
                <Textarea
                  id="abstract"
                  value={abstract}
                  onChange={(event) => setAbstract(event.target.value)}
                  placeholder="What did you build, test, or discover?"
                  className="bg-muted/50 border-border/50 min-h-[120px]"
                  required
                />
              </div>
            </div>

            <div className="retro-panel p-6 space-y-4">
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tags (press Enter)"
                    className="bg-muted/50 border-border/50"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => handleAddTag()} aria-label="Add tag">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="gap-1 border-border/50 hover:border-destructive/50 transition-colors">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-destructive" aria-label={`Remove ${tag}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button type="button" variant="outline" className="gap-2" onClick={handleSuggestTags}>
                <Sparkles className="h-4 w-4" />
                Suggest Tags
              </Button>
            </div>

            <div className="retro-panel p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Research Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write your research content in Markdown..."
                  className="bg-muted/50 border-border/50 min-h-[400px] font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">Supports headings, lists, paragraphs, and fenced code blocks.</p>
              </div>
            </div>

            <div className="retro-panel p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Repository (Optional)</Label>
                <Input
                  id="github"
                  type="url"
                  value={githubUrl}
                  onChange={(event) => setGithubUrl(event.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="bg-muted/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataset">Dataset URL (Optional)</Label>
                <Input
                  id="dataset"
                  type="url"
                  value={datasetUrl}
                  onChange={(event) => setDatasetUrl(event.target.value)}
                  placeholder="https://..."
                  className="bg-muted/50 border-border/50"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="retro-button flex-1 text-lg py-6" disabled={submitting}>
                {submitting ? 'Publishing...' : 'Publish Project'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/')} className="px-8">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Create;