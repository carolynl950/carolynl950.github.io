# carolynl950.github.io

Personal site — writing and projects. React + Vite, deployed to GitHub Pages.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # serve the built site locally
```

## Adding a post

Drop a Markdown file in `src/content/posts/`. The filename becomes the URL,
so `gemm-notes.md` lands at `/writing/gemm-notes`.

```markdown
---
title: Notes on writing a GEMM kernel
date: 2026-10-04
summary: One sentence that shows up in the post list.
---

Body goes here. Standard Markdown.
```

Frontmatter fields:

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Shown in the list and as the page heading |
| `date` | yes | `YYYY-MM-DD`. Posts sort newest first |
| `summary` | no | One-line blurb in the post list |
| `draft` | no | `draft: true` hides it from the built site |

## Adding a project

Append an object to the array in `src/content/projects.js`. Set
`featured: true` to surface it on the home page. `status` renders as a small
tag (used for in-progress work); leave it off for finished projects.

## Editing the intro and links

`src/content/site.js` holds the name, role line, intro paragraphs, and the
GitHub / LinkedIn / email links used in both the hero and the footer.

## Layout

```
src/
  content/      site.js, projects.js, posts/*.md — everything you edit regularly
  components/   Nav, Footer, PostList, ProjectList
  pages/        Home, Writing, Post, Projects, NotFound
  lib/          posts.js (Markdown loader), useTitle.js
  styles.css    one stylesheet, CSS variables at the top
public/         static assets, copied to dist/ as-is
```

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages. This requires **Settings → Pages → Source** set to
**GitHub Actions** (not "Deploy from a branch").

GitHub Pages has no SPA rewrite, so the build copies `index.html` to
`404.html`. That's what makes deep links like `/writing/some-post` work on a
cold load instead of 404ing.
