# Remaining launch tasks

## Local preparation

- Downloadable CV, direct contact links, owner portrait, and CV-based education details are in place.
- Project descriptions identify the research component and group-project contributions.
- Fonts and the minified 3D character bundle are self-hosted.
- The footer shows the latest build date and time in Sri Lanka time (UTC+05:30), including when JavaScript is disabled.
- Search/social metadata, a 1200 × 630 PNG sharing image, profile structured data, and a basic robots file are prepared.
- Use `npm run check`, `npm test`, `npm run audit`, and `npm run build` for local verification. Automated accessibility checks cover common issues; real-device and assistive-technology review remain useful.

## Content still needed

- Actual project screenshots or live-demo URLs, if available. Place supplied screenshots in `assets/projects/`; the website currently uses original architecture illustrations.
- A final visual check and CV save in the owner's normal browser. The installed headless browsers cancel PDF saves; the automated check verifies the download event, link, filename, PDF content type, and byte-for-byte delivery of the supplied file.

## Publishing stage — deferred by the owner

- Choose the final website URL and connect the repository.
- Set the canonical URL, `og:url`, and absolute social image URL. Generate a sitemap using that address.
- Configure the hosting deployment and HTTPS.
- Test the live links, PDF download, mobile layout, and social sharing preview.
