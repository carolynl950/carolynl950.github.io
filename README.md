# carolynl950.github.io

My personal portfolio — an NYC-themed single-page site built with [Jekyll](https://jekyllrb.com/).

**Live site:** https://carolynl950.github.io

## Structure

| File | What it is |
|------|------------|
| `index.html` | The whole page — hero, about, projects, contact |
| `css/nyc.css` | All styling (night skyline, MTA subway signage) |
| `_data/projects.yml` | Project list — edit this to add/remove/reorder projects |
| `404.html` | "This stop doesn't exist" error page |

## Editing

- **Add a project:** append an entry to `_data/projects.yml` (title, bullet letter, MTA color, description, tags, links).
- **Add photography:** create `_data/photos.yml` with `src`/`caption` entries and drop images in `img/photos/` — a hidden Photography section on the homepage turns on automatically.
- **Change name/links/email:** edit `_config.yml`.

## Run locally

```bash
bundle install
bundle exec jekyll serve
# open http://localhost:4000
```
