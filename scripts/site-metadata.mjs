import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export async function updateSiteMetadata() {
  const path = new URL('../index.html', import.meta.url);
  const updated = new Date();
  const iso = updated.toISOString();
  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Colombo', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(updated);
  const profile = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: 'Asen Mayuranga — Software Engineer',
    dateModified: iso,
    mainEntity: {
      '@type': 'Person',
      name: 'Asen Mayuranga Wijesiri',
      jobTitle: 'Software Engineer',
      description: 'Software engineer in Colombo, Sri Lanka, working with Java, Spring Boot, React, TypeScript, and Flutter.',
      sameAs: ['https://github.com/AshenMayuranga', 'https://www.linkedin.com/in/ashen-mayuranga-33a1a431a/'],
      knowsAbout: ['Java', 'Spring Boot', 'React', 'TypeScript', 'Flutter'],
    },
  };
  let html = await readFile(path, 'utf8');
  for (const marker of ['site-updated', 'profile-schema']) {
    if (!html.includes(`<!-- ${marker}:start -->`) || !html.includes(`<!-- ${marker}:end -->`)) {
      throw new Error(`Missing ${marker} markers in index.html`);
    }
  }
  html = html.replace(/<!-- site-updated:start -->[\s\S]*?<!-- site-updated:end -->/,
    `<!-- site-updated:start -->\n        <p class="last-updated">Last updated: <time id="last-updated" datetime="${iso}">${formatted}</time> <span>Sri Lanka (UTC+05:30)</span></p>\n        <!-- site-updated:end -->`);
  html = html.replace(/<!-- profile-schema:start -->[\s\S]*?<!-- profile-schema:end -->/,
    `<!-- profile-schema:start -->\n    <script type="application/ld+json">${JSON.stringify(profile).replaceAll('<', '\\u003c')}</script>\n    <!-- profile-schema:end -->`);
  await writeFile(path, html);
  console.log(`Last updated: ${formatted} — Sri Lanka (UTC+05:30).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await updateSiteMetadata();
