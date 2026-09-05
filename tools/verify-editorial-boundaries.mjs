#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  MAX_REFERENCE_IMAGE_BYTES,
  MAX_REFERENCE_IMAGE_TOTAL_BYTES,
  MAXIMUM_REFERENCE_IMAGES,
  MINIMUM_REFERENCE_IMAGES,
  SOURCE_IMAGE_CONTRACT_EFFECTIVE_DATE,
  extractSourceImageFigures,
  sourceImageContractAppliesToStem,
  hasValidImageExtension,
  inspectRasterImage
} from './lib/source-image-manifest.mjs';

const root = path.resolve(process.argv[2] || process.cwd());
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const protectedPosts = [
  '_posts/2017/02/2017-02-20-family-life-blog-roundup.md',
  '_posts/2024/03/2024-03-31-serach-utility.md',
  '_posts/2024/04/2024-04-17-study-vae.md',
  '_posts/2024/05/2024-05-15-googleio-review.md',
  '_posts/2024/07/2024-07-12-llama-cpp-ggml-simple-matmul.md'
];
for (const file of protectedPosts) {
  const text = read(file);
  const frontMatter = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1] || '';
  check(/^robots:\s*noindex, follow$/m.test(frontMatter), `${file} is not noindex, follow`);
  check(/^sitemap:\s*false$/m.test(frontMatter), `${file} is not excluded from the sitemap`);
  check(/^ads:\s*false$/m.test(frontMatter), `${file} does not explicitly disable ads`);
}

const sourceChecks = [
  ['_layouts/home.html', "robots contains 'noindex'"],
  ['_layouts/archives.html', "robots contains 'noindex'"],
  ['_layouts/tag.html', "robots contains 'noindex'"],
  ['_layouts/category.html', "robots contains 'noindex'"],
  ['_layouts/categories.html', "robots contains 'noindex'"],
  ['_layouts/tags.html', "robots contains 'noindex'"],
  ['_includes/update-list.html', "robots contains 'noindex'"],
  ['_includes/trending-tags.html', "robots contains 'noindex'"],
  ['_includes/related-posts.html', "robots contains 'noindex'"],
  ['assets/js/data/search.json', "robots contains 'noindex'"],
  ['assets/js/data/search-meta.json', "robots contains 'noindex'"],
  ['assets/feed.xml', "robots contains 'noindex'"]
];
for (const [file, phrase] of sourceChecks) check(read(file).includes(phrase), `${file} does not filter ${phrase}`);

const related = read('_includes/related-posts.html');
check(!related.includes('push: site.categories'), 'related-posts still pushes a category array as one nested item');
check(!related.includes('push: site.tags'), 'related-posts still pushes a tag array as one nested item');
check(related.includes('match_urls contains candidate.url'), 'related-posts does not deduplicate candidates by URL');
check(!related.includes('content=post.content'), 'related-posts excerpt still parses full post.content');

const home = read('_layouts/home.html');
check(home.includes('post.description | default: post.excerpt'), 'home cards do not prefer description/excerpt');
check(!home.includes('content=post.content'), 'home cards still parse full post.content');
check(home.includes('visible_total_pages'), 'home pagination does not use the filtered visible count');

const searchMeta = read('assets/js/data/search-meta.json');
check(!searchMeta.includes('content=post.content'), 'search-meta tier still loads full post bodies');
check(searchMeta.includes('post.description | default: post.excerpt'), 'search-meta does not use description/excerpt');
const search = read('assets/js/data/search.json');
check(search.includes('"content":'), 'full-text search tier lost its content field');
const feed = read('assets/feed.xml');
check(!feed.includes('content=post.content'), 'feed still renders full body just to make a summary');
check(feed.includes('post.description | default: post.summary | default: post.excerpt'), 'feed does not prefer editorial summaries');

const generator = read('tools/naver-blog-sync.py');
check(generator.includes('extra_categories = sorted'), 'Naver generator can still drop unknown categories');
for (const line of [
  'lines.append("lang: ko")',
  'lines.append("robots: noindex, follow")',
  'lines.append("sitemap: false")',
  'lines.append("ads: false")'
]) check(generator.includes(line), `Naver generator does not preserve ${line}`);

const plugin = read('_plugins/archive_quality_policy.rb');
check(plugin.includes("post.data['hidden'] = true"), 'noindex posts are not hidden before jekyll-paginate counts them');
check(plugin.includes('priority :highest'), 'noindex pagination policy does not run before jekyll-paginate');
check(plugin.includes('page.url.match?'), 'archive policy does not classify pagination URLs');
check(plugin.includes("page.data['sitemap'] = false"), 'archive policy does not exclude generated pages from sitemap');
const head = read('_includes/head.html');
check(head.includes('paginator.page > 1'), 'head does not render pagination noindex as a fallback');

