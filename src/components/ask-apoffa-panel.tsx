import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; sources?: Array<{ title: string; relevance: number }>; }

export function AskApoffaPanel({ caseId, context }: { caseId: string; context?: string }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await fetch(`/api/cases/${caseId}/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, context }) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: (data) => { setMessages(p => [...p, { id: `a-${Date.now()}`, role: 'assistant', content: data.answer, timestamp: new Date(), sources: data.sources }]); },
    onError: (err: Error) => { toast.error(err.message); },
  });

  useEffect(() => { scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight); }, [messages]);

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;
    setMessages(p => [...p, { id: `u-${Date.now()}`, role: 'user', content: input.trim(), timestamp: new Date() }]);
    sendMutation.mutate(input.trim());
    setInput('');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Ask APOffa <Badge variant="secondary" className="text-xs">AI</Badge></span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setMessages([]); toast.success('Cleared'); }}><Trash2 className="h-4 w-4" /></Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 gap-4">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="space-y-4 pr-3">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Bot className="h-12 w-12 mx-auto mb-3 opacity-50" /><p className="font-medium">Ask anything about this case</p><p className="text-sm mt-1">Analyze evidence, find connections, summarize findings.</p></div>
            ) : messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className={m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>{m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}</AvatarFallback></Avatar>
                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  {m.sources && <div className="mt-2 pt-2 border-t border-border/50"><p className="text-[10px] opacity-70">Sources:</p><div className="flex flex-wrap gap-1">{m.sources.map((s, i) => <Badge key={i} variant="outline" className="text-[10px]">{s.title}</Badge>)}</div></div>}
                </div>
              </div>
            ))}
            {sendMutation.isPending && <div className="flex gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-secondary"><Bot className="h-4 w-4" /></AvatarFallback></Avatar><div className="bg-muted rounded-lg px-4 py-3"><div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" /><div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.1s' }} /><div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }} /></div></div></div>}
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 pt-2 border-t">
          <Input placeholder="Ask a question..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} disabled={sendMutation.isPending} className="flex-1" />
          <Button size="icon" onClick={handleSend} disabled={!input.trim() || sendMutation.isPending}><Send className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
