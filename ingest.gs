/**
 * Bayzat Ops — sheet ingester
 * -------------------------------------------------------------
 * Watches the joiners tab, pushes new rows into Supabase, and sends
 * the two emails. Tickets live in Supabase from here on, not in a
 * Tickets tab — the team works them in the web app.
 *
 * SETUP
 *   1. Run supabase/schema.sql in Supabase → SQL Editor first.
 *   2. Open the joiners sheet → Extensions → Apps Script, paste this in.
 *   3. Project Settings → Script Properties → add two properties:
 *        SUPABASE_URL          https://YOURPROJECT.supabase.co
 *        SUPABASE_SERVICE_KEY  the service_role key from Project Settings → API
 *      Keep the service key out of the code — it bypasses row level security.
 *   4. Project Settings → time zone → Asia/Dubai.
 *   5. Run `setup`, approve the permissions prompt.
 *
 * WHY A TIMER AND NOT onEdit: a row arriving through IMPORTRANGE is a formula
 * recalculation, not a user edit, so onEdit and onChange never fire for it.
 */

const CONFIG = {
  SOURCE_SHEET      : '',                    // blank = auto-detect the joiners tab
  SOURCE_HEADER_ROW : 0,                     // 0 = auto-detect the header row
  EMAIL_TO          : 'saravana@bayzat.com',
  EMAIL_CC          : '',
  APP_URL           : '',                    // your Vercel URL, e.g. https://bayzat-ops.vercel.app
  NOTIFY_ON_NEW     : true,
  DAILY_FOLLOWUP    : true,
  SKIP_WEEKEND_MAIL : true,
  DATE_ORDER        : 'MDY',                 // 'MDY' for 7/25/2026, 'DMY' for 25/7/2026
  CHECK_EVERY_MINUTES : 5,
  DIGEST_HOUR       : 9
};

const BRAND = 'linear-gradient(103deg,#9647FF,#475CFF)';

/* ------------------------------------------------------------- setup */
function setup() {
  if (!prop('SUPABASE_URL') || !prop('SUPABASE_SERVICE_KEY')) {
    throw new Error('Add SUPABASE_URL and SUPABASE_SERVICE_KEY under Project Settings → Script Properties first.');
  }
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('syncNewRows').timeBased()
    .everyMinutes(CONFIG.CHECK_EVERY_MINUTES).create();
  if (CONFIG.DAILY_FOLLOWUP) {
    ScriptApp.newTrigger('sendDailyFollowUp').timeBased()
      .everyDays(1).atHour(CONFIG.DIGEST_HOUR).create();
  }
  const src = resolveSource();
  syncNewRows();
  const msg = 'Running.\n\nReading joiners from "' + src.sheet.getName() + '", headers on row ' +
    src.headerRow + '.\nNew rows reach Supabase within ' + CONFIG.CHECK_EVERY_MINUTES +
    ' minutes and email ' + CONFIG.EMAIL_TO + '.\nFollow-up daily at ' + CONFIG.DIGEST_HOUR + ':00.';
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
}

function onOpen() {
  try {
    SpreadsheetApp.getUi().createMenu('Onboarding')
      .addItem('Check for new joiners now', 'syncNewRows')
      .addItem('Send follow-up now', 'sendDailyFollowUp')
      .addItem('Check my setup', 'diagnose')
      .addToUi();
  } catch (e) {}
}

