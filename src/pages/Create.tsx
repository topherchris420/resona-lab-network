import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Sparkles } from 'lucide-react';

const Create = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic would go here
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Publish Your Research</h1>
            <p className="text-muted-foreground">
              Share your experiments, code, and findings with the scientific community
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="Quantum Entanglement Visualization..."
                  className="bg-muted/50 border-border/50 text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract">Abstract</Label>
                <Textarea
                  id="abstract"
                  placeholder="Provide a brief overview of your research..."
                  className="bg-muted/50 border-border/50 min-h-[120px]"
                  required
                />
              </div>
            </div>

            {/* Tags */}
            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tags (press Enter)"
                    className="bg-muted/50 border-border/50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="gap-1 border-border/50 hover:border-destructive/50 transition-colors"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button type="button" variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI-Suggest Tags
              </Button>
            </div>

            {/* Content */}
            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Research Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your research content in Markdown..."
                  className="bg-muted/50 border-border/50 min-h-[400px] font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Supports Markdown formatting and code blocks
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Repository (Optional)</Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/username/repo"
                  className="bg-muted/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataset">Dataset URL (Optional)</Label>
                <Input
                  id="dataset"
                  type="url"
                  placeholder="https://..."
                  className="bg-muted/50 border-border/50"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg py-6"
              >
                Publish Project
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="px-8"
              >
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
