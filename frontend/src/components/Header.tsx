'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthService } from '@/services/api.service';
import { LogOut, Swords, User, Wallet, Plus } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try { await AuthService.logout(); } catch { /* ignore */ }
    logout();
    router.push('/');
  };

  if (!user) return null;

  const fmtBalance = new Intl.NumberFormat('vi-VN', {
    style: 'currency', currency: 'VND', maximumFractionDigits: 0
  }).format(user.balance);

  return (
    <header className="glass-panel sticky top-0 z-50 border-b border-white/6 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">

        {/* Logo */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group"
        >
          <div className="relative">
            <Swords className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 blur-lg bg-amber-400/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xl sm:text-2xl font-black italic tracking-tight gradient-gold">
            CHESS BET
          </span>
        </button>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Balance chip */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 to-rose-500/5 shadow-[0_0_16px_rgba(245,158,11,0.12)]">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-pulse flex-shrink-0" />
            <span className="text-xs sm:text-sm font-black text-amber-300 whitespace-nowrap">
              {fmtBalance}
            </span>
          </div>

          {/* Nạp tiền button */}
          <button
            onClick={() => router.push('/profile?tab=deposit')}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm
              bg-gradient-to-r from-emerald-600/25 to-emerald-500/15 text-emerald-300
              border border-emerald-500/30 hover:border-emerald-400/50
              hover:from-emerald-600/40 hover:to-emerald-500/30
              transition-all active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline font-black">Nạp tiền</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl
              glass border border-white/10 hover:border-white/20 hover:bg-white/8
              transition-all active:scale-95"
            title="Trang cá nhân"
          >
            <User className="w-4 h-4 text-white/70 flex-shrink-0" />
            <span className="hidden md:inline text-xs text-white/60 font-semibold max-w-[120px] truncate">
              {user.email.split('@')[0]}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 sm:p-2.5 rounded-xl
              bg-rose-500/10 text-rose-400 border border-rose-500/20
              hover:bg-rose-500/25 hover:text-rose-300 hover:border-rose-500/40
              transition-all active:scale-95"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
