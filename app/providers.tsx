'use client'
import React, { useEffect } from 'react'

import { useRouter } from 'next/navigation'
import useBoardStore from '../store/useBoardStore'
import { HeroUIProvider } from '@heroui/system'

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { undo, redo } = useBoardStore()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const ctrl = e.ctrlKey || e.metaKey
      if (!ctrl) return
      if (key === 'z') { e.preventDefault(); undo() }
      else if (key === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  return (
    <HeroUIProvider>     
        {children}
    </HeroUIProvider>
  )
}
