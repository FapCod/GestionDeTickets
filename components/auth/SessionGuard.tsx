'use client'

import { useSessionGuard } from '@/components/hooks/useSessionGuard'

export function SessionGuard() {
  useSessionGuard()
  return null
}
