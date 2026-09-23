import { posts } from '../lib/posts.js';
import { useTitle } from '../lib/useTitle.js';
import PostList from '../components/PostList.jsx';

export default function Writing() {
  useTitle('Writing');

  return (
    <div className="wrap">
      <header className="page__head">
        <h1 className="page__title">Writing</h1>
        <p className="page__lede">
          Notes on what I’m learning — systems, math, and things I got stuck on.
        </p>
      </header>
      <PostList posts={posts} empty="First post coming soon." />
    </div>
  );
}
