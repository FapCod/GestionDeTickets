'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: (e?: React.MouseEvent) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {}
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // Usar sessionStorage (no localStorage) para que se resetee al cerrar navegador
    const saved = sessionStorage.getItem('theme') as Theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved || (prefersDark ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  const toggleTheme = (e?: React.MouseEvent) => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const isDark = next === 'dark'

    // Obtener coordenadas exactas del botón de tema
    const target = e?.currentTarget as HTMLElement | null
    const rect = target?.getBoundingClientRect?.()
    const x = rect ? rect.left + rect.width / 2 : (e ? e.clientX : window.innerWidth - 80)
    const y = rect ? rect.top + rect.height / 2 : (e ? e.clientY : 30)

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    ) * 1.08

    // Remover velo anterior si existe
    const oldVeil = document.getElementById('theme-luminous-veil')
    if (oldVeil) oldVeil.remove()

    // 1. Contenedor de pantalla completa
    const container = document.createElement('div')
    container.id = 'theme-luminous-veil'
    Object.assign(container.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '99999',
      overflow: 'hidden',
    })

    // 2. Elemento de velo con color 100% SÓLIDO (cero transparencia para tapar todo)
    const wave = document.createElement('div')
    const size = endRadius * 2

    Object.assign(wave.style, {
      position: 'absolute',
      left: `${x - endRadius}px`,
      top: `${y - endRadius}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      pointerEvents: 'none',
      willChange: 'transform, opacity',
      transformOrigin: 'center center',
      // Gradientes 100% opacos para bloquear la visión totalmente
      background: isDark
        ? 'radial-gradient(circle at center, #0f172a 0%, #141c30 70%, #1e3a8a 95%, #2563eb 100%)'
        : 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 70%, #fef3c7 95%, #fbbf24 100%)',
      boxShadow: isDark
        ? '0 0 80px 30px rgba(37, 99, 235, 0.7)'
        : '0 0 80px 30px rgba(251, 191, 36, 0.6)',
    })

    container.appendChild(wave)
    document.body.appendChild(container)

    // FASE 1: El velo se expande hasta TAPAR por completo la pantalla al 100% de opacidad
    const coverAnimation = wave.animate(
      [
        {
          transform: 'scale(0.01)',
          opacity: 1
        },
        {
          transform: 'scale(1.05)',
          opacity: 1
        }
      ],
      {
        duration: 380,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        fill: 'forwards'
      }
    )

    // Al terminar de tapar el 100% de la pantalla:
    coverAnimation.onfinish = () => {
      // 1. Cambiamos el tema mientras la pantalla está 100% cubierta (cero parpadeo)
      setTheme(next)
      sessionStorage.setItem('theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')

      // FASE 2: El velo se desvanece suavemente revelando el nuevo tema ya cargado
      const revealAnimation = wave.animate(
        [
          {
            opacity: 1,
            transform: 'scale(1.05)'
          },
          {
            opacity: 0,
            transform: 'scale(1.08)'
          }
        ],
        {
          duration: 380,
          easing: 'ease-out',
          fill: 'forwards'
        }
      )

      revealAnimation.onfinish = () => {
        container.remove()
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
