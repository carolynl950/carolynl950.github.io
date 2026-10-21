import { Link, useParams } from 'react-router-dom';
import { getNotebook } from '../lib/posts.js';
import { useTitle } from '../lib/useTitle.js';
import PostList from '../components/PostList.jsx';
import NotFound from './NotFound.jsx';

export default function Notebook() {
  const { notebook: id } = useParams();
  const notebook = getNotebook(id);

  useTitle(notebook ? notebook.title : 'Not found');

  if (!notebook) return <NotFound />;

  return (
    <div className="wrap">
      <header className="page__head">
        <div className="page__head-text">
          <p className="page__kicker">notebook</p>
          <h1 className="page__title">{notebook.title}</h1>
          {notebook.description && <p className="page__lede">{notebook.description}</p>}
        </div>
      </header>
      <PostList posts={notebook.posts} empty="First note coming soon." />
      <Link className="back" to="/writing">
        ← All writing
      </Link>
    </div>
  );
}
