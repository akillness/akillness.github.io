#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';


import { fileURLToPath } from 'node:url';

// Dependency-free reader for this repository's deliberately scalar ad settings.
export function readAdConfig(file = new URL('../_config.yml', import.meta.url)) {
  const text = fs.readFileSync(file, 'utf8');
  const scalar = (v = '') => v.replace(/\s+#.*$/, '').trim().replace(/^(['"])(.*)\1$/, '$2');
  const setting = (key) => scalar(text.match(new RegExp('^' + key + ':([^\\n]*)', 'm'))?.[1]);
  const slots = text.match(/^google_ad_slots:\s*\n((?:[ \t]+[^\n]*\n|\n)*)/m)?.[1] || '';
  const slot = (key) => scalar(slots.match(new RegExp('^\\s+' + key + ':([^\\n]*)', 'm'))?.[1]);
  const config = { client: setting('google_ad_client'), minimum: Number(setting('google_ad_min_post_words') || 800), bottom: slot('post_bottom'), inArticle: slot('post_in_article') };
  if (!/^ca-pub-\d+$/.test(config.client) || !Number.isFinite(config.minimum) || config.minimum <= 0 || !/^\d+$/.test(config.bottom) || !/^\d+$/.test(config.inArticle)) throw new Error('Invalid or missing configured ad publisher, word minimum, or slots');
  return config;
}
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*(["'])(.*?)\2/gs)].map((m) => [m[1].toLowerCase(), m[3]]));
export function contentRegion(html, className) {
  const opening = [...html.matchAll(/<div\b[^>]*>/gi)].find((m) => (attributes(m[0]).class || '').split(/\s+/).includes(className));
  if (!opening) return null;
  const start = opening.index + opening[0].length;
  let depth = 1;
  for (const match of html.slice(start).matchAll(/<\/?div\b[^>]*>/gi)) {
    depth += /^<\//.test(match[0]) ? -1 : 1;
    if (depth === 0) return { body: html.slice(start, start + match.index), start: opening.index, end: start + match.index + match[0].length };
  }
  return null;
}
export function expectsInArticle(content) {
  // Mirrors current post-content.html, not the superseded 600-word heuristic.
  let region;
  while ((region = contentRegion(content, 'post-ad-in-article'))) content = content.slice(0, region.start) + content.slice(region.end);
  const blocks = content.replaceAll('</p>', '</p><!--ad-anchor-->').split('<!--ad-anchor-->');
  while (blocks.at(-1) === '') blocks.pop(); // Ruby Liquid split drops empty tails.
  if (blocks.length < 8) return false;
  const midpoint = Math.floor(blocks.length / 2);
  return blocks.some((_, i) => i + 1 >= midpoint && blocks.length - i > 2 && ['<p', '<h'].includes((blocks[i + 1] || '').trim().slice(0, 2)));
}
export function verifyAdBoundary(html, { route, eligible = false, config, inArticleExpected = false, ownership = true }) {
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  const errors = [];
  const require = (ok, message) => { if (!ok) errors.push(message + ': ' + route); };
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => attributes(m[0])).filter((a) => a.name === 'google-adsense-account');
  if (ownership) require(metas.length === 1 && metas[0].content === config.client, 'ownership meta must name configured publisher exactly once');
  const loaders = [...html.matchAll(/<script\b[^>]*>/gi)].map((m) => attributes(m[0])).filter((a) => /adsbygoogle\.js/i.test(a.src || ''));
  require(loaders.length === (eligible ? 1 : 0), eligible ? 'eligible post must have exactly one loader' : 'protected page has an ad loader');
  for (const loader of loaders) {
    let url; try { url = new URL(loader.src.replaceAll('&amp;', '&')); } catch {}
    require(url?.origin === 'https://pagead2.googlesyndication.com' && url.pathname === '/pagead/js/adsbygoogle.js' && url.searchParams.getAll('client').length === 1 && url.searchParams.get('client') === config.client, 'loader must use exact configured publisher');
  }
  const units = [...html.matchAll(/<ins\b[^>]*>/gi)].map((m) => attributes(m[0])).filter((a) => (a.class || '').split(/\s+/).includes('adsbygoogle') || a['data-ad-slot']);
  const expected = eligible ? [config.bottom, ...(inArticleExpected ? [config.inArticle] : [])] : [];
  require(units.length === expected.length, 'unexpected ad unit count (expected ' + expected.length + ', got ' + units.length + ')');
  for (const slot of new Set(expected)) require(units.filter((a) => a['data-ad-slot'] === slot).length === expected.filter((s) => s === slot).length, 'configured slot missing or duplicated ' + slot);
  for (const unit of units) {
    require(unit['data-ad-client'] === config.client, 'ad unit has wrong publisher');
    require(expected.includes(unit['data-ad-slot']), 'unexpected ad slot');
    require(!/(display\s*:\s*none|visibility\s*:\s*hidden)/i.test(unit.style || ''), 'hidden ad unit');
  }
  if (eligible) {
    for (const [className, slot] of [['post-ad-bottom', config.bottom], ...(inArticleExpected ? [['post-ad-in-article', config.inArticle]] : [])]) {
      const body = contentRegion(html, className)?.body || '';
      require([...body.matchAll(/<ins\b[^>]*>/gi)].some((m) => attributes(m[0])['data-ad-slot'] === slot), 'configured slot outside ' + className);
    }
  }
  return errors;
}

// The tag-archive floor lives in _config.yml so the plugin that builds the pages
// and the verifier that audits them read one number.
export function readTagArchiveMinimum(file = new URL('../_config.yml', import.meta.url)) {
  return readArchiveMinimum('tag_archive_min_posts', file);
}

// Same contract for generated category pages.
export function readCategoryArchiveMinimum(file = new URL('../_config.yml', import.meta.url)) {
  return readArchiveMinimum('category_archive_min_posts', file);
}

function readArchiveMinimum(key, file) {
  const raw = fs.readFileSync(file, 'utf8').match(new RegExp(`^${key}:([^\\n]*)`, 'm'))?.[1];
  const value = Number((raw ?? '').replace(/\s+#.*$/, '').trim());
  if (!Number.isInteger(value) || value < 2) throw new Error(`${key} must be an integer >= 2`);
  return value;
}

function main() {
const adConfig = readAdConfig();
const tagArchiveMinimum = readTagArchiveMinimum();
const categoryArchiveMinimum = readCategoryArchiveMinimum();
const siteDir = path.resolve(process.argv[2] || '_site');
const origin = 'https://akillness.github.io';
// This is a project review floor for legacy stubs, not a Google word-count requirement.
const indexableWordFloor = 300;
const failures = [];
const listingSurfaces = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const read = (...parts) => fs.readFileSync(path.join(siteDir, ...parts), 'utf8');
const exists = (...parts) => fs.existsSync(path.join(siteDir, ...parts));

check(exists('sitemap.xml'), 'sitemap.xml is missing');
const sitemap = exists('sitemap.xml') ? read('sitemap.xml') : '';
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
  match[1].replaceAll('&amp;', '&')
);

check(exists('robots.txt'), 'robots.txt is missing');
const robotsTxt = exists('robots.txt') ? read('robots.txt') : '';
check(/^User-agent:\s*\*\s*$/im.test(robotsTxt), 'robots.txt does not address all crawlers');
check(/^Sitemap:\s*https:\/\/akillness\.github\.io\/sitemap\.xml\s*$/im.test(robotsTxt), 'robots.txt does not advertise the canonical sitemap');
check(!/^Disallow:\s*\/\s*$/im.test(robotsTxt), 'robots.txt blocks the entire site');

const archivePattern = /^https:\/\/akillness\.github\.io\/(tags|categories)\/[^/]+\/$/;
check(!locations.some((url) => archivePattern.test(url)), 'generated tag/category detail page is in sitemap.xml');
check(!locations.some((url) => url.startsWith(`${origin}/assets/`)), 'static asset is in sitemap.xml');
for (const url of [`${origin}/portfolio/`, `${origin}/resume/`, `${origin}/resume_eng/`, `${origin}/docs/google-adsense-monetization-guide/`, `${origin}/google06c53db253d71ce5.html`]) {
  check(!locations.includes(url), `${url} should not be in sitemap.xml`);
}
for (const required of [`${origin}/`, `${origin}/about/`, `${origin}/projects/`, `${origin}/start-here/`]) {
  check(locations.includes(required), `${required} is missing from sitemap.xml`);
}

const retiredSlugs = [
  'web-gl',
  'what-is-kubernetes',
  'googleio-chatgpt4o',
  'generativeai-term',
  'use-dev-tools',
  'llm-agents-eval',
  'llm-mitigate-inference-bottleneck',
  'graph-analytic',
  'visualization-of-architecture-on-aws',
  'most-popular-devops-tools',
  '60-most-useful-ai-tools',
  'git-in-a-Nutshell',
  'software-development-cycle',
  'generative-ai-eco-system',
  'key-data-term-quick-guid',
  'improving-the-performance-llm',
  'microservices-popular-architectural-style',
  'the-most-popular-use-cases-for-udp',
  'ensuring-data-quality-in-machine-learning',
  'essential-statistical-concepts-must-know',
  'explore-the-landscape-of-open-source-data-engineering',
  'strategies-to-scale-database',
  'google-adsense-monetization-strategy',
  'timeseriesfm-googleai',
  'try-implementing-rag-using-langchain',
  'rag-new-addition',
  'agentic-data-analyst',
  'gradio-transformerjs',
  'llm-systems-using-llmops',
  'survey-on-llm-based-autonomous-agents',
  'the-most-optimal-rag-configuration'
];
for (const slug of retiredSlugs) {
  const variants = new Set([slug, slug.toLowerCase()]);
  for (const variant of variants) {
    check(!exists('posts', variant, 'index.html'), `retired post was built: /posts/${variant}/`);
  }
  check(
    !locations.some((url) => url.toLowerCase() === `${origin}/posts/${slug}/`.toLowerCase()),
    `retired post is in sitemap: /posts/${slug}/`
  );
}

let archiveCount = 0;
const builtArchiveSlugs = { tags: new Set(), categories: new Set() };
for (const root of ['tags', 'categories']) {
  const dir = path.join(siteDir, root);
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(dir, entry.name, 'index.html');
    if (!fs.existsSync(file)) continue;
    archiveCount += 1;
    builtArchiveSlugs[root].add(entry.name);
    const html = fs.readFileSync(file, 'utf8');
    listingSurfaces.push({ route: `/${root}/${entry.name}/`, html });
    check(/<meta name="robots" content="[^"]*noindex[^"]*">/i.test(html), `archive lacks noindex: /${root}/${entry.name}/`);
    failures.push(...verifyAdBoundary(html, { route: `/${root}/${entry.name}/`, config: adConfig }));
    // An archive that lists fewer posts than the floor is an auto-generated page
    // with no content of its own; _plugins/archive_quality_policy.rb must not
    // have built it. Assert on the artifact, not on the plugin's own report.
    const floor = root === 'tags' ? tagArchiveMinimum : categoryArchiveMinimum;
    const kind = root === 'tags' ? 'tag' : 'category';
    const listed = (html.match(/<li class="d-flex justify-content-between/g) || []).length;
    const advertised = Number(html.match(/<span class="lead text-muted ps-2">\s*(\d+)\s*<\/span>/)?.[1] ?? NaN);
    check(listed >= floor, `${kind} archive lists ${listed} post(s), below the ${floor} floor: /${root}/${entry.name}/`);
    check(advertised === listed, `${kind} archive advertises ${advertised} but lists ${listed}: /${root}/${entry.name}/`);
  }
}
check(archiveCount > 0, 'no generated archive pages were found');
check(builtArchiveSlugs.tags.size > 0, 'no generated tag pages were found');

// Removing pages only helps if nothing still points at them. Walk every built
// page and require each archive link to resolve, so the page set and the link
// set cannot drift the way search and advertising once did.
const builtHtmlFiles = [];
(function collectHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'assets') collectHtml(full);
    } else if (entry.name.endsWith('.html')) {
      builtHtmlFiles.push(full);
    }
  }
})(siteDir);
const archiveHrefPattern = /href="(?:https:\/\/akillness\.github\.io)?\/(tags|categories)\/([^/"#?]+)\/"/g;
const danglingArchiveLinks = new Map();
for (const file of builtHtmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const [, root, slug] of html.matchAll(archiveHrefPattern)) {
    if (builtArchiveSlugs[root].has(slug)) continue;
    const key = `/${root}/${slug}/`;
    if (danglingArchiveLinks.has(key)) continue;
    danglingArchiveLinks.set(key, `/${path.relative(siteDir, file).split(path.sep).join('/')}`.replace(/index\.html$/, ''));
  }
}
for (const [target, source] of danglingArchiveLinks) {
  check(false, `link points at an archive page that was not built: ${target} (from ${source})`);
}

