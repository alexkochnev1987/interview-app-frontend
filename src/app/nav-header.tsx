'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';

export function NavHeader() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  // Hide nav on candidate/feedback pages
  if (pathname.startsWith('/take') || pathname.startsWith('/feedback')) {
    return null;
  }

  return (
    <header className="nav-header">
      <Link href="/" className="logo">Interview App</Link>
      <nav>
        {loading ? null : user ? (
          <>
            <Link href="/">Dashboard</Link>
            <Link href="/questions">Questions</Link>
            <Link href="/interviews/new">New Interview</Link>
            <span className="nav-user">{user.name}</span>
            <button onClick={logout} className="btn-link">Logout</button>
          </>
        ) : (
          <Link href="/login">Sign In</Link>
        )}
      </nav>
    </header>
  );
}
