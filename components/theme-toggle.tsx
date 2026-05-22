'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
      event.preventDefault()
      setTheme(isDark ? 'light' : 'dark')
    },
    [isDark, setTheme]
  )

  if (!mounted) {
    return (
      <DropdownMenuItem className="cursor-pointer dark:focus:bg-slate-800">
        <Moon className="mr-2 h-4 w-4" />
        Modo oscuro
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenuItem onClick={handleClick} className="cursor-pointer dark:focus:bg-slate-800">
      {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
      Modo {isDark ? 'claro' : 'oscuro'}
    </DropdownMenuItem>
  )
}
