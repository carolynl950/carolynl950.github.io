// Add a certification by appending an object here. Drop the files in
// public/certifications/ and reference them with an absolute path.
//
// `image` is what shows on the card — a badge PNG, or a screenshot of the
// certificate. `file` is the full certificate (usually a PDF) and opens in a
// new tab when the card is clicked. `href` is an online verify/credential
// link. Every field after `issuer` is optional; a card with no image shows the
// issuer's initial instead.
//
// Example:
//   {
//     title: 'Data Engineer Associate',
//     issuer: 'Databricks',
//     date: '2026',
//     image: '/certifications/databricks-badge.png',
//     file: '/certifications/databricks-certificate.pdf',
//     href: 'https://credentials.databricks.com/...',
//   },

/**
 * @typedef {Object} Certification
 * @property {string} title
 * @property {string} issuer
 * @property {string} [date]   Year or month, e.g. '2026' or 'Oct 2026'.
 * @property {string} [image]  Badge or certificate preview, e.g. '/certifications/mongodb.png'.
 * @property {string} [file]   Full certificate, e.g. '/certifications/mongodb.pdf'.
 * @property {string} [href]   Online verification link.
 */

/** @type {Certification[]} */
export const certifications = [
  {
    title: 'Sharding Strategies',
    issuer: 'MongoDB Skill Badge',
    image: '/certifications/mongodb-sharding-strategies.png',
  },
  {
    title: 'Indexing Design Fundamentals',
    issuer: 'MongoDB Skill Badge',
    image: '/certifications/mongodb-indexing-design-fundamentals.png',
  },
  {
    title: 'Query Optimization',
    issuer: 'MongoDB Skill Badge',
    image: '/certifications/mongodb-query-optimization-techniques.png',
  },
  {
    title: 'Databricks Fundamentals Accreditation',
    issuer: 'Databricks Academy',
    date: 'Oct 2026',
    image: '/certifications/databricks-certificate.jpg',
    file: '/certifications/databricks-certificate.pdf',
  },
  {
    title: 'Machine Learning Foundations',
    issuer: 'eCornell · Break Through Tech',
    date: 'Aug 2026',
    image: '/certifications/ecornell-ml-foundations.jpg',
    file: '/certifications/ecornell-ml-foundations.pdf',
  },
];
