---
layout: page
title: "Google AdSense Monetization Guide"
permalink: /docs/google-adsense-monetization-guide/
robots: noindex, follow
sitemap: false
---

# Google AdSense 수익화를 위한 블로그 운영 및 글쓰기 가이드라인

## 1. 개요 및 구글 애드센스 심사/수익화 핵심 법칙

구글 애드센스는 고품질의 독창적인 콘텐츠와 명확한 사용자 경험(UX)을 갖춘 웹사이트에 대해 광고 게재를 승인하고 수익화를 허용합니다. 단순히 글의 수만 많다고 승인되지 않으며, 다음 요소들이 정밀하게 충족되어야 합니다.

---

## 2. 구글 정책 준수 및 콘텐츠 품질 요구사항

### 2.1 독창성과 전문성 (E-E-A-T)
- **Experience (경험)**: 실제 직접 경험하거나 실험, 구축한 과정 포함
- **Expertise (전문성)**: 기술적 지식, 정확한 코드 예제, 명확한 개념 설명
- **Authoritativeness (권위성)**: 출처 명시, 표준 문서를 바탕으로 한 기술 설명
- **Trustworthiness (신뢰성)**: 작동 확인된 코드, 팩트 기반 데이터, 오개념 없는 설명

### 2.2 글의 깊이 및 구조화 기준
- **고정 최소 분량 없음**: Google은 선호하는 글자 수가 없다고 명시한다. 분량 대신 질문을 충분히 해결하는 고유한 경험·분석·검증을 요구한다.
- **구조화된 목차**: H2(`##`), H3(`###`) 헤더를 사용한 체계적인 단락 구성
- **시각 자료 및 설명**: 서술형 설명, 코드 블록, 비교표, 다이어그램 활용
- **공식 기준**: <https://developers.google.com/search/docs/fundamentals/creating-helpful-content>

### 2.3 금지 및 저품질 콘텐츠 요인
- 저작권 침해 콘텐츠, 불법/복사-붙여넣기 글 (Scraped Content)
- 텍스트가 적고 단일 이미지/링크 위주의 성의 없는 포스트 (Thin Content)
- 과도한 키워드 반복 (Keyword Stuffing)

### 2.4 Google Site Approvals 공식 영상에서 확인한 네 축

| 축 | Google이 설명한 확인점 | 이 저장소의 실행 규칙 |
|---|---|---|
| 소유권과 기본 점검 | HTML 코드, Search Console 또는 `ads.txt`로 소유권을 확인할 수 있어야 한다. 사이트는 공개 상태이고 크롤러가 접근할 수 있어야 하며, 콘텐츠 없는 화면에 광고를 두지 않는다. | `/robots.txt`가 전체 크롤러와 canonical sitemap을 안내한다. `ads.txt`와 AdSense 소유권 meta를 CI에서 검사한다. 404, 지원 페이지, `noindex` 페이지에는 광고 코드가 없다. |
| 좋은 트래픽과 나쁜 트래픽 | 실제 사용자가 자발적으로 방문해야 한다. 자동 새로고침, 숨긴 광고, 봇 위장, 클릭재킹, 애드웨어, 쿠키 스터핑 같은 인위적 트래픽은 허용되지 않는다. | 광고 클릭이나 트래픽 구매를 유도하지 않는다. CI는 게시물의 자동 새로고침, 브라우저 prerender 힌트, 숨긴 AdSense 유닛을 차단한다. |
| 품질 콘텐츠 | 방문자에게 고유하고 실질적인 가치를 제공해야 한다. 낮은 품질의 많은 페이지보다 좋은 페이지가 적은 편이 낫고, 복제·스크랩·중복 본문과 외부 링크만 모은 글을 피한다. | 외부 발표나 데모를 짧게 옮긴 글은 비공개로 전환한다. 300단어 미만 레거시 메모는 확장, 비공개 또는 `noindex` 중 하나를 명시해야 한다. 300단어는 Google 정책이 아니라 리뷰가 필요한 글을 놓치지 않기 위한 내부 검토선이다. |
| 탐색 | 모든 기기에서 정렬과 가독성이 유지되고, 메뉴와 아이콘이 작동하며, 링크가 약속한 정확한 페이지로 이어져야 한다. 분류는 일관되고 한눈에 이해돼야 한다. | 홈의 주요 탐색 경로 11개가 모두 빌드되는지 CI에서 검사한다. 내부 링크와 이미지는 `htmlproofer`로 검증하고, 태그·카테고리 상세는 탐색용으로 유지하되 `noindex, follow`로 운영한다. |

검토 근거는 Google AdSense의 Site Approvals 영상 시리즈다.

