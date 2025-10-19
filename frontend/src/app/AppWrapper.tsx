'use client';

import { useUpload } from "@/context/UploadContext";
import Notification from "@/components/Notification";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { ThemeProvider } from "@/context/ThemeContext";

// Inner component to access theme context
const Header = () => {
  const pathname = usePathname();

  const navLinkClasses = (path: string) => 
    `pb-1.5 border-b-2 transition-colors duration-300 ${
      pathname === path 
        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400' 
        : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-2xl font-bold text-slate-900 dark:text-white">Bajaj AMC</Link>
          <nav className="flex items-center space-x-6 text-sm font-semibold">
            <Link href="/" className={navLinkClasses('/')}>Chat</Link>
            <Link href="/upload" className={navLinkClasses('/upload')}>Upload</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { notification, clearNotification } = useUpload();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        {children}

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={clearNotification}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
