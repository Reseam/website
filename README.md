<p align="center">
  <img src="https://reseam.app/logo.svg" alt="Reseam logo" width="96">
</p>

<h1 align="center">Reseam website</h1>

The site at [reseam.app](https://reseam.app): the home page, the patch catalog, the browser patcher, downloads, announcements, and the docs for writing patches, the CLI, and the API server.

It is a static SvelteKit 3 site (`adapter-static`) built with Tailwind 4 and Bits UI, and served by nginx.

## Developing

```sh
bun install
bun run dev
```

`dev` and `build` first run `docs:fetch`, which pulls the documentation from the engine, CLI, and API repositories and renders it into `src/lib/server/docs.json`. The hub text at `/docs/` comes from `docs/index.md` in this repository. To render docs from sibling checkouts on disk instead, run `bun run docs:local`. The build fails when two docs files map to the same URL.

`vite dev` cannot run the patcher's workers. Test `/patch/` with `bun run build && bun run preview`.

## Data

Every page is prerendered. Pages that show API data (patches, announcements, Reseam Manager downloads) are built with the API at `API_URL` (default `https://api.reseam.app`) and refresh from the visitor's configured API in the browser. Visitors can change that address in the settings dialog.

The Download page reads the latest CLI release from Forgejo at build time. Rebuild the site after a CLI release to update it.

## Layout

- `src/lib/components/ui`: design system components on Bits UI. Tokens live in `src/app.css`.
- `src/lib/components/<area>`: components for one page or section.
- `src/lib/patcher`: the in-browser patcher state and helpers around `@reseam/browser`.
- `src/lib/server`: build-time data for prerendering.

## Building

```sh
bun run build
bun run preview
```

`Dockerfile` builds the site and serves it with the `nginx.conf` beside it.

## Checks

```sh
bun run check
```
