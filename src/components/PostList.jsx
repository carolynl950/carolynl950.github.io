import { Link } from 'react-router-dom';
import { formatDate } from '../lib/posts.js';
import Tags from './Tags.jsx';

export default function PostList({ posts, empty = 'Nothing here yet.' }) {
  if (!posts.length) return <p className="empty">{empty}</p>;

  return (
    <ul className="entries">
      {posts.map((post) => (
        <li className="entry" key={post.href}>
          <Link className="entry__link" to={post.href}>
            <div className="entry__top">
              <span className="entry__title">{post.title}</span>
              <span className="entry__meta">{formatDate(post.date)}</span>
            </div>
            {post.summary && <p className="entry__summary">{post.summary}</p>}
            <Tags tags={post.tags} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
