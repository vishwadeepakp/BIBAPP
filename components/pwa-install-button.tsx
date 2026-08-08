'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showFallbackHint, setShowFallbackHint] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
    const mobileDevice = /android|iphone|ipad|ipod/i.test(window.navigator.userAgent)

    setIsMobile(mobileDevice)

    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true)
      return
    }

    if (mobileDevice) {
      setIsVisible(true)
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsVisible(false)
      setDeferredPrompt(null)
      setShowFallbackHint(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice

        if (choice.outcome === 'accepted') {
          setIsVisible(false)
          setIsInstalled(true)
        }
      } catch (error) {
        console.error('PWA install prompt failed:', error)
      } finally {
        setDeferredPrompt(null)
      }
      return
    }

    if (isMobile) {
      setShowFallbackHint(true)
      return
    }
  }

  if (isInstalled || (!isVisible && !showFallbackHint)) return null

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex max-w-[90vw] flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleInstallClick}
        className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
      >
        <Download className="h-4 w-4" />
        {isMobile ? 'Install / Add to Home Screen' : 'Install App'}
      </button>

      {showFallbackHint && (
        <div className="max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {isMobile ? 'On Android, use the browser menu and choose “Add to Home screen”. On iPhone, tap Share and then “Add to Home Screen”.' : 'Install from your browser menu if the prompt does not appear.'}
        </div>
      )}
    </div>
  )
}
