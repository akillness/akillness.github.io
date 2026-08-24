#!/usr/bin/env python3
"""Naver blog → backlink post generator + auto-sync.

Two entry points:
  render   Read _data/naver_posts.json and (re)write the roundup post. Offline.
  sync     Fetch the Naver RSS feed, append any new posts to the JSON, then render.
           Naver has no push webhook, so a scheduled `sync` (GitHub Actions cron)
           is the practical equivalent: new posts appear in RSS within minutes.

The roundup post is backdated to the blog's earliest entry so it sits at the
archive root rather than surfacing as a fresh post; its permalink is
filename-based (/posts/family-life-blog-roundup/), so the date never changes
the URL that was submitted to Search Console.
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

BLOG_ID = "banggujin"
RSS_URL = f"https://rss.blog.naver.com/{BLOG_ID}.xml"
ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "_data" / "naver_posts.json"
POST = ROOT / "_posts" / "2017" / "02" / "2017-02-20-family-life-blog-roundup.md"
POST_DATE = "2017-02-20 09:00:00 +0900"   # earliest post; keeps URL stable

CATEGORY_ORDER = ["육아·성장기록", "결혼 준비", "맛집·카페", "여행", "동네 생활", "일상·다이어리"]


def categorize(title: str) -> str:
    s = title
    if re.search(r"아기|육아|치발기|백일|돌잔치|성장일지|조리원|baby|신생아|개월|임신|맘스홀릭|출산|기저귀|분유", s):
        return "육아·성장기록"
    if re.search(r"카페|맛집|음식|바베큐|베뉴|디저트|브런치|먹|restaurant|글램핑|캠핑", s):
        return "맛집·카페"
    if re.search(r"웨딩|예물|한복|스드메|상견례|프러포즈|결혼|honeymoon|허니문", s):
        return "결혼 준비"
    if re.search(r"사진관|여권사진|미술|음악학원|세차|학원|네일|미용|교정|병원|스튜디오|원데이", s):
        return "동네 생활"
    if re.search(r"여행|호텔|리조트|바다|제주|투어|trip|travel", s):
        return "여행"
    return "일상·다이어리"


def load_posts() -> list:
    if DATA.exists():
        return json.loads(DATA.read_text(encoding="utf-8"))
    return []


def save_posts(posts: list) -> None:
    DATA.parent.mkdir(parents=True, exist_ok=True)
    DATA.write_text(json.dumps(posts, ensure_ascii=False, indent=1), encoding="utf-8")


def fetch_rss_posts() -> list:
    """Return [{no, title}] from the recent-posts RSS feed. Best-effort."""
    req = urllib.request.Request(RSS_URL, headers={"User-Agent": "Mozilla/5.0 (naver-blog-sync)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        xml = r.read().decode("utf-8", errors="replace")
    items = re.findall(r"<item>(.*?)</item>", xml, re.S)
    out = []
    for it in items:
        link = re.search(r"<link>(.*?)</link>", it, re.S)
        title = re.search(r"<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</title>", it, re.S)
        if not link:
            continue
        m = re.search(rf"{BLOG_ID}/(\d+)", link.group(1))
        if not m:
            continue
        t = (title.group(1).strip() if title else "").strip()
        out.append({"no": m.group(1), "title": t})
    return out


def sync() -> bool:
    posts = load_posts()
    have = {p["no"] for p in posts}
    try:
        recent = fetch_rss_posts()
    except Exception as e:  # network/feed hiccup: render from what we have
        print(f"[sync] RSS fetch failed ({e}); rendering existing data only", flush=True)
        recent = []
    added = 0
    # RSS is newest-first; insert new ones at the front preserving that order.
    for p in reversed(recent):
        if p["no"] in have or not p["title"]:
            continue
        p["cat"] = categorize(p["title"])
        p["date"] = ""
        posts.insert(0, p)
        have.add(p["no"])
        added += 1
    if added:
        save_posts(posts)
        print(f"[sync] added {added} new post(s)", flush=True)
    else:
        print("[sync] no new posts", flush=True)
    return added > 0


def render() -> None:
    posts = load_posts()
    for p in posts:
        p.setdefault("cat", categorize(p["title"]))
    buckets = {c: [] for c in CATEGORY_ORDER}
    for p in posts:
        buckets.setdefault(p.get("cat", "일상·다이어리"), []).append(p)

    lines = []
    lines.append("---")
    lines.append('title: "Beyond the Terminal: A Family Life Blog I Keep on the Side"')
    lines.append('description: "This dev blog is where I write about agents and systems. '
                 'On the side I keep a Korean everyday-life blog — parenting, cafes, weddings, '
                 'and small trips. Here is a living, auto-updated index of every post."')
    lines.append("categories: [Life, Notes]")
    lines.append("tags: [personal, blog, naver, dongtan, parenting, everyday]")
    lines.append(f"date: {POST_DATE}")
    lines.append("pin: false")
    lines.append("mermaid: false")
    lines.append("math: false")
    lines.append("---")
    lines.append("")
    lines.append("Most of what I publish here is about agents, harnesses, and the systems I build. "
                 "But engineering isn't the whole of a life. On the side I keep a second, much more "
                 "ordinary blog in Korean — everyday notes about raising a small kid, cafes and "
                 "restaurants worth the drive around Dongtan, our wedding prep years ago, a few "
                 "trips, and the occasional diary entry.")
    lines.append("")
    lines.append("This page is a living index of that blog, grouped by theme and kept up to date "
                 "automatically. If you only came for the agent stuff, this is your cue to skip — "
                 "but if you're curious what the non-terminal hours look like, the links below are "
                 "the honest version.")
    lines.append("")
    lines.append(f"> The blog lives at [blog.naver.com/{BLOG_ID}](https://m.blog.naver.com/{BLOG_ID}). "
                 f"It's written for family and friends more than for an audience — no changelog, "
                 f"no benchmarks, just the small stuff that fills the days.")
    lines.append("{: .prompt-tip }")
    lines.append("")
    total = sum(len(v) for v in buckets.values())
    for cat in CATEGORY_ORDER:
        items = buckets.get(cat, [])
        if not items:
            continue
        lines.append(f"## {cat} ({len(items)})")
        lines.append("")
        for p in items:
            url = f"https://m.blog.naver.com/{BLOG_ID}/{p['no']}"
            title = p["title"].replace("[", "\\[").replace("]", "\\]")
            lines.append(f"- [{title}]({url})")
        lines.append("")
    lines.append("---")
    lines.append("")
    lines.append(f"*{total} posts indexed. This page updates automatically as new entries are published.*")

    POST.parent.mkdir(parents=True, exist_ok=True)
    POST.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"[render] wrote {POST.relative_to(ROOT)} with {total} posts", flush=True)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "render"
    if cmd == "sync":
        sync()
        render()
    elif cmd == "render":
        render()
    else:
        print(f"unknown command: {cmd} (use: render | sync)", file=sys.stderr)
        sys.exit(2)
