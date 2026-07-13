'use client';

import { useRouter } from '@/i18n/navigation';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { logout as apiLogout, type AuthUserResponseDto as User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  establishSession: (sessionUser: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  establishSession: () => {},
  logout: async () => {},
});

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser);

  if (initialUser !== prevInitialUser) {
    const previousSnapshot = prevInitialUser;
    setPrevInitialUser(initialUser);
    if (initialUser != null) {
      setUser(initialUser);
    } else if (previousSnapshot != null) {
      // Server cleared the session (expired or signed out elsewhere).
      setUser(null);
    }
    // When both snapshots are null, keep a client-established session until
    // the first RSC refresh picks up the new cookie (post login/demo sign-in).
  }

  const establishSession = (sessionUser: User) => {
    setUser(sessionUser);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{ user, establishSession, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useIsDemo() {
  return useContext(AuthContext).user?.demo === true;
}
