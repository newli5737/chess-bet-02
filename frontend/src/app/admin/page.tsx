'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { AdminService } from '@/services/api.service';
import { toast } from 'react-toastify';

// ─── Types ──────────────────────────────────────────────────
type Tab = 'deposits' | 'withdrawals' | 'rooms' | 'users' | 'bank-accounts';

interface RoomState   { roomId: string; status: string; hostId: string | null; opponentId: string | null; hostTime: number; opponentTime: number; }
interface User        { id: string; email: string; balance: number; role: string; }
interface Deposit     { id: string; amount: number; status: string; createdAt: string; transferNote: string; user: { email: string }; bankAccount: { bankName: string; accountNumber: string; accountHolder: string }; }
interface Withdrawal  { id: string; amount: number; status: string; createdAt: string; bankName: string; accountNumber: string; accountHolder: string; note: string; user: { email: string }; }
interface BankAccount { id: string; bankName: string; accountNumber: string; accountHolder: string; qrCode?: string | null; status: string; }

// ─── Helpers ────────────────────────────────────────────────
const fmt     = (n: number) => n.toLocaleString('vi-VN') + '₫';
const fmtDate = (d: string) => new Date(d).toLocaleString('vi-VN');
const statusColor: Record<string, string> = {
  pending:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  approved: 'text-green-400  bg-green-400/10  border-green-400/20',
  rejected: 'text-red-400    bg-red-400/10    border-red-400/20',
  waiting:  'text-blue-400   bg-blue-400/10   border-blue-400/20',
  playing:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  finished: 'text-gray-400   bg-gray-400/10   border-gray-400/20',
  active:   'text-green-400  bg-green-400/10  border-green-400/20',
  inactive: 'text-gray-500   bg-gray-500/10   border-gray-500/20',
};

function Badge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusColor[status] ?? 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
      {status}
    </span>
  );
}

