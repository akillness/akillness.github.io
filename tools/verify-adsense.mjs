/**
 * AdSense integration checker for akillness.github.io.
 *
 * Run against the browser you are already signed into (Playwriter):
 *
 *   playwriter session list                       # find a Chrome session
 *   playwriter -s <id> --timeout 240000 -f tools/verify-adsense.mjs
 *
 * It reports two independent halves of the integration and never writes anything:
 *
 *   1. SITE  — what the deployed site actually serves (ads.txt, meta tag, ad loader)
 *   2. DASHBOARD — what AdSense says about the publisher account and the site
 *
 * A green SITE half with a red DASHBOARD half means the repo is wired correctly
 * and the account/approval is the remaining blocker (and vice versa).
 */

const page = state.page
const SITE = 'https://akillness.github.io'
const EXPECTED_PUB = 'pub-3706360396883624'

const results = []
const record = (area, name, ok, detail) => results.push({ area, name, ok, detail })

// ---------------------------------------------------------------- 1. SITE ---

const EXPECTED_CLIENT = 'ca-' + EXPECTED_PUB
const siteEvidence = await page.evaluate(async (site) => {
  async function read(url) {
    const res = await fetch(url, { cache: 'no-store' })
    const body = await res.text()
    const doc = new DOMParser().parseFromString(body, 'text/html')
    return {
      status: res.status, url: res.url, body,
      meta: [...doc.querySelectorAll('meta[name="google-adsense-account"]')].map(el => el.content),
      loaders: [...doc.querySelectorAll('script[src]')].map(el => el.getAttribute('src')).filter(src => /adsbygoogle\.js/i.test(src)),
      slots: [...doc.querySelectorAll('ins.adsbygoogle, ins[data-ad-slot]')].map(el => ({ client: el.getAttribute('data-ad-client'), slot: el.getAttribute('data-ad-slot') })),
      eligible: doc.querySelector('article[data-monetization-eligible]')?.getAttribute('data-monetization-eligible'),
      robots: doc.querySelector('meta[name="robots"]')?.content || '',
      ga: !!doc.querySelector('script[src*="googletagmanager.com/gtag/js"]'),
      links: [...doc.querySelectorAll('a[href]')].map(el => new URL(el.getAttribute('href'), res.url).href).filter(url => url.startsWith(site + '/posts/'))
    }
  }
  const ads = await fetch(site + '/ads.txt', { cache: 'no-store' })
  const adsTxt = { status: ads.status, body: await ads.text() }
  const home = await read(site + '/?adsense-check=' + Date.now())
  let eligible = null
  for (const url of [...new Set(home.links)].slice(0, 30)) {
    const candidate = await read(url)
    if (candidate.status === 200 && candidate.eligible === 'true' && !candidate.robots.includes('noindex')) { eligible = candidate; break }
  }
  const protectedPages = await Promise.all(['/about/', '/categories/', '/tags/', '/archives/', '/404.html', '/posts/googleio-review/'].map(route => read(site + route)))
  return { adsTxt, home, eligible, protectedPages }
}, SITE)

