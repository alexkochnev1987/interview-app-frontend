'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

interface TakeMediaContextValue {
  cameraStream: MediaStream | null
}

const TakeMediaContext = createContext<TakeMediaContextValue>({
  cameraStream: null,
})

interface TakeMediaProviderProps {
  cameraStream: MediaStream | null
  children: ReactNode
}

export function TakeMediaProvider({ cameraStream, children }: TakeMediaProviderProps) {
  const value = useMemo<TakeMediaContextValue>(() => ({ cameraStream }), [cameraStream])
  return <TakeMediaContext.Provider value={value}>{children}</TakeMediaContext.Provider>
}

export function useTakeMedia(): TakeMediaContextValue {
  return useContext(TakeMediaContext)
}
