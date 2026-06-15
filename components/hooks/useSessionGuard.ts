'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSessionGuard() {
  useEffect(() => {
    // Marcar sesión activa en sessionStorage
    // (se borra solo al cerrar el navegador o la pestaña)
    const isActive = sessionStorage.getItem('sb-session-active')
    
    if (!isActive) {
      // Si no hay marca en sessionStorage significa
      // que se cerró el navegador/pestaña — forzar signOut
      const supabase = createClient()
      supabase.auth.signOut().then(() => {
        window.location.href = '/login'
      })
      document.cookie = "x-session-active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
    }

    sessionStorage.setItem('sb-session-active', 'true')
    // También creamos una cookie de sesión para que el middleware la lea
    document.cookie = "x-session-active=true; path=/; SameSite=Lax"
  }, [])
}
