# Asen Mayuranga — Interactive Portfolio

A personal portfolio for Asen Mayuranga Wijesiri, featuring an interactive 3D character and projects across Java/Spring Boot, React/TypeScript, and Flutter.

## Project status

The first version is implemented as a static, responsive website. It includes an original Three.js robot companion, five project case summaries, professional experience, education, skills, and contact links.

## Experience

- An original 3D robot that waves on arrival, moves while idle, follows the cursor, and reacts to clicks. The **Say hello** button provides a keyboard-accessible interaction.
- An introduction, selected projects, professional experience, education, skills, and contact links.
- Responsive layouts, keyboard-accessible controls, and support for reduced motion.
- A matching SVG illustration when 3D rendering is unavailable, its module fails to load, or JavaScript is disabled.
- Project filters for backend, mobile, and full-stack work.
- Animation pauses offscreen and in background tabs. Reduced-motion preferences start the character paused; visitors can also pause it manually.
- A **Download CV** button serves the supplied PDF with a readable filename.
- A footer **Last updated** date and time is generated during a build in Sri Lanka time (UTC+05:30). It stays fixed when visitors open or refresh the page.

## Run locally

```sh
npm ci
npm run vendor
npm run dev
```

Open **http://127.0.0.1:4173**. Use an HTTP server rather than opening `index.html` directly, because the character uses JavaScript modules.

```sh
npm run check
npm test
npm run build
npm run audit
```

The browser checks use an installed Google Chrome. Set `PLAYWRIGHT_CHANNEL=msedge` to use Microsoft Edge instead. They verify desktop and mobile layouts, project filters, keyboard interactions, reduced motion, graceful fallback, the CV link and exact PDF response, and stable timestamps across visitor timezones. The audit checks common accessibility issues at desktop and mobile sizes. Screenshots and audit reports are written to the ignored `test-results/` directory. Saving the CV should also be checked in a normal browser: the installed headless browsers cancel PDF saves even though the PDF response succeeds.

The build prepares a minified character bundle, local fonts and their licenses, and a downloadable copy of the CV, stamps the footer and profile metadata, then copies the static website to `dist/`. The root website also works with a static HTTP server. There is no runtime backend. Fonts and the 3D code are served locally, so the page does not need a third-party font or script request.

`npm run dev` prepares the local assets before starting the server. After making content changes, run `npm run build` to refresh the **Last updated** timestamp and static output. This reports the build time, not a live clock or the visitor's device time. To regenerate the 1200 × 630 social sharing image after editing `assets/social-card.svg`, run `npm run social-card` before building.

## Technology

- HTML, CSS, and JavaScript
- Three.js for the interactive avatar
- GitHub Pages for static hosting

No backend is required for the planned avatar interactions.

## Content

The implementation brief is in [docs/portfolio-brief.md](docs/portfolio-brief.md). Its professional information comes from the CV supplied by the owner.

The About section includes the owner's supplied portrait in a responsive frame. Its original upload is preserved in `assets/photos/`; the site uses `asen-mayuranga.jpg`.

The avatar and project diagrams are original code-created illustrations. Project diagrams describe the systems; they are not application screenshots. The contact section includes email and phone links verified against the supplied CV, alongside LinkedIn and GitHub. The CV is stored in `docs/Asen_Mayuranga_Wijesiri_Software_Engineer_CV.pdf` as a content source.

The education section uses the study period and expected graduation date from the newly supplied CV. It presents the degree as undergraduate studies and does not claim the qualification is already completed.

Real application screenshots can be placed in `assets/projects/` for integration. Current project visuals are explanatory diagrams. Final address-dependent metadata and a live social-sharing test are pending the publishing stage; see [the remaining launch tasks](docs/launch-checklist.md).

## Publishing plan

The intended GitHub account is [AshenMayuranga](https://github.com/AshenMayuranga).

If available, use a public repository named `ashenmayuranga.github.io` for the address `https://ashenmayuranga.github.io/`. Otherwise, a project repository can publish under `https://ashenmayuranga.github.io/<repository-name>/`.

After the website is implemented, enable GitHub Pages in **Settings → Pages**, select **Deploy from a branch**, and choose **main** and **/(root)**. The publishing folder must contain `index.html` and the site's assets.
