import { Link, NavLink } from 'react-router-dom';
import { site } from '../content/site.js';

export default function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav__inner">
        <Link className="nav__brand" to="/">
          {site.name}
        </Link>
        <nav className="nav__links">
          <NavLink to="/writing">Writing</NavLink>
          <NavLink to="/projects">Projects</NavLink>
        </nav>
      </div>
    </header>
  );
}
