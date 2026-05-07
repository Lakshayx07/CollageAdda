import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

/**
 * Middleware to enforce onboarding completion.
 * 
 * Note: Requires '@supabase/auth-helpers-nextjs' package.
 * Run: npm install @supabase/auth-helpers-nextjs
 */
export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  const url = new URL(req.url)
  const path = url.pathname

  // 1. Exclude static assets and auth routes
  if (
    path.startsWith('/_next') || 
    path.startsWith('/static') || 
    path.startsWith('/api') ||
    path.includes('favicon.ico') ||
    ['/login', '/register', '/auth/callback'].includes(path)
  ) {
    return res
  }

  // 2. If no session, user must go to login (unless they are already on a public page)
  if (!session) {
    // Optional: Allow landing page '/' to be public
    if (path === '/') return res
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 3. Check onboarding status from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_onboarding_complete')
    .eq('id', session.user.id)
    .single()

  const isOnboardingComplete = profile?.is_onboarding_complete

  // 4. Handle Redirection Logic
  if (!isOnboardingComplete && path !== '/onboarding') {
    // Force redirect to onboarding if not complete
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  if (isOnboardingComplete && path === '/onboarding') {
    // If onboarding is already done, don't allow access to /onboarding
    return NextResponse.redirect(new URL('/profile', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
