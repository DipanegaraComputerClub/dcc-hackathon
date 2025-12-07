"use client";

import { useState, useRef } from "react"; 
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { 
  Wand2, Copy, RefreshCw, 
  Type, Megaphone, Tags, PenLine, MessageSquareReply, MessageCircleQuestion, ChevronDown, 
  Palette, CalendarDays
} from "lucide-react";
import { API_URL } from "@/config/api";

export default function ContentStudioPage() {
  const [selectedTool, setSelectedTool] = useState("caption"); // Default awal Caption
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  // State untuk semua form inputs
  const [formData, setFormData] = useState({
    // Caption Generator
    captionTopic: "",
    captionTone: "casual",
    captionHashtags: "yes",
    captionPlatform: "instagram",
    
    // Promo Generator
    promoProduct: "",
    promoDiscount: "",
    promoTarget: "umum",
    
    // Branding
    brandingSlogan: "",
    brandingPersona: "",
    brandingTone: "makassar_friendly",
    
    // Content Planner
    plannerTheme: "",
    plannerDuration: "7",
    
    // Copywriting
    copywritingProduct: "",
    copywritingType: "caption",
    copywritingPurpose: "selling",
    copywritingStyle: "makassar_halus",
    
    // Pricing
    pricingProduct: "",
    pricingCost: "",
    pricingTargetProfit: "",
    pricingCompetitor: "",
    
    // Auto Reply
    replyMessage: "",
    replyTone: "ramah",
    
    // Comment Analyzer
    commentText: ""
  });
  
  // Ref untuk Auto-Scroll ke hasil di HP
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(""); 
    setError("");
    
    // Auto Scroll di HP
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
    
    try {
      // Build request body berdasarkan kategori
      let requestBody: any = {
        type: selectedTool,
        metadata: {}
      };

      switch (selectedTool) {
        case "caption":
          requestBody.inputText = formData.captionTopic;
          requestBody.metadata = {
            tone: formData.captionTone,
            includeHashtags: formData.captionHashtags === "yes",
            platform: formData.captionPlatform
          };
          break;

        case "promo":
          requestBody.inputText = formData.promoProduct;
          requestBody.metadata = {
            discount: formData.promoDiscount,
            targetAudience: formData.promoTarget
          };
          break;

        case "branding":
          requestBody.inputText = formData.brandingSlogan || "Generate brand voice";
          requestBody.metadata = {
            currentSlogan: formData.brandingSlogan,
            brandPersona: formData.brandingPersona,
            toneOfVoice: formData.brandingTone
          };
          break;

        case "planner":
          requestBody.inputText = formData.plannerTheme;
          requestBody.metadata = {
            duration: parseInt(formData.plannerDuration)
          };
          break;

        case "copywriting":
          requestBody.inputText = formData.copywritingProduct;
          requestBody.metadata = {
            contentType: formData.copywritingType,
            purpose: formData.copywritingPurpose,
            languageStyle: formData.copywritingStyle
          };
          break;

        case "pricing":
          requestBody.inputText = formData.pricingProduct;
          requestBody.metadata = {
            cost: parseFloat(formData.pricingCost),
            targetProfit: parseFloat(formData.pricingTargetProfit),
            competitorPrice: formData.pricingCompetitor ? parseFloat(formData.pricingCompetitor) : undefined
          };
          break;

        case "reply":
          requestBody.inputText = formData.replyMessage;
          requestBody.metadata = {
            tone: formData.replyTone
          };
          break;

        case "comment":
          requestBody.inputText = formData.commentText;
          requestBody.metadata = {};
          break;
      }

      // Validasi inputText tidak kosong
      if (!requestBody.inputText || requestBody.inputText.trim() === '') {
        throw new Error('Mohon isi input text terlebih dahulu');
      }

      console.log('Sending request to backend:', requestBody);

      // Call Backend API
      const response = await fetch(`${API_URL}/ai-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Gagal generate konten');
      }

      // Display result
      setResult(data.data.outputText || data.outputText || 'Tidak ada hasil');

    } catch (err: any) {
      console.error('Error generating content:', err);
      setError(err.message || 'Terjadi kesalahan saat generate konten');
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  // --- STYLE ---
  const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-red-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600";
  const labelClass = "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block";
  const optionClass = "bg-white text-gray-900 dark:bg-gray-950 dark:text-white py-2";

  // --- RENDER FORM FIELDS (DINAMIS) ---
  const renderFormFields = () => {
    switch (selectedTool) {
      
      // 1. CAPTION GENERATOR
      case "caption":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className={labelClass}>Topik Konten</label>
              <Input 
                className={inputClass} 
                placeholder="Misal: Foto Makanan Coto Makassar..."
                value={formData.captionTopic}
                onChange={(e) => setFormData({...formData, captionTopic: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className={labelClass}>Platform</label>
                  <select 
                    className={inputClass}
                    value={formData.captionPlatform}
                    onChange={(e) => setFormData({...formData, captionPlatform: e.target.value})}
                  >
                    <option className={optionClass} value="instagram">Instagram</option>
                    <option className={optionClass} value="tiktok">TikTok</option>
                    <option className={optionClass} value="facebook">Facebook</option>
                    <option className={optionClass} value="whatsapp">WhatsApp Status</option>
                  </select>
               </div>
               <div>
                  <label className={labelClass}>Gaya Bahasa</label>
                  <select 
                    className={inputClass}
                    value={formData.captionTone}
                    onChange={(e) => setFormData({...formData, captionTone: e.target.value})}
                  >
                    <option className={optionClass} value="casual">Daeng Friendly (Akrab)</option>
                    <option className={optionClass} value="formal">Makassar Halus</option>
                    <option className={optionClass} value="professional">Formal / Profesional</option>
                    <option className={optionClass} value="genz">Gen Z / Gaul</option>
                  </select>
               </div>
            </div>
          </div>
        );

      // 2. AI PROMO GENERATOR
      case "promo":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className={labelClass}>Nama Produk</label>
              <Input 
                className={inputClass} 
                placeholder="Contoh: Paket Ayam Geprek"
                value={formData.promoProduct}
                onChange={(e) => setFormData({...formData, promoProduct: e.target.value})}
              />
            </div>
            <div>
              <label className={labelClass}>Diskon/Penawaran</label>
              <Input 
                className={inputClass} 
                placeholder="Contoh: Diskon 20%, Buy 1 Get 1"
                value={formData.promoDiscount}
                onChange={(e) => setFormData({...formData, promoDiscount: e.target.value})}
              />
            </div>
            <div>
              <label className={labelClass}>Target Audiens</label>
              <select 
                className={inputClass}
                value={formData.promoTarget}
                onChange={(e) => setFormData({...formData, promoTarget: e.target.value})}
              >
                    <option className={optionClass} value="umum">Umum</option>
                    <option className={optionClass} value="mahasiswa">Mahasiswa</option>
                    <option className={optionClass} value="karyawan">Karyawan Kantor</option>
                    <option className={optionClass} value="keluarga">Keluarga</option>
                </select>
            </div>
          </div>
        );

      // 3. AI BRANDING
      case "branding":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className={labelClass}>Slogan Saat Ini (Opsional)</label>
              <Input 
                className={inputClass} 
                placeholder="Contoh: Rasa Enak Harga Kaki Lima"
                value={formData.brandingSlogan}
                onChange={(e) => setFormData({...formData, brandingSlogan: e.target.value})}
              />
            </div>
            <div>
              <label className={labelClass}>Brand Persona (Karakter)</label>
              <Input 
                className={inputClass} 
                placeholder="Contoh: Sahabat yang asik, atau Orang tua bijak"
                value={formData.brandingPersona}
                onChange={(e) => setFormData({...formData, brandingPersona: e.target.value})}
              />
            </div>
            <div>
                <label className={labelClass}>Tone of Voice (Gaya Bicara)</label>
                <select 
                  className={inputClass}
                  value={formData.brandingTone}
                  onChange={(e) => setFormData({...formData, brandingTone: e.target.value})}
                >
                    <option className={optionClass} value="makassar_friendly">Makassar Friendly (Akrab/Lokal)</option>
                    <option className={optionClass} value="professional">Profesional & Elegan</option>
                    <option className={optionClass} value="humorous">Lucu & Humoris</option>
                    <option className={optionClass} value="energetic">Semangat / Enerjik</option>
                </select>
            </div>
          </div>
        );

      // 4. CONTENT PLANNER
      case "planner":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className={labelClass}>Tema Mingguan</label>
              <Input 
                className={inputClass} 
                placeholder="Contoh: Kuliner Makassar, Tips Bisnis, dll"
                value={formData.plannerTheme}
                onChange={(e) => setFormData({...formData, plannerTheme: e.target.value})}
              />
            </div>
            <div>
                <label className={labelClass}>Durasi Rencana</label>
                <select 
                  className={inputClass}
                  value={formData.plannerDuration}
                  onChange={(e) => setFormData({...formData, plannerDuration: e.target.value})}
                >
                    <option className={optionClass} value="7">7 Hari (Seminggu)</option>
                    <option className={optionClass} value="14">14 Hari (2 Minggu)</option>
                    <option className={optionClass} value="30">30 Hari (Sebulan)</option>
                </select>
            </div>
          </div>
        );

      // 5. COPYWRITING (DETAIL)
      case "copywriting":
        return (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className={labelClass}>Jenis Konten</label>
                  <select 
                    className={inputClass}
                    value={formData.copywritingType}
                    onChange={(e) => setFormData({...formData, copywritingType: e.target.value})}
                  >
                    <option className={optionClass} value="caption">Caption</option>
                    <option className={optionClass} value="story">Story</option>
                    <option className={optionClass} value="post">Post</option>
                    <option className={optionClass} value="tweet">Tweet</option>
                  </select>
               </div>
               <div>
                  <label className={labelClass}>Tujuan Konten</label>
                  <select 
                    className={inputClass}
                    value={formData.copywritingPurpose}
                    onChange={(e) => setFormData({...formData, copywritingPurpose: e.target.value})}
                  >
                    <option className={optionClass} value="selling">Jualan (Selling)</option>
                    <option className={optionClass} value="awareness">Brand Awareness</option>
                    <option className={optionClass} value="engagement">Engagement</option>
                    <option className={optionClass} value="education">Edukasi</option>
                  </select>
               </div>
            </div>
            <div>
              <label className={labelClass}>Nama Produk</label>
              <Input 
                className={inputClass} 
                placeholder="Nama produk ta'..."
                value={formData.copywritingProduct}
                onChange={(e) => setFormData({...formData, copywritingProduct: e.target.value})}
              />
            </div>
            <div>
                  <label className={labelClass}>Gaya Bahasa</label>
                  <select 
                    className={inputClass}
                    value={formData.copywritingStyle}
                    onChange={(e) => setFormData({...formData, copywritingStyle: e.target.value})}
                  >
                    <option className={optionClass} value="makassar_halus">Makassar Halus</option>
                    <option className={optionClass} value="daeng_friendly">Daeng Friendly</option>
                    <option className={optionClass} value="formal">Formal</option>
                    <option className={optionClass} value="genz">Gen Z TikTok</option>
                  </select>
               </div>
          </div>
        );

      // 6. PRICING ANALYSIS
      case "pricing":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className={labelClass}>Nama Produk</label>
              <Input 
                className={inputClass} 
                placeholder="Misal: Es Kopi Susu..."
                value={formData.pricingProduct}
                onChange={(e) => setFormData({...formData, pricingProduct: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className={labelClass}>Modal (HPP)</label>
                  <Input 
                    type="number" 
                    className={inputClass} 
                    placeholder="Rp..."
                    value={formData.pricingCost}
                    onChange={(e) => setFormData({...formData, pricingCost: e.target.value})}
                  />
               </div>
               <div>
                  <label className={labelClass}>Target Untung (%)</label>
                  <Input 
                    type="number" 
                    className={inputClass} 
                    placeholder="Misal: 30"
                    value={formData.pricingTargetProfit}
                    onChange={(e) => setFormData({...formData, pricingTargetProfit: e.target.value})}
                  />
               </div>
            </div>
            <div>
               <label className={labelClass}>Harga Kompetitor (Opsional)</label>
               <Input 
                 type="number" 
                 className={inputClass} 
                 placeholder="Rp..."
                 value={formData.pricingCompetitor}
                 onChange={(e) => setFormData({...formData, pricingCompetitor: e.target.value})}
               />
            </div>
          </div>
        );

      // 7. AUTO REPLY
      case "reply":
        return (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className={labelClass}>Pesan Pelanggan</label>
              <Textarea 
                placeholder="Tempel chat pelanggan di sini..." 
                className={`${inputClass} min-h-[100px]`}
                value={formData.replyMessage}
                onChange={(e) => setFormData({...formData, replyMessage: e.target.value})}
              />
            </div>
            <div>
                  <label className={labelClass}>Nada Balasan</label>
                  <select 
                    className={inputClass}
                    value={formData.replyTone}
                    onChange={(e) => setFormData({...formData, replyTone: e.target.value})}
                  >
                    <option className={optionClass} value="ramah">Ramah & Membantu</option>
                    <option className={optionClass} value="tegas">Tegas (untuk Komplain)</option>
                    <option className={optionClass} value="santai">Lucu / Santai</option>
                    <option className={optionClass} value="formal">Formal</option>
                  </select>
               </div>
          </div>
        );

      // 8. COMMENT ANALYZER
      case "comment":
        return (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className={labelClass}>Paste Komentar Pelanggan</label>
              <Textarea 
                placeholder="Tempel komentar dari IG/TikTok/WA di sini..." 
                className={`${inputClass} min-h-[120px]`}
                value={formData.commentText}
                onChange={(e) => setFormData({...formData, commentText: e.target.value})}
              />
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                AI akan mendeteksi sentimen (Marah/Senang), masalah utama, dan membuatkan balasan otomatis.
            </div>
          </div>
        );
      
      default:
        return <p className="text-gray-500">Pilih alat dulu di atas.</p>;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-100px)] gap-4 lg:gap-6 p-1 pb-20 lg:pb-1">
        
        {/* === KOLOM KIRI: INPUT === */}
        <div className="w-full lg:w-5/12 flex flex-col h-auto lg:h-full shrink-0">
          
          <div className="mb-4 px-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Studio Kata AI</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pusat pembuatan strategi & konten teks.</p>
          </div>

          <Card className="flex-1 flex flex-col border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm overflow-hidden">
            {/* Header Pilihan */}
            <div className="p-4 lg:p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-red-50 to-white dark:from-red-950/20 dark:to-gray-950">
              <label className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2 block">
                Langkah 1: Pilih Alat
              </label>
              <div className="relative group">
                <select 
                  value={selectedTool}
                  onChange={(e) => {
                      setSelectedTool(e.target.value);
                      setResult(""); 
                  }}
                  className="w-full appearance-none rounded-xl border-2 border-red-100 bg-white px-4 py-3 pl-11 text-base font-bold text-gray-800 shadow-sm outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white cursor-pointer"
                >
                  <option className={optionClass} value="caption">Caption Generator</option>
                  <option className={optionClass} value="promo">AI Promo Generator</option>
                  <option className={optionClass} value="branding">AI Branding</option>
                  <option className={optionClass} value="planner">Content Planner</option>
                  <option className={optionClass} value="copywriting">Copywriting</option>
                  <option className={optionClass} value="pricing">Cek Harga</option>
                  <option className={optionClass} value="reply">Auto Reply</option>
                  <option className={optionClass} value="comment">Comment Analyzer</option>
                </select>
                
                {/* Ikon Dinamis */}
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
                    {selectedTool === 'caption' && <Type size={20} />}
                    {selectedTool === 'promo' && <Megaphone size={20} />}
                    {selectedTool === 'branding' && <Palette size={20} />}
                    {selectedTool === 'planner' && <CalendarDays size={20} />}
                    {selectedTool === 'copywriting' && <PenLine size={20} />}
                    {selectedTool === 'pricing' && <Tags size={20} />}
                    {selectedTool === 'reply' && <MessageSquareReply size={20} />}
                    {selectedTool === 'comment' && <MessageCircleQuestion size={20} />}
                </div>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <ChevronDown size={16} />
                </div>
              </div>
            </div>
            
            {/* Form Scrollable */}
            <div className="flex-1 lg:overflow-y-auto p-4 lg:p-5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                Langkah 2: Isi Data
              </label>
               {renderFormFields()}
            </div>

            {/* Footer Button */}
            <div className="p-4 lg:p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
               {error && (
                 <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
                   <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                 </div>
               )}
               <Button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-6 text-base font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/20 transition-all active:scale-95 duration-200"
               >
                 {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Sedang Meracik...
                    </>
                 ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" /> Buat Sekarang
                    </>
                 )}
               </Button>
            </div>
          </Card>
        </div>


        {/* === KOLOM KANAN: HASIL === */}
        <div ref={resultRef} className="w-full lg:w-7/12 flex flex-col h-[500px] lg:h-full pt-0 lg:pt-14 scroll-mt-24">
           <Card className="h-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col shadow-sm overflow-hidden relative">
              
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 relative z-20">
                 <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                        <Wand2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-200">Hasil Generate</span>
                 </div>
                 {result && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs font-medium text-gray-600 hover:text-red-600 hover:border-red-200 dark:border-gray-700 dark:text-gray-300 dark:hover:border-red-900 animate-in fade-in" 
                        onClick={() => navigator.clipboard.writeText(result)}
                    >
                        <Copy className="h-3.5 w-3.5 mr-1.5" /> Salin Teks
                    </Button>
                 )}
              </div>

              <div className="flex-1 relative bg-white dark:bg-gray-950">
                 
                 {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-30 animate-in fade-in duration-300">
                        <div className="flex gap-2 mb-4">
                            <span className="w-3 h-3 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-3 h-3 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-3 h-3 bg-red-600 rounded-full animate-bounce"></span>
                        </div>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 animate-pulse">
                            Tunggu nah, AI lagi mikir...
                        </p>
                    </div>
                 )}

                 {result ? (
                    <textarea 
                        className="w-full h-full p-6 bg-transparent text-gray-800 dark:text-gray-200 resize-none focus:ring-0 text-base lg:text-lg leading-relaxed border-0 focus:outline-none font-sans animate-in slide-in-from-bottom-4 fade-in duration-700 whitespace-pre-wrap"
                        value={result}
                        readOnly
                    />
                 ) : (
                    !loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50/30 dark:bg-gray-900/50 p-6 text-center animate-in zoom-in-95 duration-500">
                            <div className="h-16 w-16 lg:h-20 lg:w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-300 dark:border-gray-700">
                                <Wand2 className="h-8 w-8 lg:h-10 lg:w-10 opacity-20 text-gray-500" />
                            </div>
                            <p className="font-medium text-gray-500 dark:text-gray-500">Belum ada hasil, Daeng.</p>
                            <p className="text-sm opacity-60 mt-1 max-w-xs">Isi form di kiri, lalu tekan tombol Buat Sekarang.</p>
                        </div>
                    )
                 )}
              </div>
           </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}