record('SITE', 'ads.txt reachable', siteEvidence.adsTxt.status === 200, 'HTTP ' + siteEvidence.adsTxt.status)
const googleLines = siteEvidence.adsTxt.body.split(/\r?\n/).map(line => line.replace(/\s*#.*$/, '').trim()).filter(line => /^google\.com\s*,/i.test(line))
const expectedAdsLine = new RegExp('^google\\.com\\s*,\\s*' + EXPECTED_PUB + '\\s*,\\s*DIRECT\\s*,\\s*f08c47fec0942fa0\\s*$')
record('SITE', 'ads.txt exact publisher record', googleLines.length === 1 && expectedAdsLine.test(googleLines[0]), googleLines.join('; ') || 'missing')
function checkPage(evidence, label, adsAllowed) {
  record('SITE', label + ' reachable', evidence.status === 200, 'HTTP ' + evidence.status)
  record('SITE', label + ' exact ownership', evidence.meta.length === 1 && evidence.meta[0] === EXPECTED_CLIENT, evidence.meta.join(', ') || 'absent')
  const exactLoader = src => {
    let url; try { url = new URL(src) } catch { return false }
    return url.origin === 'https://pagead2.googlesyndication.com' && url.pathname === '/pagead/js/adsbygoogle.js' && url.searchParams.getAll('client').length === 1 && url.searchParams.get('client') === EXPECTED_CLIENT
  }
  record('SITE', label + ' loader boundary', adsAllowed ? evidence.loaders.length === 1 && exactLoader(evidence.loaders[0]) : evidence.loaders.length === 0, evidence.loaders.join(', ') || 'absent (expected on protected pages)')
  record('SITE', label + ' unit boundary', adsAllowed ? evidence.slots.length > 0 && evidence.slots.every(unit => unit.client === EXPECTED_CLIENT && /^\d+$/.test(unit.slot || '')) : evidence.slots.length === 0, evidence.slots.length + ' units')
}
checkPage(siteEvidence.home, 'home', false)
record('SITE', 'GA4 tag still present', siteEvidence.home.ga, siteEvidence.home.ga ? 'googletagmanager present' : 'missing')
record('SITE', 'eligible article discovered', Boolean(siteEvidence.eligible), siteEvidence.eligible?.url || 'none among first 30 distinct home article links; inspect discovery separately')
if (siteEvidence.eligible) checkPage(siteEvidence.eligible, 'eligible article', true)
for (const protectedPage of siteEvidence.protectedPages) checkPage(protectedPage, new URL(protectedPage.url).pathname, false)

// ----------------------------------------------------------- 2. DASHBOARD ---
//
// The generic /adsense/u/0/home entry point answers "access denied" even for the
// account that owns this publisher, so every dashboard URL is publisher-scoped.

const DASH = `https://adsense.google.com/adsense/u/0/${EXPECTED_PUB}`

async function dashboard(url, waitMs = 9000) {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(waitMs)
  const text = await page.evaluate(() => document.body.innerText)
  return { url: page.url(), text, flat: text.replace(/\s+/g, ' ') }
}

const home = await dashboard(`${DASH}/home`)
const denied = /액세스가 거부|Access denied|권한이 없는/.test(home.text)
const needsSignup = /signup|login/.test(home.url)

record(
  'DASHBOARD',
  'AdSense account accessible',
  !denied && !needsSignup,
  denied ? 'access denied for the signed-in account'
    : needsSignup ? `redirected to ${home.url.split('?')[0]}`
      : `dashboard reachable as ${EXPECTED_PUB}`
)

if (!denied && !needsSignup) {
  const sites = await dashboard(`${DASH}/sites/list`)
  const found = sites.flat.includes('akillness.github.io')
  record('DASHBOARD', 'akillness.github.io listed', found,
    found ? 'present in the Sites list' : 'site not present in the Sites list')

  // Review states, worst to best: 검토 필요 -> 준비 중 -> 준비됨.
  const row = (sites.flat.match(/akillness\.github\.io\s+(준비됨|준비 중|검토 필요|주의 필요|Ready|Getting ready|Requires review|Needs attention)/) || [])[1]
  record('DASHBOARD', 'site approved (준비됨/Ready)',
    /준비됨|Ready/.test(row || ''),
    row ? `state: ${row}` : 'state not readable from the Sites list')

  const adsTxtState = (sites.flat.match(/(승인됨|찾을 수 없음|Authorized|Not found)/) || ['unknown'])[0]
  record('DASHBOARD', 'ads.txt seen by AdSense',
    /승인됨|Authorized/.test(adsTxtState),
    `AdSense ads.txt status: ${adsTxtState} (crawl can lag the deploy by ~a day)`)
}


// -------------------------------------------------------------- report ------

const pad = (s, n) => String(s).padEnd(n)
console.log('\n' + pad('AREA', 11) + pad('RESULT', 8) + 'CHECK')
console.log('-'.repeat(96))
for (const r of results) {
  console.log(pad(r.area, 11) + pad(r.ok ? 'PASS' : 'FAIL', 8) + pad(r.name, 34) + r.detail)
}
const failed = results.filter(r => !r.ok)
console.log('-'.repeat(96))
console.log(`${results.length - failed.length}/${results.length} passed`)

await page.screenshot({ path: '/tmp/adsense_verify.png', scale: 'css' })
console.log('screenshot: /tmp/adsense_verify.png')