- [Site Ownership and Basic Checks](https://www.youtube.com/watch?v=WMKabXtWuFc)
- [Good and Bad Traffic](https://www.youtube.com/watch?v=kY4oVKT2z4A)
- [Quality Content](https://www.youtube.com/watch?v=poU80MgSvrY)
- [Navigation](https://www.youtube.com/watch?v=X_xKMJ8m6nY)

---

## 3. SEO 및 검색 엔진 최적화 전략

1. **Meta Description & Front Matter**:
   - `title`, `description`, `categories`, `tags`, `seo` 메타데이터 작성
2. **URL 구조**:
   - 직관적이고 키워드가 포함된 슬러그 (e.g. `/posts/viral-ui-effects-source-audit/`)
3. **내부 및 외부 링크**:
   - 관련 이전 포스트 링크 및 공식 기술 문서(MDN, Google Publisher Docs) 참조

---

## 4. 포스트 데이터베이스 및 검색/속도 최적화

Jekyll과 같은 정적 사이트 생성기(SSG)는 포스트 개수가 많아질수록 build 시간과 JS 검색 인덱스 파일(`search.json`)의 용량이 비대해지는 한계가 있습니다.

### 원칙: 원본은 Markdown, DB는 파생물

포스트의 source of truth는 `_posts/*.md`로 유지합니다. 원본을 바이너리 DB로 옮기면 git diff·PR 리뷰·머지 충돌 해결이 불가능해지고, Chirpy의 카테고리/태그/피드/related-posts가 모두 `site.posts` 컬렉션 위에서 동작하기 때문에 빌드 전에 md를 다시 생성하는 왕복이 생깁니다. 따라서 DB/인덱스는 **build 단계에서 md로부터 생성되는 파생 산출물**로만 다룹니다.

### 구현된 2단계 지연 로딩 인덱스

`search.json` 하나를 모든 페이지 로드 시점에 통째로 내려받던 구조(당시 측정 2.2 MB, gzip 740 KB)를 다음과 같이 바꿨습니다.

1. **Tier 1 — `assets/js/data/search-meta.json`** (137 KB, gzip 40 KB)
   - 제목·URL·카테고리·태그·200자 스니펫만 포함. 검색창에 처음 포커스/입력이 발생할 때 요청됩니다.
2. **Tier 2 — `assets/js/data/search.json`** (2.2 MB, gzip 740 KB)
   - 본문 전문 인덱스. Tier 1이 적용된 직후 백그라운드로 받아 데이터셋을 교체하며, 이때부터 본문 전문 검색이 동작합니다.
3. **로더 (`_includes/search-loader.html`)**
   - 페이지 로드 시에는 아무 인덱스도 요청하지 않습니다(검색을 쓰지 않는 방문자의 전송량 = 0).
   - SimpleJekyllSearch는 호출할 때마다 `searchInput`에 자체 리스너를 등록하므로, 실제 입력창 대신 detached 엘리먼트를 넘기고 질의는 로더가 직접 구동합니다. Tier 2 재초기화 시 핸들러가 중복되지 않습니다.
   - 두 인덱스의 스니펫 정의가 동일하므로 Tier 1 → Tier 2 교체 시 결과 표시가 달라지지 않습니다.

> `search-loader.html`의 인라인 스크립트는 `compress` 레이아웃이 개행을 제거하므로 `//` 주석을 쓰면 이후 코드 전체가 주석 처리됩니다. 블록 주석만 사용하세요.

### 다음 단계 (미구현)

- **Build-Time SQLite Indexing**: 본문 역인덱스를 SQLite FTS5(`assets/data/posts.sqlite`)로 생성하고, 클라이언트에서 sql.js-httpvfs의 HTTP Range 요청으로 필요한 페이지만 읽어 Tier 2의 740 KB 전송을 제거.
- **IndexedDB 캐싱**: 재방문 시 인덱스 재다운로드 회피.

### 같은 원칙의 확장: 에이전트 기록물 (2026-08-19)

"원본은 md, DB는 파생물"은 포스트뿐 아니라 **에이전트가 만들어내는 기록물**에도 그대로 적용합니다. 기준은 파일 포맷이 아니라 *누가 읽고 어떻게 접근하는가*입니다.

| 성격 | 저장 형태 | 위치 | git | 공개 |
| --- | --- | --- | --- | --- |
| 원시 턴/프롬프트 로그 (기계가 쓰고 기계가 질의, append 중심) | DB형 (jsonl/sqlite) | `.jeo/` | 추적 안 함 | 비공개 |
| 재생성 가능한 파생 캐시 | 도구 산출물 | `graphify-out/` | 추적 안 함 | 비공개 |
| 지식 베이스 원문·질의 기록 | md | `llm-wiki/` | 추적 안 함 | 비공개 |
| 큐레이션된 결과물 (사람이 리뷰) | md | `_posts/`, `docs/` | 추적 | 공개 |

원시 기록을 md로 커밋하면 세션 하나가 수천 줄짜리 파일이 되어 diff·리뷰가 무의미해지고, 반대로 큐레이션 결과를 DB에 넣으면 리뷰와 링크가 불가능해집니다. 두 축을 섞지 않는 것이 핵심입니다.

이 원칙을 어기면 **비공개여야 할 기록이 그대로 웹에 발행됩니다.** 실제로 2026-08-19 이전까지 `graphify-out/`(408 파일, 11 MB의 AST 캐시), `llm-wiki/`(30 파일), `jeo-session-*.md`(434 KB 세션 원문)가 git에 추적되어 `_site/`로 빌드되었고, 원시 프롬프트가 HTML 페이지로 렌더링되어 `sitemap.xml`에 11건 색인 요청까지 나가 있었습니다. 현재는 `.gitignore`로 추적을 끊고 `_config.yml`의 `exclude:`로 발행을 차단합니다.

> `_config.yml`에 `exclude:` 항목을 추가할 때는 그 파일이 **정말 소스인지** 확인하세요. `redirects.json`은 `jekyll-redirect-from` 플러그인이 빌드 중 생성하는 산출물이라 `exclude`에 넣어도 `_site/`에 그대로 남습니다.

**검증**: 빌드 후 `_site/` 루트에 남아야 하는 파일은 `404.html`, `ads.txt`, `feed.xml`, `google*.html`(Search Console 인증), `index.html`, `redirects.json`, `robots.txt`, `sitemap.xml`, `sw.min.js` 뿐입니다.

**자동화**: 이 검증은 사람이 기억할 일이 아니라서 CI(`.github/workflows/pages-deploy.yml`)의 "Verify agent artifacts are neither tracked nor published" 단계가 빌드 직후 세 가지를 강제합니다.

1. `git ls-files`에 `graphify-out/`, `llm-wiki/`, `test-results/`, `.jeo/`, `.serena/`, `.gjc/`, `jeo-session-*.md`가 하나라도 잡히면 실패 — `.gitignore`는 **이미 추적 중인 파일에는 효력이 없으므로**, 실수로 커밋된 기록은 이 검사로만 잡힙니다. (실제로 이 검사를 붙이자마자 `.gjc/`의 에이전트 세션 상태 JSON이 추적 중인 것이 발견되어 untrack 했습니다.)
2. `_site/`에 제외 대상 경로가 하나라도 생성되면 실패.
3. `sitemap.xml`이 에이전트 경로를 색인 요청하면 실패. 패턴은 호스트 바로 뒤에 앵커되어 있어 `/tags/llm-wiki/`처럼 **정상 태그 페이지는 오탐하지 않습니다**.

> **git 히스토리 재작성은 하지 않습니다.** 추적을 끊어도 과거 커밋에는 내용이 남지만, 이 저장소의 경우 재작성 실익이 없습니다. 유출 항목 중 유일한 개인정보였던 이메일은 이미 `_config.yml`의 공개 연락처이자 199개 커밋의 author 필드에 들어 있어 파일을 지워도 그대로 남고, 전체 히스토리를 스캔한 결과 토큰·API 키·비밀키는 한 건도 없었습니다. 반면 `filter-repo` + force push는 모든 클론·포크를 깨뜨리고 GitHub에는 옛 SHA가 그대로 접근 가능하게 남습니다. **실제 크리덴셜이 커밋된 경우에만** 재작성을 검토하고, 그때는 재작성보다 해당 키의 폐기·재발급이 우선입니다.



---

## 5. 애드센스 광고 배치 및 Jekyll Chirpy 적용 가이드

1. **Auto Ads (자동 광고)**: `<head>` 태그 내 Script 추가
2. **본문 상단/하단 수동 광고**: `_layouts/post.html` 또는 `_includes/` 내 광고 영역 모듈화
3. **ads.txt 게시**: 루트 디렉토리에 `ads.txt` 포함하여 게시자 자격 검증

---

## 6. 이 저장소의 실제 연동 상태와 검증 방법

### 현재 배선

| 요소 | 위치 | 상태 |
|---|---|---|
| 게시자 ID | `ads.txt` | `pub-3706360396883624` 배포 완료 (live HTTP 200) |
| 광고 스크립트 | `_includes/adsense.html` → `_includes/head.html` | 배선 완료, **활성** |
| 활성화 스위치 | `_config.yml` 의 `google_ad_client` | `ca-pub-3706360396883624` |
| 본문 하단 광고 | `_includes/adsense-post.html` → `_layouts/post.html` | 슬롯 `2404463133`, 편집 기준을 통과한 글만 |
| 본문 중간 광고 | `_includes/adsense-in-article.html` → `_includes/post-content.html` | 슬롯 `2101210804` (in-article/fluid), 편집 기준을 통과한 글만 |
| 슬롯 스위치 | `_config.yml` 의 `google_ad_slots` | `post_bottom`, `post_in_article` |
| 편집 안전 기준 | `_config.yml` 의 `google_ad_min_post_words` | 800단어, Google 정책이 아닌 이 사이트의 보수적 광고 기준 |

`_includes/adsense.html` 은 `jekyll.environment == 'production'` 이면서
`site.google_ad_client` 가 비어 있지 않을 때만 동작한다. 로더 허용 범위는 홈페이지와
`google_ad_min_post_words` 기준을 통과한 포스트뿐이다. 일반 지원 페이지, `noindex`
페이지, 태그·카테고리 상세, 404에는 meta 태그와 `adsbygoogle.js` 로더를 모두 넣지
않는다. 즉 로컬 빌드와 저밀도 또는 검색 제외 화면에는 광고 코드가 없다.

`portfolio/`, `resume/`, `resume_eng/` 같은 독립 HTML 페이지도 광고 로더가 없고
`noindex`로 운영한다. 검색용 포트폴리오는 서버 렌더링되는 `/projects/`가 담당한다.

### 광고 유닛 배치 규칙

로더(`adsbygoogle.js`)는 페이지당 한 번만 `<head>` 에서 나가고, 각 유닛 include 는
`<ins>` 와 `push({})` 만 출력한다. 두 유닛 모두 프로덕션 빌드 + `google_ad_client`
+ 해당 슬롯 ID + 사이트의 편집 안전 기준을 모두 통과해야 렌더링된다. 포스트 front
matter에 `ads: false`를 넣으면 분량과 무관하게 그 글을 광고에서 제외한다.

본문 중간 유닛은 `_includes/post-content.html` 이 본문을 `</p>` 경계로 잘라
자동 삽입한다. 문단이 8개 미만인 짧은 글은 건너뛰고, 중간 지점 이후에서
다음 블록이 최상위 `<p>` 또는 헤딩으로 시작하는 첫 경계에만 넣어
인용문·리스트·코드블록 내부로 광고가 끼어드는 것을 막는다. 마지막 두 블록도
제외해 하단 유닛과 붙지 않게 한다. 통과 개수는 새 글과 비공개 전환에 따라 바뀌므로
고정 수치로 문서화하지 않고 빌드된 HTML에서 검증한다.


### 계정 진행 상태 (2026-08-28 기준)

1. 기존 **YouTube용 애드센스** 계정(`pub-3706360396883624`)을 웹사이트 계정으로 전환 완료.
   `adsense.google.com/adsense/u/0/home` 은 이 계정에서도 접근 거부가 나므로
   대시보드는 반드시 게시자 스코프 URL `/adsense/u/0/pub-3706360396883624/...` 로 연다.
2. 사이트 `akillness.github.io` 등록 → 로더 스니펫 배포 → **소유권 확인 완료**.
3. **검토 요청 완료**, 승인 상태 `준비 중`. 구글 심사 결과를 기다리는 단계.
4. `ads.txt`는 `google.com, pub-3706360396883624, DIRECT, f08c47fec0942fa0`으로
   정상 서빙되며 AdSense 대시보드에서도 승인 상태를 확인했다.
5. 2026-08-28 09:41 KST 기준 사이트 상태는 `리뷰가 요청됨`이다. 이 문서는 승인이나
   수익을 보장하지 않으며, 심사 중에는 새 재검토 요청을 반복하지 않는다.

### 검증 스크립트

로그인된 크롬 세션을 그대로 재사용해 **사이트 쪽 배선**과 **애드센스 대시보드** 를
한 번에 점검한다:

```bash
playwriter session list                                   # 크롬 세션 ID 확인
playwriter -s <id> --timeout 300000 -f tools/verify-adsense.mjs
```

`SITE` 5개 항목이 모두 통과하면 저장소/배포 쪽은 정상이다. `DASHBOARD` 의
`site approved` 와 `ads.txt seen by AdSense` 는 구글 심사·크롤링이 끝나야 통과하므로,
승인 대기 중에는 **7/9** 가 정상 상태다.

---
*최종 업데이트: 2026-08-28 (저밀도 아카이브·광고 경계·현재 심사 상태 반영)*

