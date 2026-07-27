# English — Bradfield Senior College

Static site of student-facing course workbooks, hosted on GitHub Pages.

## Structure

```
index.html                        site landing page — links to each course
assets/site.css                   shared styles for navigation pages only
assets/submit-system.{css,js}     student work-submission system (unit pages)
assets/handout-system.{css,js}    per-section handout printing (unit pages)
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

## Handouts

Handouts come at two levels. Every section has a **Print handout** button in its
header bar, and every subsection (`h3.subsection`) has a quieter one that appears
on hover. Either prints just that much of the page — pick "Save as PDF" in the
print dialog to get a file. Both levels are needed: some sections have no
subsections at all, others run to seven.

Either can also be opened straight into the print dialog by URL:

```
…/on-the-road/?handout=chapmans-homer     a whole section
…/on-the-road/?handout=nonfiction-scott   one subsection
```

The id is the element's own `id` — sections and subsections all already have
one, so nothing needs adding to make a handout link work. Ruled
writing lines appear under each task in handouts only; set `data-lines="N"` on a
`.task` box to change how many, or `data-lines="0"` for none.

Printing the whole page (Ctrl/Cmd-P) is unaffected — it still starts each
section on a new page, with no buttons or ruled lines.

## Visibility

The repo is public (required for free GitHub Pages) and the site has no login.
Content is curriculum material only — **no student names, marks, work, or other
personal information belongs in this repo.** The `noindex` meta tag plus
`robots.txt` keep pages out of search results, so the site is reachable by URL
but not findable.
