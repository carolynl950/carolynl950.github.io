import { projects } from '../content/projects.js';
import { site } from '../content/site.js';
import { useTitle } from '../lib/useTitle.js';
import ProjectTabs from '../components/ProjectTabs.jsx';

export default function Projects() {
  useTitle('Projects');

  return (
    <div className="wrap">
      <header className="page__head">
        <div className="page__head-text">
          <h1 className="page__title">Projects</h1>
          <p className="page__lede">
            Things I’ve built — hackathon projects, apps people actually use, and
            whatever I’m currently learning by writing from scratch.
          </p>
        </div>
        <img
          className="page__mascot"
          src={site.mascots.projects.src}
          alt={site.mascots.projects.alt}
        />
      </header>
      <ProjectTabs projects={projects} />
    </div>
  );
}
