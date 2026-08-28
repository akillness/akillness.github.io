#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const siteDir = path.resolve(process.argv[2] || '_site');
const origin = 'https://akillness.github.io';
const failures = [];
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
  'google-adsense-monetization-strategy'
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
for (const root of ['tags', 'categories']) {
  const dir = path.join(siteDir, root);
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(dir, entry.name, 'index.html');
    if (!fs.existsSync(file)) continue;
    archiveCount += 1;
    const html = fs.readFileSync(file, 'utf8');
    check(/<meta name="robots" content="[^"]*noindex[^"]*">/i.test(html), `archive lacks noindex: /${root}/${entry.name}/`);
    check(!html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'), `archive loads AdSense: /${root}/${entry.name}/`);
  }
}
check(archiveCount > 0, 'no generated archive pages were found');

const postsRoot = path.join(siteDir, 'posts');
const postEntries = fs.existsSync(postsRoot)
  ? fs.readdirSync(postsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  : [];
let monetizedPosts = 0;
let nonMonetizedPosts = 0;
for (const entry of postEntries) {
  const file = path.join(postsRoot, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const route = `/posts/${entry.name}/`;
  check(/<html lang="(?:en|ko)"/i.test(html), `invalid or missing html lang: ${route}`);
  check(!/<meta name="description"[^>]*\{%/i.test(html), `Liquid leaked into meta description: ${route}`);
  check(!html.includes('user-scalable=no'), `zoom is disabled: ${route}`);

  const article = html.match(/<article\b[\s\S]*?<\/article>/i)?.[0] || '';
  check(Boolean(article), `article element missing: ${route}`);
  const h1Count = (article.match(/<h1\b/gi) || []).length;
  check(h1Count === 1, `article must contain exactly one h1 (${h1Count} found): ${route}`);
  check(/href="\/about\/"[^>]*>Jang Young Jeong<\/a>/i.test(article), `author byline does not link to About: ${route}`);

  const eligibility = article.match(/data-monetization-eligible="(true|false)"/i)?.[1];
  const words = Number(article.match(/data-content-words="(\d+)"/i)?.[1]);
  check(Boolean(eligibility), `monetization marker missing: ${route}`);
  check(Number.isFinite(words), `content word count marker missing: ${route}`);
  const hasLoader = html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
  const hasSlot = /data-ad-slot="\d+"/i.test(article);
  const hasCta = /class="[^"]*post-cta\b/i.test(article);
  if (eligibility === 'true') {
    monetizedPosts += 1;
    check(words >= 800, `post below 800 words is monetized (${words}): ${route}`);
    check(hasLoader && hasSlot && hasCta, `eligible post is missing loader, slot, or CTA: ${route}`);
  } else if (eligibility === 'false') {
    nonMonetizedPosts += 1;
    check(!hasLoader && !hasSlot && !hasCta, `ineligible post has a commercial surface: ${route}`);
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

const home = exists('index.html') ? read('index.html') : '';
check(/<html lang="en"/i.test(home), 'home page is not English');
check(home.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'), 'home page is missing the AdSense ownership loader');
for (const route of ['about', 'projects', 'start-here', 'work-with-me', 'contact', 'privacy', 'terms', 'archives', 'categories', 'tags']) {
  const html = exists(route, 'index.html') ? read(route, 'index.html') : '';
  check(!html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'), `/${route}/ unexpectedly loads AdSense`);
}
const about = exists('about', 'index.html') ? read('about', 'index.html') : '';
check((about.match(/googletagmanager\.com\/gtag\/js/g) || []).length === 1, '/about/ must load Google Analytics exactly once');
const koreanPost = exists('posts', 'googleio-review', 'index.html') ? read('posts', 'googleio-review', 'index.html') : '';
check(/<html lang="ko"/i.test(koreanPost), 'Korean post language override failed');
const notFound = exists('404.html') ? read('404.html') : '';
check(!notFound.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'), '404 page loads AdSense');
for (const route of ['portfolio', 'resume', 'resume_eng']) {
  const html = exists(route, 'index.html') ? read(route, 'index.html') : '';
  check(/<meta name="robots" content="[^"]*noindex[^"]*">/i.test(html), `/${route}/ lacks noindex`);
}
const portfolio = exists('portfolio', 'index.html') ? read('portfolio', 'index.html') : '';
check(portfolio.includes('<link rel="canonical" href="https://akillness.github.io/projects/">'), '/portfolio/ canonical does not point to /projects/');
const internalGuide = exists('docs', 'google-adsense-monetization-guide', 'index.html')
  ? read('docs', 'google-adsense-monetization-guide', 'index.html')
  : '';
check(/<meta name="robots" content="[^"]*noindex[^"]*">/i.test(internalGuide), 'internal AdSense guide lacks noindex');
check(!internalGuide.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'), 'internal AdSense guide loads AdSense');

if (failures.length) {
  console.error(`Site quality verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Site quality verification passed: ${locations.length} sitemap URLs, ${postEntries.length} posts, ${archiveCount} noindex archives, ${monetizedPosts} monetized posts, ${nonMonetizedPosts} protected posts.`);
