# Reseam website

The static site at [reseam.app](https://reseam.app): landing page, patch downloads, announcements, and the documentation for the engine, CLI, and API. SvelteKit with `adapter-static`, served by nginx.

## Developing

```sh
bun install
bun run dev
```

`dev` and `build` first run `docs:fetch`, which pulls the documentation sources from the engine, CLI, and API repositories and renders them into `src/lib/docs/generated/`. To render docs from sibling checkouts on disk instead, run `bun run docs:local`.

The site reads the Reseam API at `PUBLIC_API_URL` (default `https://api.reseam.app`). Set it in `.env` to build against another instance; visitors can also override it at runtime from the settings dialog.

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
