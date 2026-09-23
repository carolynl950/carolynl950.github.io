import { site } from '../content/site.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <div className="footer__links">
          {site.links.map((link) => (
            <a key={link.href} href={link.href} rel="noopener">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
