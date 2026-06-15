import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                             request.nextUrl.pathname.startsWith('/settings') ||
                             request.nextUrl.pathname === '/'

    if (isProtectedRoute) {
        const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('auth-token'))
        const hasActiveSession = request.headers.get('x-session-active') === 'true' || request.cookies.get('x-session-active')?.value === 'true'

        if (hasAuthCookie && !hasActiveSession) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            const response = NextResponse.redirect(url)
            request.cookies.getAll().forEach(c => {
                if (c.name.includes('auth-token')) {
                    response.cookies.delete(c.name)
                }
            })
            return response
        }

        return await updateSession(request)
    }
    return
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
