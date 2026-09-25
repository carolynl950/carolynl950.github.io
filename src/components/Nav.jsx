import { Link, NavLink } from 'react-router-dom';
import { site } from '../content/site.js';
import ThemeToggle from './ThemeToggle.jsx';

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
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
