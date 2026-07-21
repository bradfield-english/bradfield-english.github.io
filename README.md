# English — Bradfield Senior College

Static site of student-facing course workbooks, hosted on GitHub Pages.

## Structure

```
index.html                        site landing page — links to each course
assets/site.css                   shared styles for navigation pages only
robots.txt                        Disallow: / (search engines stay out)
.nojekyll                         serve files as-is, no Jekyll build

<course-slug>/index.html          course front page — links to that course's units
<course-slug>/<unit-slug>/index.html   the unit workbook
```

Course slugs are year + course, e.g. `11-english-studies`, `12-english-studies`.
Adding English Advanced or Standard later means a new sibling folder —
`12-english-advanced/` — and a card on the site landing page.

Navigation is deliberately siloed: a course page links only to its own units, so
students see one coherent path. Anyone with a URL can reach any page — this is
about clarity, not access control.

Unit workbooks are single self-contained HTML files — styles inline, no build
step, no dependencies. They do **not** use `assets/site.css`; that's only for
the landing and course pages. Media (video, large PDFs) is always **linked
out**, never hosted here.

## Adding a unit

1. Create `<course-slug>/<unit-slug>/index.html`.
2. Copy an existing unit page as the style template.
3. Make sure `<head>` contains `<meta name="robots" content="noindex, nofollow">`.
4. Add a `.card` linking to it on that course's front page.
5. Commit and push — Pages redeploys in about a minute.

## Local preview

Directory links (`href="on-the-road/"`) don't resolve over `file://`, so preview
with a real server:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Visibility

The repo is public (required for free GitHub Pages) and the site has no login.
Content is curriculum material only — **no student names, marks, work, or other
personal information belongs in this repo.** The `noindex` meta tag plus
`robots.txt` keep pages out of search results, so the site is reachable by URL
but not findable.
