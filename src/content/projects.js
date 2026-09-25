// Add a project by appending an object here. `featured: true` pulls it onto the
// home page. `status` renders as a small tag; omit it for finished work.
// `category` drives the tabs on /projects: 'selected' for shipped work,
// 'ongoing' for things still in progress.
//
// Anything wrapped in [square brackets] is a placeholder waiting on real copy.

/**
 * @typedef {Object} ProjectLink
 * @property {string} label  Button/link text, e.g. 'Devpost', 'App Store'.
 * @property {string} href
 */

/**
 * @typedef {Object} ProjectImage
 * @property {string} src  Absolute path, e.g. '/projects/moodswing/hero.jpg'.
 * @property {string} alt
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * @typedef {Object} Project
 * @property {string} slug         Used for React keys and image paths.
 * @property {string} title
 * @property {string} date         Year or range; '[date]' when unknown.
 * @property {string} stack        Short comma-separated list; '[stack]' when unknown.
 * @property {string} [hook]       Optional lead-in line, set in italics above the description.
 * @property {string} description  One or two sentences. `**wrapped**` runs render bold.
 * @property {'selected'|'ongoing'} category  Which tab the project appears under.
 * @property {ProjectLink[]} links            First entry becomes the primary button.
 * @property {ProjectImage[]} [images]        Up to 4, shown as one justified row. Omit for none.
 * @property {string} [caption]               Short line under the image row.
 * @property {string} [status]                Renders as a small tag next to the title.
 * @property {boolean} [featured]             Pulls the project onto the home page.
 */

