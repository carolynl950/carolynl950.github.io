import { projects } from '../content/projects.js';
import { useTitle } from '../lib/useTitle.js';
import ProjectTabs from '../components/ProjectTabs.jsx';

export default function Projects() {
  useTitle('Projects');

  return (
    <div className="wrap">
      <header className="page__head">
        <h1 className="page__title">Projects</h1>
        <p className="page__lede">
          Things I’ve built — hackathon projects, apps people actually use, and
          whatever I’m currently learning by writing from scratch.
        </p>
      </header>
      <ProjectTabs projects={projects} />
    </div>
  );
}
