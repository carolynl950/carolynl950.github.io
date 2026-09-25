// Renders `**bold**` runs inside a description string. Splitting on the
// delimiter is enough here — descriptions are one or two plain sentences, so
// pulling in a markdown parser would be overkill.
function withBold(text) {
  return text.split('**').map((chunk, i) =>
    i % 2 === 1 ? <strong key={i}>{chunk}</strong> : chunk,
  );
}

// Falls back to a mild landscape shape when an image omits its dimensions.
function aspectRatio(image) {
  return image.width && image.height ? image.width / image.height : 1.5;
}

export default function ProjectEntry({ project, index }) {
  const number = String(index + 1).padStart(3, '0');
  const images = project.images ?? [];
  const [primary, ...secondary] = project.links;
  const meta = [project.date, project.stack].filter(Boolean);

  return (
    <li className="project">
      <div className="project__index">
        <span className="project__number">{number}</span>
        <span className="project__rule" aria-hidden="true" />
      </div>

      <h3 className="project__title">
        {project.title}{' '}
        {project.status && <span className="tag">{project.status}</span>}
      </h3>

      {meta.length > 0 && <p className="project__meta">{meta.join(' · ')}</p>}

      {project.hook && <p className="project__hook">{project.hook}</p>}

      <p className="project__description">{withBold(project.description)}</p>

      {images.length > 0 && (
        <figure className="project__figure">
          <div className="project__images">
            {images.slice(0, 4).map((image) => (
              <img
                key={image.src}
                className="project__image"
                // Each image grows in proportion to its own aspect ratio, so a
                // row of mixed portrait/landscape shots lands at one shared
                // height and always fits on a single line.
                style={{ '--ar': aspectRatio(image) }}
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
              />
            ))}
          </div>
          {project.caption && (
            <figcaption className="project__caption">{project.caption}</figcaption>
          )}
        </figure>
      )}

      {project.links.length > 0 && (
        <div className="project__actions">
          <a
            className="project__button"
            href={primary.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {primary.label}
          </a>
          {secondary.map((link) => (
            <a
              key={link.href}
              className="project__action"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      )}
    </li>
  );
}
