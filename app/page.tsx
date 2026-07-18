import { Suspense } from 'react'
import { OTPPageContent } from '@/components/auth/otp-page-content'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OTPPageContent />
    </Suspense>
  )
}
