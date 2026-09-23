import { Link, useParams } from 'react-router-dom';
import { getPost, formatDate } from '../lib/posts.js';
import { useTitle } from '../lib/useTitle.js';
import NotFound from './NotFound.jsx';

export default function Post() {
  const { slug } = useParams();
  const post = getPost(slug);

  useTitle(post ? post.title : 'Not found');

  if (!post) return <NotFound />;

  return (
    <article className="wrap">
      <header className="page__head">
        <h1 className="page__title">{post.title}</h1>
        {post.date && <p className="article__meta">{formatDate(post.date)}</p>}
      </header>
      {/* Markdown here is authored in this repo, not user input. */}
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      <Link className="back" to="/writing">
        ← All posts
      </Link>
    </article>
  );
}
