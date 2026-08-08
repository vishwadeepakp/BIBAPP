import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_COOKIE_NAMES = ['accessToken', 'refreshToken']

function hasAuthCookie(request: NextRequest) {
    return AUTH_COOKIE_NAMES.some((name) => {
        const cookie = request.cookies.get(name);
        return Boolean(cookie?.value);
    });
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const isAuthenticated = hasAuthCookie(request)

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