// The published editorial standard on /about/, /start-here/ and /terms/ promises
// that a post without enough original analysis leaves search AND advertising.
// Advertising was enforced by word count from the start; search was not, so the
// site advertised a boundary it only half applied. The three front-matter keys are
// what actually carry the boundary through every listing, feed, search tier and
// the sitemap, so they must always travel together: withdrawing ads without
// withdrawing the page from search is the exact contradiction to prevent.
const promisePages = ['_tabs/about.md', '_tabs/start-here.md', '_tabs/terms.md'];
for (const file of promisePages) {
  check(read(file).includes('removed from search and advertising'), `${file} no longer states the search-and-advertising boundary`);
}
const adsense = read('_includes/adsense.html');
check(adsense.includes('ad_client_configured'), 'adsense include does not separate publisher configuration from ad eligibility');
check(
  /\{%\s*if ad_client_configured\s*%\}\s*<meta name="google-adsense-account"/.test(adsense),
  'ownership meta tag is still gated behind ad eligibility instead of shipping site-wide'
);
check(adsense.includes('{% if adsense_allowed and ad_client_configured %}'), 'ad loader is no longer gated by the editorial ad boundary');

const scopeTool = read('tools/verify-publication-scope.mjs');
check(scopeTool.includes("git', ['diff', '--cached'"), 'Publication scope tool does not verify staged paths');
check(scopeTool.includes('Live article target already exists'), 'Publication scope tool does not block live article collisions');
check(scopeTool.includes('referenceImages.length >= MINIMUM_REFERENCE_IMAGES && referenceImages.length <= MAXIMUM_REFERENCE_IMAGES'), 'Publication scope tool does not unconditionally enforce the 4–12 source-image count band');

const walkFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) check(false, `Published source-image tree contains a symlink: ${path.relative(root, full)}`);
    else if (entry.isDirectory()) found.push(...walkFiles(full));
    else if (entry.isFile()) found.push(full);
    else check(false, `Published source-image tree contains a non-regular entry: ${path.relative(root, full)}`);
  }
  return found;
};
const postFiles = walkFiles(path.join(root, '_posts')).filter((file) => file.endsWith('.md'));

// A post held back from advertising must also be held back from search, and the
// reverse. Enforcing the triple at the source is what makes the boundary cascade:
// every listing, the feed, both search tiers, related-posts and the sitemap all
// key off `robots: noindex`, and `ads: false` is what keeps the ad loader off the
// page. Splitting them is how the site ended up advertising a search boundary it
// never applied to 109 posts.
let boundedPosts = 0;
for (const file of postFiles) {
  const frontMatter = fs.readFileSync(file, 'utf8').split(/^---\s*$/m)[1] || '';
  const noindex = /^robots:\s*noindex, follow$/m.test(frontMatter);
  const outOfSitemap = /^sitemap:\s*false$/m.test(frontMatter);
  const noAds = /^ads:\s*false$/m.test(frontMatter);
  if (!noindex && !outOfSitemap && !noAds) continue;
  boundedPosts += 1;
  const relative = path.relative(root, file);
  check(noindex, `${relative}: withheld from advertising or the sitemap but still indexable`);
  check(outOfSitemap, `${relative}: noindex but still submitted in the sitemap`);
  check(noAds, `${relative}: removed from search but does not explicitly disable ads`);
}
check(boundedPosts >= protectedPosts.length, 'editorial boundary is applied to fewer posts than the protected set');

