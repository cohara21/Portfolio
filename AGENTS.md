# Working on carsonohara.com

Carson O'Hara's portfolio. Plain HTML, CSS and JavaScript, hosted on GitHub Pages from `main`. No build step.

**This repo is public, and `main` is the live site.** Anything pushed to `main` is on carsonohara.com about a minute later. Work on a branch. Merge or push to `main` only when Carson says so.

## Read first
- `DESIGN.md`: the design system. Every colour, size, space, radius, shadow and motion value comes from its tokens (mirrored in the `:root` block of `css/styles.css`). If something needs a value that isn't there, change DESIGN.md first.
- `.claude/skills/`: the writing and interface skills this project uses. `writing-without-ai-tells` applies to every word of page copy.

## Layout
- Pages: `index.html` (Home), `work.html`, `about.html`, five case studies (`case-study-*.html`), two galleries, `404.html`.
- Side projects with their own folders: `tennis-pong/`, `word-clock/`.
- `js/main.js` (menu, header, lightbox, carousels), `js/case-zoom.js`, `js/text-type.js`, `js/stack.js`.
- Images live in `images/<page>/` as WebP.

## Rules
- Never invent facts, numbers, quotes, captions or results. If something is missing, say what's missing and stop.
- Don't rewrite Carson's copy without asking. New copy is a draft until he approves it.
- No em or en dashes in page copy. No banned vocabulary (see the writing skill).
- Contact email everywhere: carsonohara78@gmail.com. LinkedIn: https://www.linkedin.com/in/carson-ohara-225512292
- Job titles: Contio = "Designer". FINRA x SCADpro = "UX Designer".
- Keep `prefers-reduced-motion`, keyboard access and visible focus rings working on anything you touch.
- Concept pages (`home-*.html`) never go on `main`, because Pages would publish them. They live on the `home-concepts` branch.
- This repo is public. Nothing private goes in it: no unreleased company numbers, no client or customer names beyond what the case studies already show, no personal notes.

## Before calling work done
- Serve the folder (`python3 -m http.server 8766`) and check every page you changed at 320, 375, 768 and 1280 px wide, at 100% and 200% text size: no sideways scrolling, no console errors.
- Check keyboard use (Tab through it) and reduced motion.
- Screenshots in headless Chrome: launch with `--use-angle=swiftshader --enable-unsafe-swiftshader`, or the transparent WebP heroes (Coral Keepers, Mose, Big Bus) don't paint. That's a tool problem, not a site bug. Set phone sizes with device emulation, not window size.
- Say plainly what you checked and what you didn't.
