import { marked } from 'marked';

// Every .md file in src/content/posts becomes a post. The filename is the URL
// slug, so `first-post.md` lives at /writing/first-post.
const files = import.meta.glob('../content/posts/*.md', {
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

export const posts = Object.entries(files)
  .map(([path, raw]) => {
    const slug = path.split('/').pop().replace(/\.md$/, '');
    const { meta, body } = parseFrontmatter(raw);
    return {
      slug,
      title: meta.title || slug,
      date: meta.date || '',
      summary: meta.summary || '',
      draft: meta.draft === 'true',
      html: marked.parse(body),
    };
  })
  .filter((post) => !post.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

export function getPost(slug) {
  return posts.find((post) => post.slug === slug);
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
