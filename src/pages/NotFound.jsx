import { Link } from 'react-router-dom';
import { useTitle } from '../lib/useTitle.js';

export default function NotFound() {
  useTitle('Not found');

  return (
    <div className="wrap">
      <header className="page__head">
        <h1 className="page__title">Not found</h1>
        <p className="page__lede">
          That page doesn’t exist — it may have moved in the rebuild.
        </p>
      </header>
      <Link className="back" to="/">
        ← Home
      </Link>
    </div>
  );
}
