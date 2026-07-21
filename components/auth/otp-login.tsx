'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/contexts/theme-context'
import { useLanguage, Language } from '@/components/contexts/language-context'
import { useAuth } from '@/components/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import { useSendOtp, useVerifyOtp } from '@/hook/useAuth'
import toast from "react-hot-toast";

export function OTPLogin() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { login } = useAuth()

  const [step, setStep] = useState<1 | 2>(1)
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [languageStatus, setLanguageStatus] = useState(false)

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();


  const validateMobileNumber = (num: string) => {
    return num.length === 10 && /^\d+$/.test(num)
  }

  const validateOtp = (num: string) => {
    return num.length === 6 && /^\d+$/.test(num)
  }

  const handleSendOtp = async () => {
    setError('')
    if (!validateMobileNumber(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    await sendOtp.mutate({ phone: mobileNumber }, {
      onError: (error: any) => {
        toast.error(error.message || "Something went wrong");

        setStep(2)
        setResendTimer(60)

        // Timer countdown
        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    });
    if (sendOtp.isSuccess) {
      setStep(2)
      setResendTimer(60)

      // Timer countdown
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    if (!validateOtp(otp)) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    setLoading(false)

    // Mock verification - accept any valid OTP
    login(mobileNumber)
    router.push('/dashboard')
  }

  const handleResendOtp = () => {
    setOtp('')
    setStep(1)
  }

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      {/* Floating Controls - Top Right */}
      <div className="fixed top-6 right-6 flex gap-3 z-50">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white dark:bg-slate-700 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-slate-600"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-slate-700" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-400" />
          )}
        </button>

        {/* Language Selector */}
        <div className="relative group">
          <button onClick={() => setLanguageStatus((pre: boolean) => !pre)} className="p-2.5 rounded-full bg-white dark:bg-slate-700 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-slate-600 text-sm font-medium">
            {language.toUpperCase()}
          </button>
          <div className="group-hover:flex absolute right-0 mt-2 flex-col bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600 overflow-hidden">
            {languageStatus && languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors ${language === lang.code
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium'
                  : 'text-slate-700 dark:text-slate-200'
                  }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {t('login.title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">{t('login.subtitle')}</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Step 1: Mobile Number */}
            <div
              className={`overflow-hidden transition-all duration-300 ${step === 1 ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('login.step1.label')}
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => {
                    setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                    setError('')
                  }}
                  placeholder={t('login.step1.placeholder')}
                  maxLength={10}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  onClick={handleSendOtp}
                  disabled={loading || mobileNumber.length < 10}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {sendOtp?.isPending ? 'Sending...' : t('login.step1.button')}

                </button>
              </div>
            </div>

            {/* Step 2: OTP Verification */}
            <div
              className={`overflow-hidden transition-all duration-300 ${step === 2 ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('login.step2.label')}
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sent to {mobileNumber}
                  </p>
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                    setError('')
                  }}
                  placeholder={t('login.step2.placeholder')}
                  maxLength={6}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-center text-lg tracking-widest"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? 'Verifying...' : t('login.step2.button')}
                </button>

                {/* Resend OTP */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleResendOtp}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Change Number
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'OTP expired, resend'}
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {step === 1 ? (
                <>
                  By continuing, you agree to our{' '}
                  <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    Terms of Service
                  </button>
                </>
              ) : (
                'Please enter the OTP sent to your mobile'
              )}
            </p>
          </div>
        </div>

        {/* PWA Install Info */}
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Install this app on your device for better experience</p>
        </div>
      </div>
    </div>
  )
}
