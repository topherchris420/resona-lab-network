import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  username: string;
  content: string;
  created_at: string;
}

interface LabChatProps {
  labId: string;
}

const LabChat = ({ labId }: LabChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username] = useState(() => `User_${Math.random().toString(36).substr(2, 5)}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    const channel = supabase
      .channel(`lab_messages:${labId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lab_messages',
          filter: `lab_id=eq.${labId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [labId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('lab_messages')
      .select('*')
      .eq('lab_id', labId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('lab_messages')
      .insert({
        lab_id: labId,
        username,
        content: newMessage.trim()
      });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="glass-card rounded-xl p-4 h-[600px] flex flex-col">
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${message.username === username ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary">{message.username}</span>
                  <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2 ${
                    message.username === username
                      ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
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
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-background/50"
        />
        <Button type="submit" size="icon" className="bg-gradient-to-r from-primary to-accent">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default LabChat;