function diagnose() {
  const src = resolveSource();
  let reachable = 'no';
  try { reachable = sb('GET', '/rest/v1/tickets?select=ref&limit=1') ? 'yes' : 'no'; } catch (e) { reachable = e.message; }
  const lines = [
    'Joiners tab: ' + src.sheet.getName(),
    'Header row:  ' + src.headerRow,
    'Columns — first: ' + col(src.cols.first) + ', last: ' + col(src.cols.last) +
      ', DOJ: ' + col(src.cols.doj) + ', location: ' + col(src.cols.loc) + ', laptop: ' + col(src.cols.laptop),
    'Data rows:   ' + Math.max(src.sheet.getLastRow() - src.headerRow, 0),
    'Supabase reachable: ' + reachable,
    'Open tickets: ' + (function () { try { return sb('GET', '/rest/v1/tickets?select=ref&status=eq.open').length; } catch (e) { return '?'; } })(),
    'Email quota left: ' + MailApp.getRemainingDailyQuota(),
    'Time zone: ' + Session.getScriptTimeZone()
  ].join('\n');
  Logger.log(lines);
  try { SpreadsheetApp.getUi().alert(lines); } catch (e) {}
  function col(i) { return i < 0 ? 'NOT FOUND' : String.fromCharCode(65 + i); }
}

/* --------------------------------------------------------- supabase */
function prop(k) { return PropertiesService.getScriptProperties().getProperty(k); }

function sb(method, path, body) {
  const res = UrlFetchApp.fetch(prop('SUPABASE_URL') + path, {
    method: method,
    contentType: 'application/json',
    headers: {
      apikey: prop('SUPABASE_SERVICE_KEY'),
      Authorization: 'Bearer ' + prop('SUPABASE_SERVICE_KEY')
    },
    payload: body ? JSON.stringify(body) : undefined,
    muteHttpExceptions: true
  });
  const code = res.getResponseCode(), text = res.getContentText();
  if (code >= 300) throw new Error('Supabase ' + code + ': ' + text.slice(0, 300));
  return text ? JSON.parse(text) : null;
}

/* --------------------------------------------- read the sheet */
function resolveSource() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const named = CONFIG.SOURCE_SHEET ? ss.getSheetByName(CONFIG.SOURCE_SHEET) : null;
  const candidates = named ? [named] : ss.getSheets();

  for (let i = 0; i < candidates.length; i++) {
    const sh = candidates[i];
    const scan = Math.min(sh.getLastRow(), 8);
    if (!scan) continue;
    const rows = sh.getRange(1, 1, scan, Math.max(sh.getLastColumn(), 1)).getValues();
    for (let r = 0; r < rows.length; r++) {
      const cols = matchCols(rows[r]);
      if (cols.first > -1 && cols.doj > -1) {
        return { sheet: sh, headerRow: CONFIG.SOURCE_HEADER_ROW || (r + 1), cols: cols };
      }
    }
  }
  const fb = candidates[0] || ss.getSheets()[0];
  return { sheet: fb, headerRow: CONFIG.SOURCE_HEADER_ROW || 1,
           cols: { first: 0, last: 1, doj: 2, loc: 3, laptop: 4 } };
}

function matchCols(header) {
  const norm = header.map(function (h) {
    return String(h || '').toLowerCase().replace(/[^a-z]/g, '');
  });
  function find() {
    const alts = Array.prototype.slice.call(arguments);
    for (let i = 0; i < alts.length; i++) {
      const e = norm.indexOf(alts[i]); if (e > -1) return e;
    }
    for (let i = 0; i < alts.length; i++) {
      for (let j = 0; j < norm.length; j++) {
        if (norm[j] && norm[j].indexOf(alts[i]) > -1) return j;
      }
    }
    return -1;
  }
  return {
    first : find('firstname', 'first', 'employeename', 'name'),
    last  : find('lastname', 'last', 'surname', 'familyname'),
    doj   : find('doj', 'dateofjoining', 'joiningdate', 'startdate', 'joindate'),
    loc   : find('joininglocation', 'location', 'office', 'country', 'city'),
    laptop: find('laptoprequest', 'laptoprequired', 'laptop', 'device')
  };
}

