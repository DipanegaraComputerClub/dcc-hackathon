"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Store, ShoppingBag, Wallet, Plus, Edit, Trash2, 
  TrendingUp, TrendingDown, Save, X 
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- TIPE DATA ---
type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
};

type Transaction = {
  id: number;
  date: string;
  desc: string;
  amount: number;
  type: "in" | "out";
};

export default function ManagementPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE DATA (Agar Bisa Ditambah) ---
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Coto Makassar Daging", price: 25000, stock: 20, image: "https://placehold.co/100x100/orange/white?text=Coto" },
    { id: 2, name: "Pallubasa Serigala", price: 28000, stock: 15, image: "https://placehold.co/100x100/brown/white?text=Pallu" },
    { id: 3, name: "Es Pisang Ijo", price: 15000, stock: 50, image: "https://placehold.co/100x100/green/white?text=Pisang" },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, date: "2025-12-04", desc: "Penjualan Coto (5 Porsi)", amount: 125000, type: "in" },
    { id: 2, date: "2025-12-04", desc: "Beli Daging Sapi 2kg", amount: 240000, type: "out" },
    { id: 3, date: "2025-12-03", desc: "Penjualan Pisang Ijo", amount: 75000, type: "in" },
  ]);

  // --- STATE MODAL (Pop-up) ---
  const [showProductModal, setShowProductModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);

  // --- STATE FORM INPUT BARU ---
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "" });
  const [newTx, setNewTx] = useState({ desc: "", amount: "", type: "in", date: "" });

  // --- LOGIKA HITUNG DUIT OTOMATIS ---
  const totalIncome = transactions.filter(t => t.type === 'in').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'out').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  // Format Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  // --- HANDLER FUNGSI ---
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return alert("Isi nama dan harga dulu, Daeng!");
    
    const product: Product = {
      id: Date.now(),
      name: newProduct.name,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock) || 0,
      image: "https://placehold.co/100x100/red/white?text=Baru"
    };

    setProducts([product, ...products]); // Tambah ke atas
    setShowProductModal(false); // Tutup modal
    setNewProduct({ name: "", price: "", stock: "" }); // Reset form
  };

  const handleDeleteProduct = (id: number) => {
    if(confirm("Yakin mau hapus menu ini?")) {
        setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleAddTransaction = () => {
    if (!newTx.desc || !newTx.amount) return alert("Isi keterangan dan jumlah uangnya!");

    const tx: Transaction = {
      id: Date.now(),
      date: newTx.date || new Date().toISOString().split('T')[0],
      desc: newTx.desc,
      amount: Number(newTx.amount),
      type: newTx.type as "in" | "out"
    };

    setTransactions([tx, ...transactions]);
    setShowFinanceModal(false);
    setNewTx({ desc: "", amount: "", type: "in", date: "" });
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
                    <CardTitle>Logo</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                     <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-red-50 dark:border-red-900/20 mb-4 group cursor-pointer">
                        <img src="https://placehold.co/150x150/red/white?text=Logo" alt="Logo" className="object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit className="text-white h-6 w-6" />
                        </div>
                     </div>
                     <p className="text-sm text-gray-500 text-center">Klik logo untuk ganti.</p>
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
                            <Input className={inputStyle} defaultValue="Warung Coto Daeng" />
                        </div>
                        <div>
                            <label className={labelStyle}>Kategori</label>
                            <select className={inputStyle}>
                                <option>Kuliner / Makanan</option>
                                <option>Fashion</option>
                                <option>Jasa</option>
                            </select>
                        </div>
                     </div>
                     <div>
                        <label className={labelStyle}>Alamat</label>
                        <Textarea className={inputStyle} defaultValue="Jl. A.P. Pettarani No. 102, Makassar" />
                     </div>
                     <div className="pt-2 flex justify-end">
                        <Button onClick={() => alert("Profil tersimpan!")} className="bg-red-600 hover:bg-red-700 text-white">
                            <Save className="ml-2 h-4 w-4" /> Simpan
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
                    {products.map((product) => (
                        <Card key={product.id} className="bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900 transition-colors group relative">
                            <div className="flex p-4 gap-4">
                                <div className="h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{product.name}</h3>
                                    <p className="text-red-600 dark:text-red-400 font-semibold">{formatRupiah(product.price)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Stok: {product.stock}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
                                <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">Tersedia</span>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleDeleteProduct(product.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
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
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-2 rounded-full",
                                            tx.type === 'in' ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-red-100 text-red-600 dark:bg-red-900/30"
                                        )}>
                                            {tx.type === 'in' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{tx.desc}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{tx.date}</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "font-bold",
                                        tx.type === 'in' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                    )}>
                                        {tx.type === 'in' ? '+' : '-'} {formatRupiah(tx.amount)}
                                    </span>
                                </div>
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
                        <Button onClick={handleAddProduct} className="w-full bg-red-600 hover:bg-red-700 text-white mt-2">
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
                                value={newTx.desc}
                                onChange={(e) => setNewTx({...newTx, desc: e.target.value})}
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
                                    value={newTx.date}
                                    onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                                />
                            </div>
                        </div>
                        <Button onClick={handleAddTransaction} className="w-full bg-red-600 hover:bg-red-700 text-white mt-2">
                            Simpan Transaksi
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )}

      </div>
    </DashboardLayout>
  );
}