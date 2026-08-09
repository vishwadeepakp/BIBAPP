'use client'

import { useEffect, useState, type ComponentType } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/components/contexts/auth-context'

export function withAuthGuard<P extends object>(WrappedComponent: ComponentType<P>) {
  return function AuthGuardedComponent(props: P) {
    const router = useRouter()
    const { logout } = useAuth()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
      let isMounted = true

      const verifyAccess = async () => {
        const hasAuthCookie = typeof document !== 'undefined'
          ? document.cookie
              .split(';')
              .some((cookie) => /(?:refreshToken|access|auth|token)=/i.test(cookie))
          : false

        if (!hasAuthCookie) {
          logout()
          if (isMounted) {
            router.replace('/')
          }
          return
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATWAY}/users/refresh-token`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            throw new Error('Refresh failed')
          }

          if (isMounted) {
            setIsChecking(false)
          }
        } catch (error) {
          logout()
          if (isMounted) {
            router.replace('/')
          }
        }
      }

      verifyAccess()

      return () => {
        isMounted = false
      }
    }, [logout, router])

    if (isChecking) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}
