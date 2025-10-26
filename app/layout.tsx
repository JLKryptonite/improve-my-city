import type { Metadata } from 'next';
import './globals.css';
import TopNav from '@/components/TopNav';

export const metadata: Metadata = {
  title: 'Improve My City',
  description: 'Report civic issues and track their resolution',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        <div className="min-h-screen text-gray-900 relative">
          <div className="relative z-10">
            <TopNav />
            <main>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
