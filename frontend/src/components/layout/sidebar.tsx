"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenTool,
  Image as ImageIcon,
  Store,
  Bot,
  Menu,
  Settings,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ... (Menu Items biarkan sama) ...
const menuItems = [
  { icon: LayoutDashboard, label: "Beranda", href: "/dashboard" },
  { icon: PenTool, label: "Studio Kata AI", href: "/content-studio" },
  { icon: ImageIcon, label: "Studio Visual", href: "/visual-studio" },
  { icon: Store, label: "Dapur UMKM", href: "/management" },
  { icon: Bot, label: "Tanya Daeng", href: "/chatbot" },
  { icon: Settings, label: "Pengaturan", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-md bg-white p-2 shadow-md lg:hidden dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
      >
        <Menu className="h-5 w-5 text-red-600" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r transition-transform duration-300 flex flex-col",
          // PERBAIKAN DISINI:
          // bg-white = Putih saat Terang
          // dark:bg-gray-950 = Hitam saat Gelap
          "bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <div className="rounded-lg bg-red-600 p-1.5 text-white shadow-sm">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-xl bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent dark:from-red-500 dark:to-red-400">
              TABE AI
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all group",
                  isActive
                    ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                    // PERBAIKAN HOVER:
                    : "text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-red-400"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="border-t border-gray-200 p-4 dark:border-gray-800 mt-auto">
           {/* PERBAIKAN USER CARD: */}
           <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-xs font-bold">
                  DG
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Daeng Kuliner</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Super Admin</p>
              </div>
           </div>
        </div>
      </aside>
    </>
  );
}