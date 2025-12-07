"use client";

import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, Bot, User, Trash2, Sparkles, Lightbulb, 
  RefreshCw, ExternalLink, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
  time: string;
  suggestions?: string[];
  resources?: {
    type: 'link' | 'image' | 'video';
    title: string;
    url: string;
    description?: string;
  }[];
};

const suggestions = [
  "Bagaimana cara memulai bisnis UMKM?",
  "Cara bikin foto produk yang bagus?",
  "Platform apa yang cocok untuk jualan?",
  "Bagaimana cara promosi yang efektif?"
];

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [showFAQ, setShowFAQ] = useState(false);
  const [faqs, setFaqs] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      content: "Ji'! Tabe' Daeng! 👋\n\nSaya Daeng, asisten pintar untuk bantu UMKM ko. Mau tanya tentang:\n- Strategi jualan 🔥\n- Bikin konten menarik ✨\n- Modal dan harga 💰\n- Marketing & promosi 📱\n\nSantai mi, tanya apa saja!",
      time: getCurrentTime()
    }
  ]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load FAQ on mount
  useEffect(() => {
    loadFAQ();
  }, []);

  const loadFAQ = async () => {
    try {
      const response = await fetch(`${API_URL}/tanya-daeng/faq`);
      const data = await response.json();
      if (data.success) {
        setFaqs(data.data);
      }
    } catch (error) {
      console.error('Failed to load FAQ:', error);
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = { 
        id: Date.now(), 
        role: "user", 
        content: text,
        time: getCurrentTime()
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Update conversation history
    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: text }
    ];

    try {
      const response = await fetch(`${API_URL}/tanya-daeng/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: newHistory.slice(-10), // Keep last 10 messages
          userContext: {
            businessType: 'umkm',
            location: 'Indonesia'
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMsg: Message = { 
          id: Date.now() + 1, 
          role: "ai", 
          content: data.data.reply,
          time: getCurrentTime(),
          suggestions: data.data.suggestions,
          resources: data.data.resources
        };
        
        setMessages((prev) => [...prev, aiMsg]);
        
        // Update conversation history
        setConversationHistory([
          ...newHistory,
          { role: 'assistant', content: data.data.reply }
        ]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg: Message = { 
        id: Date.now() + 1, 
        role: "ai", 
        content: "Aduh ji, Daeng lagi error. Coba lagi sebentar ya kak! 🙏",
        time: getCurrentTime()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if(confirm("Bersihkan semua chat?")) {
        setMessages([{
            id: Date.now(),
            role: "ai",
            content: "Chat sudah bersih. Kita mulai baru lagi nah! Mau tanya apa?",
            time: getCurrentTime()
        }]);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] w-full max-w-6xl mx-auto p-2 lg:p-4 gap-4">
        
        {/* === HEADER CHAT === */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-red-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                    <Bot className="h-6 w-6" />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Tanya Daeng
              </h1>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Online • AI Cerdas
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowFAQ(!showFAQ)} 
              className="text-gray-400 hover:text-blue-600"
              title="Lihat FAQ"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClearChat} 
              className="text-gray-400 hover:text-red-600"
              title="Hapus Chat"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* FAQ Panel */}
        {showFAQ && (
          <div 
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-lg"
            style={{ animation: 'slideInFade 0.3s ease-out' }}
          >
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              Pertanyaan Umum (FAQ)
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {faqs.map((faq, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleSend(faq.question);
                    setShowFAQ(false);
                  }}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm border border-transparent hover:border-red-200"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{faq.question}</div>
                  <div className="text-xs text-gray-500 mt-1 flex gap-1 flex-wrap">
                    {faq.keywords.slice(0, 3).map((kw: string, i: number) => (
                      <span key={i} className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">#{kw}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === AREA CHAT === */}
        <div className="flex-1 relative flex flex-col rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-[#f8fafc] dark:bg-[#020617] shadow-inner">
            
            <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.05] pointer-events-none" 
                 style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")` 
                 }}>
            </div>

            {/* List Pesan */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 z-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                
                <div className="flex justify-center">
                    <span className="text-[10px] bg-gray-200 dark:bg-gray-800 text-gray-500 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                        Hari Ini
                    </span>
                </div>

                {messages.map((msg, index) => (
                    <div 
                        key={msg.id} 
                        className={cn(
                            "flex w-full",
                            msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                        style={{
                          animation: `slideInFade 0.5s ease-out ${index * 0.1}s both`
                        }}
                    >
                        <div className={cn(
                            "flex max-w-[85%] md:max-w-[70%] gap-3 items-end",
                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}>
                            <div className="shrink-0 pb-1">
                                {msg.role === "user" ? (
                                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <User className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                                    </div>
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                        <Bot className="h-5 w-5 text-red-600" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 max-w-full">
                                <div className={cn(
                                    "px-5 py-3 shadow-md relative group",
                                    msg.role === "user"
                                        ? "bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl rounded-tr-sm"
                                        : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-sm"
                                )}>
                                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                                        {msg.content}
                                    </div>
                                    <div className={cn(
                                        "text-[10px] mt-1 flex items-center justify-end gap-1 opacity-70",
                                        msg.role === "user" ? "text-red-100" : "text-gray-400"
                                    )}>
                                        {msg.time}
                                    </div>
                                </div>

                                {/* Resources Links */}
                                {msg.role === "ai" && msg.resources && msg.resources.length > 0 && (
                                    <div className="flex flex-col gap-2 ml-11">
                                        {msg.resources.map((resource, idx) => (
                                            <a
                                                key={idx}
                                                href={resource.url}
                                                className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:shadow-md transition-all group"
                                            >
                                                <span className="text-2xl">{resource.type === 'link' ? '🔗' : '📷'}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                        {resource.title}
                                                    </div>
                                                    {resource.description && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {resource.description}
                                                        </div>
                                                    )}
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-red-500 group-hover:translate-x-1 transition-transform" />
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* Quick Suggestions */}
                                {msg.role === "ai" && msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 ml-11">
                                        {msg.suggestions.slice(0, 3).map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSend(suggestion)}
                                                className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20 transition-all"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex w-full justify-start animate-in fade-in duration-300">
                        <div className="flex gap-3 items-end">
                             <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center pb-1">
                                <Bot className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* === INPUT AREA === */}
            <div className="p-4 z-20">
                {messages.length < 3 && (
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none justify-center">
                        {suggestions.map((text, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleSend(text)}
                                className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 transition-all shadow-sm flex items-center gap-1.5"
                            >
                                <Lightbulb className="h-3 w-3" /> {text}
                            </button>
                        ))}
                    </div>
                )}

                <div className="relative flex items-center bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-200/20 dark:shadow-none p-1.5 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all">
                    <Input 
                        placeholder="Ketik pertanyaan ta' di sini..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoading}
                        className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-4 py-3 text-base placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                    <Button 
                        onClick={() => handleSend()} 
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className={cn(
                            "h-10 w-10 rounded-full transition-all shrink-0 mr-1",
                            input.trim() 
                                ? "bg-red-600 hover:bg-red-700 text-white shadow-md hover:scale-105" 
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
                    </Button>
                </div>
                <p className="text-[10px] text-center text-gray-400 mt-2">
                    AI Ewako bisa membuat kesalahan. Cek kembali informasi penting.
                </p>
            </div>

        </div>
      </div>
    </DashboardLayout>
  );
}