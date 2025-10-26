import { StackServerApp } from "@stackframe/stack";

// Use the environment variable directly with a fallback for build time
const secretServerKey = process.env.STACK_SECRET_SERVER_KEY;

export const stackServerApp = new StackServerApp({
  secretServerKey,
  tokenStore: "nextjs-cookie",
  urls: {
    home: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    afterSignIn: "/profile",
    afterSignUp: "/profile",
    afterSignOut: "/",
  },
});