/* -------------------------------------------- create tickets + notify */
function syncNewRows() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    const src = resolveSource(), sh = src.sheet, cols = src.cols;
    const n = Math.max(sh.getLastRow() - src.headerRow, 0);
    if (!n) return;
    const rows = sh.getRange(src.headerRow + 1, 1, n, Math.max(sh.getLastColumn(), 5)).getValues();

    const made = [];
    rows.forEach(function (r) {
      const first = String(pick(r, cols.first, 0) || '').trim();
      if (!first || /^first\s*name$/i.test(first)) return;
      const last   = String(pick(r, cols.last, 1) || '').trim();
      const doj    = asDate(pick(r, cols.doj, 2));
      const loc    = String(pick(r, cols.loc, 3) || '').trim();
      const laptop = !/^(no|n|false|0|not required|na|personal)$/i
                      .test(String(pick(r, cols.laptop, 4) || 'Yes').trim());

      const out = sb('POST', '/rest/v1/rpc/create_ticket', {
        p_first: first, p_last: last, p_doj: fmt(doj), p_location: loc, p_laptop: laptop
      });
      if (out && out.created) made.push(out);
    });

    if (made.length && CONFIG.NOTIFY_ON_NEW) sendNewTicketEmail(made);
  } finally {
    lock.releaseLock();
  }
}

function pick(row, idx, fallback) {
  const i = (idx > -1 && idx < row.length) ? idx : fallback;
  return row[i];
}

const STEP_LABELS = ['ID created','Device allocated','Drata configured',
                     'Google + Slack groups','Team access granted','VPN set up'];

function sendNewTicketEmail(made) {
  const one = made.length === 1;
  const cards = made.map(function (t) {
    return '<div style="border:1px solid #E8E3F3;border-radius:12px;padding:14px 16px;margin-bottom:9px">' +
      '<div style="font:800 15px Inter,Arial;color:#1B1533">' + t.name +
        ' <span style="font:700 10px Inter,Arial;background:#F3EEFF;color:#7B3FD4;border-radius:20px;' +
        'padding:3px 9px;letter-spacing:.5px">' + t.ref + '</span></div>' +
      '<div style="font:500 12.5px Inter,Arial;color:#5C5670;margin-top:6px">Joins ' + t.doj +
        ' &middot; ' + (t.location || 'location not given') + ' &middot; ' +
        (t.laptop ? 'laptop required' : 'no laptop, personal device') + '</div>' +
      '<div style="font:700 12.5px Inter,Arial;color:#DC2B2B;margin-top:6px">Everything due by ' + t.due + '</div>' +
      '<div style="font:500 12.5px Inter,Arial;color:#5C5670;margin-top:9px;line-height:1.9">' +
        STEP_LABELS.map(function (s, i) {
          return (i === 1 && !t.laptop) ? '&#9898; <s>' + s + '</s>' : '&#9744; ' + s;
        }).join('<br>') + '</div></div>';
  }).join('');

  MailApp.sendEmail({
    to: CONFIG.EMAIL_TO, cc: CONFIG.EMAIL_CC,
    subject: one ? 'New joiner — ' + made[0].name + ', onboarding due ' + made[0].due
                 : made.length + ' new joiners — onboarding tickets created',
    htmlBody: shell(
      one ? 'Onboarding ticket created' : made.length + ' onboarding tickets created',
      'Six steps each, due five working days after joining', cards)
  });
}

