// The badge and title link to the certificate file when there is one, otherwise
// to the verify link, so a single click always lands on the most useful thing.
export default function CertificationList({ certifications, empty = 'Nothing here yet.' }) {
  if (!certifications.length) return <p className="empty">{empty}</p>;

  return (
    <ul className="certs">
      {certifications.map((cert) => {
        const target = cert.file ?? cert.href;
        const Main = target ? 'a' : 'div';
        const mainProps = target ? { href: target, target: '_blank', rel: 'noopener' } : {};

        return (
          <li key={`${cert.issuer}-${cert.title}`} className="cert">
            <Main className="cert__main" {...mainProps}>
              <span className="cert__media">
                {cert.image ? (
                  <img
                    className="cert__image"
                    src={cert.image}
                    alt={`${cert.issuer} ${cert.title}`}
                    loading="lazy"
                  />
                ) : (
                  <span className="cert__initial" aria-hidden="true">
                    {cert.issuer.charAt(0)}
                  </span>
                )}
              </span>
              <span className="cert__title">{cert.title}</span>
              <span className="cert__meta">
                {cert.issuer}
                {cert.date && ` · ${cert.date}`}
              </span>
            </Main>
            {cert.file && cert.href && (
              <a className="cert__verify" href={cert.href} target="_blank" rel="noopener">
                Verify ↗
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
