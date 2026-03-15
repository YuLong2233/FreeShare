# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Generate resources + build production bundle
npm run gen          # Regenerate data/ and public/data/details/ from resources/*.md
npm run gen:clean    # Same as gen, but also deletes orphaned images from GitHub CDN
npm run preview      # Serve production build locally
```

No test framework or linter is configured.

## Environment Variables

Create `.env.local` in the root:

```env
GEMINI_API_KEY=       # Google Gemini API key (required for AI search)
GITHUB_TOKEN=         # GitHub personal access token (for image CDN uploads)
GITHUB_OWNER=YuLong2233
GITHUB_REPO=FreeShare
```

## Architecture

**FreeShare** is a Markdown-driven resource sharing platform (React 19 + Vite 6 + TypeScript). Resources are stored as `.md` files and compiled into static JSON at build time.

### Data Flow

```
resources/*.md  →  scripts/generateResources.mjs  →  data/resources-list.ts
                                                   →  public/data/details/{id}.json
                                                   →  public/resource/{id}/index.html  (SEO页面)
                                                   →  public/sitemap.xml
```

- `npm run gen` must be run after adding/editing `.md` files for changes to appear in the app.
- `data/resources-list.ts` is a lightweight list (no HTML) imported directly by the app for fast rendering.
- `public/data/details/{id}.json` files are fetched on demand when a user opens a resource detail page.
- `public/resource/{id}/index.html` are standalone pre-rendered HTML pages served by Cloudflare Pages for SEO (search engines get full HTML content without JS).
- Local images referenced in Markdown are auto-uploaded to a GitHub Release CDN and the `.md` files are updated in-place with the CDN URLs.

### Routing

`App.tsx` uses `BrowserRouter` with these routes:
- `/` — Home/hero page
- `/downloads` — Resource list with AI search (`data/resources-list.ts` + Gemini API)
- `/resource/:id` — Detail page (fetches `/data/details/{id}.json` at runtime)
- `/guide` — Guide page

`public/_redirects` provides `/* /index.html 200` fallback for Cloudflare Pages. Static pre-rendered files in `public/resource/{id}/` take priority over this fallback and are served directly for SEO.

### Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | All routing and page-level components |
| `components/ResourceCard.tsx` | Card UI for each resource |
| `services/geminiService.ts` | Gemini AI semantic search |
| `services/statsService.ts` | View/like counters via `/api/stats/*` (Cloudflare Workers + KV) |
| `scripts/generateResources.mjs` | Build-time Markdown → JSON/TS generator |
| `types.ts` | Shared TypeScript interfaces |

### Resource Markdown Format

Resources live in `resources/`. See `resources/_template.md` for the full template. Key frontmatter fields:

```yaml
---
title: 资源标题
desc: 一句话概括
category: 办公软件
date: '2024-02-27'
tags: [标签1, 标签2]
links:
  - name: 夸克网盘
    url: 'https://...'
    code: 提取码        # optional
gallery:
  - 'https://...'       # first image used as card preview
id: 13                  # auto-assigned if omitted
---
```

IDs are auto-incremented by the generator if omitted. The generator increments to the highest existing ID + 1.

### Stats Backend

`/api/stats/*` endpoints are NOT in this repo — they run as Cloudflare Workers with Cloudflare KV storage. `statsService.ts` calls these endpoints for view/like tracking; likes are also cached in `localStorage`.

### CI/CD

`.github/workflows/generate-resources.yml` runs on pushes to `main` that touch `resources/**` or `scripts/**`. It runs `npm run gen` and `npm run build` to validate changes.
