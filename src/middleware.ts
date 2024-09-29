// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow access to the register page
    if (req.nextUrl.pathname === "/register") {
      return NextResponse.next();
    }
  },
  {
    pages: {
      signIn: "/signin",
    },
  }
);

// Exclude API routes and Next.js special routes from middleware
export const config = {
  matcher: [
    // Match all paths except for:
    // - /api routes
    // - /_next (Next.js internals)
    // - /static (static files)
    // - /.*\\..* (files with extensions like .css, .js, .png)
    // - /favicon.ico
    // - /register (registration page)
    "/((?!api/|_next/|static/|.*\\..*|favicon.ico|register).*)",
  ],
};
