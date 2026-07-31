'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { useRouter } from '@/i18n/navigation'
import {
  completeOnboarding as apiCompleteOnboarding,
  logout as apiLogout,
  type MeResponse as User,
  type CompleteOnboardingStatus,
} from '@/lib/api'

interface AuthContextType {
  user: User | null
  establishSession: (sessionUser: User) => void
  completeOnboarding: (status?: CompleteOnboardingStatus) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  establishSession: () => {},
  completeOnboarding: async () => {
    throw new Error('AuthProvider is not mounted')
  },
  logout: async () => {},
})

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode
  initialUser: User | null
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(initialUser)
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser)

  if (initialUser !== prevInitialUser) {
    const previousSnapshot = prevInitialUser
    setPrevInitialUser(initialUser)
    if (initialUser != null) {
      setUser(initialUser)
    } else if (previousSnapshot != null) {
      // Server cleared the session (expired or signed out elsewhere).
      setUser(null)
    }
    // When both snapshots are null, keep a client-established session until
    // the first RSC refresh picks up the new cookie (post login/demo sign-in).
  }

  const establishSession = useCallback((sessionUser: User) => {
    setUser(sessionUser)
  }, [])

  const completeOnboarding = useCallback(async (status: CompleteOnboardingStatus = 'completed') => {
    const updatedUser = await apiCompleteOnboarding(status)
    setUser(updatedUser)
    return updatedUser
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    router.push('/login')
    router.refresh()
  }, [router])

  const value = useMemo(
    () => ({ user, establishSession, completeOnboarding, logout }),
    [user, establishSession, completeOnboarding, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

export function useIsDemo() {
  return useContext(AuthContext).user?.demo === true
}
