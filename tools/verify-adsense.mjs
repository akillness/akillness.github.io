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

const adsTxt = await page.evaluate(async (site) => {
  const res = await fetch(`${site}/ads.txt`, { cache: 'no-store' })
  return { status: res.status, body: res.ok ? (await res.text()).slice(0, 500) : '' }
}, SITE)

record('SITE', 'ads.txt reachable', adsTxt.status === 200, `HTTP ${adsTxt.status}`)
record(
  'SITE',
  'ads.txt names expected publisher',
  adsTxt.body.includes(EXPECTED_PUB),
  (adsTxt.body.match(/^google\.com.*$/m) || ['<no google.com line>'])[0]
)

await page.goto(`${SITE}/?adsense-check=${Date.now()}`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(4000)

const head = await page.evaluate(() => ({
  metaPub: document.querySelector('meta[name="google-adsense-account"]')?.content || null,
  loader: document.querySelector('script[src*="adsbygoogle"]')?.src || null,
  ga: !!document.querySelector('script[src*="googletagmanager"]')
}))

const wired = Boolean(head.metaPub && head.loader)
record('SITE', 'google-adsense-account meta tag', Boolean(head.metaPub), head.metaPub || 'absent')
record('SITE', 'adsbygoogle.js loader', Boolean(head.loader), head.loader || 'absent')
record('SITE', 'GA4 tag still present', head.ga, head.ga ? 'googletagmanager loaded' : 'missing')

if (!wired) {
  record(
    'SITE',
    'ad markup expected?',
    true,
    'no — `google_ad_client` in _config.yml is empty on purpose, so adsense.html is skipped'
  )
}

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