const postsByStem = new Map();
for (const file of postFiles) {
  const stem = path.basename(file, '.md');
  const matches = postsByStem.get(stem) || [];
  matches.push(file);
  postsByStem.set(stem, matches);
}
for (const [stem, matches] of postsByStem) {
  if (!sourceImageContractAppliesToStem(stem)) continue;
  check(matches.length === 1, `${stem}: source-image contract requires exactly one post for each stem`);
  const referencesDir = path.join(root, 'assets', 'img', 'posts', stem, 'references');
  check(fs.existsSync(referencesDir), `${stem}: posts dated ${SOURCE_IMAGE_CONTRACT_EFFECTIVE_DATE} or later must ship a references directory`);
}
const postAssetRoot = path.join(root, 'assets', 'img', 'posts');
if (fs.existsSync(postAssetRoot)) {
  for (const entry of fs.readdirSync(postAssetRoot, { withFileTypes: true })) {
    const articleDir = path.join(postAssetRoot, entry.name);
    if (entry.isSymbolicLink()) {
      check(false, `Published article asset tree contains a symlink: ${path.relative(root, articleDir)}`);
      continue;
    }
    if (!entry.isDirectory()) continue;
    const referencesDir = path.join(articleDir, 'references');
    if (!fs.existsSync(referencesDir)) continue;
    const referenceFiles = walkFiles(referencesDir);
    check(referenceFiles.length >= MINIMUM_REFERENCE_IMAGES, `${entry.name}: published reference folder has ${referenceFiles.length} images; expected at least ${MINIMUM_REFERENCE_IMAGES}`);
    check(referenceFiles.length <= MAXIMUM_REFERENCE_IMAGES, `${entry.name}: published reference folder has ${referenceFiles.length} images; maximum is ${MAXIMUM_REFERENCE_IMAGES}`);
    let totalBytes = 0;
    const publicPaths = new Set();
    for (const file of referenceFiles) {
      const relative = path.relative(root, file).split(path.sep).join('/');
      const bytes = fs.readFileSync(file);
      totalBytes += bytes.length;
      publicPaths.add(`/${relative}`);
      check(hasValidImageExtension(relative), `${relative}: unsupported source-image extension`);
      check(bytes.length > 0 && bytes.length <= MAX_REFERENCE_IMAGE_BYTES, `${relative}: source image must be non-empty and no larger than ${MAX_REFERENCE_IMAGE_BYTES} bytes`);
      const raster = inspectRasterImage(relative, bytes);
      check(raster.metadataSegments === 0, `${relative}: source image must have EXIF/XMP/text metadata stripped`);
      check(raster.valid, `${relative}: bytes do not match a metadata-free plausible raster structure for the declared extension`);
    }
    check(totalBytes <= MAX_REFERENCE_IMAGE_TOTAL_BYTES, `${entry.name}: source images exceed the ${MAX_REFERENCE_IMAGE_TOTAL_BYTES}-byte aggregate limit`);

    const matchingPosts = postsByStem.get(entry.name) || [];
    check(matchingPosts.length === 1, `${entry.name}: expected exactly one matching post, found ${matchingPosts.length}`);
    if (matchingPosts.length !== 1) continue;
    const article = fs.readFileSync(matchingPosts[0], 'utf8');
    const body = article.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '');
    const figures = extractSourceImageFigures(body);
    const uses = new Map();
    for (const figure of figures) {
      if (!figure.src?.startsWith(`/assets/img/posts/${entry.name}/references/`)) continue;
      uses.set(figure.src, (uses.get(figure.src) || 0) + 1);
      check(figure.imgCount === 1 && figure.captionCount === 1, `${entry.name}: every source figure must contain exactly one image and one caption`);
      check(figure.hidden !== true, `${entry.name}: source figure must be a top-level visibly rendered block without hidden, extra-class or inline-style attributes`);
      const urls = new Set((figure.caption || '').match(/https?:\/\/[^"'<>\s)]+/g) || []);
      check(urls.size >= 2, `${entry.name}: source figure must visibly carry source and license URLs: ${figure.src}`);
      check(publicPaths.has(figure.src), `${entry.name}: source figure references an unshipped image: ${figure.src}`);
    }
    for (const publicPath of publicPaths) check(uses.get(publicPath) === 1, `${entry.name}: published reference image must appear in exactly one credited source figure: ${publicPath}`);
    for (const publicPath of uses.keys()) check(publicPaths.has(publicPath), `${entry.name}: source figure has no matching published reference file: ${publicPath}`);
  }
}
const workspaceTool = read('tools/editorial-workspace.mjs');
check(workspaceTool.includes("case 'verify-archives'"), 'Workspace tool has no archive-integrity command');
check(workspaceTool.includes("algorithm: 'sha256'"), 'Workspace archives are not sealed with SHA-256');
check(/^_workspace\/$/m.test(read('.gitignore')), '.gitignore does not protect _workspace/');
for (const phrase of ['- _workspace/', '- .claude/', '- .agents/', '- AGENTS.md', '- CLAUDE.md']) {
  check(read('_config.yml').includes(phrase), `_config.yml exclude is missing ${phrase}`);
}
const workflow = read('.github/workflows/pages-deploy.yml');
check(workflow.includes('git ls-files -- _workspace'), 'CI does not reject a tracked _workspace');
check(workflow.includes('for p in _workspace'), 'CI does not reject a published _workspace');
check(!/paths-ignore:\s*\n\s*- \.gitignore/m.test(workflow), 'CI still ignores .gitignore-only changes');

const liquidFiles = [
  '_includes/head.html',
  '_includes/post-paginator.html',
  '_includes/related-posts.html',
  '_includes/trending-tags.html',
  '_includes/update-list.html',
  '_layouts/archives.html',
  '_layouts/categories.html',
  '_layouts/category.html',
  '_layouts/home.html',
  '_layouts/tag.html',
  '_layouts/tags.html',
  'assets/feed.xml',
  'assets/js/data/search.json',
  'assets/js/data/search-meta.json'
];
const openers = new Set(['if', 'unless', 'for', 'case', 'capture', 'comment', 'raw', 'tablerow']);
const closers = new Map([...openers].map((name) => [`end${name}`, name]));
for (const file of liquidFiles) {
  let text = read(file);
  text = text.replace(/{%\s*(comment|raw)\s*%}[\s\S]*?{%\s*end\1\s*%}/g, '');
  const stack = [];
  for (const match of text.matchAll(/{%[-\s]*([a-zA-Z_]+)[\s\S]*?%}/g)) {
    const tag = match[1];
    if (openers.has(tag)) stack.push(tag);
    else if (closers.has(tag)) {
      const expected = closers.get(tag);
      const actual = stack.pop();
      check(actual === expected, `${file} closes ${tag} while ${actual || 'nothing'} is open`);
    }
  }
  check(stack.length === 0, `${file} has unclosed Liquid blocks: ${stack.join(', ')}`);
}

if (failures.length) {
  console.error(`Editorial boundary verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Editorial boundary verification passed: ${protectedPosts.length} protected posts, ${sourceChecks.length} filtered surfaces, ${liquidFiles.length} balanced Liquid files.`);
