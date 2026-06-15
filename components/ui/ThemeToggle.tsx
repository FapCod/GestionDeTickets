'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo azul marino'}
      className="flex items-center gap-2 px-3 hover:bg-muted/50 rounded-md h-9"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="text-sm font-medium hidden sm:inline">Modo Claro</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="text-sm font-medium hidden sm:inline">Modo Marino</span>
        </>
      )}
    </Button>
  )
}
