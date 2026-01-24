'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { askAI } from '@/app/actions/ai-chat';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: '¡Hola! Soy tu asistente de IA Monalisa. ¿En qué puedo ayudarte a analizar hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await askAI(userMsg);
      setMessages((prev) => [...prev, { role: 'ai', content: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Lo siento, hubo un error. Inténtalo de nuevo.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón Flotante */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-monalisa-gold text-monalisa-navy p-4 rounded-full shadow-2xl z-50 hover:bg-white transition-colors border-2 border-monalisa-gold/20 shadow-monalisa-gold/20"
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[500px] glass-card z-50 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10"
          >
            {/* Header */}
            <div className="bg-monalisa-gold/10 p-4 border-b border-monalisa-gold/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="text-monalisa-gold h-5 w-5" />
                <span className="text-monalisa-gold font-bold">Asistente IA</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-monalisa-silver hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-monalisa-gold/20"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-monalisa-gold text-monalisa-navy rounded-tr-none'
                        : 'bg-white/10 text-monalisa-silver rounded-tl-none border border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 opacity-60 text-[10px] uppercase font-bold">
                      {msg.role === 'user' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                      {msg.role === 'user' ? 'Gerente' : 'IA Monalisa'}
                    </div>
                    <div
                      className="whitespace-pre-wrap leading-tight"
                      dangerouslySetInnerHTML={{
                        __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'),
                      }}
                    />
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-monalisa-gold animate-spin" />
                    <span className="text-xs text-monalisa-silver/50">Pensando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-monalisa-gold/20 bg-black/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregunta algo..."
                  className="bg-white/5 border-monalisa-gold/20 text-white placeholder:text-white/20 rounded-xl"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-monalisa-gold hover:bg-white text-monalisa-navy"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
