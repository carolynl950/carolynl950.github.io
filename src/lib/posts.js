import { marked } from 'marked';

// Writing lives in two places:
//   src/content/journal/<slug>.md               → /writing/<slug>
//   src/content/notebooks/<notebook>/<slug>.md  → /writing/notebooks/<notebook>/<slug>
// Each notebook folder may hold a `_notebook.md` whose frontmatter gives the
// notebook's title and description; files starting with `_` are never posts.
// Adding a notebook is just adding a folder — nothing here needs to change.
const journalFiles = import.meta.glob('../content/journal/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const notebookFiles = import.meta.glob('../content/notebooks/*/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// Minimal YAML frontmatter reader: `key: value` pairs between --- fences.
// Deliberately hand-rolled so posts need no extra dependency to build.
function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { meta: {}, body: raw };

  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim());
    if (!pair) continue;
    meta[pair[1]] = pair[2].trim().replace(/^["'](.*)["']$/, '$1');
  }
  return { meta, body: raw.slice(match[0].length) };
}

function toPost(slug, raw, href) {
  const { meta, body } = parseFrontmatter(raw);
  return {
    slug,
    href,
    title: meta.title || slug,
    date: meta.date || '',
    summary: meta.summary || '',
    // `tags: tv, philosophy` → ['tv', 'philosophy']
    tags: (meta.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    draft: meta.draft === 'true',
    html: marked.parse(body),
  };
}

const byNewest = (a, b) => b.date.localeCompare(a.date);

export const journal = Object.entries(journalFiles)
  .map(([path, raw]) => {
    const slug = path.split('/').pop().replace(/\.md$/, '');
    return toPost(slug, raw, `/writing/${slug}`);
  })
  .filter((post) => !post.draft)
  .sort(byNewest);

const notebookMap = new Map();
for (const [path, raw] of Object.entries(notebookFiles)) {
  const [id, file] = path.split('/').slice(-2);
  if (!notebookMap.has(id)) {
    notebookMap.set(id, { id, title: id, description: '', posts: [] });
  }
  const notebook = notebookMap.get(id);

  if (file === '_notebook.md') {
    const { meta } = parseFrontmatter(raw);
    notebook.title = meta.title || id;
    notebook.description = meta.description || '';
    continue;
  }
  if (file.startsWith('_')) continue;

  const slug = file.replace(/\.md$/, '');
  const post = toPost(slug, raw, `/writing/notebooks/${id}/${slug}`);
  if (!post.draft) notebook.posts.push({ ...post, notebook: id });
}

// Notebooks with the most recent activity come first.
export const notebooks = [...notebookMap.values()]
  .map((notebook) => ({ ...notebook, posts: notebook.posts.sort(byNewest) }))
  .sort((a, b) => (b.posts[0]?.date || '').localeCompare(a.posts[0]?.date || ''));

// Everything, newest first — used for "recent writing" on the home page.
export const posts = [...journal, ...notebooks.flatMap((n) => n.posts)].sort(byNewest);

export function getNotebook(id) {
  return notebooks.find((notebook) => notebook.id === id);
}

export function getPost(slug, notebookId) {
  if (notebookId) return getNotebook(notebookId)?.posts.find((post) => post.slug === slug);
  return journal.find((post) => post.slug === slug);
}

export function formatDate(date) {
  if (!date) return '';
  // Parse as UTC so a date-only string doesn't shift a day in western timezones.
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
