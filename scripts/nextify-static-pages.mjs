import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const legacyDir = path.join(root, 'legacy-html');
const pagesDir = path.join(root, 'pages');
const contentDir = path.join(root, 'components', 'page-content');

if (!fs.existsSync(legacyDir)) {
  throw new Error('Expected legacy-html/ to contain the source HTML files.');
}

fs.mkdirSync(contentDir, { recursive: true });

const htmlFiles = fs
  .readdirSync(legacyDir)
  .filter((file) => file.endsWith('.html'))
  .sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)));

function routeFromFile(file) {
  if (file === 'index.html') return '/';
  return `/${file.replace(/\.html$/, '')}`;
}

function pageFilename(file) {
  if (file === 'index.html') return 'index.tsx';
  return `${file.replace(/\.html$/, '')}.tsx`;
}

function pascalCase(value) {
  return value
    .replace(/\.html$/, '')
    .replace(/^index$/, 'home')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function extractTag(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : '';
}

function normalizeLocalUrls(markup) {
  let next = markup;

  for (const file of htmlFiles) {
    const route = routeFromFile(file);
    if (file === 'index.html') {
      next = next.replaceAll('href="index.html"', 'href="/"');
      next = next.replaceAll("href='index.html'", "href='/'");
      next = next.replaceAll('href="/index.html"', 'href="/"');
      next = next.replaceAll("href='/index.html'", "href='/'");
      continue;
    }

    next = next.replaceAll(`href="${file}"`, `href="${route}"`);
    next = next.replaceAll(`href='${file}'`, `href='${route}'`);
    next = next.replaceAll(`href="/${file}"`, `href="${route}"`);
    next = next.replaceAll(`href='/${file}'`, `href='${route}'`);
  }

  return next
    .replaceAll('src="assets/', 'src="/assets/')
    .replaceAll("src='assets/", "src='/assets/")
    .replaceAll('href="assets/', 'href="/assets/')
    .replaceAll("href='assets/", "href='/assets/");
}

function htmlToJsx(markup) {
  return normalizeLocalUrls(markup)
    .replace(/\bclass=/g, 'className=')
    .replace(/\bfor=/g, 'htmlFor=')
    .replace(/\benctype=/g, 'encType=')
    .replace(/\btabindex=/g, 'tabIndex=')
    .replace(/\breadonly=/g, 'readOnly=')
    .replace(/\bmaxlength=/g, 'maxLength=')
    .replace(/\bautofocus=/g, 'autoFocus=');
}

function literal(value) {
  return JSON.stringify(value);
}

const siteLayout = `import Head from 'next/head';
import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function SiteLayout({ title, description, children }: Props) {
  return (
    <>
      <Head>
        <title>{title}</title>
        {description ? <meta name="description" content={description} /> : null}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
      </Head>
      <Header />
      {children}
      <Footer />
    </>
  );
}
`;

fs.writeFileSync(path.join(root, 'components', 'SiteLayout.tsx'), siteLayout);

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(legacyDir, file), 'utf8');
  const title = extractTag(source, /<title>([\s\S]*?)<\/title>/i);
  const description = extractTag(source, /<meta\s+content="([^"]*)"\s+name="description"\s*\/?>/i);
  const main = extractTag(source, /<main[^>]*>([\s\S]*?)<\/main>/i);

  if (!main) {
    throw new Error(`Could not find a <main> element in ${file}`);
  }

  const baseName = pascalCase(file);
  const contentName = `${baseName}Content`;
  const pageName = `${baseName}Page`;
  const route = routeFromFile(file);
  const contentPath = path.join(contentDir, `${contentName}.tsx`);
  const pagePath = path.join(pagesDir, pageFilename(file));
  const pageToContent = file === 'index.html' ? '../components/page-content' : '../components/page-content';

  fs.writeFileSync(
    contentPath,
    `export default function ${contentName}() {
  return (
    <main>${htmlToJsx(main)}</main>
  );
}
`,
  );

  fs.writeFileSync(
    pagePath,
    `import SiteLayout from '../components/SiteLayout';
import ${contentName} from '${pageToContent}/${contentName}';

export default function ${pageName}() {
  return (
    <SiteLayout title={${literal(title)}}${description ? ` description={${literal(description)}}` : ''}>
      <${contentName} />
    </SiteLayout>
  );
}
`,
  );
}

for (const obsolete of [
  path.join(pagesDir, '[[...slug]].tsx'),
  path.join(root, 'components', 'StaticPage.tsx'),
  path.join(root, 'lib', 'static-page.ts'),
  path.join(root, 'lib', 'pages.ts'),
]) {
  if (fs.existsSync(obsolete)) {
    fs.unlinkSync(obsolete);
  }
}

const redirects = [
  { source: '/index.html', destination: '/', permanent: true },
  ...htmlFiles
    .filter((file) => file !== 'index.html')
    .map((file) => ({ source: `/${file}`, destination: routeFromFile(file), permanent: true })),
];

const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return ${JSON.stringify(redirects, null, 6)};
  },
};

module.exports = nextConfig;
`;

fs.writeFileSync(path.join(root, 'next.config.js'), nextConfig);

console.log(`Converted ${htmlFiles.length} legacy HTML files to Next.js pages and JSX content components.`);
