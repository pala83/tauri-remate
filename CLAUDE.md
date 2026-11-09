# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Qwik + Qwik City (file-based routing, SSR) on Vite 7, styled with Tailwind CSS v4 and Qwik UI (styled components + headless primitives). The package manager is **bun** (`bun.lock`); use `bun` / `bunx` rather than npm.

The web frontend is wrapped as a **Tauri 2** desktop app (`src-tauri/`), built with the Qwik **static (SSG) adapter** so `dist/` contains plain HTML for the webview. Persistence is **SQLite + Drizzle ORM** (see "Database"). Tests run with `bun test` (`tests/`); `nx` is installed but unconfigured.

## Commands

```shell
bun start            # dev server (SSR mode) and open browser
bun run dev          # dev server without opening browser
bun run build        # production build: client + SSG prerender into dist/ + tsc + lint
bun run build.types  # type-check only
bun run lint         # eslint over src/**/*.ts*
bun run fmt          # prettier --write (with tailwind class sorting)
bun run fmt.check
bun run test         # bun test tests: the real src/db on an in-memory SQLite (see "Database")
bun run preview      # production build + local preview server
bun qwik add         # add a Qwik integration / deployment adapter
bunx qwik-ui add <component>   # generate a Qwik UI styled component into src/components/ui
bun run db.generate  # drizzle-kit: create a migration in drizzle/ from src/db/schema.ts
DB_PATH=~/.config/com.palazzo.remates/remate.db bun run db.studio   # inspect the real DB (Linux path)
bunx tauri dev       # desktop app: runs `bun dev`, opens a window on http://localhost:5173
bunx tauri build     # desktop bundle: runs the beforeBuildCommand, packages ../dist
```

Note that `bun build` (without `run`) invokes bun's own bundler, not the `build` script.

`bunfig.toml` preloads `tests/apoyo/base.ts`. It swaps the Tauri SQL plugin for `bun:sqlite`, applies `drizzle/*.sql`, and runs the Rust commands with the SQL taken from `src-tauri/src/comandos.rs`. So the tests exercise the real `src/db` and the Drizzle proxy.

## Architecture

- **Entry points**: Vite starts from `src/entry.ssr.tsx` (not `index.html`) because of the `qwikCity` plugin. `src/entry.dev.tsx` is client-only dev, `src/entry.preview.tsx` backs `bun preview`. `src/root.tsx` renders `<QwikCityProvider>` with the document `<head>`/`<body>` and must keep those elements.
- **Routing**: `src/routes/` is directory-based. `index.tsx` = page, `layout.tsx` = nested layout, `index.ts` = endpoint. Pages export `head: DocumentHead` for title/meta, which `src/components/router-head/router-head.tsx` renders.
- **Imports**: `~/*` aliases `src/*` (tsconfig `paths` + `vite-tsconfig-paths`).
- **Dependencies**: everything lives in `devDependencies`. `vite.config.ts` throws if any `qwik` package is in `dependencies` or if a package is listed in both, so keep it that way unless a dep is truly a runtime server dependency.

## Tauri (`src-tauri/`)

- Rust crate `app` (lib `app_lib`): `src/main.rs` just calls `app_lib::run()` in `src/lib.rs`, where the `tauri::Builder` is set up. Rust commands (`#[tauri::command]`) and plugins get registered there; `tauri-plugin-log` is enabled only in debug builds.
- `tauri.conf.json`: dev loads the Vite server (`devUrl` 5173, `beforeDevCommand: bun dev`); production loads static files from `frontendDist: ../dist`.
- `capabilities/default.json` grants the `main` window `core:default`, the SQL permissions and the image picker's (`dialog`, `fs` limited to `$APPCONFIG/imagenes`). Images are copied there by `src/db/imagenes.ts`, and the DB stores the path. `opener:allow-open-url` only allows the Google Maps sites that `src/lib/lugar.ts` accepts; keep both lists the same. Its patterns are globs compared to the literal URL, which is why `lugar` is saved as `new URL(...).href`. Any new plugin or command the frontend calls needs a permission added there.
- `bun run build` runs `build.server` = `vite build -c adapters/static/vite.config.ts`, which prerenders every route into `dist/`. Inside Tauri there is no Node server, so `routeLoader$` / `server$` only run at prerender time; runtime work happens client-side (DB via the SQL plugin) or in Rust commands.
- The `identifier` (`com.palazzo.remates`) determines the app config dir where the DB lives; changing it orphans existing data.

## Database

