export default function ProjectList({ projects }) {
  return (
    <ul className="entries">
      {projects.map((project) => (
        <li className="entry" key={project.title}>
          <div className="entry__link">
            <div className="entry__top">
              <span className="entry__title">
                {project.title}{' '}
                {project.status && <span className="tag">{project.status}</span>}
              </span>
              {project.year && <span className="entry__meta">{project.year}</span>}
            </div>
            <p className="entry__summary">{project.blurb}</p>
            {project.links.length > 0 && (
              <div className="entry__links">
                {project.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
