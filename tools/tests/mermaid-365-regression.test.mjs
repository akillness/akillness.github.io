import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const post = readFileSync(new URL('_posts/2026-11-08-365-data-science-ai-agent-curriculum-audit.md', root), 'utf8');
const [frontMatter] = post.match(/^---\n[\s\S]*?\n---/);
const diagrams = [...post.matchAll(/^```mermaid\n([\s\S]*?)^```/gm)].map((match) => match[1]);

function loaderEnabled(front) {
  return /^mermaid:\s*true\s*$/m.test(front);
}

test('365 curriculum diagrams opt into the Jekyll Mermaid loader', () => {
  const selector = readFileSync(new URL('_includes/js-selector.html', root), 'utf8');
  assert.match(selector, /{% if page\.mermaid %}\s*{% include mermaid\.html %}/);
  assert.equal(diagrams.length, 2);
  assert.ok(loaderEnabled(frontMatter), 'Mermaid fences alone do not load the renderer');
  // Reproduce the original omission rather than allowing a vacuous positive test.
  assert.equal(loaderEnabled(frontMatter.replace(/^mermaid:.*\n/m, '')), false);
});

function luminance(hex) {
  const channels = hex.match(/[a-f0-9]{2}/gi).map((pair) => parseInt(pair, 16) / 255);
  const linear = channels.map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(a, b) {
  const levels = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (levels[0] + 0.05) / (levels[1] + 0.05);
}

test('both diagrams retain native-size labels and readable ink on pastel clusters', () => {
  for (const diagram of diagrams) {
    assert.match(diagram, /"useMaxWidth":\s*false/, 'mobile readers must be able to pan instead of reading a scaled-down graph');
    const clusters = [...diagram.matchAll(/^\s*style\s+\w+\s+(.+)$/gm)];
    assert.equal(clusters.length, 3);
    for (const [, style] of clusters) {
      const fill = style.match(/(?:^|,)fill:(#[a-f0-9]{6})/i)?.[1];
      const ink = style.match(/(?:^|,)color:(#[a-f0-9]{6})/i)?.[1];
      assert.ok(fill && ink, 'custom cluster fills need explicit label ink for both themes');
      assert.ok(contrast(fill, ink) >= 4.5, 'cluster labels must meet normal-text contrast');
    }
    assert.doesNotMatch(diagram, /<script|javascript:/i);
    assert.doesNotMatch(diagram, /securityLevel|startOnLoad|suppressErrorRendering/);
  }
  assert.ok(contrast('#f9f9f9', '#cccccc') < 4.5, 'negative control: inherited dark-theme ink on a light cluster is unreadable');
});
