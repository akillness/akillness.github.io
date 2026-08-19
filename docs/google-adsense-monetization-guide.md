---
layout: page
title: "Google AdSense Monetization Guide"
permalink: /docs/google-adsense-monetization-guide/
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

### 2.2 글의 분량 및 구조화 기준
- **최소 글 분량**: 포스트당 1,500자 ~ 2,500자 이상의 밀도 높은 내용 권장
- **구조화된 목차**: H2(`##`), H3(`###`) 헤더를 사용한 체계적인 단락 구성
- **시각 자료 및 설명**: 서술형 설명, 코드 블록, 비교표, 다이어그램 활용

### 2.3 금지 및 저품질 콘텐츠 요인
- 저작권 침해 콘텐츠, 불법/복사-붙여넣기 글 (Scraped Content)
- 텍스트가 적고 단일 이미지/링크 위주의 성의 없는 포스트 (Thin Content)
- 과도한 키워드 반복 (Keyword Stuffing)

---

## 3. SEO 및 검색 엔진 최적화 전략

1. **Meta Description & Front Matter**:
   - `title`, `description`, `categories`, `tags`, `seo` 메타데이터 작성
2. **URL 구조**:
   - 직관적이고 키워드가 포함된 슬러그 (e.g. `/posts/google-adsense-monetization-strategy/`)
3. **내부 및 외부 링크**:
   - 관련 이전 포스트 링크 및 공식 기술 문서(MDN, Google Publisher Docs) 참조

---

## 4. SQLite / Local DB를 활용한 포스트 데이터베이스 및 검색/속도 최적화

Jekyll과 같은 정적 사이트 생생기(SSG)는 포스트 개수가 많아질수록 build 시간과 JS 검색 인덱스 파일(`search.json`)의 메모리 용량이 비대해지는 한계가 있습니다.

### 최적화 아키텍처
1. **Build-Time SQLite Indexing**:
   - build 단계에서 모든 포스트의 메타데이터 및 본문 역인덱스(Inverted Index)를 SQLite DB (`assets/data/posts.sqlite` 또는 FTS5 데이터베이스)로 압축 및 생성.
2. **WebAssembly SQLite / IndexedDB (Client-Side)**:
   - 클라이언트 측에서 lightweight SQLite WASM 또는 IndexedDB를 이용하여 메모리 소모를 기존 대비 70% 이상 절감.
3. **Lazy-loading & Pagination**:
   - 전체 검색 인덱스를 한 번에 로딩하지 않고, 필요에 따라 인덱스 chunk 및 DB를 로딩하여 LCP(Largest Contentful Paint) 및 INP(Interaction to Next Paint) 향상.

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

`_includes/adsense.html` 은 `jekyll.environment == 'production'` 이면서
`site.google_ad_client` 가 비어 있지 않을 때만 meta 태그와 `adsbygoogle.js` 로더를
출력한다. 즉 로컬 개발 빌드에는 광고 스크립트가 절대 들어가지 않는다.

기본 레이아웃을 쓰는 604개 페이지에 로더가 들어간다. `portfolio/`, `resume/`,
`IDENTITY.html` 등 독립 HTML 페이지는 이 include 를 쓰지 않으므로 로더가 없다.
승인 심사는 홈을 포함한 일반 페이지 기준이라 문제되지 않지만, 해당 페이지까지
수익화하려면 각 파일 `<head>` 에 로더를 직접 넣어야 한다.

### 계정 진행 상태 (2026-08-19 기준)

1. 기존 **YouTube용 애드센스** 계정(`pub-3706360396883624`)을 웹사이트 계정으로 전환 완료.
   `adsense.google.com/adsense/u/0/home` 은 이 계정에서도 접근 거부가 나므로
   대시보드는 반드시 게시자 스코프 URL `/adsense/u/0/pub-3706360396883624/...` 로 연다.
2. 사이트 `akillness.github.io` 등록 → 로더 스니펫 배포 → **소유권 확인 완료**.
3. **검토 요청 완료**, 승인 상태 `준비 중`. 구글 심사 결과를 기다리는 단계.
4. 대시보드의 `Ads.txt 상태` 는 크롤링이 배포보다 하루 정도 늦을 수 있어
   한동안 `찾을 수 없음` 으로 보일 수 있다. 파일 자체는 이미 정상 서빙된다.

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
*최종 업데이트: 2026-08-19 (웹사이트 계정 전환·소유권 확인·검토 요청 반영)*

