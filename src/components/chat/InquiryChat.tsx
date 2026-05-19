import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Send, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InquiryChatProps {
  inquiry: any;
  onClose: () => void;
}

export default function InquiryChat({ inquiry, onClose }: InquiryChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isBuyer = (user?.id === inquiry.buyer_id);
  
  // Get seller_id safely, including for old inquiries missing the column data
  let resolvedSellerId = inquiry.seller_id;
  if (!resolvedSellerId) {
    const prod = Array.isArray(inquiry.products) ? inquiry.products[0] : inquiry.products;
    const comp = prod?.companies;
    resolvedSellerId = Array.isArray(comp) ? comp[0]?.owner_id : comp?.owner_id;
  }
  
  const otherPartyId = isBuyer ? resolvedSellerId : inquiry.buyer_id;
  
  // Try to determine the name safely
  const otherPartyName = isBuyer 
    ? (inquiry.seller?.full_name || 'Seller')
    : (inquiry.buyer?.full_name || 'Buyer');

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages for this inquiry
    const channel = supabase
      .channel(`chat-${inquiry.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `inquiry_id=eq.${inquiry.id}` 
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          markAsRead(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [inquiry.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('inquiry_id', inquiry.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
      // Mark unread messages as read
      const unreadMessages = data.filter(m => m.receiver_id === user?.id && !m.read);
      unreadMessages.forEach(markAsRead);
    }
    setLoading(false);
  };

  const markAsRead = async (msg: any) => {
    if (msg.receiver_id === user?.id && !msg.read) {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', msg.id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;
    
    if (!otherPartyId) {
      console.error('Cannot send message: Missing receiver ID');
      return;
    }

    setSending(true);
    const { error } = await supabase
      .from('messages')
      .insert({
        inquiry_id: inquiry.id,
        sender_id: user.id,
        receiver_id: otherPartyId,
        content: newMessage.trim(),
      });

    if (!error) {
      setNewMessage('');
    } else {
      console.error('Error sending message:', error);
    }
    setSending(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white border border-sand w-full max-w-lg rounded-2xl shadow-xl flex flex-col h-[80vh] max-h-[800px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sand bg-sand/10 rounded-t-2xl">
            <div className="flex flex-col">
              <h3 className="font-display font-semibold text-coffee text-lg">
                Trade Chat
              </h3>
              <p className="text-[10px] font-bold text-stone/50 uppercase tracking-widest">
                with {otherPartyName}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-stone/50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-sand/5">
            {/* Initial Inquiry Message Context */}
            {inquiry.message && (
              <div className="flex flex-col mb-6">
                <div className="mx-auto bg-stone/5 px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest text-stone/40 mb-2">
                  Initial Inquiry
                </div>
                <div className="bg-white border border-sand rounded-xl p-4 shadow-sm text-sm text-coffee">
                  {inquiry.message}
                </div>
              </div>
            )}

            {loading ? (
              <div className="h-full flex items-center justify-center text-stone/30">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone/40 space-y-2">
                <p className="text-sm">No messages yet.</p>
                <p className="text-xs">Send a message to start the conversation.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div 
                    key={msg.id || idx} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[75%] rounded-2xl p-3 ${
                        isMe 
                          ? 'bg-olive text-white rounded-br-sm' 
                          : 'bg-white border border-sand text-coffee rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-stone/40'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-sand rounded-b-2xl">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-sand/10 border border-sand/50 rounded-full px-4 py-2.5 text-sm outline-none focus:border-olive/30 focus:ring-1 focus:ring-olive/30 transition-all text-coffee placeholder:text-stone/40"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-olive text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-olive-dark transition-colors shrink-0"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
