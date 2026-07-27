/* Bradfield unit pages — student work-submission system (shared behaviour).
   Loaded on every unit page via <script src>. Reads per-unit values from
   window.UNIT_SETUP (defined inline on each page) merged over the shared
   defaults below. Do not fork per unit — edit here and it propagates.

   Per-page window.UNIT_SETUP keys:
     year               e.g. 'Y11'                    (REQUIRED — cohort; fallback for the Task label & workbook-folder name when courseCode absent)
     courseCode         e.g. '11ENS'                  (course code — leads the submitted Task label AND the suggested workbook-folder name so course, not just year, is captured; matters for students taking two courses, e.g. 12ENA + 12ENX; falls back to year if absent)
     unitName           e.g. 'On the Road'            (REQUIRED)
     unitSlug           e.g. 'y11-on-the-road'        (REQUIRED — year-qualified, unique across the whole site)
     workbookFolderName e.g. '11ENS On the Road — my work'
     teachers           [{ id:'t01', label:'Brenton' }, ...]  (ids must match the private TeacherID->email table)
     taskOverrides      [[textStart, niceLabel], ...]  (optional; nicer labels where section title can't disambiguate)
     form               optional per-unit override; normally omitted (one Form serves the whole site) */
(function () {
  'use strict';

  if (!window.UNIT_SETUP) return;   // not a configured unit page (e.g. a draft preview) — stay inert
  var page = window.UNIT_SETUP;
  var cfg = {
    year: page.year || '',
    courseCode: page.courseCode || '',
    unitName: page.unitName || '',
    unitSlug: page.unitSlug || 'unit',
    workbookFolderName: page.workbookFolderName || 'my work',
    onedriveUrl: page.onedriveUrl || 'https://www.office.com/launch/onedrive',
    teachers: page.teachers || [],
    taskOverrides: page.taskOverrides || [],
    // Shared submission Form — the SAME one for every unit on the site.
    form: page.form || {
      baseUrl: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=InJTGddVgUWE-8LaboNcdLtmj6pX3LtNqzwmne0GSwFUQzhJVkRVVkJLUjNVUFlHVUxUMzRTMzFFNS4u',
      taskParam: 'rf0b85a30722b4c24b8b9b7a9b4477c32',      // Task question
      teacherParam: 'rb7f0ae01ed224528ae6ab0c8af513ee6'    // Teacher code question
    }
  };

  var KEY_T = 'mset:' + cfg.unitSlug + ':teacher';
  var KEY_W = 'mset:' + cfg.unitSlug + ':workbook';
  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }

  var sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
  if (!sidebar) return;

  // ---- Build the "My setup" panel and insert it at the top of the sidebar ----
  var panel = document.createElement('div');
  panel.className = 'sb-setup';
  panel.innerHTML =
    '<label class="sb-field-label" for="sbTeacher">My teacher</label>' +
    '<select class="sb-select" id="sbTeacher" aria-label="My teacher">' +
      '<option value="">Choose your teacher…</option>' +
    '</select>' +
    '<span class="sb-field-label">My workbook</span>' +
    '<a class="sb-btn sb-btn-open sb-btn-block" id="sbWorkbookOpen" href="#" target="_blank" rel="noopener" hidden>▶ Open my workbook</a>' +
    '<div class="sb-row" id="sbWorkbookSet">' +
      '<input class="sb-input" id="sbWorkbookInput" type="url" inputmode="url" placeholder="Paste workbook link">' +
      '<button class="sb-btn" id="sbWorkbookSave" type="button">Save</button>' +
    '</div>' +
    '<button class="sb-link" id="sbWorkbookChange" type="button" hidden>change workbook link</button>' +
    '<p class="sb-help" id="sbWorkbookHelp"></p>' +
    '<button class="sb-btn sb-btn-block sb-btn-submit" id="sbSubmit" type="button">Submit work ↗</button>' +
    '<p class="sb-help" id="sbSubmitHint">Attach your file. (If it’s an online file, pick it from OneDrive.) ' +
      'If asked about a <strong>previous draft</strong>, choose <strong>New draft</strong>. ' +
      'NB – Don’t save a copy of the form after submitting; just close the tab.</p>' +
    '<p class="sb-note" id="sbSubmitNote" hidden></p>';

  var head = sidebar.querySelector('.sb-head');
  if (head && head.nextSibling) sidebar.insertBefore(panel, head.nextSibling);
  else if (head) sidebar.appendChild(panel);
  else sidebar.insertBefore(panel, sidebar.firstChild);

  var teacherSel = panel.querySelector('#sbTeacher');
  var wbOpen   = panel.querySelector('#sbWorkbookOpen');
  var wbSet    = panel.querySelector('#sbWorkbookSet');
  var wbInput  = panel.querySelector('#sbWorkbookInput');
  var wbSave   = panel.querySelector('#sbWorkbookSave');
  var wbChange = panel.querySelector('#sbWorkbookChange');
  var wbHelp   = panel.querySelector('#sbWorkbookHelp');
  var submitBtn  = panel.querySelector('#sbSubmit');
  var submitNote = panel.querySelector('#sbSubmitNote');

  // ---- Teacher picker ----
  cfg.teachers.forEach(function (t) {
    var o = document.createElement('option');
    o.value = t.id; o.textContent = t.label;
    teacherSel.appendChild(o);
  });
  var savedT = lsGet(KEY_T);
  if (savedT) teacherSel.value = savedT;
  teacherSel.addEventListener('change', function () { lsSet(KEY_T, teacherSel.value); });

  // ---- Workbook link ----
  function showWorkbook(url) {
    wbOpen.href = url; wbOpen.hidden = false;
    wbSet.hidden = true; wbChange.hidden = false; wbHelp.innerHTML = '';
  }
  function showWorkbookInput() {
    wbOpen.hidden = true; wbSet.hidden = false; wbChange.hidden = true; wbInput.value = '';
    wbHelp.innerHTML = 'Paste the link to your OneDrive folder named <strong>' +
      cfg.workbookFolderName + '</strong>. Lost it? Open <a href="' + cfg.onedriveUrl +
      '" target="_blank" rel="noopener">OneDrive</a> and copy the folder’s address.';
  }
  var savedW = lsGet(KEY_W);
  if (savedW) showWorkbook(savedW); else showWorkbookInput();
  wbSave.addEventListener('click', function () {
    var v = (wbInput.value || '').trim();
    if (!v) { wbInput.focus(); return; }
    if (!/^https?:\/\//i.test(v)) {
      wbHelp.innerHTML = 'That doesn’t look like a link — it should start with https://';
      wbInput.focus(); return;
    }
    lsSet(KEY_W, v); showWorkbook(v);
  });
  wbInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); wbSave.click(); }
  });
  wbChange.addEventListener('click', showWorkbookInput);

  // ---- Submission URL + shared API ----
  function buildSubmitUrl(taskId) {
    var f = cfg.form;
    if (!f || !f.baseUrl) return null;
    // Every submitted Task string is course + unit qualified (e.g.
    // "11ENS On the Road — Frost Task 1"), so one Form serves every course/unit
    // and every response row is unambiguous — the course code (not just the year)
    // distinguishes courses that share a unit, e.g. 12ENG vs 12ENA. Falls back to
    // year for pages seeded before courseCode existed.
    var prefix = (cfg.courseCode || cfg.year);
    prefix = (prefix ? prefix + ' ' : '') + cfg.unitName;
    var task = taskId ? (prefix + ' — ' + taskId) : prefix;
    var url = f.baseUrl;
    if (f.taskParam) url += '&' + f.taskParam + '=' + encodeURIComponent(task);
    if (f.teacherParam && teacherSel.value) url += '&' + f.teacherParam + '=' + encodeURIComponent(teacherSel.value);
    return url;
  }
  function attemptSubmit(taskId) {
    if (!teacherSel.value) return { ok: false, reason: 'no-teacher' };
    var url = buildSubmitUrl(taskId);
    if (!url) return { ok: false, reason: 'no-form' };
    window.open(url, '_blank', 'noopener');
    return { ok: true };
  }
  function focusTeacher() {
    if (window.matchMedia('(max-width: 1000px)').matches) document.body.classList.add('nav-open');
    teacherSel.focus();
  }
  window.MSetup = { attemptSubmit: attemptSubmit, focusTeacher: focusTeacher, buildSubmitUrl: buildSubmitUrl };

  function note(msg) { submitNote.textContent = msg || ''; submitNote.hidden = !msg; }
  submitBtn.addEventListener('click', function () {
    var r = attemptSubmit('');
    if (r.ok) { note(''); return; }
    note(r.reason === 'no-teacher'
      ? 'First choose your teacher above.'
      : 'The submission form isn’t connected yet (coming soon).');
    if (r.reason === 'no-teacher') teacherSel.focus();
  });

  // ---- Inject per-task "Submit this task" links into hand-in written-work boxes ----
  var SKIP = /^(discussion|reflection)$/i;   // in-class talk, nothing handed in
  var PART = /^part\s/i;                       // multi-part working steps (Part A/1/…)
  var overrides = cfg.taskOverrides;
  function overrideFor(text) {
    for (var i = 0; i < overrides.length; i++) {
      if (text.indexOf(overrides[i][0]) !== -1) return overrides[i][1];
    }
    return null;
  }

  var boxes = document.querySelectorAll('.task, .portfolio-task');
  Array.prototype.forEach.call(boxes, function (box) {
    if (box.hasAttribute('data-nosubmit')) return;
    var isPortfolio = box.classList.contains('portfolio-task');
    var labelEl = box.querySelector(isPortfolio ? '.portfolio-label' : '.task-label');
    var labelText = labelEl ? labelEl.textContent.trim() : '';
    if (!isPortfolio && (SKIP.test(labelText) || PART.test(labelText))) return;

    var taskId = box.getAttribute('data-task');
    if (!taskId) {
      var pEl = box.querySelector('p');
      taskId = overrideFor(pEl ? pEl.textContent : '');
    }
    if (!taskId) {
      var sec = box.closest('.section-block');
      var h2 = sec && sec.querySelector('.week-header h2');
      var title = h2 ? h2.textContent.trim() : '';
      taskId = title ? (title + ' — ' + labelText) : labelText;
    }

    var p = document.createElement('p');
    p.className = 'task-submit';
    var a = document.createElement('a');
    a.href = '#';
    a.className = 'submit-task';
    a.innerHTML = 'Submit this task ↗';
    var msg = document.createElement('span');
    msg.className = 'task-submit-msg';
    msg.hidden = true;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var r = attemptSubmit(taskId);
      if (r.ok) { msg.hidden = true; return; }
      if (r.reason === 'no-teacher') {
        msg.textContent = 'Choose your teacher in the sidebar first.';
        msg.hidden = false;
        focusTeacher();
      } else {
        msg.textContent = 'Submission form isn’t connected yet.';
        msg.hidden = false;
      }
    });
    p.appendChild(a);
    p.appendChild(msg);
    box.appendChild(p);
  });
})();
