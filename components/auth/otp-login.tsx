'use client'

import { useState } from 'react'
import { useTheme } from '@/components/contexts/theme-context'
import { useLanguage, Language } from '@/components/contexts/language-context'
import { useAuth } from '@/components/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Moon, Sun, ArrowRight, Smartphone, Sparkles, KeyRound, Lock } from 'lucide-react'
import { useSendOtp, useVerifyOtp } from '@/hooks/useAuth'
import toast from "react-hot-toast"

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

  const sendOtp = useSendOtp()
  const verifyOtp = useVerifyOtp()

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
      onSuccess: (data) => {
        setStep(2)
        setResendTimer(60)

        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
        toast.success("OTP sent successfully")
      },
      onError: (error: any) => {
        toast.error(error.message || "Something went wrong")
      }
    })
  }

  const handleVerifyOtp = async () => {
    setError('')
    if (!validateOtp(otp)) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    await verifyOtp.mutate({ phone: mobileNumber, otp }, {
      onSuccess: (data) => {
        login(mobileNumber, data.token)
        setTimeout(() => {
          router.replace('/dashboard')
        }, 100)
        toast.success("OTP verified successfully")
      },
      onError: (error: any) => {
        toast.error(error.message || error.error || "Something went wrong")
      }
    })
    setLoading(false)
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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Background Glowing Effects (Light & Dark Adaptive) */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Floating Controls */}
      <div className="fixed top-6 right-6 flex items-center gap-3 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-lg active:scale-95"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setLanguageStatus((pre: boolean) => !pre)}
            className="px-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
            {language.toUpperCase()}
          </button>
          
          {languageStatus && (
            <div className="absolute right-0 mt-3 w-36 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code)
                    setLanguageStatus(false)
                  }}
                  className={`w-full px-4 py-2 text-xs text-left transition-colors flex items-center justify-between ${
                    language === lang.code
                      ? 'bg-indigo-50 dark:bg-cyan-500/20 text-indigo-600 dark:text-cyan-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {lang.label}
                  {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Glassmorphism Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="relative rounded-3xl bg-white/70 dark:bg-slate-900/40 p-1 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl dark:shadow-[0_0_80px_-15px_rgba(0,0,0,0.9)] transition-all">
          
          {/* Top Subtle Glowing Accent Line */}
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-indigo-500 dark:via-cyan-500 to-transparent mx-auto rounded-full opacity-80" />

          <div className="p-8 sm:p-10 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-cyan-400 mb-4 shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('login.title')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t('login.subtitle')}
              </p>
            </div>

            {/* Form Area */}
            <div className="space-y-6">
              {/* Step 1: Mobile */}
              <div
                className={`transition-all duration-300 ${
                  step === 1 ? 'block opacity-100' : 'hidden opacity-0'
                }`}
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {t('login.step1.label')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Smartphone className="w-4 h-4" />
                      </div>
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
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-indigo-500/50 dark:focus:ring-cyan-500/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm tracking-wider font-mono transition-all"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSendOtp}
                    disabled={loading || mobileNumber.length < 10}
                    className="w-full py-3.5 px-4 bg-indigo-600 dark:bg-white hover:bg-indigo-700 dark:hover:bg-slate-200 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white dark:text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 group"
                  >
                    <span>{sendOtp?.isPending ? 'Sending...' : t('login.step1.button')}</span>
                    {!sendOtp?.isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>
              </div>

              {/* Step 2: OTP */}
              <div
                className={`transition-all duration-300 ${
                  step === 2 ? 'block opacity-100' : 'hidden opacity-0'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {t('login.step2.label')}
                    </label>
                    <span className="text-xs text-indigo-600 dark:text-cyan-400 font-mono bg-indigo-50 dark:bg-cyan-950/60 border border-indigo-100 dark:border-cyan-800/50 px-2.5 py-0.5 rounded-md">
                      +91 {mobileNumber}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <KeyRound className="w-4 h-4" />
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
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-indigo-500/50 dark:focus:ring-cyan-500/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-center text-lg font-mono tracking-[0.4em] transition-all"
                    />
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length < 6}
                    className="w-full py-3.5 px-4 bg-emerald-600 dark:bg-cyan-500 hover:bg-emerald-700 dark:hover:bg-cyan-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white dark:text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {verifyOtp?.isPending ? 'Verifying...' : t('login.step2.button')}
                  </button>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={handleResendOtp}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors underline underline-offset-4"
                    >
                      Change Number
                    </button>
                    <p className="text-slate-500 dark:text-slate-500">
                      {resendTimer > 0 ? (
                        <span>Resend in <strong className="text-indigo-600 dark:text-cyan-400 font-mono">{resendTimer}s</strong></span>
                      ) : (
                        <span className="text-indigo-600 dark:text-cyan-400 cursor-pointer hover:underline font-semibold" onClick={handleSendOtp}>Resend OTP</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <p className="text-xs text-rose-600 dark:text-rose-400 text-center font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-2">
              <p className="text-[11px] text-slate-500 dark:text-slate-500">
                {step === 1 ? (
                  <>
                    By continuing, you agree to our{' '}
                    <button className="text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Terms of Service
                    </button>
                  </>
                ) : (
                  'Verification code expires in 10 minutes'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* PWA Label */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
            ⚡ Installed app experience enabled for your device
          </p>
        </div>
      </div>
    </div>
  )
}