- `tauri-plugin-sql` (feature `sqlite`, registered in `src-tauri/src/lib.rs`, permissions `sql:default` + `sql:allow-execute`) opens `sqlite:remate.db` in the app config dir (`~/.config/com.palazzo.remates/` on Linux).
- `src/db/client.ts` → `getDb()`: a lazy singleton that loads the plugin, runs migrations, and wraps it with Drizzle's `sqlite-proxy` driver (the callback converts the plugin's object rows to arrays). Use it only client-side (`useVisibleTask$`, event handlers, `$` functions); never store the `db` instance in Qwik state, only query results.
- `src/db/schema.ts` is the Drizzle schema. Workflow: edit schema → `bun run db.generate` → commit `drizzle/` → the new migration is applied on next app start by `src/db/migrate.ts` (bundles `drizzle/*.sql` via `import.meta.glob`, tracks applied tags in `__migrations`). Don't use Drizzle's `migrate()`; it needs `fs`.
- Clients are stored with `trim()`, `toLowerCase()` and repeated whitespace collapsed to one space: `src/db/clientes.ts` applies it to every write, so don't write to that table anywhere else. The app shows names and referrals with `titulo` (`src/lib/textos.ts`), including in form fields; emails stay lowercase.
- A client's name is unique (`clientes_nombre_idx`, `drizzle/0006_clientes_nombre_unico.sql`): `crearCliente` and `editarCliente` turn the UNIQUE error into «Ya existe un cliente llamado …». Renaming a client to another's name asks «¿Unificar clientes?» (`cliente-form/use-guardar-cliente.ts`, `unificar-dialogo.tsx`, which checks with `clienteLlamado` first). Confirming runs the `unificar_clientes` Rust command (`unificarClientes`): every foreign key of the renamed client moves to the one that had the name, and the renamed one is deleted. Two settlements in the same remate can't coexist, so the renamed client's installments, payments and notes join the other's settlement and its own is deleted.
- `lotes.vendido_con` holds the N° of the lot with the price when several were sold together for one price (the Excel's `XXXX`): that lot has a buyer and `vendido_con`, and `precio_venta` is null. The table's CHECKs enforce it. `drizzle-kit generate` gets rebuilds wrong when a table gains a column: its `INSERT ... SELECT` names the new column, and SQLite reads that as text. Check that line and change it to `NULL`, before Vite sees the file, as `drizzle/0004_lotes_vendido_con.sql` does.
- A settlement (`liquidaciones`, one per client and remate) stores no amounts: they're always calculated from the lots, so correcting a lot corrects them. Purchases are `precio × (1 + comision_compra)`, sales `precio × (1 − comision_venta)`, rounded to the peso per lot; the net is purchases minus sales, and the balance subtracts non-annulled `cobro`s and adds `pago`s. `lotes.comision_*` are in hundredths of a percent (`1000` = 10%). `sin_comision` on the settlement makes its commissions 0; the one on `clientes` is copied to each new settlement. `cuotas` are promises, `pagos` the money that moved, `pago_lotes` which lots a payment covers; what's paid comes from there, there's no paid flag on the lot.
- Deleting: a remate goes only with no lots and no settlements (`borrarRemate`, from «Eliminar remate» in `remate-editar/`); every key pointing at `remates` and `lotes` is `RESTRICT`, so the database refuses anything else too. A lot goes only while its sale isn't registered (`borrarLote`, the trash button in its card): the `lotes_vendidos_no_se_borran` trigger (`drizzle/0007_…`) refuses deleting one with a buyer, which is why `tests/apoyo/base.ts` clears the sales before emptying `lotes`. Both screens count or read again at that moment, then ask with `confirmar/confirmar-dialogo.tsx`, the app's one confirmation dialog (Qwik UI `Modal`).
- Rebuilding `lotes` needs more than that fix now that its rows point at each other through `vendido_con`. The plugin's connections have foreign keys on and `PRAGMA foreign_keys=OFF` only reaches one of them, so drizzle's `DROP TABLE` fails with `FOREIGN KEY constraint failed`. `drizzle/0005_liquidaciones.sql` shows what works with them on or off: the new table's self FK references `__new_lotes`, the old rows are cleared after copying them, and the PRAGMAs are gone.
- **The store is never a source of truth.** Reads come in two kinds, and each must stay in its role:
  - `ver*` (`verClientes`, `verLotes`, `verDatosRemate`, `verHistorial`, `verRematesDeCliente`) keep their answer in `src/store/consultas.ts` until a write forgets it. Use them only to show data, and only from the screens' loading hooks (the list is in `tests/fuente-de-verdad.test.ts`).
  - Anything that fills a form, is worked out to be saved, or is printed reads the database at that moment with `leer*` / `listar*`. Examples: `leerLote`, `lotesDeVenta`, `ultimoLote`, `leerCliente`, `leerRemate`, `leerLiquidacion`, and `leerVigente` (`src/components/liquidacion/vigente.ts`).
  - Numbers only shown on screen (list balances, totals, the hammer's running total) may be worked out from `ver*`.
  - A draft restored from `src/store` keeps only the fields the user changed, over values read again from the DB (`conCambios`, `src/lib/cambios.ts`).
- Every write in `src/db` calls its `olvidar*` (`src/db/olvidos.ts`) when it's over, even if it failed. A new write needs its line there and its case in `tests/store-al-dia.test.ts`, which checks that after each write every `ver*` equals the database. Write that test first.
- Limitations of the proxy approach:
  - The plugin uses a connection pool, so `db.transaction()` / `BEGIN…COMMIT` across calls isn't reliable. Put atomic multi-statement operations in a Rust command.
  - Rows come back as objects keyed by column name, so same-named columns in a join (two `nombre`s) collapse and the values shift to the wrong fields. A key in `select({...})` isn't an SQL alias; use ``sql`${col}`.as("alias")``, as `src/db/clientes.ts` does.
  - Opening the dev server in a normal browser has no Tauri runtime and DB calls fail; test with `bunx tauri dev`.

## Styling / Qwik UI

- `qwik-ui.config.json` sets `componentsRoot: src/components/ui`; generated Qwik UI components go there and are meant to be edited in place (shadcn-style, built on `class-variance-authority` and `@qwik-ui/utils`).
- `src/global.css` holds the theme: the "Libro de Remates" design, aged paper and ink, in light and dark. Design tokens are CSS variables in `:root` and `.dark` (`--primary`, `--border`, `--border-radius`, `--shadow-*`, etc.) and are mapped to Tailwind utilities via `@theme` (`bg-primary`, `rounded-sm`, `shadow-lg`, ...). Hard offset shadows (`shadow-xs` 3px, `shadow-sm` 4px, `shadow-md` 5px on hover, `shadow-lg` 8px on cards), 2px `border`, 4px `rounded-sm`, and the `press`, `textura` (paper vignette, work area) and `hoja` (paper fibers, cards) utilities. Change the look by editing the variables, not by hard-coding colors in components. Fonts are local (`@fontsource`, so the desktop app works offline) and set through Tailwind's own variables: `font-serif` IM Fell English (titles), `font-mono` Courier Prime (labels, buttons), `font-sans` EB Garamond (text, fields).
- The app recreates the "Libro de Remates" design. `src/routes/layout.tsx` holds the header and the active remate (`src/components/app-state/`, persisted in `localStorage`); each section is a route (`/`, `/lotes/`, `/clientes/`, plus `/remate/`, which edits the active remate) laid out with `src/components/page-columns/` (three columns, nav, "En esta página" index, `Field`, `FormMessage`...). Its `planilla` prop gives the main column no scroll of its own, for the Lotes sheet. `desplazable` is for a sheet under a tall panel, as in Remate: the column fills the window when it can and scrolls below `min-h-240`, which keeps the height definite so the sheet still scrolls on its own.
- What a page leaves behind when another tab opens lives in `src/store/`. Tabs are `<Link>`s, so the layout stays mounted, but the page is torn down and its signals start over. `memoria.ts` keeps a store in the layout for the whole time the app is open; a reload starts it over. Each remembered state has its own file there, exporting its snapshot type plus `useFotoX()` (read it before the page resets itself) and `useGuardarX(campos)`. `index.ts` re-exports them all, so always import from `~/store`. Snapshots record the remate they belong to and are applied once, on the first load. That way, changing the remate, or picking another client, starts over as before. Only what the user chose or typed is remembered; data is always read back from the DB.
- Components built from several others live in `src/components/<name>/`: one component per file, 100 lines at most; split anything longer. Only `src/components/ui/` (generated) is exempt. Use only Qwik UI components (`bunx qwik-ui add <name>`), plus native elements where it has none (`<table>`), with theme tokens and Tailwind's scale: no hex colors, `style=` or arbitrary sizes like `w-[272px]`.
- Don't add CSS variables to `global.css`. The design's colors without a token of their own use the old sidebar palette, which nothing else uses: `sidebar-primary` accent, `sidebar-primary-foreground` accent on the dark panel, `sidebar-accent` blue stamp, `sidebar-accent-foreground` faint panel text, `sidebar-border` ruled lines, and `--sidebar`, `--sidebar-foreground`, `--sidebar-ring` the paper's light, stains and fibers. Also `popover` is the fields' background, `secondary` the dark panel, and `shadow-inner` a focused field's shadow. The comment in `global.css` keeps this list. Reuse these tokens (`bg-card`, `bg-muted`, `text-muted-foreground`, `Sello` for stamps) and Tailwind's scale, so the whole app keeps one style.
- The `@layer` order on the first line of `global.css` must keep `theme` before `base`: `@theme` maps `--shadow-*` to itself, so if it wins over the values in `base` the variables turn invalid and no shadow renders.
- `cn` runs `tailwind-merge` 1.14, which doesn't know newer classes: it reads `border-base` as a border color (next to `border-<color>` one is silently dropped) and can't tell that `size-20` or `rounded-xs` replace `h-10 w-10` or `rounded-md`. Use `border-base [border-color:var(--x)]`, `h-20 w-20` and `rounded-sm`. `buttonVariants({ class })` doesn't merge at all: use `cn(buttonVariants(...), "...")`.
- A headless `Select` or `ToggleGroup` doesn't follow a plain `value` after mounting: use `bind:value` with a signal synced in `useTask$` (see `tri-state-toggle.tsx`). `Select` reads its items once, so give it a `key` that changes with the list.
- The optimizer binds `{obj.prop}` to that object for good when `obj` is a plain `const`: `const activa = remateActivo(state)` followed by `{activa.nombre}` keeps showing the first remate after the selection changes, while `{fechaCorta(activa.fecha)}` does update, being a call. Derive it with `useComputed$` and read `activa.value.nombre` (see `app-header.tsx`). Computed values also update a moment later, so don't read one right after changing the signal it depends on.
- An attribute that comes in the prerendered HTML isn't removed when it later turns `undefined`: after a reload, the tab active on load kept `aria-current` after clicking another one. Give state attributes a value both ways (`aria-current={activo ? "page" : "false"}`, as `app-tabs.tsx`, `nav-item.tsx` and `page-toc.tsx` do); the `aria-current:` variant only matches `"true"`.
- The Lotes screen (`src/components/lotes-page/`) handles up to 1200 lots per remate. `lotes-planilla/` is a native `<table class="table-fixed">` that only draws the visible rows (`use-planilla-virtual.ts`); its two spacer rows are the one allowed `style=`, since their height is computed at runtime. A saved lot is read back alone with `leerLote` and added to the list in memory, instead of reloading it. `--shadow-2xl` is 6px on purpose: it's the design's value for the sheet and quick entry.
- `dueno-buscador/` searches clients for owners and buyers. Its list is Qwik UI's `Combobox`, but the field is the plain `Input`: `Combobox.Input` adds its own key handlers to any you pass (Enter would choose twice) and clears the highlight when typing. Don't use a `Select` for all the clients: it draws every option, which took 400 ms per opening with 300 clients.
- `/martillo/` (the "Remate" tab, `src/components/martillo/`) sells lot by lot and is where a lot's commission is set, one for each side. Every new sale starts at `COMISION_DEFECTO` (10%): only an already sold lot shows its own values, so a correction doesn't change them unnoticed. A lot is sold or unsold: there's no third state. A sale changes several lots at once, so `escribirVentas` (`src/db/ventas.ts`) writes them in one `UPDATE … FROM json_each`, and a lot sold with another carries that lot's buyer because the CHECK requires it. Its keys are `Ctrl`, never `Alt`; `Ctrl P` has to be stopped with `sync$` or it opens the print dialog.
- `/clientes/` shows settlements and payments (`liquidacion/`, `pagos/`). All amounts come from `liquidar` (`src/lib/liquidacion.ts`). A payment with its lots is saved by the `registrar_pago` Rust command (`src-tauri/src/comandos.rs`), which holds a transaction on the plugin's own pool. Printing goes through `imprimir` (`src/lib/imprimir.ts`): it copies the element to `body` with `papel-claro`, which redeclares the light tokens, so the paper stays light in dark mode.
- A remate's `lugar` is a Google Maps link or null, validated by `errorRemate` (`src/lib/remates.ts`) when creating and editing. It's shown only as the `lugar-link/` icon, which opens it in the system's browser through the opener plugin, because the webview can't navigate out by itself.
- Dark mode is class-based: `@custom-variant dark (&:is(.dark *))`, so `dark:` utilities apply under a `.dark` ancestor. The theme is only `light` or `dark` (no "system" option): `ThemeScript` (`src/components/theme/theme.tsx`, in `<head>`) sets `.dark` on `<html>` before first paint from `localStorage["theme"]`, falling back to `prefers-color-scheme` until the user chooses. Change it with `useTheme().setTheme$` (used by the header's `ThemeToggle`).
- Icons come from `@qwikest/icons`.

## Qwik conventions to respect

- Components are `component$(...)`. Anything crossing a `$` boundary (event handlers `onClick$`, `useTask$`, `routeLoader$`, `server$`) must be serializable; don't close over non-serializable values like class instances or functions without `$`.
- Because the app is static inside Tauri, data loading is client-side (`useVisibleTask$` + `getDb()`), not `routeLoader$` / `server$`. The `eslint-plugin-qwik` recommended rules enforce much of this, so run `bun run lint` after changes.
