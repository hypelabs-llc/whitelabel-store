# White Label Store

A clean, responsive storefront for reselling mobile proxies under the HypeProxy ecosystem.

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
[![API](https://img.shields.io/badge/API-connect.hypelabs.network-6366f1)](https://connect.hypelabs.network)
[![SDK](https://img.shields.io/badge/SDK-%40hypelabs--llc%2Fts--sdk-f28d1a)](https://www.npmjs.com/package/@hypelabs-llc/ts-sdk)
[![License MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

Resellers view, manage, and order 4G/5G mobile proxies with ease. The store is fully white-labeled: branding,
store name, documentation and feature tabs are pulled live from the tenant's HypeLabs Connect configuration.

## Requirements

- Node.js 20 or later
- [pnpm](https://pnpm.io) 11 or later
- A HypeLabs Connect API key (`hl_live_...`)

> The Connect API key authenticates server-side only. It is read from the environment and never shipped to
> the browser, so keep it out of any `NEXT_PUBLIC_*` variable.

## Install

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Configure the environment.** Create a `.env.local` at the project root:

   ```bash
   # Server-side HypeLabs Connect API key. Never expose this to the client.
   CONNECT_API_KEY=hl_live_...

   # Secret used by Auth.js to sign the session cookie. Generate one with: openssl rand -base64 32
   AUTH_SECRET=...
   ```

   Create your organization and generate an API key on the
   [HypeLabs Console](https://console.hypelabs.network).

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev)
- [`@hypelabs-llc/ts-sdk`](https://www.npmjs.com/package/@hypelabs-llc/ts-sdk): the typed Connect API client
- [Auth.js (NextAuth v5)](https://authjs.dev) for authentication
- [SWR](https://swr.vercel.app) for client-side data fetching
- [Tailwind CSS](https://tailwindcss.com) for styling
- [i18next](https://www.i18next.com) for localization (English, Russian, Chinese, Spanish, Portuguese, Ukrainian)
