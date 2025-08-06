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
    "/((?!api/|_next/|static/|.\..|favicon.ico|register|$).*)"
  ],
};