const tagsHubHtml = exists('tags', 'index.html') ? read('tags', 'index.html') : '';
const hubTagSlugs = new Set([...tagsHubHtml.matchAll(/class="tag" href="\/tags\/([^/"#?]+)\/"/g)].map((match) => match[1]));
check(
  hubTagSlugs.size === builtArchiveSlugs.tags.size,
  `/tags/ lists ${hubTagSlugs.size} tag pages but ${builtArchiveSlugs.tags.size} were built`
);

let paginationCount = 0;
for (const entry of fs.readdirSync(siteDir, { withFileTypes: true })) {
  if (!entry.isDirectory() || !/^page\d+$/.test(entry.name)) continue;
  const file = path.join(siteDir, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  paginationCount += 1;
  const route = `/${entry.name}/`;
  const html = fs.readFileSync(file, 'utf8');
  listingSurfaces.push({ route, html });
  check(/<meta name="robots" content="[^"]*noindex[^"]*">/i.test(html), `pagination lacks noindex: ${route}`);
  const cardCount = (html.match(/<article\b[^>]*class="[^"]*card-wrapper\b/gi) || []).length;
  check(cardCount > 0, `orphan pagination page has no visible posts: ${route}`);
  const pageIndex = html.match(/<li class="page-index[^>]*>[\s\S]*?<span>(\d+)<\/span>[\s\S]*?<span[^>]*>\/\s*(\d+)<\/span>/i);
  if (pageIndex) check(Number(pageIndex[1]) <= Number(pageIndex[2]), `pagination index exceeds visible total: ${route}`);
  failures.push(...verifyAdBoundary(html, { route, config: adConfig }));
  check(!locations.includes(`${origin}${route}`), `pagination is in sitemap.xml: ${route}`);
}
check(paginationCount > 0, 'no paginated home pages were found');

const postsRoot = path.join(siteDir, 'posts');
const postEntries = fs.existsSync(postsRoot)
  ? fs.readdirSync(postsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  : [];
let monetizedPosts = 0;
let nonMonetizedPosts = 0;
let noindexPosts = 0;
const noindexRoutes = [];
for (const entry of postEntries) {
  const file = path.join(postsRoot, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const route = `/posts/${entry.name}/`;
  check(/<html lang="(?:en|ko)"/i.test(html), `invalid or missing html lang: ${route}`);
  check(!/<meta name="description"[^>]*\{%/i.test(html), `Liquid leaked into meta description: ${route}`);
  check(!html.includes('user-scalable=no'), `zoom is disabled: ${route}`);
  check(!/<meta[^>]+http-equiv=["']?refresh/i.test(html), `automatic refresh is present: ${route}`);
  check(!/<link[^>]+rel=["'][^"']*prerender/i.test(html), `browser prerender hint is present: ${route}`);

  const article = html.match(/<article\b[\s\S]*?<\/article>/i)?.[0] || '';
  check(Boolean(article), `article element missing: ${route}`);
  const h1Count = (article.match(/<h1\b/gi) || []).length;
  check(h1Count === 1, `article must contain exactly one h1 (${h1Count} found): ${route}`);
  check(/href="\/about\/"[^>]*>Jang Young Jeong<\/a>/i.test(article), `author byline does not link to About: ${route}`);

  const eligibility = article.match(/data-monetization-eligible="(true|false)"/i)?.[1];
  const words = Number(article.match(/data-content-words="(\d+)"/i)?.[1]);
  const robotsDirective = html.match(/<meta name="robots" content="([^"]+)"/i)?.[1] || '';
  const isNoindex = robotsDirective.toLowerCase().includes('noindex');
  check(Boolean(eligibility), `monetization marker missing: ${route}`);
  check(Number.isFinite(words), `content word count marker missing: ${route}`);
  const hasLoader = html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
  const hasSlot = /data-ad-slot="\d+"/i.test(article);
  const body = contentRegion(article, 'content');
  check(Boolean(body), 'article content region missing: ' + route);
  failures.push(...verifyAdBoundary(html, { route, config: adConfig, eligible: eligibility === 'true' && !isNoindex, inArticleExpected: expectsInArticle(body?.body || '') }));
  const hasCta = /class="[^"]*post-cta\b/i.test(article);
  const hasHiddenAd = [...article.matchAll(/<ins\b[^>]*>/gi)].some(
    ([tag]) => /adsbygoogle/i.test(tag) && /(display\s*:\s*none|visibility\s*:\s*hidden)/i.test(tag)
  );
  check(!hasHiddenAd, `hidden AdSense unit is present: ${route}`);
  if (Number.isFinite(words) && words < indexableWordFloor) {
    check(isNoindex, `legacy stub below ${indexableWordFloor} words is indexable (${words}): ${route}`);
  }
  if (isNoindex) {
    noindexPosts += 1;
    noindexRoutes.push(route);
    check(!locations.includes(`${origin}${route}`), `noindex post is in sitemap: ${route}`);
    check(eligibility === 'false', `noindex post is monetization-eligible: ${route}`);
    check(!hasLoader && !hasSlot && !hasCta, `noindex post has a commercial surface: ${route}`);
  }
  if (eligibility === 'true') {
    monetizedPosts += 1;
    check(words >= adConfig.minimum, `post below configured ${adConfig.minimum} words is monetized (${words}): ${route}`);
    check(hasLoader && hasSlot && hasCta, `eligible post is missing loader, slot, or CTA: ${route}`);
  } else if (eligibility === 'false') {
    nonMonetizedPosts += 1;
    check(!hasLoader && !hasSlot && !hasCta, `ineligible post has a commercial surface: ${route}`);
    // /about/, /start-here/ and /terms/ promise removal from search *and*
    // advertising. Withdrawing the ads while leaving the page in the index is the
    // half-applied boundary that made 40% of the indexed archive contradict the
    // published standard, so the artifact has to prove both halves together.
    check(isNoindex, `post held back from advertising is still indexable (${words}): ${route}`);
  }

  const jsonScripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  let blogPosting = null;
  for (const match of jsonScripts) {
    try {
      const data = JSON.parse(match[1]);
      const types = Array.isArray(data['@type']) ? data['@type'] : [data['@type']];
      if (types.includes('BlogPosting')) blogPosting = data;
    } catch (error) {
      failures.push(`invalid JSON-LD at ${route}: ${error.message}`);
    }
  }
  check(Boolean(blogPosting), `BlogPosting JSON-LD missing: ${route}`);
  if (blogPosting) {
    check(blogPosting.author?.name === 'Jang Young Jeong', `JSON-LD author name missing: ${route}`);
    check(blogPosting.author?.url === `${origin}/about/`, `JSON-LD author URL missing: ${route}`);
  }
}
check(postEntries.length > 0, 'no built posts were found');
check(monetizedPosts > 0, 'no eligible monetized posts were found');
check(nonMonetizedPosts > 0, 'no protected non-monetized posts were found');
for (const route of [
  '/posts/family-life-blog-roundup/',
  '/posts/serach-utility/',
  '/posts/study-vae/',
  '/posts/googleio-review/',
  '/posts/llama-cpp-ggml-simple-matmul/'
]) {
  check(noindexRoutes.includes(route), `required protected post is still indexable: ${route}`);
}

const home = exists('index.html') ? read('index.html') : '';
listingSurfaces.push({ route: '/', html: home });
check(/<html lang="en"/i.test(home), 'home page is not English');
failures.push(...verifyAdBoundary(home, { route: '/', config: adConfig }));
const navigationRoutes = ['/', '/start-here/', '/categories/', '/tags/', '/archives/', '/about/', '/projects/', '/work-with-me/', '/contact/', '/privacy/', '/terms/'];
for (const route of navigationRoutes) {
  const output = route === '/' ? ['index.html'] : [route.slice(1, -1), 'index.html'];
  check(exists(...output), `navigation target is missing: ${route}`);
}
const sidebar = home.match(/<aside\b[^>]*id="sidebar"[\s\S]*?<\/aside>/i)?.[0] || '';
const footer = home.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] || '';
check(Boolean(sidebar), 'home sidebar is missing');
check(Boolean(footer), 'home footer is missing');
for (const route of ['/', '/start-here/', '/categories/', '/tags/', '/about/', '/projects/', '/work-with-me/']) {
  check(sidebar.includes(`href="${route}"`), `home sidebar does not link to: ${route}`);
}
for (const route of ['/archives/', '/contact/', '/privacy/', '/terms/']) {
  check(!sidebar.includes(`href="${route}"`), `home sidebar still links to footer-only route: ${route}`);
  check(footer.includes(`href="${route}"`), `home footer does not preserve access to: ${route}`);
}
for (const route of ['about', 'projects', 'start-here', 'work-with-me', 'contact', 'privacy', 'terms', 'archives', 'categories', 'tags']) {
  const html = exists(route, 'index.html') ? read(route, 'index.html') : '';
  failures.push(...verifyAdBoundary(html, { route: `/${route}/`, config: adConfig }));
}
const about = exists('about', 'index.html') ? read('about', 'index.html') : '';
check((about.match(/googletagmanager\.com\/gtag\/js/g) || []).length === 1, '/about/ must load Google Analytics exactly once');

const archivesHtml = exists('archives', 'index.html') ? read('archives', 'index.html') : '';
const feedHtml = exists('feed.xml') ? read('feed.xml') : '';
const searchJson = exists('assets', 'js', 'data', 'search.json') ? read('assets', 'js', 'data', 'search.json') : '';
const searchMetaJson = exists('assets', 'js', 'data', 'search-meta.json') ? read('assets', 'js', 'data', 'search-meta.json') : '';
listingSurfaces.push({ route: '/archives/', html: archivesHtml });
for (const route of noindexRoutes) {
  for (const surface of listingSurfaces) {
    check(!surface.html.includes(route), `noindex post ${route} is linked from listing ${surface.route}`);
  }
  check(!feedHtml.includes(route), `noindex post is present in feed.xml: ${route}`);
  check(!searchJson.includes(route), `noindex post is present in search.json: ${route}`);
  check(!searchMetaJson.includes(route), `noindex post is present in search-meta.json: ${route}`);
}

// Removing a post from search, the sitemap, the feed and every listing does not
// remove it from the crawlable surface while one live post still links it. The
// older/newer nav walked raw site.posts, so a crawler starting at any live post
// reached all 117 retired reposts through it (2026-09-18 live crawl). Assert on
// the built artifact: neither related-posts nor post-navigation may name one.
let postsWithNavLink = 0;
const noindexRouteSet = new Set(noindexRoutes);
for (const entry of postEntries) {
  const file = path.join(postsRoot, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const related = html.match(/<aside\b[^>]*id="related-posts"[\s\S]*?<\/aside>/i)?.[0] || '';
  for (const route of noindexRoutes) {
    check(!related.includes(route), `related-posts links to noindex post ${route} from /posts/${entry.name}/`);
  }
  const nav = html.match(/<nav\b[^>]*class="[^"]*post-navigation\b[\s\S]*?<\/nav>/i)?.[0] || '';
  check(Boolean(nav), `post-navigation is missing: /posts/${entry.name}/`);
  const navTargets = [...nav.matchAll(/href="(?:https:\/\/akillness\.github\.io)?(\/posts\/[^"#?]*\/)"/g)].map((match) => match[1]);
  if (navTargets.length) postsWithNavLink += 1;
  for (const target of navTargets) {
    check(!noindexRouteSet.has(target), `post-navigation links to noindex post ${target} from /posts/${entry.name}/`);
  }
}
// Fail closed on the opposite mistake: a filter that drops every neighbour would
// also pass the check above while silently deleting the whole nav.
check(postsWithNavLink > 0, 'no post links a neighbour from post-navigation');

const koreanPost = exists('posts', 'googleio-review', 'index.html') ? read('posts', 'googleio-review', 'index.html') : '';
check(/<html lang="ko"/i.test(koreanPost), 'Korean post language override failed');
const notFound = exists('404.html') ? read('404.html') : '';
failures.push(...verifyAdBoundary(notFound, { route: '/404.html', config: adConfig }));
// Search is currently an in-page panel, not a standalone route. Guard a future standalone page if present.
if (exists('search', 'index.html')) failures.push(...verifyAdBoundary(read('search', 'index.html'), { route: '/search/', config: adConfig }));
for (const route of ['portfolio', 'resume', 'resume_eng']) {
  const html = exists(route, 'index.html') ? read(route, 'index.html') : '';
  check(/<meta name="robots" content="[^"]*noindex[^"]*">/i.test(html), `/${route}/ lacks noindex`);
  failures.push(...verifyAdBoundary(html, { route: `/${route}/`, config: adConfig, ownership: false }));
}
const portfolio = exists('portfolio', 'index.html') ? read('portfolio', 'index.html') : '';
check(portfolio.includes('<link rel="canonical" href="https://akillness.github.io/projects/">'), '/portfolio/ canonical does not point to /projects/');
const internalGuide = exists('docs', 'google-adsense-monetization-guide', 'index.html')
  ? read('docs', 'google-adsense-monetization-guide', 'index.html')
  : '';
check(/<meta name="robots" content="[^"]*noindex[^"]*">/i.test(internalGuide), 'internal AdSense guide lacks noindex');
failures.push(...verifyAdBoundary(internalGuide, { route: '/docs/google-adsense-monetization-guide/', config: adConfig }));

if (failures.length) {
  console.error(`Site quality verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Site quality verification passed: ${locations.length} sitemap URLs, ${postEntries.length} posts, ${archiveCount} noindex archives (${builtArchiveSlugs.tags.size} tags at >= ${tagArchiveMinimum} posts, ${builtArchiveSlugs.categories.size} categories at >= ${categoryArchiveMinimum} posts), ${paginationCount} noindex pagination pages, ${noindexPosts} noindex posts, ${monetizedPosts} monetized posts, ${nonMonetizedPosts} protected posts.`);

}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
