'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Memverifikasi email Anda...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get hash fragment from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (type === 'signup' && accessToken) {
          // Email verified successfully
          setStatus('success');
          setMessage('Email berhasil diverifikasi! Redirecting ke login...');
          
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else if (type === 'recovery') {
          // Password recovery
          setStatus('success');
          setMessage('Redirecting ke reset password...');
          
          setTimeout(() => {
            router.push('/reset-password');
          }, 1500);
        } else {
          setStatus('error');
          setMessage('Link verifikasi tidak valid atau sudah kadaluarsa.');
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('Terjadi kesalahan saat memverifikasi email.');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 pb-6 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-red-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Memverifikasi Email
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tunggu sebentar...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Berhasil!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Verifikasi Gagal
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {message}
              </p>
              <button
                onClick={() => router.push('/login')}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Kembali ke Login
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
