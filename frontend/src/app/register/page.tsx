'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/api.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, Swords, ChevronLeft, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user } = await AuthService.register({ email, password });
      setAuth(user);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại. Xin thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[hsl(220,20%,4%)] p-4">
      {/* Background with parallax effect */}
      <div className="absolute inset-0 z-0">
        <img src="/hero_banner.png" alt="Background" className="w-full h-full object-cover opacity-40 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background/90" />
      </div>

      {/* Ambient glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #f43f5e, transparent)' }} />

      {/* Back button */}
      <button 
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/50 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm font-semibold hidden sm:block">Quay lại trang chủ</span>
      </button>

      {/* Main card */}
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="glass-dark p-8 sm:p-10 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-crimson mb-4 shadow-crimson animate-glow-pulse" style={{ animationDuration: '4s' }}>
              <Swords className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-3xl font-black italic tracking-tight gradient-crimson-gold mb-2">
              TẠO TÀI KHOẢN
            </h1>
            <p className="text-white/50 text-sm">Bắt đầu hành trình chinh phục kỳ đài</p>
          </div>

          {error && (
            <div className="glass-crimson border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-fade-in">
              <span className="text-rose-500 font-bold">!</span> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full bg-[hsl(220,20%,2%)]/80 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all text-white placeholder-white/20 text-sm"
                placeholder="tanthu@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Mật khẩu</label>
              </div>
              <input 
                type="password" 
                required
                className="w-full bg-[hsl(220,20%,2%)]/80 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all text-white placeholder-white/20 text-sm"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-sm rounded-xl px-4 py-4 mt-8 flex justify-center items-center gap-2 shadow-crimson transition-transform active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5 text-white" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5 text-white" />
                  ĐĂNG KÝ NGAY
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-rose-400 hover:text-rose-300 font-bold ml-1 transition-colors">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