/** @type {Project[]} */
export const projects = [
  {
    slug: 'invisible-string',
    title: 'Invisible String',
    date: '2026',
    stack: 'Next.js, React, Tailwind, Vercel, MongoDB Atlas, Dropbox, GPT-4o-mini',
    description:
      'A scrapbook that **organizes your memories with your friends**, reminding you of connections you had in the past, **rekindling lost connections**.',
    category: 'selected',
    featured: true,
    images: [
      {
        src: '/projects/invisible-string/invisible-string-designs.png',
        alt: 'Three app screens: a tangled string map of connections, the Invisible String title screen, and a College circle linking friends to shared photos',
        width: 1932,
        height: 1120,
      },
      {
        src: '/projects/invisible-string/dropbox-import.png',
        alt: 'The camera roll import screen, showing 8 events found across 125 scanned photos with friends tagged on each',
        width: 1300,
        height: 1488,
      },
      {
        src: '/projects/invisible-string/popup-notif.png',
        alt: 'A popup reading "Cindy is fading — 4 months since bts concert with Cindy", offering to make a plan',
        width: 896,
        height: 1522,
      },
    ],
    caption:
      'The design system, the camera roll import, and the nudge when a connection starts to fade.',
    links: [
      {
        label: 'Project Link',
        href: 'https://plume.hackmit.org/project/cwrqu-beqdw-ksvcc-nioba',
      },
      { label: 'Slides and Link to Demo',
        href: 'https://www.figma.com/deck/gRiii8Ut80W8wbw2AjH9EX/hackmit?node-id=2-2&t=i2QzIrdpQzV2IHzq-1'
      }
    ],
  },
  {
    slug: 'moodswing',
    title: 'MoodSwing',
    date: '2025',
    stack: 'YOLOv8, DeepFace, Gemini API, ElevenLabs, Spotify API',
    description:
      'An AI DJ that **reads your facial expressions** and queues up songs to **match your mood**.',
    category: 'selected',
    featured: true,
    images: [
      {
        src: '/projects/moodswing/demo-thumbnail.png',
        alt: 'The MoodSwing start screen beside a laptop detecting a happy expression and cueing "Walking on Sunshine"',
        width: 1908,
        height: 890,
      },
      {
        src: '/projects/moodswing/architecture-overview.png',
        alt: 'Architecture diagram: camera input runs through YOLOv8 and DeepFace, the detected emotion goes to the Gemini API, which drives ElevenLabs narration and Spotify playback',
        width: 1966,
        height: 1098,
      },
      {
        src: '/projects/moodswing/functions.png',
        alt: 'Real-time emotion detection picking out the primary face among three people and labeling it angry',
        width: 1900,
        height: 952,
      },
    ],
    caption:
      'The demo, the pipeline behind it, and emotion detection locking onto the primary face.',
    links: [
      { label: 'Devpost', href: 'https://devpost.com/software/moodswing-27fmc0' },
      {
        label: 'Slides',
        href: 'https://docs.google.com/presentation/d/e/2PACX-1vTd5uQNZnFHuuRyLkTmFXOXjKqHAkQrkd8v270rPZYDTrnoFpL-Db4YIe7GrnhQm-SEoJmFl4QLbRM5/pub',
      },
    ],
  },
  {
    slug: 'calroarie',
    title: 'CalRoarie',
    date: '2025',
    stack: 'SwiftUI, Combine (MVVM), Flask, Render, Python, BeautifulSoup, USDA API',
    description:
      'A published iOS app for you to **track your calories, protein, and more at your university dining halls** — currently available for **Columbia/Barnard and Cornell** students!',
    category: 'selected',
    featured: true,
    images: [
      {
        src: '/projects/calroarie/columbia-dining.jpg',
        alt: 'The Columbia Dining home screen listing every dining hall with hours, ratings, and item counts',
        width: 950,
        height: 2034,
      },
      {
        src: '/projects/calroarie/nutrition.jpg',
        alt: 'The John Jay Dining Hall menu broken out by station, with calories, protein, carbs, fat, and dietary tags per item',
        width: 944,
        height: 2035,
      },
      {
        src: '/projects/calroarie/add-food.jpg',
        alt: 'Adding Carrots and Green Beans to the cart by serving size, previewing the macros it adds',
        width: 950,
        height: 2027,
      },
      {
        src: '/projects/calroarie/tracker.jpg',
        alt: 'The daily tracker showing calories and protein against goals, a macro summary, and a streak counter',
        width: 934,
        height: 2021,
      },
    ],
    caption:
      'Browsing dining halls, reading a menu by station, logging a serving, and tracking the day against your goals.',
    links: [
      {
        label: 'App Store',
        href: 'https://apps.apple.com/us/app/calroarie/id6758307010',
      },
    ],
  },
  {
    slug: 'aimed',
    title: 'aiMed',
    date: '2025',
    stack: 'React, Vite, Fastify, Supabase, K2 Think API, RxNorm + OpenFDA',
    description:
      'An AI medical agent to answer your concerns about **medication interactions** and help **compare treatment options**.',
    category: 'selected',
    images: [
      {
        src: '/projects/aimed/mix-function.png',
        alt: 'The Mix screen checking benadryl against Aspirin, returning a documented interaction rated mild with dosing notes',
        width: 1966,
        height: 1024,
      },
      {
        src: '/projects/aimed/compare-function.png',
        alt: 'The Compare screen lining up benadryl and Aspirin side by side across dose, form, active ingredients, and suggested use',
        width: 1882,
        height: 940,
      },
      {
        src: '/projects/aimed/tech-stack.png',
        alt: 'Tech stack table: React and Vite frontend, Fastify backend, Supabase database, K2 Think API, and DSLD, RxNorm and OpenFDA data sources',
        width: 2446,
        height: 1254,
      },
    ],
    caption:
      'Checking an interaction, comparing two products side by side, and the stack underneath.',
    links: [
      { label: 'Devpost', href: 'https://devpost.com/software/aimed-ek4mcr' },
      {
        label: 'Slides',
        href: 'https://docs.google.com/presentation/d/e/2PACX-1vR4SR1dX26etsq-DzclCWGfoyN1nSAAOBxsCvPtF3j9ITNtt3MiEwGWLTyDCdPAa552fjoIvMt9-Kq4/pub',
      },
    ],
  },
  {
    slug: 'stocktrader',
    title: 'StockTrader',
    date: '2024',
    stack: 'Flutter, FlutterFlow, Python, Flask, Alpaca Trading API, Firebase (Auth, Firestore, Storage)',
    description:
      'A stock trading simulator where students can **compete on portfolios** and teachers can **track their progress**.',
    category: 'selected',
    images: [
      {
        src: '/projects/stocktrader/login-screen.png',
        alt: 'The StockTrader sign-in screen, with tabs to create an account or log in',
        width: 2480,
        height: 1112,
      },
      {
        src: '/projects/stocktrader/dashboard.png',
        alt: 'The dashboard for downloading the template and uploading a program, alongside the dialog for joining a group with an instructor-issued ID',
        width: 2678,
        height: 1432,
      },
      {
        src: '/projects/stocktrader/Architecture-overview.png',
        alt: 'Architecture diagram: login feeds Firebase Auth, uploaded scripts land in Firebase Storage, and a Flask server runs them daily and writes results to Firestore for the leaderboard',
        width: 2640,
        height: 1490,
      },
    ],
    caption:
      'Signing in, joining a class group and uploading a strategy, and the pipeline that scores it each day.',
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
    slug: 'reaction-game',
    title: 'Reaction Game',
    date: '2026',
    stack: 'Arduino, C++, Tinkercad, 3D printing, servo motors, embedded systems',
    description:
      'A quick reflex game — you must **catch the falling stick** before it hits the ground!',
    category: 'selected',
    images: [
      {
        src: '/projects/reaction-game/product.png',
        alt: 'The finished game held up: a plywood board with a hand-drawn face, servo-driven sliding rods, and a sprung catch mechanism',
        width: 780,
        height: 1046,
      },
      {
        src: '/projects/reaction-game/hardware.png',
        alt: 'The wiring behind it — an ELEGOO UNO R3 board and breadboard running the servos',
        width: 1410,
        height: 950,
      },
    ],
    caption: 'The build, and the breadboard driving it.',
    links: [
      {label: 'Progress/demo video',
        href: 'https://drive.google.com/file/d/1LfmpC3rkDIxBplTwAG1cMWKNxilZ5fpO/view?usp=sharing'
      }],
  },
  {
    slug: 'redis-from-scratch',
    title: 'Redis From Scratch',
    date: '[date]',
    stack: 'C++',
    description: 'A miniature Redis server built **from scratch in C++**!',
    category: 'ongoing',
    status: 'Ongoing',
    images: [],
    links: [],
  },
  {
    slug: 'gemm',
    title: 'GEMM',
    date: '[date]',
    stack: 'C++',
    description:
      'Writing a **GEMM (matrix multiplication) kernel** in C++, learning **performance optimization** along the way.',
    category: 'ongoing',
    status: 'Ongoing',
    images: [],
    links: [],
  },
];
