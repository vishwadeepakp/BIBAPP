import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_COOKIE_NAMES = ['accessToken', 'refreshToken', 'token', 'authToken']

function hasAuthCookie(request: NextRequest) {
  return AUTH_COOKIE_NAMES.some((name) => request.cookies.has(name))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
//   const isAuthenticated = hasAuthCookie(request)

  console.log('--- MIDDLEWARE RUNNING ---')
  console.log('Path:', pathname)
  console.log('All Cookies Received:', request.cookies.getAll())

  const isAuthenticated = hasAuthCookie(request)
  console.log('Is Authenticated?:', isAuthenticated)

  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
}
