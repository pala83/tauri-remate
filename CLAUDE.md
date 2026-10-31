# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Qwik + Qwik City (file-based routing, SSR) on Vite 7, styled with Tailwind CSS v4 and Qwik UI (styled components + headless primitives). The package manager is **bun** (`bun.lock`); use `bun` / `bunx` rather than npm.

The web frontend is wrapped as a **Tauri 2** desktop app (`src-tauri/`), built with the Qwik **static (SSG) adapter** so `dist/` contains plain HTML for the webview. Persistence is **SQLite + Drizzle ORM** (see "Database"). No test runner; `nx` is installed but unconfigured.

## Commands

```shell
bun start            # dev server (SSR mode) and open browser
bun run dev          # dev server without opening browser
bun run build        # production build: client + SSG prerender into dist/ + tsc + lint
bun run build.types  # type-check only
bun run lint         # eslint over src/**/*.ts*
bun run fmt          # prettier --write (with tailwind class sorting)
bun run fmt.check
bun run preview      # production build + local preview server
bun qwik add         # add a Qwik integration / deployment adapter
bunx qwik-ui add <component>   # generate a Qwik UI styled component into src/components/ui
bun run db.generate  # drizzle-kit: create a migration in drizzle/ from src/db/schema.ts
DB_PATH=~/.config/com.palazzo.remates/remate.db bun run db.studio   # inspect the real DB (Linux path)
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
- `capabilities/default.json` grants the `main` window `core:default` plus the SQL permissions. Any new plugin or command the frontend calls needs a permission added there.
- `bun run build` runs `build.server` = `vite build -c adapters/static/vite.config.ts`, which prerenders every route into `dist/`. Inside Tauri there is no Node server, so `routeLoader$` / `server$` only run at prerender time; runtime work happens client-side (DB via the SQL plugin) or in Rust commands.
- The `identifier` (`com.palazzo.remates`) determines the app config dir where the DB lives; changing it orphans existing data.

## Database

- `tauri-plugin-sql` (feature `sqlite`, registered in `src-tauri/src/lib.rs`, permissions `sql:default` + `sql:allow-execute`) opens `sqlite:remate.db` in the app config dir (`~/.config/com.palazzo.remates/` on Linux).
- `src/db/client.ts` → `getDb()`: a lazy singleton that loads the plugin, runs migrations, and wraps it with Drizzle's `sqlite-proxy` driver (the callback converts the plugin's object rows to arrays). Use it only client-side (`useVisibleTask$`, event handlers, `$` functions); never store the `db` instance in Qwik state, only query results.
- `src/db/schema.ts` is the Drizzle schema. Workflow: edit schema → `bun run db.generate` → commit `drizzle/` → the new migration is applied on next app start by `src/db/migrate.ts` (bundles `drizzle/*.sql` via `import.meta.glob`, tracks applied tags in `__migrations`). Don't use Drizzle's `migrate()`; it needs `fs`.
- Limitations of the proxy approach:
  - The plugin uses a connection pool, so `db.transaction()` / `BEGIN…COMMIT` across calls isn't reliable. Put atomic multi-statement operations in a Rust command.
  - Rows come back as objects keyed by column name, so same-named columns in a join (two `id`s) collapse. Alias them in `select({...})`.
  - Opening the dev server in a normal browser has no Tauri runtime and DB calls fail; test with `bunx tauri dev`.

## Styling / Qwik UI

- `qwik-ui.config.json` sets `componentsRoot: src/components/ui`; generated Qwik UI components go there and are meant to be edited in place (shadcn-style, built on `class-variance-authority` and `@qwik-ui/utils`).
- `src/global.css` holds the theme. Design tokens are CSS variables in `:root` and `.dark` (`--primary`, `--border`, `--border-radius`, `--shadow-*`, etc.) and are mapped to Tailwind utilities via `@theme` (`bg-primary`, `rounded-md`, `shadow-sm`, ...). The current theme is a neo-brutalist look: black borders, 2px border width, 0 radius, hard offset shadows, plus a custom `press` utility. Change the look by editing the variables, not by hard-coding colors in components.
- `src/components/ui/sidebar/` is a hand-written component (not generated) that follows the Qwik UI conventions and mirrors shadcn's sidebar API as `Sidebar.Provider/Root/Header/Content/Group/Menu/MenuButton/...`; state via `useSidebar()`, Ctrl/Cmd+B toggles, state persists in `localStorage`. All its sizes and colors are `--sidebar-*` tokens in `global.css` (including `--sidebar-mobile-breakpoint`, read at runtime for the drawer), so keep it free of literal sizes/colors. The app shell lives in `src/routes/layout.tsx`.
- Dark mode is class-based: `@custom-variant dark (&:is(.dark *))`, so `dark:` utilities apply under a `.dark` ancestor.
- Icons come from `@qwikest/icons`.

## Qwik conventions to respect

- Components are `component$(...)`. Anything crossing a `$` boundary (event handlers `onClick$`, `useTask$`, `routeLoader$`, `server$`) must be serializable; don't close over non-serializable values like class instances or functions without `$`.
- Because the app is static inside Tauri, data loading is client-side (`useVisibleTask$` + `getDb()`), not `routeLoader$` / `server$`. The `eslint-plugin-qwik` recommended rules enforce much of this, so run `bun run lint` after changes.
