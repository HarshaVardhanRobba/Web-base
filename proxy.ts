import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/welcome',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export const proxy = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return

  await auth.protect({
    unauthenticatedUrl: new URL('/welcome', req.url).toString(),
  })
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
}
