import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  const url = new URL(request.url)
  const path = url.pathname

  // 1. Exclude static assets and auth routes
  if (
    path.startsWith('/_next') || 
    path.startsWith('/static') || 
    path.startsWith('/api') ||
    path.includes('favicon.ico') ||
    ['/login', '/register', '/auth/callback'].includes(path)
  ) {
    return response
  }

  // 2. If no user, redirect to login
  if (!user) {
    if (path === '/') return response
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Check onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_onboarding_complete')
    .eq('id', user.id)
    .single()

  const isOnboardingComplete = profile?.is_onboarding_complete

  // 4. Onboarding Redirection Logic
  if (!isOnboardingComplete && path !== '/onboarding') {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  if (isOnboardingComplete && path === '/onboarding') {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
