/* Bradfield unit pages — per-section handout printing (shared behaviour).
   Loaded on every unit page via <script src>; styling lives in
   handout-system.css. Do not fork per unit — edit here and it propagates.

   What it does
     • Adds a "Print handout" button to every .section-block's week-header,
       and a quieter one to every h3.subsection heading.
     • Clicking either prints THAT SECTION / SUBSECTION ONLY, via the
       browser's own print dialog — where every browser offers "Save as PDF"
       (macOS: the PDF dropdown; Chrome/Edge: Destination → Save as PDF;
       Firefox: Print to File). No library, no server, no PDF-generation
       code of our own.
     • Adds ruled writing lines under each task box, print-only.

   Both levels are needed: some sections are a single undivided study (the
   Keats and Dante poetry sections have no subsections at all), while others
   run to seven subsections that each want their own handout.

   A note on structure: a subsection is NOT a container element. It is an
   h3.subsection heading plus its following siblings, up to the next
   h3.subsection or the end of the section. So printing one means tagging
   that range (see partOf), not hiding the siblings of a wrapper.

   Handout links
     Any section OR subsection can be printed from a URL — both already
     carry ids (the sidebar links to the section ones):

       …/on-the-road/?handout=chapmans-homer          (a whole section)
       …/on-the-road/?handout=nonfiction-scott        (one subsection)

     Opening that link opens the print dialog on load. The URL is
     bookmarkable and emailable — a teacher sends a colleague a link, not
     a file. The ?handout= param is stripped again after printing so a
     reload doesn't re-trigger it.

   Per-task control (optional attributes on a .task / .portfolio-task box)
     data-lines="10"   this many ruled lines instead of the default 6
     data-lines="0"    no ruled lines for this box                        */
(function () {
  'use strict';

  var DEFAULT_LINES = 6;
  var PARAM = 'handout';

  var sections = document.querySelectorAll('.section-block');
  if (!sections.length) return;

  // ---- Ruled answer lines under each task box (hidden except in handout print) ----
  var boxes = document.querySelectorAll('.task, .portfolio-task');
  Array.prototype.forEach.call(boxes, function (box) {
    var n = parseInt(box.getAttribute('data-lines'), 10);
    if (isNaN(n)) n = DEFAULT_LINES;
    if (n <= 0) return;

    var wrap = document.createElement('div');
    wrap.className = 'answer-lines';
    var label = document.createElement('div');
    label.className = 'answer-lines-label';
    label.textContent = 'Your response';
    wrap.appendChild(label);
    for (var i = 0; i < n; i++) {
      var rule = document.createElement('div');
      rule.className = 'rule';
      wrap.appendChild(rule);
    }
    // After the box, not inside it — .task has break-inside: avoid, and a
    // task plus its lines is usually taller than a page can keep together.
    if (box.parentNode) box.parentNode.insertBefore(wrap, box.nextSibling);
  });

  // ---- Printing ----
  var cleanupTimer = null;

  function cleanup() {
    document.body.classList.remove('handout');
    document.body.classList.remove('handout-sub');
    var t = document.querySelector('.handout-target');
    if (t) t.classList.remove('handout-target');
    var parts = document.querySelectorAll('.handout-part, .handout-part-first');
    Array.prototype.forEach.call(parts, function (el) {
      el.classList.remove('handout-part');
      el.classList.remove('handout-part-first');
    });
    if (cleanupTimer) { clearTimeout(cleanupTimer); cleanupTimer = null; }
  }

  function isSubHeading(el) {
    return el && el.tagName === 'H3' && el.classList.contains('subsection');
  }

  /* The elements making up one subsection: the heading itself, then every
     following sibling until the next h3.subsection (or the section's end). */
  function partOf(h3) {
    var part = [h3];
    var el = h3.nextElementSibling;
    while (el && !isSubHeading(el)) {
      part.push(el);
      el = el.nextElementSibling;
    }
    return part;
  }

  /* Safari's default footer prints the page URL, so whatever is sitting in
     the address bar ends up on the handout — including a stale #section-id
     from the last sidebar link clicked, or our own ?handout= param. Strip
     both just before printing so the footer reads as the clean unit URL.
     replaceState doesn't scroll or add a history entry. */
  function tidyUrlForPrint() {
    if (!window.history || !window.history.replaceState) return;
    var search = window.location.search
      .replace(new RegExp('([?&])' + PARAM + '=[^&#]*'), '$1')
      .replace(/&{2,}/g, '&')
      .replace(/[?&]$/, '');
    if (search === '?') search = '';
    try {
      window.history.replaceState(null, '', window.location.pathname + search);
    } catch (e) { /* file:// and some sandboxes disallow this — harmless */ }
  }

  function startPrint() {
    tidyUrlForPrint();
    // Safety net: if afterprint never fires (older Safari, print cancelled
    // in an odd way), don't strand the page in handout mode.
    cleanupTimer = setTimeout(cleanup, 60000);
    window.print();
  }

  function printSection(section) {
    if (!section) return;
    cleanup();
    document.body.classList.add('handout');
    section.classList.add('handout-target');
    startPrint();
  }

  function printSubsection(h3) {
    if (!isSubHeading(h3)) return;
    var section = h3.closest ? h3.closest('.section-block') : null;
    if (!section) return;
    cleanup();
    document.body.classList.add('handout');
    document.body.classList.add('handout-sub');
    section.classList.add('handout-target');
    partOf(h3).forEach(function (el) { el.classList.add('handout-part'); });
    h3.classList.add('handout-part-first');
    startPrint();
  }

  window.addEventListener('afterprint', cleanup);

  // ---- Button in each section header ----
  Array.prototype.forEach.call(sections, function (section) {
    var header = section.querySelector('.week-header');
    if (!header) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'handout-btn';
    btn.textContent = 'Print handout';
    btn.title = 'Print this section on its own — choose "Save as PDF" in the print dialog';
    btn.addEventListener('click', function () { printSection(section); });
    header.appendChild(btn);
  });

  // ---- Button on each subsection heading ----
  var subs = document.querySelectorAll('.section-block h3.subsection');
  Array.prototype.forEach.call(subs, function (h3) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'handout-btn-sub';
    btn.textContent = 'Print handout';
    btn.title = 'Print this subsection on its own — choose "Save as PDF" in the print dialog';
    btn.addEventListener('click', function () { printSubsection(h3); });
    h3.appendChild(btn);
  });

  // ---- ?handout=<section-id> — print on load, then strip the param ----
  function idFromUrl() {
    var m = new RegExp('[?&]' + PARAM + '=([^&#]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
  }

  var wanted = idFromUrl();
  if (wanted) {
    var target = document.getElementById(wanted);
    var isSection = target && target.classList.contains('section-block');
    if (isSection || isSubHeading(target)) {
      window.addEventListener('load', function () {
        // Let fonts and layout settle before the print snapshot.
        setTimeout(function () {
          // Scroll to it rather than setting location.hash — a hash would
          // show up in Safari's printed URL footer, here and on every
          // later print. startPrint() tidies the URL itself.
          if (target.scrollIntoView) target.scrollIntoView();
          if (isSection) printSection(target);
          else printSubsection(target);
        }, 300);
      });
    }
  }
})();
