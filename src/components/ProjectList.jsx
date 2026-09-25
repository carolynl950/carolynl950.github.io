import ProjectEntry from './ProjectEntry.jsx';

// Presentational only — numbering restarts at 001 for whatever list it's given,
// so a filtered tab and the home page's featured slice both number from the top.
export default function ProjectList({ projects, empty }) {
  if (projects.length === 0) {
    return <p className="empty">{empty ?? 'Nothing here yet.'}</p>;
  }

  return (
    <ul className="projects">
      {projects.map((project, index) => (
        <ProjectEntry key={project.slug} project={project} index={index} />
      ))}
    </ul>
  );
}
