// src/hooks/useIOSInstall.js
// Detecta si el usuario está en iOS y si la PWA está instalada.
// Maneja la lógica de "no mostrar más" y el timing del prompt.

import { useState, useEffect } from 'react'

const STORAGE_KEY  = 'manguito_ios_install_dismissed'
const DELAY_MS     = 3000  // 3 segundos después de cargar

function detectarIOS() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua)
}

function detectarIPadModerno() {
  // iPads con iPadOS 13+ reportan como Mac
  return (
    typeof navigator !== 'undefined' &&
    navigator.maxTouchPoints > 1 &&
    /macintosh/i.test(navigator.userAgent)
  )
}

function detectarStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  )
}

function getBrowserIOS() {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  if (/CriOS/i.test(ua)) return 'chrome'
  if (/FxiOS/i.test(ua)) return 'firefox'
  if (/EdgiOS/i.test(ua)) return 'edge'
  if (/Safari/i.test(ua)) return 'safari'
  return 'other'
}

export function useIOSInstall() {
  const [visible,    setVisible]    = useState(false)
  const [esIOS,      setEsIOS]      = useState(false)
  const [instalada,  setInstalada]  = useState(false)
  const [browser,    setBrowser]    = useState(null)

  useEffect(() => {
    const ios    = detectarIOS() || detectarIPadModerno()
    const alone  = detectarStandalone()
    const br     = getBrowserIOS()

    setEsIOS(ios)
    setInstalada(alone)
    setBrowser(br)

    // No mostrar si: no es iOS, ya está instalada, o el usuario la descartó
    if (!ios || alone) return
    const descartado = localStorage.getItem(STORAGE_KEY)
    if (descartado) return

    // Solo mostramos en Safari (las demás no permiten "Add to Home Screen")
    // Chrome/Firefox en iOS usan su propio mecanismo y no soportan PWA install
    if (br !== 'safari') return

    const timer = setTimeout(() => setVisible(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  const descartar = (noMostrarMas = false) => {
    setVisible(false)
    if (noMostrarMas) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString())
    }
  }

  const resetear = () => {
    localStorage.removeItem(STORAGE_KEY)
    setVisible(true)
  }

  return { visible, esIOS, instalada, browser, descartar, resetear }
}