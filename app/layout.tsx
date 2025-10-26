import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TopNav from '@/components/TopNav';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <div 
          className="min-h-screen text-gray-900 relative"
          style={{
            background: 'linear-gradient(to bottom, #FF9933 0%, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%, #138808 100%)',
          }}
        >
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center 50%, rgba(0, 0, 128, 0.1) 0%, transparent 10%)'
            }}
          >
            <svg 
              className="absolute"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              width="120" 
              height="120" 
              viewBox="0 0 120 120"
            >
              <circle cx="60" cy="60" r="40" fill="none" stroke="#000080" strokeWidth="2.5"/>
              <circle cx="60" cy="60" r="2" fill="#000080"/>
              {[...Array(24)].map((_, i) => (
                <line
                  key={i}
                  x1="60"
                  y1="20"
                  x2="60"
                  y2="58"
                  stroke="#000080"
                  strokeWidth="2.5"
                  transform={`rotate(${i * 15} 60 60)`}
                />
              ))}
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10"></div>
          <div className="relative z-10">
            <TopNav />
            <main className="max-w-6xl mx-auto p-4">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
