// Auth.js (NextAuth v5) route handlers — serves all /api/auth/* endpoints (sign-in, sign-out,
// session, csrf, callbacks). The configuration lives in @/auth, which exposes them via `handlers`.
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
