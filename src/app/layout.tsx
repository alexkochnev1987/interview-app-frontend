import type { Metadata } from 'next';
import './globals.css';
import { NavHeader } from './nav-header';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Interview App',
  description: 'AI-powered interview platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
