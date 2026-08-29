#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

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

const scopeTool = read('tools/verify-publication-scope.mjs');
check(scopeTool.includes("git', ['diff', '--cached'"), 'Publication scope tool does not verify staged paths');
check(scopeTool.includes('Live article target already exists'), 'Publication scope tool does not block live article collisions');
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
