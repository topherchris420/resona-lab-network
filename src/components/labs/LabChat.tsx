import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface Message {
  id: string;
  username: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

interface LabChatProps {
  labId: string;
}

const LabChat = ({ labId }: LabChatProps) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const username = profile?.username || profile?.full_name || 'Researcher';

  useEffect(() => {
    let cancelled = false;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('lab_messages')
        .select('*')
        .eq('lab_id', labId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching messages:', error);
      } else if (!cancelled) {
        setMessages(data || []);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`lab_messages:${labId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lab_messages',
          filter: `lab_id=eq.${labId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [labId]);

  useEffect(() => {
    // The Radix ScrollArea root doesn't scroll; its inner viewport does.
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages]);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !newMessage.trim()) return;

    const { error } = await supabase.from('lab_messages').insert({
      lab_id: labId,
      user_id: user.id,
      username,
      content: newMessage.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="retro-panel p-4 h-[600px] flex flex-col">
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No messages yet. Start the conversation.</div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex flex-col ${message.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary">{message.username}</span>
                  <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
                </div>
                <div className={`max-w-[80%] border border-border px-4 py-2 ${message.user_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {message.content}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="flex gap-2 mt-4 pt-4 border-t border-border">
        <Input
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          placeholder={user ? 'Type a message...' : 'Sign in to chat'}
          className="flex-1 bg-background/50"
          disabled={!user}
        />
        <Button type="submit" size="icon" className="retro-button" disabled={!user || !newMessage.trim()} aria-label="Send message">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default LabChat;