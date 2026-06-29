import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Users, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

interface Document {
  id: string;
  title: string;
  content: string;
}

interface LabDocumentProps {
  labId: string;
}

const LabDocument = ({ labId }: LabDocumentProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);

  useEffect(() => {
    fetchDocuments();
    return () => {
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
    };
  }, [labId]);

  useEffect(() => {
    if (activeDoc) {
      setupCollaboration(activeDoc.id);
    }
  }, [activeDoc?.id]);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('lab_documents')
      .select('*')
      .eq('lab_id', labId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
    } else if (data && data.length > 0) {
      setDocuments(data);
      setActiveDoc(data[0]);
      setContent(data[0].content || '');
      setTitle(data[0].title);
    }
  };

  const setupCollaboration = (docId: string) => {
    // Clean up previous connection
    providerRef.current?.destroy();
    ydocRef.current?.destroy();

    // Create new Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Create WebRTC provider for real-time collaboration
    const provider = new WebrtcProvider(`resona-doc-${docId}`, ydoc, {
      signaling: ['wss://signaling.yjs.dev'],
    });
    providerRef.current = provider;

    // Track awareness (connected users)
    const awareness = provider.awareness;
    const username = profile?.username || profile?.full_name || 'Researcher';
    awareness.setLocalStateField('user', { name: username, color: getRandomColor() });

    awareness.on('change', () => {
      const states = Array.from(awareness.getStates().values());
      const users = states
        .filter((state: any) => state.user)
        .map((state: any) => state.user.name);
      setCollaborators(users);
    });

    // Sync text content
    const ytext = ydoc.getText('content');
    
    ytext.observe(() => {
      setContent(ytext.toString());
    });

    // Initialize with current content if empty
    if (ytext.length === 0 && activeDoc?.content) {
      ytext.insert(0, activeDoc.content);
    }
  };

  const getRandomColor = () => {
    const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleContentChange = (newContent: string) => {
    if (ydocRef.current) {
      const ytext = ydocRef.current.getText('content');
      ytext.delete(0, ytext.length);
      ytext.insert(0, newContent);
    }
    setContent(newContent);
  };

  const createDocument = async () => {
    if (!user) {
      toast({ title: 'Sign in to create documents', variant: 'destructive' });
      return;
    }

    const { data, error } = await supabase
      .from('lab_documents')
      .insert({ lab_id: labId, title: 'Untitled Document', content: '' })
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      toast({ title: 'Failed to create document', variant: 'destructive' });
    } else {
      setDocuments([data, ...documents]);
      setActiveDoc(data);
      setContent('');
      setTitle(data.title);
      toast({ title: 'Document created!' });
    }
  };

  const saveDocument = useCallback(async () => {
    if (!activeDoc) return;
    if (!user) {
      toast({ title: 'Sign in to save documents', variant: 'destructive' });
      return;
    }
    
    setSaving(true);
    const { error } = await supabase
      .from('lab_documents')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', activeDoc.id);

    setSaving(false);
    if (error) {
      console.error('Error saving document:', error);
      toast({ title: 'Failed to save document', variant: 'destructive' });
    } else {
      toast({ title: 'Document saved!' });
      // Update local state
      setDocuments(docs => 
        docs.map(d => d.id === activeDoc.id ? { ...d, title, content } : d)
      );
    }
  }, [activeDoc, title, content, toast, user]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeDoc && content !== activeDoc.content) {
        saveDocument();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeDoc, content, saveDocument]);

  return (
    <div className="glass-card rounded-xl p-4 h-[600px] flex">
      {/* Sidebar */}
      <div className="w-48 border-r border-border pr-4 flex flex-col">
        <Button onClick={createDocument} size="sm" className="mb-4 retro-button" disabled={!user}>
          <FileText className="w-4 h-4 mr-2" />
          New Doc
        </Button>
        <div className="flex-1 overflow-auto space-y-2">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => {
                setActiveDoc(doc);
                setContent(doc.content || '');
                setTitle(doc.title);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeDoc?.id === doc.id
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-muted'
              }`}
            >
              {doc.title}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 pl-4 flex flex-col">
        {activeDoc ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none px-0 focus-visible:ring-0"
                placeholder="Document title..."
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{collaborators.length} editing</span>
                </div>
                <Button onClick={saveDocument} size="sm" disabled={saving || !user}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="flex-1 bg-background/30 resize-none font-mono text-sm"
              placeholder="Start writing your document..."
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No documents yet</p>
              <Button onClick={createDocument} className="mt-4" variant="outline">
                Create your first document
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabDocument;
