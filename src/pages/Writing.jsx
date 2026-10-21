import { journal, notebooks } from '../lib/posts.js';
import { site } from '../content/site.js';
import { useTitle } from '../lib/useTitle.js';
import PostList from '../components/PostList.jsx';
import NotebookList from '../components/NotebookList.jsx';

export default function Writing() {
  useTitle('Writing');

  return (
    <div className="wrap">
      <header className="page__head">
        <div className="page__head-text">
          <h1 className="page__title">Writing</h1>
          <p className="page__lede">
            Notebooks for the technical stuff — what I built and learned, one per
            project or role. A journal for everything else.
          </p>
        </div>
        <img
          className="page__mascot"
          src={site.mascots.writing.src}
          alt={site.mascots.writing.alt}
        />
      </header>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">notebooks</h2>
        </div>
        <NotebookList notebooks={notebooks} empty="First notebook coming soon." />
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">journal</h2>
        </div>
        <PostList posts={journal} empty="First entry coming soon." />
      </section>
    </div>
  );
}
