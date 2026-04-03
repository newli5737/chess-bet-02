import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Chess Bet — Đấu Cờ Tướng | Kiếm Tiền Thật',
  description: 'Nền tảng cờ tướng cá cược trực tuyến uy tín. Đối kháng real-time, nạp rút tức thì, bảo mật cao.',
  keywords: 'cờ tướng, chess bet, cá cược, xiangqi, đánh cờ online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased min-h-screen bg-background text-foreground flex flex-col`}>
        <main className="flex-grow flex flex-col">
          <AuthProvider>
            {children}
          </AuthProvider>
        </main>
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          draggable
          pauseOnHover
          theme="dark"
          toastStyle={{
            background: 'rgba(10, 8, 20, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            fontSize: '14px',
          }}
        />
      </body>
    </html>
  );
}
