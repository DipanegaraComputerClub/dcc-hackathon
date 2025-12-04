"use client";

import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, Bot, User, Trash2, Sparkles, Lightbulb, 
  RefreshCw, // <-- INI YANG TADI HILANG
} from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
  time: string;
};

const suggestions = [
  "Strategi jualan laris di TikTok?",
  "Cara hitung modal Coto Makassar?",
  "Buatkan ide promo Hari Kemerdekaan",
  "Tips hadapi pelanggan yang rewel"
];

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      content: "Tabe', Daeng! 👋\nSaya asisten pintar ta'. Mau bahas strategi jualan, ide konten, atau curhat bisnis hari ini?",
      time: getCurrentTime()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

    setTimeout(() => {
      let aiResponse = "";
      const lowerText = text.toLowerCase();

      if (lowerText.includes("tiktok") || lowerText.includes("konten")) {
        aiResponse = "🔥 **Strategi TikTok Viral:**\n\n1. **3 Detik Pertama:** Langsung to the point. Contoh: *'Jangan makan di sini kalau tidak kuat pedas!'*\n2. **Sound Viral:** Pakai lagu yang lagi trending di Makassar.\n3. **POV:** Rekam proses masak dari sudut pandang pembeli.\n\nJangan lupa hashtag #KulinerMakassar #EwakoFood.";
      } else if (lowerText.includes("modal") || lowerText.includes("harga")) {
        aiResponse = "💰 **Rumus Hitung Harga:**\n\n`(Modal Bahan + Biaya Gas/Listrik + Gaji Karyawan) + Profit 30-50%`\n\nContoh: Modal seporsi Rp 15.000. Jual Rp 25.000. Untung Rp 10.000 per porsi. Aman mi itu Daeng.";
      } else if (lowerText.includes("promo")) {
        aiResponse = "🏷️ **Ide Promo:**\n\n'Beli 2 Gratis 1' khusus jam sepi (misal jam 2-4 sore). Ini bisa pancing orang datang pas warung lagi kosong.";
      } else {
        aiResponse = "Pertanyaan mantap Daeng! Intinya konsisten ki' promosi dan jaga kualitas rasa. 💪\n\nAda lagi yang mau ditanyakan?";
      }

      const aiMsg: Message = { 
          id: Date.now() + 1, 
          role: "ai", 
          content: aiResponse,
          time: getCurrentTime()
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 2000);
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
          <Button variant="ghost" size="icon" onClick={handleClearChat} className="text-gray-400 hover:text-red-600">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

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

                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={cn(
                            "flex w-full animate-in slide-in-from-bottom-4 duration-500",
                            msg.role === "user" ? "justify-end" : "justify-start"
                        )}
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