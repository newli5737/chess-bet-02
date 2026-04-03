'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocket } from '@/lib/useSocket';
import { WalletService } from '@/services/api.service';
import Header from '@/components/Header';
import { Swords, Star, CheckCircle, Loader2, Shield, Zap, Trophy, Users, ChevronRight, Play } from 'lucide-react';

interface RoomInfo {
  id: string;
  gameType: string;
  betAmount: number;
  status: string;
  playerCount?: number;
  hostId?: string | null;
  opponentId?: string | null;
  readyCount?: number;
}

// ── LANDING PAGE (không login) ──────────────────────────────
function LandingPage() {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = 12847;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      setCount(c => {
        if (c + step >= target) { clearInterval(timer); return target; }
        return c + step;
      });
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      img: '/feature_chess_piece.png',
      icon: '♟️',
      title: 'Cờ Tướng Đỉnh Cao',
      desc: 'Đối kháng real-time với người chơi khắp Việt Nam, mỗi nước đi quyết định vận mệnh.',
      color: 'from-amber-500/20 to-amber-900/10',
      border: 'border-amber-500/20',
    },
    {
      img: '/feature_battle.png',
      icon: '⚔️',
      title: 'Đấu Trí – Thắng Tiền',
      desc: 'Đặt cược mỗi ván, chiến thắng nhận ngay phần thưởng. Kỹ năng quyết định tất cả.',
      color: 'from-rose-500/20 to-rose-900/10',
      border: 'border-rose-500/20',
    },
    {
      img: '/feature_reward.png',
      icon: '💰',
      title: 'Nạp / Rút Tức Thì',
      desc: 'Hệ thống ví điện tử an toàn. Nạp bằng QR, rút về tài khoản ngân hàng nhanh chóng.',
      color: 'from-emerald-500/20 to-emerald-900/10',
      border: 'border-emerald-500/20',
    },
  ];

  const stats = [
    { label: 'Người chơi', value: count.toLocaleString('vi-VN') + '+', icon: <Users className="w-5 h-5" /> },
    { label: 'Ván đã đấu', value: '98,431+', icon: <Swords className="w-5 h-5" /> },
    { label: 'Giải thưởng', value: '₫2.1 Tỷ+', icon: <Trophy className="w-5 h-5" /> },
    { label: 'Uptime', value: '99.9%', icon: <Shield className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[hsl(220,20%,4%)] text-white overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Swords className="w-7 h-7 text-amber-400 glow-gold" />
            <span className="text-xl sm:text-2xl font-black italic tracking-tight gradient-gold">
              CHESS BET
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 rounded-xl text-sm font-bold border border-white/15 text-white/80 hover:text-white hover:bg-white/8 transition-all"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-4 py-2 rounded-xl text-sm font-bold btn-shimmer text-amber-950 shadow-gold"
            >
              Đăng ký
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background image */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero_banner.png"
            alt="Chess Battle"
            className="w-full h-full object-cover object-center"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,20%,4%)]/70 via-[hsl(220,20%,4%)]/40 to-[hsl(220,20%,4%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,20%,4%)]/80 via-transparent to-[hsl(220,20%,4%)]/80" />
        </div>

        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-48 sm:w-72 h-48 sm:h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f43f5e, transparent)' }} />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${6 + i * 3}px`,
              height: `${6 + i * 3}px`,
              background: i % 2 === 0 ? '#f59e0b' : '#f43f5e',
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              '--dur': `${7 + i}s`,
              '--delay': `${i * 1.2}s`,
            } as React.CSSProperties}
          />
        ))}

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-crimson border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            🔴 TRỰC TUYẾN — {count.toLocaleString('vi-VN')} người đang tham chiến
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black italic leading-[1.05] tracking-tight mb-5 animate-slide-up">
            <span className="gradient-crimson-gold">ĐẤU CỜ TƯỚNG</span>
            <br />
            <span className="text-white">KIẾM TIỀN THẬT</span>
          </h1>

          <p className="text-base sm:text-xl text-white/60 max-w-xl mx-auto mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Nền tảng cờ tướng cá cược đầu tiên tại Việt Nam. Thể hiện tài năng, đánh bại đối thủ và nhận ngay phần thưởng.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => router.push('/login')}
              className="group relative px-8 py-4 rounded-2xl font-black text-lg text-amber-950 btn-shimmer shadow-gold flex items-center justify-center gap-2 animate-glow-pulse"
            >
              <Play className="w-5 h-5 fill-amber-950" />
              ĐĂNG NHẬP ĐỂ CHƠI
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-8 py-4 rounded-2xl font-bold text-lg text-white glass hover:bg-white/10 border border-white/15 transition-all flex items-center justify-center gap-2"
            >
              Tạo tài khoản miễn phí
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: <Shield className="w-3.5 h-3.5" />, text: 'Bảo mật cao' },
              { icon: <Zap className="w-3.5 h-3.5" />, text: 'Thanh toán nhanh' },
              { icon: <Trophy className="w-3.5 h-3.5" />, text: 'Fair play 100%' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-white/50 text-xs sm:text-sm">
                <span className="text-amber-400">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <span className="text-xs tracking-wider uppercase">Khám phá</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────── */}
      <section className="py-10 sm:py-14 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {stats.map(({ label, value, icon }) => (
              <div key={label} className="glass rounded-2xl p-4 sm:p-5 text-center hover:scale-105 transition-transform">
                <div className="flex justify-center mb-2 text-amber-400 opacity-70">{icon}</div>
                <div className="text-xl sm:text-2xl font-black gradient-gold leading-tight">{value}</div>
                <div className="text-[11px] sm:text-xs text-white/40 mt-1 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-block px-4 py-1.5 rounded-full glass-gold border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
              Tại sao chọn ChessBet?
            </div>
            <h2 className="text-2xl sm:text-4xl font-black gradient-gold">
              Trải nghiệm đỉnh cao
            </h2>
            <p className="text-white/50 mt-3 text-sm sm:text-base max-w-xl mx-auto">
              Không chỉ là cờ — đây là nơi kỹ năng được đền đáp bằng tiền thật.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {features.map(({ img, icon, title, desc, color, border }) => (
              <div
                key={title}
                className={`group relative overflow-hidden rounded-3xl border ${border} bg-gradient-to-b ${color} hover:scale-[1.02] transition-all duration-500 cursor-default`}
              >
                {/* Image */}
                <div className="h-44 sm:h-52 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).parentElement!.style.background =
                        'linear-gradient(135deg, rgba(190,18,60,0.3), rgba(15,10,25,0.8))';
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,20%,4%)] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 text-3xl">{icon}</div>
                </div>
                <div className="p-5">
                  <h3 className="text-base sm:text-lg font-black text-white mb-2">{title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">Bắt đầu trong <span className="gradient-gold">3 bước</span></h2>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
              {[
                { step: '01', title: 'Tạo tài khoản', desc: 'Đăng ký miễn phí trong 30 giây', icon: '👤' },
                { step: '02', title: 'Nạp tiền', desc: 'Chuyển khoản qua QR, xác nhận tức thì', icon: '💳' },
                { step: '03', title: 'Đấu & thắng', desc: 'Vào phòng, đặt cược, chiến thắng', icon: '🏆' },
              ].map(({ step, title, desc, icon }) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl glass-gold border border-amber-500/30 flex items-center justify-center text-3xl mb-4 animate-glow-pulse">
                    {icon}
                  </div>
                  <div className="text-xs font-black text-amber-500/50 tracking-widest mb-1">BƯỚC {step}</div>
                  <div className="text-base font-black text-white mb-2">{title}</div>
                  <div className="text-sm text-white/40 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center glass-crimson border border-rose-500/20">
            <div className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(ellipse at center, rgba(244,63,94,0.5) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl mb-4">🏆</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                Sẵn sàng bước vào chiến trường?
              </h2>
              <p className="text-white/50 mb-7 text-sm sm:text-base">
                Hàng nghìn cao thủ đang chờ bạn. Thách đấu ngay hôm nay.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-4 rounded-2xl font-black text-lg text-amber-950 btn-shimmer shadow-gold inline-flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-amber-950" />
                ĐĂNG NHẬP ĐỂ CHƠI NGAY
              </button>
              <p className="text-white/30 text-xs mt-4">Miễn phí · Không ẩn phí · Rút tiền dễ dàng</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="border-t border-white/6 py-8 px-4 text-center text-white/25 text-xs">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Swords className="w-4 h-4 text-amber-500/50" />
          <span className="font-black italic text-white/40">CHESS BET</span>
        </div>
        <p>© 2025 ChessBet. Chơi có trách nhiệm. 18+</p>
      </footer>
    </div>
  );
}

// ── LOBBY PAGE (đã login) ───────────────────────────────────
function LobbyPage() {
  const { user, updateBalance } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'medium' | 'premium'>('basic');

  useEffect(() => {
    if (!user) return;
    WalletService.getBalance()
      .then(data => updateBalance(data.balance))
      .catch(console.error);
  }, [user?.id, updateBalance]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('request_room_list');
    const handler = (list: RoomInfo[]) => setRooms(list);
    socket.on('room_list_update', handler);
    return () => { socket.off('room_list_update', handler); };
  }, [socket]);

  const basicRooms   = rooms.filter(r => r.id.includes('basic'));
  const mediumRooms  = rooms.filter(r => r.id.includes('medium'));
  const premiumRooms = rooms.filter(r => r.id.includes('premium'));
  const displayRooms = activeTab === 'basic' ? basicRooms : activeTab === 'medium' ? mediumRooms : premiumRooms;

  const tabs = [
    { key: 'basic'   as const, label: 'Cơ Bản',  sub: '< 100K',    icon: '🎯', color: 'amber' },
    { key: 'medium'  as const, label: 'Trung Cấp', sub: '100K–1M',  icon: '⭐', color: 'orange' },
    { key: 'premium' as const, label: 'Cao Cấp',   sub: '≥ 1M',     icon: '👑', color: 'rose' },
  ];

  return (
    <div className="min-h-screen bg-[hsl(220,20%,4%)] flex flex-col relative">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-72 opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(245,158,11,0.4) 0%, transparent 70%)' }} />

      <Header />

      <main className="flex-grow container mx-auto px-3 sm:px-4 py-5 sm:py-8 flex flex-col relative z-10 max-w-6xl">

        {/* ── Tab bar ── */}
        <div className="glass rounded-2xl p-1.5 sm:p-2 border border-white/8 mb-5 sm:mb-7 sticky top-[65px] z-40">
          <div className="grid grid-cols-3 gap-1">
            {tabs.map(({ key, label, sub, icon, color }) => {
              const active = activeTab === key;
              const colorMap: Record<string, string> = {
                amber:  'bg-amber-400/15 text-amber-300 border-amber-400/25',
                orange: 'bg-orange-400/15 text-orange-300 border-orange-400/25',
                rose:   'bg-rose-400/15 text-rose-300 border-rose-400/25',
              };
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex flex-col items-center py-2.5 sm:py-3.5 px-2 rounded-xl transition-all border ${
                    active ? colorMap[color] : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg sm:text-xl mb-0.5">{icon}</span>
                  <span className="font-black text-xs sm:text-sm uppercase tracking-wide">{label}</span>
                  <span className="text-[10px] sm:text-xs opacity-60 hidden sm:block">{sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Connection warning ── */}
        {!isConnected && (
          <div className="mb-4 p-3 sm:p-4 glass-crimson text-rose-300 border border-rose-500/30 rounded-xl flex items-center gap-3 text-sm font-semibold">
            <Loader2 className="animate-spin w-4 h-4 flex-shrink-0" />
            Đang kết nối tới máy chủ thời gian thực...
          </div>
        )}

        {/* ── Room grid ── */}
        {displayRooms.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-3xl glass flex items-center justify-center text-5xl mb-5">
              🎮
            </div>
            <p className="text-white/50 text-base font-semibold mb-1">Chưa có phòng nào</p>
            <p className="text-white/30 text-sm">Hãy là người đầu tiên tạo phòng!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {displayRooms.map(room => {
              const isDisconnected = room.status === 'playing' && (room.playerCount ?? 0) < 2;
              const statusLabel = isDisconnected ? 'Mất Kết Nối' : room.status === 'playing' ? 'Đang Giao Tranh' : 'Đang Chờ Khách';
              const statusColor = isDisconnected
                ? 'text-red-400 bg-red-400' : room.status === 'playing'
                ? 'text-emerald-400 bg-emerald-400' : 'text-amber-400 bg-amber-400';

              return (
                <div key={room.id} className="group relative overflow-hidden rounded-3xl border border-white/8 hover:border-amber-500/30 transition-all duration-500 hover:shadow-gold cursor-pointer"
                  onClick={() => router.push(`/room/${room.id}`)}>

                  {/* Room image */}
                  <div className="relative h-44 sm:h-52 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/xiangqi_table.png"
                      alt="Bàn cờ"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,20%,5%)] via-[hsl(220,20%,5%)]/30 to-transparent" />

                    {/* Room ID badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-lg glass-dark border border-rose-500/30 text-rose-200 text-[11px] font-black uppercase tracking-widest">
                        CỜ TƯỚNG #{room.id.split('-').pop()?.slice(-4).toUpperCase()}
                      </span>
                    </div>

                    {/* Ready badge */}
                    {(room.readyCount ?? 0) > 0 && room.status === 'waiting' && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/20 text-green-300 px-2.5 py-1 rounded-full border border-green-500/40 text-xs font-bold">
                        <CheckCircle className="w-3 h-3" />
                        {room.readyCount}/2
                      </div>
                    )}

                    {/* Players overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center justify-between glass-dark rounded-xl px-3 py-2 border border-white/8">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${statusColor.split(' ')[1]} ${room.status === 'waiting' ? 'animate-pulse' : ''}`} />
                          <span className={`text-xs font-bold ${statusColor.split(' ')[0]}`}>{statusLabel}</span>
                        </div>
                        <span className="text-white/60 text-xs font-semibold">
                          👥 {room.playerCount ?? 0}/2
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Room info */}
                  <div className="p-4 bg-[hsl(220,20%,6%)]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-black text-white italic">
                        Kỳ Đài #{room.id.split('-').pop()?.slice(-4)}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-amber-400 font-black text-sm">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(room.betAmount || 0)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/room/${room.id}`); }}
                      className={`w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95 ${
                        room.status === 'playing'
                          ? 'glass border border-white/15 text-white/70 hover:bg-white/10'
                          : 'btn-shimmer text-amber-950 shadow-gold'
                      }`}
                    >
                      {room.status === 'playing' ? '👁 XEM TRẬN' : '⚔️ THAM CHIẾN'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// ── ROOT PAGE: auto-switch ──────────────────────────────────
export default function RootPage() {
  const { user } = useAuthStore();
  return user ? <LobbyPage /> : <LandingPage />;
}
