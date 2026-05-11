'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { logout as apiLogout, type AuthUserResponseDto as User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionVerifyFailed: boolean;
  establishSession: (sessionUser: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  sessionVerifyFailed: false,
  establishSession: () => {},
  logout: async () => {},
});

export function AuthProvider({
  children,
  initialUser,
  initialSessionVerifyFailed = false,
}: {
  children: ReactNode;
  initialUser: User | null;
  initialSessionVerifyFailed?: boolean;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);
  const [sessionVerifyFailed, setSessionVerifyFailed] = useState(
    initialSessionVerifyFailed,
  );
  const loading = false;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- align client state with RSC session snapshot after router.refresh() / navigations
    setUser(initialUser);
    setSessionVerifyFailed(initialSessionVerifyFailed);
  }, [initialUser, initialSessionVerifyFailed]);

  const establishSession = (sessionUser: User) => {
    setUser(sessionUser);
    setSessionVerifyFailed(false);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    setSessionVerifyFailed(false);
    router.push('/login');
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, sessionVerifyFailed, establishSession, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
