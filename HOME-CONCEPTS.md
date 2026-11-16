# Home page concepts (branch home-concepts)

Preview pages for a new home page. This branch is never merged into main as is:
main is the live site, and GitHub Pages only publishes main.

To view one: `python3 -m http.server 8766`, then open http://localhost:8766/home-accordion.html

- Carson's favourite so far: `home-accordion.html`. Known weak spots: four of five projects are hidden until hovered, opening depends on hover, and the open panel's content is small.
- Styles he liked: `home-broadcast.html`, `home-gameday.html` (broadcast), `home-telemetry.html`, `home-timeline.html` (data), `home-drop.html` (Nike drop).
- Rejected: everything else here, including `home-premium.html` and the glass pages (`home-lineup`, `home-dash`, `home-spatial`).

When a direction is chosen, build it into index.html on a new branch from main.
