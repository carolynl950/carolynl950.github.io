import { Link } from 'react-router-dom';
import { site } from '../content/site.js';
import { projects } from '../content/projects.js';
import { posts } from '../lib/posts.js';
import { useTitle } from '../lib/useTitle.js';
import PostList from '../components/PostList.jsx';
import ProjectList from '../components/ProjectList.jsx';

export default function Home() {
  useTitle(null);

  const recentPosts = posts.slice(0, 3);
  const featured = projects.filter((project) => project.featured);

  return (
    <div className="wrap">
      <section className="hero">
        <h1 className="hero__name">{site.name}</h1>
        <p className="hero__role">{site.role}</p>
        <div className="hero__intro">
          {site.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="hero__links">
          {site.links.map((link) => (
            <a key={link.href} href={link.href} rel="noopener">
              {link.label}
            </a>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Writing</h2>
          <Link className="section__more" to="/writing">
            All posts →
          </Link>
        </div>
        <PostList posts={recentPosts} empty="First post coming soon." />
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Projects</h2>
          <Link className="section__more" to="/projects">
            All projects →
          </Link>
        </div>
        <ProjectList projects={featured} />
      </section>
    </div>
  );
}
