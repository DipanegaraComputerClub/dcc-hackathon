'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';
import { API_URL } from '@/config/api';

export default function MagicLinkPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim link login');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = "w-full h-12 rounded-xl border border-gray-200 bg-white/50 dark:bg-gray-900/50 pl-12 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 dark:border-gray-800 dark:text-white dark:focus:bg-[#020617] dark:focus:border-red-500";
  const iconLeftStyle = "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#6b7280 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 dark:bg-red-900/20 rounded-full blur-[80px] opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-900/20 rounded-full blur-[80px] opacity-70 translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Back Button */}
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Login
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-xl shadow-red-600/20 mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Magic Link Login
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Login tanpa password! Kami kirim link ke email ta' 🪄
          </p>
        </div>

        {/* Card */}
        <Card className="border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-2xl">
          <CardHeader className="text-center border-b border-gray-100 dark:border-gray-800/50">
            <CardTitle className="text-xl">Masuk dengan Email</CardTitle>
            <CardDescription>
              Tidak perlu ingat password lagi
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className={iconLeftStyle} />
                    <Input
                      type="email"
                      placeholder="contoh@umkm.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputStyle}
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg shadow-red-600/20 font-bold text-base transition-all active:scale-95"
                >
                  {isLoading ? 'Mengirim...' : '🪄 Kirim Link Login'}
                </Button>

                {/* Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    💡 <strong>Cara kerja:</strong> Kami akan kirim link khusus ke email Anda. 
                    Klik link tersebut dan Anda langsung masuk tanpa perlu password!
                  </p>
                </div>
              </form>
            ) : (
              /* Success State */
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Email Terkirim! 📧
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Cek inbox email <strong className="text-gray-900 dark:text-white">{email}</strong> dan klik link yang kami kirim.
                </p>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    ⚠️ Link akan kadaluarsa dalam <strong>1 jam</strong>. 
                    Jika tidak ada di inbox, cek folder <strong>Spam/Junk</strong>.
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Kirim Ulang Link
                </Button>
              </div>
            )}

            {/* Divider */}
            {!success && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-3 text-gray-500 dark:text-gray-400 font-medium">
                    Atau
                  </span>
                </div>
              </div>
            )}

            {/* Link to Regular Login */}
            {!success && (
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline dark:text-red-400"
                >
                  Login dengan Password
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">🔒</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Lebih Aman</p>
          </div>
          <div>
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Lebih Cepat</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Lebih Mudah</p>
          </div>
        </div>
      </div>
    </div>
  );
}
