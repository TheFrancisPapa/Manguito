import { useSecureStorage } from '../lib/secureStorage'
import { useState, useEffect } from 'react';

export const useTheme = () => {
  // Inicializamos el tema desde localStorage o por defecto 'light'
  const [theme, setThemeStorage] = useSecureStorage('ui_theme', 'light')
 
  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])
 
  const toggleTheme = () => {
    setThemeStorage(prev => (prev === 'light' ? 'dark' : 'light'))
  }
 
  return { theme, toggleTheme }
}