function ActionBtn({ label, onClick, danger, disabled }: { label: string; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
        danger
          ? 'bg-red-500/15 text-red-300 hover:bg-red-500/30 border border-red-500/30'
          : 'bg-green-500/15 text-green-300 hover:bg-green-500/30 border border-green-500/30'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Bank Account Modal ──────────────────────────────────────
interface BankFormState { bankName: string; accountNumber: string; accountHolder: string; qrCode: string; }
const emptyBankForm: BankFormState = { bankName: '', accountNumber: '', accountHolder: '', qrCode: '' };

function BankAccountModal({
  mode, initial, onSave, onClose,
}: {
  mode: 'add' | 'edit';
  initial?: BankAccount;
  onSave: (data: BankFormState) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<BankFormState>(
    initial
      ? { bankName: initial.bankName, accountNumber: initial.accountNumber, accountHolder: initial.accountHolder, qrCode: initial.qrCode || '' }
      : emptyBankForm
  );
  const [saving, setSaving] = useState(false);

  const set = (k: keyof BankFormState) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bankName.trim() || !form.accountNumber.trim() || !form.accountHolder.trim()) {
      toast.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err: any) { toast.error(err?.response?.data?.error || 'Lỗi khi lưu'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[hsl(240,10%,8%)] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold text-white mb-5">
          {mode === 'add' ? '➕ Thêm tài khoản ngân hàng' : '✏️ Sửa tài khoản ngân hàng'}
        </h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Tên ngân hàng *</label>
            <input
              type="text" value={form.bankName} onChange={set('bankName')} required
              placeholder="VD: Vietcombank, MB Bank, Techcombank..."
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Số tài khoản *</label>
            <input
              type="text" value={form.accountNumber} onChange={set('accountNumber')} required
              placeholder="VD: 1234567890"
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Tên chủ tài khoản *</label>
            <input
              type="text" value={form.accountHolder} onChange={set('accountHolder')} required
              placeholder="VD: NGUYEN VAN A"
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm uppercase focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">QR Code URL (tuỳ chọn)</label>
            <input
              type="url" value={form.qrCode} onChange={set('qrCode')}
              placeholder="https://..."
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-gray-400 hover:bg-white/5 transition-all"
            >
              Huỷ
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 hover:bg-yellow-400/30 transition-all disabled:opacity-50"
            >
              {saving ? '⏳ Đang lưu...' : mode === 'add' ? 'Thêm tài khoản' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sidebar nav items ───────────────────────────────────────
const NAV: { key: Tab; icon: string; label: string }[] = [
  { key: 'deposits',      icon: '💰', label: 'Nạp tiền'   },
  { key: 'withdrawals',   icon: '🏧', label: 'Rút tiền'   },
  { key: 'rooms',         icon: '🎮', label: 'Rooms Live' },
  { key: 'users',         icon: '👥', label: 'Users'      },
  { key: 'bank-accounts', icon: '🏦', label: 'Tài khoản NH' },
];

// ─── Main ────────────────────────────────────────────────────
export default function AdminPage() {
  const router    = useRouter();
  const { user }  = useAuthStore();
  const [tab, setTab]                 = useState<Tab>('deposits');
  const [collapsed, setCollapsed]     = useState(false);
  const [rooms, setRooms]             = useState<RoomState[]>([]);
  const [users, setUsers]             = useState<User[]>([]);
  const [deposits, setDeposits]       = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading]         = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ──  Bank account modal state
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editTarget, setEditTarget] = useState<BankAccount | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') router.replace('/');
  }, [user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'rooms')         setRooms(await AdminService.getRooms());
      if (tab === 'users')         setUsers(await AdminService.getUsers());
      if (tab === 'deposits')      setDeposits(await AdminService.getDeposits());
      if (tab === 'withdrawals')   setWithdrawals(await AdminService.getWithdrawals());
      if (tab === 'bank-accounts') setBankAccounts(await AdminService.getAdminBankAccounts());
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => {
    load();
    if (tab === 'rooms') pollRef.current = setInterval(load, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [load, tab]);

  const handle = async (action: () => Promise<any>, msg: string) => {
    try { await action(); toast.success(msg); load(); }
    catch (e: any) { toast.error(e?.response?.data?.error || 'Thao tác thất bại'); }
  };

  const openAddModal = () => { setModalMode('add'); setEditTarget(undefined); setModalOpen(true); };
  const openEditModal = (ba: BankAccount) => { setModalMode('edit'); setEditTarget(ba); setModalOpen(true); };

  const handleSaveBankAccount = async (data: BankFormState) => {
    if (modalMode === 'add') {
      await AdminService.createBankAccount(data);
      toast.success('Thêm tài khoản thành công');
    } else if (editTarget) {
      await AdminService.updateBankAccount(editTarget.id, data);
      toast.success('Cập nhật tài khoản thành công');
    }
    await load();
  };

  if (!user || user.role !== 'admin') return null;

  const pendingDeposits    = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

  const badge = (n: number) => n > 0
    ? <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{n}</span>
    : null;

  return (
    <div className="flex h-screen bg-[hsl(240,10%,3.9%)] text-white overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`flex-shrink-0 flex flex-col border-r border-white/8 bg-black/30 backdrop-blur-xl transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[60px]' : 'w-[220px]'
        }`}
      >
        {/* Logo + toggle */}
        <div className={`flex items-center h-16 px-3 border-b border-white/8 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <span className="font-black text-sm bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden">
              ⚙️ Admin
            </span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all flex-shrink-0"
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 p-2 flex-grow">
          {NAV.map(({ key, icon, label }) => {
            const count = key === 'deposits' ? pendingDeposits : key === 'withdrawals' ? pendingWithdrawals : 0;
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all group relative ${
                  active
                    ? 'bg-yellow-400/15 text-yellow-300 border border-yellow-400/25'
                    : 'text-gray-400 hover:bg-white/8 hover:text-white border border-transparent'
                }`}
              >
                <span className="text-base flex-shrink-0">{icon}</span>
                {!collapsed && (
                  <>
                    <span className="truncate">{label}</span>
                    {badge(count)}
                  </>
                )}
                {/* Badge khi thu gọn */}
                {collapsed && count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-3 border-t border-white/8 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <button onClick={() => router.push('/')} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all" title="Về trang chủ">
              🏠
            </button>
          ) : (
            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-all px-2 py-1.5 rounded-lg hover:bg-white/8 w-full">
              🏠 <span>Về trang chủ</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/8 bg-black/20 flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-white">
              {NAV.find(n => n.key === tab)?.icon} {NAV.find(n => n.key === tab)?.label}
            </h1>
            {tab === 'rooms' && <p className="text-xs text-gray-500">🔴 Live — tự động refresh mỗi 5 giây</p>}
          </div>
          <div className="flex items-center gap-3">
            {tab === 'bank-accounts' && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-yellow-400/30 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 font-semibold transition-all"
              >
                ➕ Thêm tài khoản
              </button>
            )}
            <button
              onClick={load}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <span className={loading ? 'animate-spin inline-block' : ''}>🔄</span>
              Refresh
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-6">

          {/* ── Deposits ── */}
          {tab === 'deposits' && (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-left text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Số tiền</th>
                    <th className="px-4 py-3">Ngân hàng</th>
                    <th className="px-4 py-3">Nội dung</th>
                    <th className="px-4 py-3">Ngày</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d, i) => (
                    <tr key={d.id} className={`border-t border-white/5 hover:bg-white/5 transition-colors ${i % 2 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="px-4 py-3 text-blue-300 font-medium">{d.user.email}</td>
                      <td className="px-4 py-3 font-bold text-green-400">{fmt(d.amount)}</td>
                      <td className="px-4 py-3 text-gray-300">
                        <div className="font-medium">{d.bankAccount.bankName}</div>
                        <div className="text-xs text-gray-500">{d.bankAccount.accountNumber} · {d.bankAccount.accountHolder}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 max-w-[150px] truncate">{d.transferNote || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDate(d.createdAt)}</td>
                      <td className="px-4 py-3"><Badge status={d.status} /></td>
                      <td className="px-4 py-3">
                        {d.status === 'pending' && (
                          <div className="flex gap-2">
                            <ActionBtn label="✓ Duyệt"    onClick={() => handle(() => AdminService.approveDeposit(d.id),  'Đã duyệt nạp tiền')} />
                            <ActionBtn label="✗ Từ chối" onClick={() => handle(() => AdminService.rejectDeposit(d.id),   'Đã từ chối')} danger />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {deposits.length === 0 && <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-600">Không có dữ liệu</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Withdrawals ── */}
          {tab === 'withdrawals' && (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-left text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Số tiền</th>
                    <th className="px-4 py-3">Ngân hàng</th>
                    <th className="px-4 py-3">Ghi chú</th>
                    <th className="px-4 py-3">Ngày</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w, i) => (
                    <tr key={w.id} className={`border-t border-white/5 hover:bg-white/5 transition-colors ${i % 2 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="px-4 py-3 text-blue-300 font-medium">{w.user.email}</td>
                      <td className="px-4 py-3 font-bold text-orange-400">{fmt(w.amount)}</td>
                      <td className="px-4 py-3 text-gray-300">
                        <div className="font-medium">{w.bankName}</div>
                        <div className="text-xs text-gray-500">{w.accountNumber} · {w.accountHolder}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 max-w-[140px] truncate">{w.note || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDate(w.createdAt)}</td>
                      <td className="px-4 py-3"><Badge status={w.status} /></td>
                      <td className="px-4 py-3">
                        {w.status === 'pending' && (
                          <div className="flex gap-2">
                            <ActionBtn label="✓ Đã chuyển" onClick={() => handle(() => AdminService.approveWithdrawal(w.id), 'Đã xác nhận chuyển tiền')} />
                            <ActionBtn label="✗ Hoàn tiền" onClick={() => handle(() => AdminService.rejectWithdrawal(w.id), 'Đã hoàn tiền cho user')} danger />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {withdrawals.length === 0 && <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-600">Không có dữ liệu</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Rooms Live ── */}
          {tab === 'rooms' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {rooms.map(r => (
                <div key={r.roomId} className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/[0.08] transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[11px] font-mono text-gray-500 truncate max-w-[130px]">{r.roomId}</span>
                    <Badge status={r.status} />
                  </div>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>🔴</span>
                      <span className="font-mono text-[10px] text-white/70">{r.hostId?.slice(0, 10) ?? '—'}…</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⚫</span>
                      <span className="font-mono text-[10px] text-white/70">{r.opponentId?.slice(0, 10) ?? '—'}…</span>
                    </div>
                    {r.status === 'playing' && (
                      <div className="flex gap-4 mt-2 pt-2 border-t border-white/10 text-xs font-mono">
                        <span className="text-red-400">🔴 {Math.floor(r.hostTime / 60)}:{String(r.hostTime % 60).padStart(2, '0')}</span>
                        <span className="text-gray-400">⚫ {Math.floor(r.opponentTime / 60)}:{String(r.opponentTime % 60).padStart(2, '0')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {rooms.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-600">
                  <div className="text-5xl mb-3">🎮</div>
                  <div>Không có room nào đang hoạt động</div>
                </div>
              )}
            </div>
          )}

          {/* ── Users ── */}
          {tab === 'users' && (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-left text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Số dư</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 font-mono">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className={`border-t border-white/5 hover:bg-white/5 transition-colors ${i % 2 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="px-4 py-3 text-blue-300 font-medium">{u.email}</td>
                      <td className={`px-4 py-3 font-bold ${u.balance > 0 ? 'text-green-400' : 'text-gray-500'}`}>{fmt(u.balance)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/8 text-gray-400 border-white/10'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-gray-600">{u.id}</td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={4} className="px-4 py-16 text-center text-gray-600">Không có dữ liệu</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Bank Accounts ── */}
          {tab === 'bank-accounts' && (
            <div className="space-y-4">
              {/* Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tổng cộng</p>
                  <p className="text-2xl font-black text-white">{bankAccounts.length}</p>
                </div>
                <div className="rounded-xl border border-green-400/20 bg-green-400/5 px-4 py-3">
                  <p className="text-xs text-green-600 uppercase tracking-wider mb-1">Active</p>
                  <p className="text-2xl font-black text-green-400">{bankAccounts.filter(b => b.status === 'active').length}</p>
                </div>
                <div className="rounded-xl border border-gray-500/20 bg-gray-500/5 px-4 py-3">
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Inactive</p>
                  <p className="text-2xl font-black text-gray-500">{bankAccounts.filter(b => b.status === 'inactive').length}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 text-gray-400 text-left text-xs uppercase tracking-wider">
                      <th className="px-4 py-3">Ngân hàng</th>
                      <th className="px-4 py-3">Số tài khoản</th>
                      <th className="px-4 py-3">Chủ tài khoản</th>
                      <th className="px-4 py-3">QR preview</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankAccounts.map((ba, i) => {
                      // Preview QR using sepay if no custom qrCode
                      const previewQr = ba.qrCode
                        ? ba.qrCode
                        : `https://qr.sepay.vn/img?acc=${ba.accountNumber}&bank=${encodeURIComponent(ba.bankName)}&template=compact&amount=100000&des=PREVIEW`;

                      return (
                        <tr key={ba.id} className={`border-t border-white/5 hover:bg-white/5 transition-colors ${i % 2 ? 'bg-white/[0.02]' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🏦</span>
                              <span className="font-bold text-white">{ba.bankName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-yellow-300 text-sm">{ba.accountNumber}</td>
                          <td className="px-4 py-3 text-gray-300 uppercase text-xs font-semibold tracking-wide">{ba.accountHolder}</td>
                          <td className="px-4 py-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewQr}
                              alt="QR"
                              className="w-12 h-12 rounded-lg object-contain bg-white p-0.5"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handle(() => AdminService.toggleBankAccountStatus(ba.id), `Đã ${ba.status === 'active' ? 'tắt' : 'bật'} tài khoản`)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 ${
                                ba.status === 'active'
                                  ? 'bg-green-400/15 text-green-300 border-green-400/30 hover:bg-green-400/25'
                                  : 'bg-gray-500/15 text-gray-400  border-gray-500/30 hover:bg-gray-500/25'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${ba.status === 'active' ? 'bg-green-400' : 'bg-gray-500'}`} />
                              {ba.status === 'active' ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(ba)}
                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-all hover:scale-105"
                              >
                                ✏️ Sửa
                              </button>
                              <ActionBtn
                                label="🗑 Xóa"
                                danger
                                onClick={() => handle(
                                  () => AdminService.deleteBankAccount(ba.id),
                                  'Đã xóa tài khoản'
                                )}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {bankAccounts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-20 text-center">
                          <div className="text-5xl mb-3">🏦</div>
                          <div className="text-gray-600">Chưa có tài khoản ngân hàng nào</div>
                          <button
                            onClick={openAddModal}
                            className="mt-4 px-6 py-2 rounded-xl text-sm font-semibold bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 hover:bg-yellow-400/25 transition-all"
                          >
                            ➕ Thêm tài khoản đầu tiên
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-600 italic">
                💡 Chỉ các tài khoản <span className="text-green-400 font-semibold">Active</span> mới hiển thị cho người dùng khi nạp tiền. Nhấn vào badge trạng thái để bật/tắt nhanh.
              </p>
            </div>
          )}

        </main>
      </div>

      {/* ── Bank Account Modal ─────────────────────────────── */}
      {modalOpen && (
        <BankAccountModal
          mode={modalMode}
          initial={editTarget}
          onSave={handleSaveBankAccount}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
