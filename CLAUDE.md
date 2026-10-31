# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Qwik + Qwik City (file-based routing, SSR) on Vite 7, styled with Tailwind CSS v4 and Qwik UI (styled components + headless primitives). The package manager is **bun** (`bun.lock`); use `bun` / `bunx` rather than npm.

The web frontend is wrapped as a **Tauri 2** desktop app (`src-tauri/`). The project is otherwise still close to the Qwik "empty starter": no Qwik deploy adapter yet (`bun qwik add`), no test runner, and `nx` is installed but unconfigured.

## Commands

```shell
bun start            # dev server (SSR mode) and open browser
bun run dev          # dev server without opening browser
bun run build        # production build: client + server + tsc type-check (qwik build)
bun run build.types  # type-check only
bun run lint         # eslint over src/**/*.ts*
bun run fmt          # prettier --write (with tailwind class sorting)
bun run fmt.check
bun run preview      # production build + local preview server
bun qwik add         # add a Qwik integration / deployment adapter
bunx qwik-ui add <component>   # generate a Qwik UI styled component into src/components/ui
bunx tauri dev       # desktop app: runs `bun dev`, opens a window on http://localhost:5173
bunx tauri build     # desktop bundle: runs the beforeBuildCommand, packages ../dist
```

Note that `bun build` (without `run`) invokes bun's own bundler, not the `build` script.

There are no tests configured.

## Architecture

- **Entry points**: Vite starts from `src/entry.ssr.tsx` (not `index.html`) because of the `qwikCity` plugin. `src/entry.dev.tsx` is client-only dev, `src/entry.preview.tsx` backs `bun preview`. `src/root.tsx` renders `<QwikCityProvider>` with the document `<head>`/`<body>` and must keep those elements.
- **Routing**: `src/routes/` is directory-based. `index.tsx` = page, `layout.tsx` = nested layout, `index.ts` = endpoint. Pages export `head: DocumentHead` for title/meta, which `src/components/router-head/router-head.tsx` renders.
- **Imports**: `~/*` aliases `src/*` (tsconfig `paths` + `vite-tsconfig-paths`).
- **Dependencies**: everything lives in `devDependencies`. `vite.config.ts` throws if any `qwik` package is in `dependencies` or if a package is listed in both, so keep it that way unless a dep is truly a runtime server dependency.

## Tauri (`src-tauri/`)

- Rust crate `app` (lib `app_lib`): `src/main.rs` just calls `app_lib::run()` in `src/lib.rs`, where the `tauri::Builder` is set up. Rust commands (`#[tauri::command]`) and plugins get registered there; `tauri-plugin-log` is enabled only in debug builds.
- `tauri.conf.json`: dev loads the Vite server (`devUrl` 5173, `beforeDevCommand: bun dev`); production loads static files from `frontendDist: ../dist`.
- `capabilities/default.json` grants the `main` window only `core:default`. Any new plugin or command the frontend calls needs a permission added there.
- The webview needs static HTML in `dist/`. A plain `qwik build` without an adapter emits SSR server code and client chunks but no prerendered pages, so the production desktop build depends on adding the Qwik SSG adapter (`bun qwik add static`). Inside Tauri there is no Node server, so `routeLoader$` / `server$` only work at prerender time; runtime backend logic belongs in Rust commands called via `@tauri-apps/api` `invoke`.

## Styling / Qwik UI

- `qwik-ui.config.json` sets `componentsRoot: src/components/ui`; generated Qwik UI components go there and are meant to be edited in place (shadcn-style, built on `class-variance-authority` and `@qwik-ui/utils`).
- `src/global.css` holds the theme. Design tokens are CSS variables in `:root` and `.dark` (`--primary`, `--border`, `--border-radius`, `--shadow-*`, etc.) and are mapped to Tailwind utilities via `@theme` (`bg-primary`, `rounded-md`, `shadow-sm`, ...). The current theme is a neo-brutalist look: black borders, 2px border width, 0 radius, hard offset shadows, plus a custom `press` utility. Change the look by editing the variables, not by hard-coding colors in components.
- Dark mode is class-based: `@custom-variant dark (&:is(.dark *))`, so `dark:` utilities apply under a `.dark` ancestor.
- Icons come from `@qwikest/icons`.

## Qwik conventions to respect

- Components are `component$(...)`. Anything crossing a `$` boundary (event handlers `onClick$`, `useTask$`, `routeLoader$`, `server$`) must be serializable; don't close over non-serializable values like class instances or functions without `$`.
- For web/SSR contexts, prefer Qwik City `routeLoader$` / `routeAction$` / `server$` over client-side fetching in effects (see the Tauri caveat above). The `eslint-plugin-qwik` recommended rules enforce much of this, so run `bun run lint` after changes.
