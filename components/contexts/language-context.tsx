'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Language = 'en' | 'hi' | 'mr'

interface Translations {
  [key: string]: string
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: { [key in Language]: Translations } = {
  en: {
    'login.title': 'MSME Inventory Manager',
    'login.subtitle': 'Manage your business inventory efficiently',
    'login.step1.label': 'Enter Mobile Number',
    'login.step1.placeholder': '10-digit mobile number',
    'login.step1.button': 'Send OTP',
    'login.step2.label': 'Enter OTP',
    'login.step2.placeholder': '6-digit OTP',
    'login.step2.button': 'Verify & Login',
    'login.resend': 'Resend OTP in {time}s',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'language': 'Language',
    'dashboard.analytics': 'Analytics',
    'dashboard.inventory': 'Inventory',
    'dashboard.sales': 'Sales',
    'dashboard.logout': 'Logout',
    'analytics.totalSales': 'Total Sales',
    'analytics.stock': 'Remaining Stock',
    'analytics.lowStock': 'Low Stock Items',
    'inventory.name': 'Product Name',
    'inventory.sku': 'SKU',
    'inventory.quantity': 'Quantity',
    'inventory.status': 'Status',
    'inventory.inStock': 'In Stock',
    'inventory.lowStock': 'Low Stock',
    'inventory.outOfStock': 'Out of Stock',
    'inventory.search': 'Search products or SKU...',
    'sales.orderId': 'Order ID',
    'sales.date': 'Date',
    'sales.amount': 'Bill Amount',
    'sales.status': 'Payment Status',
    'sales.paid': 'Paid',
    'sales.pending': 'Pending',
  },
  hi: {
    'login.title': 'MSME इन्वेंटरी प्रबंधक',
    'login.subtitle': 'अपने व्यावसायिक इन्वेंटरी को कुशलतापूर्वक प्रबंधित करें',
    'login.step1.label': 'मोबाइल नंबर दर्ज करें',
    'login.step1.placeholder': '10 अंकों का मोबाइल नंबर',
    'login.step1.button': 'OTP भेजें',
    'login.step2.label': 'OTP दर्ज करें',
    'login.step2.placeholder': '6 अंकों का OTP',
    'login.step2.button': 'सत्यापित करें और लॉगिन करें',
    'login.resend': '{time}s में OTP फिर से भेजें',
    'theme.light': 'हल्का',
    'theme.dark': 'गहरा',
    'language': 'भाषा',
    'dashboard.analytics': 'विश्लेषण',
    'dashboard.inventory': 'इन्वेंटरी',
    'dashboard.sales': 'बिक्रय',
    'dashboard.logout': 'लॉग आउट',
    'analytics.totalSales': 'कुल बिक्रय',
    'analytics.stock': 'शेष स्टॉक',
    'analytics.lowStock': 'कम स्टॉक आइटम',
    'inventory.name': 'उत्पाद का नाम',
    'inventory.sku': 'SKU',
    'inventory.quantity': 'मात्रा',
    'inventory.status': 'स्थिति',
    'inventory.inStock': 'स्टॉक में',
    'inventory.lowStock': 'कम स्टॉक',
    'inventory.outOfStock': 'स्टॉक खत्म',
    'inventory.search': 'उत्पाद या SKU खोजें...',
    'sales.orderId': 'ऑर्डर आईडी',
    'sales.date': 'तारीख',
    'sales.amount': 'बिल राशि',
    'sales.status': 'भुगतान स्थिति',
    'sales.paid': 'भुगतान किया गया',
    'sales.pending': 'लंबित',
  },
  mr: {
    'login.title': 'MSME इन्व्हेंटरी व्यवस्थापक',
    'login.subtitle': 'आपल्या व्यावसायिक इन्व्हेंटरी कुशलतेने व्यवस्थापित करा',
    'login.step1.label': 'मोबाइल नंबर प्रविष्ट करा',
    'login.step1.placeholder': '10 अंकांचा मोबाइल नंबर',
    'login.step1.button': 'OTP पाठवा',
    'login.step2.label': 'OTP प्रविष्ट करा',
    'login.step2.placeholder': '6 अंकांचा OTP',
    'login.step2.button': 'सत्यापित करा आणि लॉगिन करा',
    'login.resend': '{time}s मध्ये OTP पुन्हा पाठवा',
    'theme.light': 'हलका',
    'theme.dark': 'गडद',
    'language': 'भाषा',
    'dashboard.analytics': 'विश्लेषण',
    'dashboard.inventory': 'इन्व्हेंटरी',
    'dashboard.sales': 'विक्रय',
    'dashboard.logout': 'लॉग आउट करा',
    'analytics.totalSales': 'एकूण विक्रय',
    'analytics.stock': 'उर्वरित स्टॉक',
    'analytics.lowStock': 'कमी स्टॉक आयटम',
    'inventory.name': 'उत्पादाचे नाव',
    'inventory.sku': 'SKU',
    'inventory.quantity': 'प्रमाण',
    'inventory.status': 'स्थिती',
    'inventory.inStock': 'स्टॉकमध्ये',
    'inventory.lowStock': 'कमी स्टॉक',
    'inventory.outOfStock': 'स्टॉक संपला',
    'inventory.search': 'उत्पाद किंवा SKU शोधा...',
    'sales.orderId': 'ऑर्डर आयडी',
    'sales.date': 'तारीख',
    'sales.amount': 'बिल रक्कम',
    'sales.status': 'पेमेंट स्थिती',
    'sales.paid': 'भरलेले',
    'sales.pending': 'प्रलंबित',
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    try {
      const savedLanguage = (localStorage.getItem('language') as Language) || 'en'
      setLanguageState(savedLanguage)
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('language', lang)
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
