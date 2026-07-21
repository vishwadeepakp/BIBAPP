'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import toast from "react-hot-toast";

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface UseSpeechToTextProps {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: (text: string) => void
}

export function useSpeechToText({
  lang = 'en-IN',
  continuous = false,
  interimResults = false,
  onResult,
}: UseSpeechToTextProps = {}) {
  const recognitionRef = useRef<any>(null)

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [supported, setSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isListening) {
      toast.loading("🎤 Akash is listening...", {
        id: "speech-to-text",
        position: "bottom-right"
      });
    } else {
      toast.dismiss("speech-to-text");
    }
  }, [isListening]);

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition()

    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = interimResults

    recognition.onstart = () => {
      setError(null)
      setIsListening(true)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      setError(event.error)
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      let text = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript
      }

      setTranscript(text)
      onResult?.(text)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [lang, continuous, interimResults, onResult])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return

    recognitionRef.current.start()

  }, [isListening])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const resetTranscript = () => {
    setTranscript('')
  }

  return {
    transcript,
    isListening,
    supported,
    error,

    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  }
}