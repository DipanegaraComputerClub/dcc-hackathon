"use client";
import { API_URL } from "@/config/api";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Store, ShoppingBag, Wallet, Plus, Edit, Trash2, 
  TrendingUp, TrendingDown, Save, X, Sparkles, Lightbulb, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";


// --- TIPE DATA ---
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category?: string;
  cost_price?: number;
};

type Transaction = {
  id: string;
  transaction_date: string;
  description: string;
  amount: number;
  type: "in" | "out";
  category?: string;
};

type Profile = {
  id: string;
  business_name: string;
  category: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  description?: string;
};

type QuickInsight = {
  id: string;
  title: string;
  question: string;
  type: string;
  icon: string;
};

export default function ManagementPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // --- STATE DATA (Dynamic dari Supabase) ---
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [quickInsights, setQuickInsights] = useState<QuickInsight[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string>("");

  // --- STATE MODAL (Pop-up) ---
  const [showProductModal, setShowProductModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  // --- STATE FORM INPUT BARU ---
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "", category: "" });
  const [newTx, setNewTx] = useState({ description: "", amount: "", type: "in", transaction_date: "", category: "" });
  const [profileForm, setProfileForm] = useState({
    business_name: "",
    category: "Kuliner / Makanan",
    address: "",
    phone: "",
    email: "",
    description: ""
  });

  // --- LOAD DATA ON MOUNT ---
  useEffect(() => {
    loadProfile();
    loadProducts();
    loadTransactions();
    loadQuickInsights();
  }, []);

  // Update profile form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        business_name: profile.business_name,
        category: profile.category,
        address: profile.address || "",
        phone: profile.phone || "",
        email: profile.email || "",
        description: profile.description || ""
      });
      setLogoPreview(profile.logo_url || "");
    }
  }, [profile]);

  // --- API CALLS ---
  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/dapur-umkm/profile`);
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/dapur-umkm/products`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await fetch(`${API_URL}/dapur-umkm/transactions`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadQuickInsights = async () => {
    try {
      const res = await fetch(`${API_URL}/dapur-umkm/quick-insights`);
      const data = await res.json();
      if (data.success) {
        setQuickInsights(data.data);
      }
    } catch (error) {
      console.error('Error loading quick insights:', error);
    }
  };

  // --- LOGIKA HITUNG DUIT OTOMATIS ---
  const totalIncome = transactions.filter(t => t.type === 'in').reduce((acc, curr) => acc + parseFloat(String(curr.amount)), 0);
  const totalExpense = transactions.filter(t => t.type === 'out').reduce((acc, curr) => acc + parseFloat(String(curr.amount)), 0);
  const balance = totalIncome - totalExpense;

  // Format Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  // --- HANDLER FUNGSI ---
  const handleSaveProfile = async () => {
    if (!profileForm.business_name || !profileForm.category) {
      return alert("Nama usaha dan kategori wajib diisi!");
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/dapur-umkm/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile?.id,
          ...profileForm
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setProfile(data.data);
        alert("Profil berhasil disimpan! ✅");
      } else {
        alert("Gagal menyimpan profil: " + data.message);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert("Terjadi kesalahan saat menyimpan profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return alert("Isi nama dan harga dulu, Daeng!");
    
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/dapur-umkm/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profile?.id,
          name: newProduct.name,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock) || 0,
          category: newProduct.category || 'Lainnya',
          image_url: "https://placehold.co/100x100/red/white?text=Baru"
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setProducts([data.data, ...products]);
        setShowProductModal(false);
        setNewProduct({ name: "", price: "", stock: "", category: "" });
      } else {
        alert("Gagal menambah produk: " + data.message);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert("Terjadi kesalahan saat menambah produk");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if(!confirm("Yakin mau hapus menu ini?")) return;
    
    try {
      const res = await fetch(`${API_URL}/dapur-umkm/products/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      
      if (data.success) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert("Gagal menghapus produk: " + data.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert("Terjadi kesalahan saat menghapus produk");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return alert('Format file harus JPEG, PNG, WebP, atau GIF');
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return alert('Ukuran file maksimal 5MB');
    }

    try {
      setIsUploadingLogo(true);

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('profile_id', profile.id);

      const res = await fetch(`${API_URL}/dapur-umkm/upload-logo`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setProfile(data.data.profile);
        alert('Logo berhasil diupload! ✅');
      } else {
        alert('Gagal upload logo: ' + data.message);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Terjadi kesalahan saat upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTx.description || !newTx.amount) return alert("Isi keterangan dan jumlah uangnya!");

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/dapur-umkm/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profile?.id,
          transaction_date: newTx.transaction_date || new Date().toISOString().split('T')[0],
          description: newTx.description,
          amount: Number(newTx.amount),
          type: newTx.type,
          category: newTx.category || 'Lainnya'
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setTransactions([data.data, ...transactions]);
        setShowFinanceModal(false);
        setNewTx({ description: "", amount: "", type: "in", transaction_date: "", category: "" });
      } else {
        alert("Gagal menambah transaksi: " + data.message);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert("Terjadi kesalahan saat menambah transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAIAdvice = async (insight: QuickInsight) => {
    if (!profile?.id) {
      return alert("Silakan lengkapi profil bisnis terlebih dahulu!");
    }

    try {
      setIsAILoading(true);
      setShowAIModal(true);
      setAiRecommendation("Sedang menganalisis bisnis Anda... 🤔");

      const res = await fetch(`${API_URL}/dapur-umkm/ai-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profile.id,
          insight_type: insight.type,
          question: insight.question
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setAiRecommendation(data.data.recommendation);
      } else {
        setAiRecommendation("Gagal mendapatkan rekomendasi: " + data.message);
      }
    } catch (error: any) {
      console.error('Error getting AI advice:', error);
      setAiRecommendation("Terjadi kesalahan: " + error.message);
    } finally {
      setIsAILoading(false);
    }
  };

  // Styles
  const labelStyle = "text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block";
  const inputStyle = "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-red-500 transition-all";

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20 relative">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dapur UMKM</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola identitas usaha, daftar menu, dan uang kas.</p>
        </div>

        {/* TAB NAVIGASI */}
        <div className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
            {["profile", "products", "finance"].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                        "flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all capitalize",
                        activeTab === tab 
                            ? "bg-red-600 text-white shadow-sm" 
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    )}
                >
                    {tab === "profile" && <Store className="h-4 w-4 mr-2" />}
                    {tab === "products" && <ShoppingBag className="h-4 w-4 mr-2" />}
                    {tab === "finance" && <Wallet className="h-4 w-4 mr-2" />}
                    <span className="hidden sm:inline">{tab === "products" ? "Menu / Produk" : tab === "finance" ? "Keuangan" : "Profil Usaha"}</span>
                </button>
            ))}
        </div>


        {/* === KONTEN 1: PROFIL === */}
        {activeTab === "profile" && (
            <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
               <Card className="md:col-span-1 bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle>Logo Usaha</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                     <input 
                        type="file" 
                        id="logo-upload" 
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleLogoUpload}
                        className="hidden"
                     />
                     <label 
                        htmlFor="logo-upload"
                        className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-red-50 dark:border-red-900/20 mb-4 group cursor-pointer"
                     >
                        {isUploadingLogo ? (
                          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                          </div>
                        ) : (
                          <>
                            <img 
                              src={logoPreview || "https://placehold.co/150x150/red/white?text=Logo"} 
                              alt="Logo" 
                              className="object-cover w-full h-full" 
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit className="text-white h-6 w-6" />
                            </div>
                          </>
                        )}
                     </label>
                     <p className="text-sm text-gray-500 text-center">Klik logo untuk ganti</p>
                     <p className="text-xs text-gray-400 text-center mt-1">Max 5MB (JPG, PNG, WebP, GIF)</p>
                  </CardContent>
               </Card>

               <Card className="md:col-span-2 bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle>Identitas Bisnis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>Nama Usaha</label>
                            <Input 
                              className={inputStyle} 
                              value={profileForm.business_name}
                              onChange={(e) => setProfileForm({...profileForm, business_name: e.target.value})}
                              placeholder="Warung Coto Daeng"
                            />
                        </div>
                        <div>
                            <label className={labelStyle}>Kategori</label>
                            <select 
                              className={inputStyle}
                              value={profileForm.category}
                              onChange={(e) => setProfileForm({...profileForm, category: e.target.value})}
                            >
                                <option>Kuliner / Makanan</option>
                                <option>Fashion</option>
                                <option>Kosmetik</option>
                                <option>Kerajinan</option>
                                <option>Jasa</option>
                                <option>Lainnya</option>
                            </select>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>Nomor HP</label>
                            <Input 
                              className={inputStyle} 
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                              placeholder="081234567890"
                            />
                        </div>
                        <div>
                            <label className={labelStyle}>Email</label>
                            <Input 
                              className={inputStyle} 
                              type="email"
                              value={profileForm.email}
                              onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                              placeholder="warung@example.com"
                            />
                        </div>
                     </div>
                     <div>
                        <label className={labelStyle}>Alamat</label>
                        <Textarea 
                          className={inputStyle} 
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                          placeholder="Jl. A.P. Pettarani No. 102, Makassar"
                        />
                     </div>
                     <div>
                        <label className={labelStyle}>Deskripsi Bisnis</label>
                        <Textarea 
                          className={inputStyle} 
                          value={profileForm.description}
                          onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
                          placeholder="Ceritakan tentang bisnis Anda..."
                        />
                     </div>
                     <div className="pt-2 flex justify-end">
                        <Button 
                          onClick={handleSaveProfile} 
                          disabled={isLoading}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Simpan
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </div>
        )}


        {/* === KONTEN 2: PRODUK === */}
        {activeTab === "products" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center">
                    <div className="relative w-full max-w-sm">
                        <Input className={inputStyle} placeholder="Cari menu..." />
                    </div>
                    {/* TOMBOL TAMBAH MENU */}
                    <Button onClick={() => setShowProductModal(true)} className="bg-red-600 hover:bg-red-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Menu
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading ? (
                        <div className="col-span-full flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">Belum ada produk. Klik "Tambah Menu" untuk mulai!</p>
                        </div>
                    ) : (
                        products.map((product) => (
                            <Card key={product.id} className="bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900 transition-colors group relative">
                                <div className="flex p-4 gap-4">
                                    <div className="h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                        <img src={product.image_url || "https://placehold.co/100x100/gray/white?text=No+Image"} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{product.name}</h3>
                                        <p className="text-red-600 dark:text-red-400 font-semibold">{formatRupiah(product.price)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Stok: {product.stock}</p>
                                        {product.category && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{product.category}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
                                    <span className={cn(
                                        "text-xs px-2 py-1 rounded-full",
                                        product.stock > 10 ? "text-green-600 bg-green-100 dark:bg-green-900/30" : "text-orange-600 bg-orange-100 dark:bg-orange-900/30"
                                    )}>
                                        {product.stock > 10 ? "Tersedia" : "Stok Rendah"}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleDeleteProduct(product.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        )}


        {/* === KONTEN 3: KEUANGAN === */}
        {activeTab === "finance" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                
                {/* Ringkasan Saldo (REAL TIME) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                                <TrendingUp className="h-5 w-5" />
                                <span className="font-medium">Pemasukan</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatRupiah(totalIncome)}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
                                <TrendingDown className="h-5 w-5" />
                                <span className="font-medium">Pengeluaran</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatRupiah(totalExpense)}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                                <Wallet className="h-5 w-5" />
                                <span className="font-medium">Sisa Saldo</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatRupiah(balance)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabel Transaksi */}
                <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Riwayat Transaksi</CardTitle>
                        {/* TOMBOL CATAT TRANSAKSI */}
                        <Button onClick={() => setShowFinanceModal(true)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90">
                            <Plus className="mr-2 h-4 w-4" /> Catat Transaksi
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {transactions.length === 0 ? (
                                <div className="text-center py-8">
                                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">Belum ada transaksi tercatat</p>
                                </div>
                            ) : (
                                transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-2 rounded-full",
                                                tx.type === 'in' ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-red-100 text-red-600 dark:bg-red-900/30"
                                            )}>
                                                {tx.type === 'in' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{tx.description}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.transaction_date).toLocaleDateString('id-ID')}</p>
                                                {tx.category && <p className="text-xs text-gray-400 mt-0.5">{tx.category}</p>}
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "font-bold",
                                            tx.type === 'in' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                        )}>
                                            {tx.type === 'in' ? '+' : '-'} {formatRupiah(parseFloat(String(tx.amount)))}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* AI INSIGHTS PANEL */}
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-900">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <CardTitle>AI Business Advisor</CardTitle>
                        </div>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Konsultasi gratis dengan AI untuk optimalkan bisnis Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {quickInsights.map((insight) => (
                                <button
                                    key={insight.id}
                                    onClick={() => handleGetAIAdvice(insight)}
                                    disabled={isAILoading}
                                    className="flex flex-col items-start p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-2xl mb-2">{insight.icon}</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                        {insight.title}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                        {insight.question}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}


        {/* === MODAL TAMBAH MENU (POPUP) === */}
        {showProductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
                <Card className="w-full max-w-md bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                        <CardTitle>Tambah Menu Baru</CardTitle>
                        <button onClick={() => setShowProductModal(false)}><X className="h-5 w-5 text-gray-500" /></button>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div>
                            <label className={labelStyle}>Nama Menu</label>
                            <Input 
                                className={inputStyle} 
                                placeholder="Contoh: Pisang Epe" 
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className={labelStyle}>Kategori</label>
                            <Input 
                                className={inputStyle} 
                                placeholder="Makanan, Minuman, Snack, dll" 
                                value={newProduct.category}
                                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Harga (Rp)</label>
                                <Input 
                                    type="number" 
                                    className={inputStyle} 
                                    placeholder="15000" 
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Stok Awal</label>
                                <Input 
                                    type="number" 
                                    className={inputStyle} 
                                    placeholder="20"
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                                />
                            </div>
                        </div>
                        <Button 
                            onClick={handleAddProduct} 
                            disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white mt-2"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Simpan Menu
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )}


        {/* === MODAL CATAT TRANSAKSI (POPUP) === */}
        {showFinanceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
                <Card className="w-full max-w-md bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                        <CardTitle>Catat Transaksi</CardTitle>
                        <button onClick={() => setShowFinanceModal(false)}><X className="h-5 w-5 text-gray-500" /></button>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div>
                            <label className={labelStyle}>Jenis Transaksi</label>
                            <select 
                                className={inputStyle}
                                value={newTx.type}
                                onChange={(e) => setNewTx({...newTx, type: e.target.value as "in" | "out"})}
                            >
                                <option value="in">Pemasukan (+)</option>
                                <option value="out">Pengeluaran (-)</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelStyle}>Keterangan</label>
                            <Input 
                                className={inputStyle} 
                                placeholder="Contoh: Jual 5 Porsi / Beli Gas" 
                                value={newTx.description}
                                onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className={labelStyle}>Kategori</label>
                            <Input 
                                className={inputStyle} 
                                placeholder="Penjualan, Operasional, Inventory, dll" 
                                value={newTx.category}
                                onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Jumlah (Rp)</label>
                                <Input 
                                    type="number" 
                                    className={inputStyle} 
                                    placeholder="50000"
                                    value={newTx.amount}
                                    onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Tanggal</label>
                                <Input 
                                    type="date" 
                                    className={inputStyle}
                                    value={newTx.transaction_date}
                                    onChange={(e) => setNewTx({...newTx, transaction_date: e.target.value})}
                                />
                            </div>
                        </div>
                        <Button 
                            onClick={handleAddTransaction} 
                            disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white mt-2"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Simpan Transaksi
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )}

        {/* === MODAL AI RECOMMENDATION === */}
        {showAIModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
                <Card className="w-full max-w-2xl bg-white dark:bg-[#020617] border-purple-200 dark:border-purple-900 max-h-[80vh] overflow-hidden flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <CardTitle>AI Business Recommendation</CardTitle>
                        </div>
                        <button onClick={() => setShowAIModal(false)}><X className="h-5 w-5 text-gray-500" /></button>
                    </CardHeader>
                    <CardContent className="pt-6 overflow-y-auto">
                        {isAILoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">Menganalisis bisnis Anda...</p>
                            </div>
                        ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border border-purple-200 dark:border-purple-900">
                                    <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                                        {aiRecommendation}
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <Button 
                                        onClick={() => setShowAIModal(false)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        Tutup
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        )}

      </div>
    </DashboardLayout>
  );
}