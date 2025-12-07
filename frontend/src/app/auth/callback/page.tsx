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
        // Check for error in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (error) {
          // Handle errors
          setStatus('error');
          if (error === 'access_denied' && errorDescription?.includes('expired')) {
            setMessage('Link sudah kadaluarsa. Silakan minta link baru.');
          } else {
            setMessage(errorDescription || 'Terjadi kesalahan. Silakan coba lagi.');
          }
          
          setTimeout(() => {
            router.push('/login?error=verification_failed');
          }, 3000);
          return;
        }

        if (accessToken) {
          // Save tokens to localStorage
          localStorage.setItem('access_token', accessToken);
          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }

          // Determine success message based on type
          setStatus('success');
          
          if (type === 'magiclink') {
            setMessage('🪄 Magic Link berhasil! Selamat datang di TABE AI...');
          } else if (type === 'signup') {
            setMessage('✅ Email berhasil diverifikasi! Redirecting...');
          } else if (type === 'recovery') {
            setMessage('Redirecting ke reset password...');
            setTimeout(() => {
              router.push('/reset-password');
            }, 1500);
            return;
          } else {
            // OAuth login (Google, GitHub, etc)
            setMessage('Login berhasil! Redirecting...');
          }

          // Redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          setStatus('error');
          setMessage('Link tidak valid atau sudah kadaluarsa.');
          
          setTimeout(() => {
            router.push('/login');
          }, 3000);
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
