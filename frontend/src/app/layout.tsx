import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { AuthProvider } from '@/context/userContext';
import { ReactQueryProvider } from './(home)/ReactQueryProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '800'], // Regular, Medium, ExtraBold
});

export const metadata: Metadata = {
  title: 'interviewaly.ai',
  description:
    'AI-powered mock interview and job application management platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
