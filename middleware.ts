import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@/lib/supabase/server"

const protectedRoutes = {
  "/profile": [],
  "/directory": [],
  "/tools": [],
  "/admin": ["isAdmin"],
  "/rewards": [],
  "/ekart": [],
  "/discussions": [],
  "/events": [],
  "/reviews": [],
  "/training": [],
  "/careers": [],
}

const SKIP_MIDDLEWARE_PATHS = [
  '/api/',
  '/_next/',
  '/static/',
  '/public/',
  '/favicon.ico',
  '/mockify-logo.png',
  '/mockify-logo-black.png',
  '/auth/',
];

function generateRequestId() {
  return Math.random().toString(36).substring(2, 8);
}

export async function middleware(req: NextRequest) {
  const startTime = Date.now();
  const requestId = generateRequestId();

  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  if (SKIP_MIDDLEWARE_PATHS.some(path => req.nextUrl.pathname.startsWith(path))) {
    return response;
  }

  const supabase = createMiddlewareClient(req, response)

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    const isSessionValid = session?.user && session?.expires_at && Date.now() < session.expires_at * 1000

    const isProtectedRoute = Object.keys(protectedRoutes).some(route =>
      req.nextUrl.pathname.startsWith(route)
    )
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    const isLoginPage = req.nextUrl.pathname === "/login"
    const isForgotPasswordPage = req.nextUrl.pathname === "/forgot-password"
    const isResetPasswordPage = req.nextUrl.pathname === "/reset-password"
    const isRootPath = req.nextUrl.pathname === "/"

    if (isRootPath) {
      if (isSessionValid) {
        return NextResponse.redirect(new URL("/profile", req.url))
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (isLoginPage) {
      if (isSessionValid) {
        const redirectParam = req.nextUrl.searchParams.get("redirect")
        if (redirectParam) {
          return NextResponse.redirect(new URL(redirectParam, req.url))
        }
        return NextResponse.redirect(new URL("/profile", req.url))
      }
      return response
    }

    if (isForgotPasswordPage || isResetPasswordPage) {
      return response
    }

    if ((isProtectedRoute || isAdminRoute) && !isSessionValid) {
      return redirectToLogin(req)
    }

    return response
  } catch (error) {
    console.error(`❌ [${requestId}] Middleware error after ${Date.now() - startTime}ms:`, error)
    return response
  }
}

function redirectToLogin(req: NextRequest) {
  const redirectUrl = new URL("/login", req.url)
  redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: [
    "/",
    "/profile/:path*",
    "/directory/:path*",
    "/tools/:path*",
    "/admin/:path*",
    "/rewards/:path*",
    "/ekart/:path*",
    "/discussions/:path*",
    "/events/:path*",
    "/reviews/:path*",
    "/training/:path*",
    "/careers/:path*",
    "/login",
    "/forgot-password",
    "/reset-password",
    // "/:id((?!api|_next/static|_next/image|favicon.ico|logo.png|logo-black.png).*)",
  ],
}