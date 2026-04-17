import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

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
        <header className="nav-header">
          <Link href="/" className="logo">
            Interview App
          </Link>
          <nav>
            <Link href="/">Dashboard</Link>
            <Link href="/interviews/new">New Interview</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
