import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Pastikan ini ada
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TABE AI",
  description: "Platform AI untuk UMKM kuliner Makassar: branding, konten marketing, dan engagement pelanggan lebih gampang, nakko.",
    icons: {
    icon: "/tabe-ai.jpg",
    shortcut: "/tabe-ai.jpg",
    apple: "/tabe-ai.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const localTheme = localStorage.getItem('theme');

                  if (localTheme === 'dark' || (!localTheme && isDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Tambahkan Listener: Kalau user ubah settingan Chrome saat web terbuka, ikut berubah langsung
                  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                    if (!localStorage.getItem('theme')) {
                      if (e.matches) {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                    }
                  });
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-background text-foreground transition-colors duration-300`}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}