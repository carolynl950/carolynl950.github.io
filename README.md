# Portfolio site

An animated Möbius intro on the Nocturne design system. Plain static files —
no build step, no npm install, no framework.

## Files

```
index.html          Möbius scene + the page below it
support.js          Runtime: loads React + Babel, compiles the .jsx in-browser
animations-v3.jsx   CompositionStage, useComposition, interpolate, Easing, clamp
tweaks-panel.jsx    TweaksPanel and the Tweak* controls
mobius-scene.jsx    The Möbius geometry and camera
nocturne/
  styles.css        Design tokens + component classes (.btn, .card, .nav, .tag …)
  readme.md         What each class is for — read before adding sections
```

## Run it locally

The pages fetch the `.jsx` files over HTTP, so opening the HTML by
double-clicking will not work (`file://` blocks it). Serve the folder:

    python3 -m http.server 8000

Then open http://localhost:8000

Edit any file and refresh. There is nothing to rebuild.

## Using the site

The Möbius scene fills the first screen and is scroll-driven — scrolling down
plays through the four beats defined in `OM_SCENES` (Roll, Rise, Flip, Home)
and reveals the page content underneath.

A **tweaks panel** sits pinned in the bottom-right corner of the page. Drag
its header to move it, click the `×` to close it. It has three groups:

- **Surface** — half-twists (1–3), rib count, and a shaded-faces toggle for
  the band geometry.
- **Type** — a show-equations toggle, plus the Name and Tagline text shown
  on the intro.
- **Editing** — a "Motion editor" toggle that exposes additional scene/timing
  controls for the scroll animation.

Changes in the panel update the scene live, in the browser, without a
refresh. They are not saved to disk automatically — to make a change
permanent, copy the resulting values into the `TWEAK_DEFAULTS` block in
`index.html` (between the `EDITMODE-BEGIN`/`EDITMODE-END` comments).

## Editing

**Scene settings** live in the `TWEAK_DEFAULTS` block near the top of
`index.html` — name, tagline, number of half-twists, rib count, whether the
equations show. Change the JSON, refresh.

**Page content** is below the sticky scene in `index.html` — the `#work`
project grid and the `#about` bio + stat band. Edit the cards/text directly,
using the classes documented in `nocturne/readme.md`.

**Colors and spacing** come from CSS variables in `nocturne/styles.css`
(`var(--color-accent)`, `var(--space-6)`, etc.). Change a token there and it
propagates everywhere.

**Scene motion** is in the `mobius-scene.jsx`. `OM_SCENES` in the HTML defines
the named beats (Roll, Rise, Flip, Home) and their durations; the scene code
reads them as `CUES.Rise`, `CUES.Flip`, and so on.

## Deploy to GitHub Pages

The live site is served from a separate repo, `carolynl950/carolynl950.github.io`
(cloned locally at `~/Desktop/carolynl950.github.io`), not from this folder.
This folder is the editing source; that repo is the deploy target.

To publish a change:

    SRC=/Users/carolynlee/Desktop/site
    DEST=~/Desktop/carolynl950.github.io
    cp "$SRC/index.html" "$SRC/support.js" "$SRC/animations-v3.jsx" \
       "$SRC/mobius-scene.jsx" "$SRC/tweaks-panel.jsx" "$DEST/"
    rm -rf "$DEST/nocturne" && cp -R "$SRC/nocturne" "$DEST/nocturne"
    cd "$DEST"
    git add -A
    git commit -m "update portfolio"
    git push

GitHub Pages serves the `main` branch root directly — no build step. A
`.nojekyll` file in that repo tells GitHub Pages to skip the Jekyll build
the repo used to have, so these plain static files are served as-is.

## Known constraints

- React, ReactDOM, and Babel load from unpkg.com at runtime. The site needs a
  network connection and will not work offline. First paint waits on those
  three downloads (~1s). If you ever want to remove that dependency you would
  need to vendor the three scripts locally and precompile the JSX.
- Babel compiles the JSX in the browser on every load. Fine for a portfolio,
  measurably slower than a built site.
- The scene renders a 1920×1080 stage and scale it down, so it is heavy on
  low-end phones. Consider a reduced rib count on small screens if it stutters.
