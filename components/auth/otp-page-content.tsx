'use client'

import { OTPLogin } from '@/components/auth/otp-login'
import { useEffect } from 'react'

export function OTPPageContent() {
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      window.location.href = '/dashboard'
    }
  }, [])

  return <OTPLogin />
}
