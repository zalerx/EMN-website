# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Website for the Emerging Markets Network (EMN) club. Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v3. Uses `@react-three/fiber` + `drei` + `three` for a 3D globe component.

## Commands

- `npm run dev` — start dev server (uses Next's `--turbopack`)
- `npm run build` — production build
- `npm run start` — run built app
- `npm run lint` — ESLint (`eslint-config-next`)

There is no test setup in this repo.

## Architecture

Everything lives under `app/` using the Next.js App Router. Route segments are colocated folders with their own `page.tsx` (e.g. `app/about`, `app/events`, `app/resources`, `app/sponsors`, `app/_tradle`). `app/layout.tsx` wraps every route and pulls global styles from `app/ui/globals.css` and fonts from `app/ui/fonts.ts`.

Shared pieces (not route segments) live inside `app/` as well:
- `app/components/` — shared UI + presentational components (`header`, `footer`, `globe`, `event-card`, `cta`, etc.). Note these are plain React components, not shadcn-style primitives.
- `app/lib/utils.ts` — shared helpers (e.g. `cn` classname merge).
- `app/ui/` — global CSS and font definitions only.

The `_tradle` segment is underscore-prefixed, so Next treats it as a private folder and it is not routable.

Path alias `@/*` maps to the repo root (see `tsconfig.json`), so imports look like `@/app/components/header`.

The 3D `globe` component is client-only and relies on `three` / `@react-three/fiber`; keep it inside a `"use client"` boundary and avoid importing it from server components directly.

## Notes

- `README.md` currently contains unresolved Git merge conflict markers (`<<<<<<<` / `>>>>>>>`) from the initial commit. Leave it alone unless asked to fix.
