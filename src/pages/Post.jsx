import { Link, useParams } from 'react-router-dom';
import { getPost, getNotebook, formatDate } from '../lib/posts.js';
import { useTitle } from '../lib/useTitle.js';
import Tags from '../components/Tags.jsx';
import NotFound from './NotFound.jsx';

export default function Post() {
  const { slug, notebook: notebookId } = useParams();
  const post = getPost(slug, notebookId);
  const notebook = notebookId && getNotebook(notebookId);

  useTitle(post ? post.title : 'Not found');

  if (!post) return <NotFound />;

  return (
    <article className="wrap">
      <header className="page__head">
        <div className="page__head-text">
          {notebook && (
            <Link className="page__kicker" to={`/writing/notebooks/${notebook.id}`}>
              {notebook.title}
            </Link>
          )}
          <h1 className="page__title">{post.title}</h1>
          {post.date && <p className="article__meta">{formatDate(post.date)}</p>}
          <Tags tags={post.tags} />
        </div>
      </header>
      {/* Markdown here is authored in this repo, not user input. */}
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      {notebook ? (
        <Link className="back" to={`/writing/notebooks/${notebook.id}`}>
          ← Back to {notebook.title}
        </Link>
      ) : (
        <Link className="back" to="/writing">
          ← All writing
        </Link>
      )}
    </article>
  );
}
