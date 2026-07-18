'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  mobileNumber: string
  loginTime: string
}

interface AuthContextType {
  user: User | null
  login: (mobileNumber: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          console.error('Failed to parse saved user', e)
          localStorage.removeItem('user')
        }
      }
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }, [])

  const login = (mobileNumber: string) => {
    const newUser = {
      mobileNumber,
      loginTime: new Date().toISOString(),
    }
    setUser(newUser)
    try {
      localStorage.setItem('user', JSON.stringify(newUser))
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem('user')
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
