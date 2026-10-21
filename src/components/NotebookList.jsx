import { Link } from 'react-router-dom';

export default function NotebookList({ notebooks, empty = 'Nothing here yet.' }) {
  if (!notebooks.length) return <p className="empty">{empty}</p>;

  return (
    <ul className="notebooks">
      {notebooks.map((notebook) => (
        <li key={notebook.id}>
          <Link className="notebook" to={`/writing/notebooks/${notebook.id}`}>
            <span className="notebook__title">{notebook.title}</span>
            {notebook.description && (
              <p className="notebook__description">{notebook.description}</p>
            )}
            <span className="notebook__count">
              {notebook.posts.length} {notebook.posts.length === 1 ? 'note' : 'notes'}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
