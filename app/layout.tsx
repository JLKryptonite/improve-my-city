import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TopNav from '@/components/TopNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Improve My City',
  description: 'Report civic issues and track their resolution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <TopNav />
          <main className="max-w-6xl mx-auto p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
