"use client";

import { Search, Bell, LogOut, User, Settings, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    // LOGIKA SIDEBAR: 
    // bg-white (Terang) | dark:bg-gray-950 (Gelap - Hitam Pekat)
    <header className="sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors duration-300 
      bg-white/80 border-gray-200 
      dark:bg-gray-950/80 dark:border-gray-800">
      
      <div className="flex h-16 items-center gap-4 px-6">
        
        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
           <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-200">
             <Menu className="h-5 w-5" />
           </Button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-hover:text-red-500 transition-colors" />
            <Input
              type="search"
              placeholder="Cari sesuatu..."
              // Input: Abu muda (Terang) / Hitam (Gelap)
              className="pl-10 rounded-full border-transparent transition-all duration-300 
                bg-gray-100 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500
                dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-300">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-white dark:border-gray-950 animate-pulse" />
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ml-1 ring-2 ring-transparent hover:ring-red-500/20 transition-all cursor-pointer">
                {/* Avatar: Merah Gradient */}
                <div className="h-full w-full rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  UM
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            {/* Dropdown Content: Putih (Terang) / Hitam Pekat (Gelap) */}
            <DropdownMenuContent className="w-56 mt-2 bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-red-600 dark:text-red-400">UMKM Kuliner</p>
                  <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                    umkm@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer rounded-md focus:bg-gray-100 dark:focus:bg-gray-900 dark:text-gray-200">
                <Settings className="mr-2 h-4 w-4 text-gray-500" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer rounded-md mt-1">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-medium">Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}