import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

interface Message {
  id: string;
  created_at: string;
  sender_type: 'member' | 'guardian' | 'business';
  sender_id: string;
  message: string;
  is_read: boolean;
}

interface PortalMessagingProps {
  user: User;
  referenceId: string;
  recipientOwnerId: string;
  portalType: 'gym' | 'school';
  senderType: 'member' | 'guardian';
  businessName?: string;
}

export function PortalMessaging({
  user,
  referenceId,
  recipientOwnerId,
  portalType,
  senderType,
  businessName = 'the team',
}: PortalMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`portal-messages-${referenceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portal_messages',
          filter: `reference_id=eq.${referenceId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [referenceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMessages() {
    setLoading(true);
    const { data } = await supabase
      .from('portal_messages')
      .select('*')
      .eq('reference_id', referenceId)
      .eq('portal_type', portalType)
      .order('created_at', { ascending: true });

    setMessages((data as Message[]) || []);
    setLoading(false);
  }

  async function sendMessage() {
    if (!text.trim()) return;
    setSending(true);
    const msg = text.trim();
    setText('');

    await supabase.from('portal_messages').insert({
      sender_type: senderType,
      sender_id: user.id,
      recipient_owner_id: recipientOwnerId,
      portal_type: portalType,
      reference_id: referenceId,
      message: msg,
      is_read: false,
    });

    setSending(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm text-foreground">Messages with {businessName}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No messages yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Send a message to get started.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isOwn = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm',
                  isOwn
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                )}>
                  <p className="leading-relaxed">{msg.message}</p>
                  <p className={cn(
                    'text-[10px] mt-1 text-right',
                    isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  )}>
                    {format(new Date(msg.created_at), 'h:mm a')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 h-10"
            disabled={sending}
          />
          <Button
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={sendMessage}
            disabled={!text.trim() || sending}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
