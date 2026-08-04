'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

import { useRouter } from '@/i18n/navigation'
import {
  completeOnboarding as apiCompleteOnboarding,
  logout as apiLogout,
  type MeResponse as User,
  type AvatarUpdateResponse,
  type CompleteOnboardingStatus,
} from '@/lib/api'

interface AuthContextType {
  user: User | null
  establishSession: (sessionUser: User) => void
  completeOnboarding: (status?: CompleteOnboardingStatus) => Promise<User>
  updateAvatar: (avatar: AvatarUpdateResponse) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  establishSession: () => {},
  completeOnboarding: async () => {
    throw new Error('AuthProvider is not mounted')
  },
  updateAvatar: () => {},
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

  const establishSession = (sessionUser: User) => {
    setUser(sessionUser)
  }

  const completeOnboarding = async (status: CompleteOnboardingStatus = 'completed') => {
    const updatedUser = await apiCompleteOnboarding(status)
    setUser(updatedUser)
    return updatedUser
  }

  const updateAvatar = ({ pictureUrl, avatarSource }: AvatarUpdateResponse) => {
    setUser((current) =>
      current ? { ...current, pictureUrl: pictureUrl ?? undefined, avatarSource } : current,
    )
  }

  const logout = async () => {
    await apiLogout()
    setUser(null)
    router.push('/login')
    router.refresh()
  }

  return (
    <AuthContext.Provider
      // oxlint-disable-next-line react/jsx-no-constructed-context-values
      value={{ user, establishSession, completeOnboarding, updateAvatar, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function useIsDemo() {
  return useContext(AuthContext).user?.demo === true
}
