// Add a project by appending an object here. `featured: true` pulls it onto the
// home page. `status` renders as a small tag; omit it for finished work.
export const projects = [
  {
    title: 'MoodSwing',
    blurb:
      'An AI DJ that reads your facial expressions and queues up songs to match your mood.',
    year: '2025',
    featured: true,
    links: [
      { label: 'Devpost', href: 'https://devpost.com/software/moodswing-27fmc0' },
      {
        label: 'Slides',
        href: 'https://docs.google.com/presentation/d/e/2PACX-1vTd5uQNZnFHuuRyLkTmFXOXjKqHAkQrkd8v270rPZYDTrnoFpL-Db4YIe7GrnhQm-SEoJmFl4QLbRM5/pub',
      },
    ],
  },
  {
    title: 'CalRoarie',
    blurb:
      'A real-time nutrition tracking app — calories, protein, and more — for Columbia dining halls.',
    year: '2025',
    featured: true,
    links: [
      {
        label: 'App Store',
        href: 'https://apps.apple.com/us/app/calroarie/id6758307010',
      },
    ],
  },
  {
    title: 'aiMed',
    blurb:
      'An AI medical agent that answers questions about medication interactions and compares treatment options.',
    year: '2025',
    links: [
      { label: 'Devpost', href: 'https://devpost.com/software/aimed-ek4mcr' },
      {
        label: 'Slides',
        href: 'https://docs.google.com/presentation/d/e/2PACX-1vR4SR1dX26etsq-DzclCWGfoyN1nSAAOBxsCvPtF3j9ITNtt3MiEwGWLTyDCdPAa552fjoIvMt9-Kq4/pub',
      },
    ],
  },
  {
    title: 'StockTrader',
    blurb:
      'A stock trading simulator where students compete on portfolios and teachers track their progress.',
    year: '2024',
    links: [
      {
        label: 'Live platform',
        href: 'https://cmtrading.flutterflow.app/uploadpage',
      },
      {
        label: 'Slides',
        href: 'https://docs.google.com/presentation/d/e/2PACX-1vT4idOeAKFyYLhLYYL9qC4wG6Hyl4pz_R6zbXyQB9uIGzav6TCqWrrFhgEfZXk4LqJwCSnOHwMOV1ld/pub',
      },
    ],
  },
  {
    title: 'Redis From Scratch',
    blurb:
      'A miniature Redis server built from scratch in C++ — no libraries beyond the standard library and POSIX sockets.',
    status: 'Ongoing',
    links: [],
  },
  {
    title: 'GEMM',
    blurb:
      'Writing a GEMM (matrix multiplication) kernel in C++, learning performance optimization along the way.',
    status: 'Ongoing',
    links: [],
  },
  {
    title: 'Reaction Game',
    blurb: 'A quick reflex game — catch the falling stick before it hits the ground.',
    links: [],
  },
];
