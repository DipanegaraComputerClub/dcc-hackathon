"use client";

import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // PERUBAHAN:
    // Terang: bg-white (Putih Bersih, bukan abu-abu lagi)
    // Gelap: dark:bg-[#020617] (Hitam Pekat / Slate 950)
    <div className="min-h-screen w-full bg-white dark:bg-[#020617] transition-colors duration-300">
      
      <Sidebar />

      <div className="flex flex-col min-h-screen lg:pl-64 transition-all duration-300">
        <Navbar />
        
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}