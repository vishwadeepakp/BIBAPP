'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[App] Service Worker registered successfully:', registration.scope)
        })
        .catch((error) => {
          console.log('[App] Service Worker registration failed:', error)
        })
    }
  }, [])

  return null
}
