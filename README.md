# English Studies — Bradfield Senior College

Static site of student-facing course workbooks, hosted on GitHub Pages.

## Structure

```
index.html                        landing page — links to each unit
robots.txt                        Disallow: / (search engines stay out)
.nojekyll                         serve files as-is, no Jekyll build
units/<unit-slug>/index.html      one self-contained workbook per unit
```

Each workbook is a single self-contained HTML file — styles inline, no build
step, no dependencies. Media (video, large PDFs) is always **linked out**,
never hosted here.

## Adding a unit

1. Create `units/<unit-slug>/index.html`.
2. Copy an existing unit page as the style template.
3. Make sure `<head>` contains `<meta name="robots" content="noindex, nofollow">`.
4. Add a `.unit` card linking to it in the root `index.html`.
5. Commit and push — Pages redeploys in about a minute.

## Visibility

The repo is public (required for free GitHub Pages) and the site has no login.
Content is curriculum material only — **no student names, marks, work, or other
personal information belongs in this repo.** The `noindex` meta tag plus
`robots.txt` keep pages out of search results, so the site is reachable by URL
but not findable.