/* ------------------------------------------------ daily follow-up mail */
function sendDailyFollowUp() {
  const now = new Date();
  if (CONFIG.SKIP_WEEKEND_MAIL && (now.getDay() === 6 || now.getDay() === 0)) return;

  const rows = sb('GET', '/rest/v1/v_pending_steps?select=*');
  if (!rows || !rows.length) return;

  const byPerson = {};
  rows.forEach(function (r) {
    const k = r.ref;
    if (!byPerson[k]) byPerson[k] = { name: r.name, loc: r.location, doj: r.doj,
                                      due: r.due_date, days: r.days_left, steps: [] };
    byPerson[k].steps.push(r.label + ' — <b>' + labelOf(r.status) + '</b>');
  });

  const late = [], due = [], soon = [];
  Object.keys(byPerson).forEach(function (k) {
    const p = byPerson[k];
    (p.days < 0 ? late : p.days === 0 ? due : soon).push(p);
  });

  const total = late.length + due.length + soon.length;
  if (!total) return;

  function block(title, list, colour) {
    if (!list.length) return '';
    return '<h3 style="font:800 12px Inter,Arial;letter-spacing:1px;text-transform:uppercase;color:' +
      colour + ';margin:22px 0 8px">' + title + ' &middot; ' + list.length + '</h3>' +
      list.map(function (p) {
        const tag = p.days < 0 ? (-p.days) + ' days overdue' : p.days === 0 ? 'due today' : p.days + ' days left';
        return '<div style="border:1px solid #E8E3F3;border-radius:10px;padding:11px 13px;margin-bottom:7px">' +
          '<div style="font:700 14px Inter,Arial;color:#1B1533">' + p.name +
            '<span style="font:500 12px Inter,Arial;color:#8B85A0"> &middot; ' + (p.loc || '—') +
            ' &middot; joined ' + p.doj + ' &middot; due ' + p.due + ' &middot; ' + tag + '</span></div>' +
          '<div style="font:500 12.5px Inter,Arial;color:#5C5670;margin-top:6px;line-height:1.8">' +
            p.steps.join(' &nbsp;&middot;&nbsp; ') + '</div></div>';
      }).join('');
  }

  MailApp.sendEmail({
    to: CONFIG.EMAIL_TO, cc: CONFIG.EMAIL_CC,
    subject: 'Onboarding follow-up — ' + late.length + ' overdue, ' + rows.length + ' open steps',
    htmlBody: shell('Onboarding follow-up',
      fmt(new Date()) + ' · ' + late.length + ' overdue, ' + due.length + ' due today, ' +
      soon.length + ' still in the window',
      block('Overdue', late, '#DC2B2B') + block('Due today', due, '#B26A00') +
      block('Still in the window', soon, '#8B85A0'))
  });
}

function labelOf(s) { return s === 'progress' ? 'In progress' : s === 'todo' ? 'To do' : s; }

function shell(title, subtitle, body) {
  const cta = CONFIG.APP_URL
    ? '<p style="margin-top:16px"><a href="' + CONFIG.APP_URL + '/onboarding" style="font:700 13px Inter,Arial;' +
      'background:#9647FF;color:#fff;text-decoration:none;border-radius:8px;padding:11px 20px;' +
      'display:inline-block">Open the tracker</a></p>' : '';
  return '<div style="font-family:Inter,Arial;max-width:640px">' +
    '<div style="background:' + BRAND + ';border-radius:14px;padding:18px 20px;color:#fff">' +
      '<div style="font:800 17px Inter,Arial">' + title + '</div>' +
      '<div style="font:500 13px Inter,Arial;opacity:.88;margin-top:4px">' + subtitle + '</div></div>' +
    '<div style="margin-top:16px">' + body + '</div>' + cta + '</div>';
}

/* ------------------------------------------------------------ helpers */
function asDate(v) {
  if (v instanceof Date) return midnight(v);
  const s = String(v || '').trim();
  if (!s) return midnight(new Date());

  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return midnight(new Date(+m[1], +m[2] - 1, +m[3]));

  m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    const a = +m[1], b = +m[2];
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : +m[3];
    let day, mon;
    if (a > 12)      { day = a; mon = b; }
    else if (b > 12) { mon = a; day = b; }
    else if (CONFIG.DATE_ORDER === 'DMY') { day = a; mon = b; }
    else             { mon = a; day = b; }
    return midnight(new Date(y, mon - 1, day));
  }
  const p = new Date(s);
  return isNaN(p) ? midnight(new Date()) : midnight(p);
}
function midnight(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function fmt(d) {
  const x = (d instanceof Date) ? d : new Date(d);
  return Utilities.formatDate(x, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
