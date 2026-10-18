/* HA Card Generator: build a Home Assistant card with a form, see a live preview, copy the YAML. */
const BMC_USER = '';   // Buy Me a Coffee username; the coffee button stays hidden while empty

const $ = (s, r = document) => r.querySelector(s);
const byType = Object.fromEntries(CARDS.map((c) => [c.type, c]));
const state = { root: null, path: [], dark: matchMedia('(prefers-color-scheme: dark)').matches };

/* ── config helpers ─────────────────────────────────── */
function newCard(type) {
  const d = byType[type];
  return { type, ...JSON.parse(JSON.stringify(d ? d.defaults || {} : {})) };
}
function nodeAt(path) { let n = state.root; for (const i of path) n = n.cards[i]; return n; }
function clean(cfg) {
  // drop empty values and put "type" first, so the YAML reads like HA writes it
  const out = { type: cfg.type };
  for (const [k, v] of Object.entries(cfg)) {
    if (k === 'type' || v === '' || v == null || (Array.isArray(v) && !v.length && k !== 'cards')) continue;
    if (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length) continue;
    out[k] = k === 'cards' ? v.map(clean) : v;
  }
  return out;
}
const toYaml = (cfg) => jsyaml.dump(clean(cfg), { lineWidth: -1, noRefs: true, quotingType: '"' });

/* ── share link ─────────────────────────────────────── */
const enc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const dec = (s) => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))));
function saveHash() { history.replaceState(null, '', '#c=' + enc(clean(state.root))); }

/* ── preview ────────────────────────────────────────── */
function render(cfg) {
  const d = byType[cfg.type];
  if (!d) return `<div class="hc-card pad unknown">${icon('mdi:puzzle-outline')}<b>${h(cfg.type)}</b><small>No preview for this card type; its YAML is kept as is.</small></div>`;
  try { return d.preview(cfg, render); } catch (e) { return `<div class="hc-card pad unknown">Preview error: ${h(e.message)}</div>`; }
}
function wrapGrid(cfg, html) {
  const col = cfg.grid_options && cfg.grid_options.columns;
  return `<div class="pv-cell" style="grid-column: span ${col === 'full' || !col ? 12 : Math.max(3, +col)}">${html}</div>`;
}
function updatePreview() {
  const pv = $('#preview');
  pv.className = 'preview ' + (state.dark ? 'dark' : 'light');
  pv.innerHTML = `<div class="pv-section">${wrapGrid(state.root, render(state.root))}</div>`;
  $('#yaml').textContent = toYaml(state.root);
  saveHash();
}

/* ── form ───────────────────────────────────────────── */
const FIELD_LABEL = (f) => f.label || f.name.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const DATALIST = Object.keys(DEMO);

function fieldHtml(f, v, cfg) {
  const id = 'f_' + f.name, lab = `<label for="${id}">${h(FIELD_LABEL(f))}${f.required ? ' *' : ''}</label>`;
  switch (f.type) {
    case 'text': return `<div class="fld">${lab}<input id="${id}" data-f="${f.name}" value="${h(v ?? '')}" placeholder="${h(f.placeholder || '')}"></div>`;
    case 'textarea': return `<div class="fld wide">${lab}<textarea id="${id}" data-f="${f.name}" rows="6">${h(v ?? '')}</textarea></div>`;
    case 'number': return `<div class="fld">${lab}<input id="${id}" type="number" data-f="${f.name}" data-num value="${h(v ?? '')}" ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''}></div>`;
    case 'entity': return `<div class="fld">${lab}<input id="${id}" data-f="${f.name}" list="ents" value="${h(v ?? '')}" placeholder="${h(f.domain ? f.domain + '.' : 'light.')}…" autocomplete="off"></div>`;
    case 'icon': return `<div class="fld">${lab}<div class="iconin"><span>${icon(v || 'mdi:shape-outline')}</span><input id="${id}" data-f="${f.name}" list="icons" value="${h(v ?? '')}" placeholder="mdi:…" autocomplete="off"></div></div>`;
    case 'color': return `<div class="fld">${lab}<div class="colors">${['', ...COLORS].map((c) => `<button type="button" class="sw ${c === (v || '') ? 'sel' : ''}" data-color="${c}" title="${c || 'default'}" style="${c ? `background:${COLOR_HEX[c]}` : ''}">${c ? '' : '∅'}</button>`).join('')}</div></div>`;
    case 'select': {
      const val = f.unmap ? f.unmap(v) : v;
      if (f.multiple) return `<div class="fld wide">${lab}<div class="pills">${f.options.map((o) => `<label class="pill"><input type="checkbox" data-multi="${f.name}" value="${o}" ${(val || []).includes(o) ? 'checked' : ''}>${h(o)}</label>`).join('')}</div></div>`;
      return `<div class="fld">${lab}<select id="${id}" data-f="${f.name}"><option value="">(default)</option>${f.options.map((o) => `<option ${o === val ? 'selected' : ''}>${h(o)}</option>`).join('')}</select></div>`;
    }
    case 'bool': { const on = v ?? f.default ?? false; return `<div class="fld chk"><label class="tog"><input type="checkbox" data-bool="${f.name}" data-def="${f.default ? 1 : 0}" ${on ? 'checked' : ''}><span></span>${h(FIELD_LABEL(f))}</label></div>`; }
    case 'entities': {
      const list = (f.unmap ? f.unmap(v) : (v || []).map((x) => (typeof x === 'string' ? x : x.entity)));
      return `<div class="fld wide">${lab}<div class="elist" data-list="${f.name}">${list.map((e, i) => `<div class="erow"><input list="ents" value="${h(e)}" data-li="${i}" autocomplete="off"><button type="button" class="x" data-del="${i}" title="Remove">${icon('mdi:close')}</button></div>`).join('')}
        <button type="button" class="add" data-addent>${icon('mdi:plus')} Add entity</button></div></div>`;
    }
    case 'action': {
      const a = v || {}; const opts = ['', 'toggle', 'more-info', 'navigate', 'url', 'perform-action', 'none'];
      return `<div class="fld">${lab}<select data-action="${f.name}">${opts.map((o) => `<option value="${o}" ${o === (a.action || '') ? 'selected' : ''}>${o || '(default)'}</option>`).join('')}</select>
        ${a.action === 'navigate' ? `<input data-action-extra="${f.name}" data-key="navigation_path" placeholder="/lovelace/1" value="${h(a.navigation_path || '')}">` : ''}
        ${a.action === 'url' ? `<input data-action-extra="${f.name}" data-key="url_path" placeholder="https://…" value="${h(a.url_path || '')}">` : ''}
        ${a.action === 'perform-action' ? `<input data-action-extra="${f.name}" data-key="perform_action" placeholder="light.turn_on" value="${h(a.perform_action || '')}">` : ''}</div>`;
    }
    case 'grid': { const c = (v && v.columns) || ''; return `<div class="fld">${lab}<select data-grid><option value="">(auto)</option>${[3, 6, 9, 12, 'full'].map((o) => `<option value="${o}" ${String(o) === String(c) ? 'selected' : ''}>${o === 'full' ? 'Full width' : o + ' / 12 columns'}</option>`).join('')}</select></div>`; }
    case 'severity': { const s = v || {}; return `<div class="fld wide">${lab}<div class="sev">${['green', 'yellow', 'red'].map((k) => `<span class="sevi"><i style="background:${COLOR_HEX[k === 'yellow' ? 'amber' : k]}"></i><input type="number" data-sev="${k}" value="${h(s[k] ?? '')}" placeholder="${k}"></span>`).join('')}</div></div>`; }
    case 'styles': { const card = Object.assign({}, ...((v && v.card) || [])); return `<div class="fld wide">${lab}<div class="two"><input data-style="height" placeholder="height, e.g. 120px" value="${h(card.height || '')}"><input data-style="border-radius" placeholder="radius, e.g. 20px" value="${h(card['border-radius'] || '')}"></div></div>`; }
    case 'cards': {
      const kids = v || [];
      return `<div class="fld wide">${lab}<div class="kids">${kids.map((k, i) => { const d = byType[k.type];
        return `<div class="kid"><span class="kic">${icon(d ? d.icon : 'mdi:puzzle-outline')}</span><span class="kname">${h(d ? d.label : k.type)}<small>${h(k.entity || k.heading || k.title || k.primary || '')}</small></span>
          <button type="button" data-kid-up="${i}" title="Up" ${i ? '' : 'disabled'}>${icon('mdi:arrow-up')}</button><button type="button" data-kid-down="${i}" title="Down" ${i < kids.length - 1 ? '' : 'disabled'}>${icon('mdi:arrow-down')}</button>
          <button type="button" data-kid-edit="${i}" class="edit">${icon('mdi:pencil')} Edit</button><button type="button" data-kid-del="${i}" title="Remove">${icon('mdi:delete-outline')}</button></div>`; }).join('')}
        <div class="addkid"><select data-kid-type><option value="">+ Add a card…</option>${groupOptions()}</select></div></div></div>`;
    }
    default: return '';
  }
}
function groupOptions(selected) {
  const groups = [...new Set(CARDS.map((c) => c.group))];
  return groups.map((g) => `<optgroup label="${h(g)}">${CARDS.filter((c) => c.group === g).map((c) => `<option value="${h(c.type)}" ${c.type === selected ? 'selected' : ''}>${h(c.label)}</option>`).join('')}</optgroup>`).join('');
}

function renderForm() {
  const cfg = nodeAt(state.path), d = byType[cfg.type];
  const crumbs = [{ label: byType[state.root.type] ? byType[state.root.type].label : state.root.type, path: [] }];
  state.path.forEach((_, i) => { const p = state.path.slice(0, i + 1); const n = nodeAt(p); crumbs.push({ label: byType[n.type] ? byType[n.type].label : n.type, path: p }); });
  $('#crumbs').innerHTML = crumbs.map((c, i) => (i === crumbs.length - 1 ? `<b>${h(c.label)}</b>` : `<a href="#" data-crumb="${c.path.join(',')}">${h(c.label)}</a> ›`)).join(' ');
  $('#cardtype').innerHTML = groupOptions(cfg.type) + (d ? '' : `<option selected>${h(cfg.type)}</option>`);
  $('#carddesc').textContent = d ? d.desc : 'Unknown card type: you can still edit the YAML below and copy it.';
  $('#form').innerHTML = d ? d.fields.map((f) => fieldHtml(f, cfg[f.name], cfg)).join('') : '';
  updatePreview();
}

function setField(name, value) {
  const cfg = nodeAt(state.path), d = byType[cfg.type];
  const f = d && d.fields.find((x) => x.name === name);
  if (value === '' || value == null || (Array.isArray(value) && !value.length)) delete cfg[name];
  else cfg[name] = f && f.map ? f.map(value) : value;
  updatePreview();
}

/* ── events ─────────────────────────────────────────── */
function bind() {
  const form = $('#form');
  form.addEventListener('input', (ev) => {
    const t = ev.target;
    if (t.dataset.f) {
      const f = byType[nodeAt(state.path).type].fields.find((x) => x.name === t.dataset.f);
      setField(t.dataset.f, t.dataset.num !== undefined ? (t.value === '' ? '' : +t.value) : t.value);
      if (f && f.type === 'icon') t.previousElementSibling.innerHTML = icon(t.value || 'mdi:shape-outline');
    } else if (t.dataset.li !== undefined) {
      const box = t.closest('[data-list]'); const vals = [...box.querySelectorAll('[data-li]')].map((i) => i.value.trim());
      setField(box.dataset.list, vals.filter(Boolean));
    } else if (t.dataset.sev) {
      const s = {}; form.querySelectorAll('[data-sev]').forEach((i) => { if (i.value !== '') s[i.dataset.sev] = +i.value; });
      setField('severity', Object.keys(s).length ? s : '');
    } else if (t.dataset.style) {
      const card = []; form.querySelectorAll('[data-style]').forEach((i) => { if (i.value) card.push({ [i.dataset.style]: i.value }); });
      setField('styles', card.length ? { card } : '');
    } else if (t.dataset.actionExtra) {
      const cfg = nodeAt(state.path); const a = { ...(cfg[t.dataset.actionExtra] || {}) }; a[t.dataset.key] = t.value; cfg[t.dataset.actionExtra] = a; updatePreview();
    }
  });
  form.addEventListener('change', (ev) => {
    const t = ev.target, cfg = nodeAt(state.path);
    if (t.dataset.bool) { const def = t.dataset.def === '1'; setField(t.dataset.bool, t.checked === def ? '' : t.checked); }
    else if (t.dataset.multi) { setField(t.dataset.multi, [...form.querySelectorAll(`[data-multi="${t.dataset.multi}"]:checked`)].map((i) => i.value)); }
    else if (t.dataset.action !== undefined) { if (t.value) cfg[t.dataset.action] = { action: t.value }; else delete cfg[t.dataset.action]; renderForm(); }
    else if (t.dataset.grid !== undefined) { if (t.value) cfg.grid_options = { columns: t.value === 'full' ? 'full' : +t.value }; else delete cfg.grid_options; updatePreview(); }
    else if (t.dataset.kidType !== undefined && t.value) { cfg.cards = cfg.cards || []; cfg.cards.push(newCard(t.value)); state.path = [...state.path, cfg.cards.length - 1]; renderForm(); }
  });
  form.addEventListener('click', (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    const cfg = nodeAt(state.path);
    if (b.dataset.color !== undefined) { setField('color' in (byType[cfg.type].fields.reduce((o, f) => ({ ...o, [f.name]: 1 }), {})) ? 'color' : 'icon_color', b.dataset.color); renderForm(); }
    else if (b.dataset.addent !== undefined) { const box = b.closest('[data-list]'); const f = byType[cfg.type].fields.find((x) => x.name === box.dataset.list);
      const cur = f.unmap ? f.unmap(cfg[f.name]) : (cfg[f.name] || []).map((x) => (typeof x === 'string' ? x : x.entity)); cur.push(''); cfg[f.name] = f.map ? f.map(cur) : cur; renderForm();
      const ins = $('#form').querySelectorAll(`[data-list="${box.dataset.list}"] [data-li]`); ins[ins.length - 1].focus(); }
    else if (b.dataset.del !== undefined) { const box = b.closest('[data-list]'); const vals = [...box.querySelectorAll('[data-li]')].map((i) => i.value.trim()); vals.splice(+b.dataset.del, 1); setField(box.dataset.list, vals.filter(Boolean)); renderForm(); }
    else if (b.dataset.kidEdit !== undefined) { state.path = [...state.path, +b.dataset.kidEdit]; renderForm(); }
    else if (b.dataset.kidDel !== undefined) { cfg.cards.splice(+b.dataset.kidDel, 1); renderForm(); }
    else if (b.dataset.kidUp !== undefined) { const i = +b.dataset.kidUp; [cfg.cards[i - 1], cfg.cards[i]] = [cfg.cards[i], cfg.cards[i - 1]]; renderForm(); }
    else if (b.dataset.kidDown !== undefined) { const i = +b.dataset.kidDown; [cfg.cards[i + 1], cfg.cards[i]] = [cfg.cards[i], cfg.cards[i + 1]]; renderForm(); }
  });
  $('#crumbs').addEventListener('click', (ev) => { const a = ev.target.closest('[data-crumb]'); if (!a) return; ev.preventDefault(); state.path = a.dataset.crumb ? a.dataset.crumb.split(',').map(Number) : []; renderForm(); });
  $('#cardtype').addEventListener('change', (ev) => {
    const fresh = newCard(ev.target.value); const old = nodeAt(state.path);
    if (old.entity && byType[ev.target.value].fields.some((f) => f.name === 'entity')) fresh.entity = old.entity;
    if (old.cards && fresh.cards) fresh.cards = old.cards;
    if (!state.path.length) state.root = fresh; else { const parent = nodeAt(state.path.slice(0, -1)); parent.cards[state.path[state.path.length - 1]] = fresh; }
    renderForm();
  });
  $('#copy').addEventListener('click', async () => {
    await navigator.clipboard.writeText($('#yaml').textContent);
    flash('#copy', 'Copied!');
  });
  $('#share').addEventListener('click', async () => { saveHash(); await navigator.clipboard.writeText(location.href); flash('#share', 'Link copied!'); });
  $('#theme').addEventListener('click', () => { state.dark = !state.dark; updatePreview(); });
  $('#import').addEventListener('click', () => { $('#importbox').hidden = !$('#importbox').hidden; $('#importtext').focus(); });
  $('#doimport').addEventListener('click', () => {
    try {
      const o = jsyaml.load($('#importtext').value);
      if (!o || typeof o !== 'object' || !o.type) throw new Error('This YAML has no "type:" at the top.');
      state.root = o; state.path = []; $('#importbox').hidden = true; $('#importerr').textContent = ''; renderForm();
    } catch (e) { $('#importerr').textContent = e.message; }
  });
  $('#templates').addEventListener('click', (ev) => { const b = ev.target.closest('[data-tpl]'); if (!b) return; state.root = JSON.parse(JSON.stringify(TEMPLATES[+b.dataset.tpl].config)); state.path = []; renderForm(); });
  $('#reset').addEventListener('click', () => { state.root = newCard('tile'); state.path = []; renderForm(); });
}
function flash(sel, text) { const b = $(sel); const old = b.innerHTML; b.textContent = text; setTimeout(() => { b.innerHTML = old; }, 1400); }

/* ── start ──────────────────────────────────────────── */
function start() {
  $('#ents').innerHTML = DATALIST.map((e) => `<option value="${e}">`).join('');
  $('#templates').innerHTML = TEMPLATES.map((t, i) => `<button type="button" data-tpl="${i}">${icon(t.icon)}${h(t.name)}</button>`).join('');
  try { if (location.hash.startsWith('#c=')) state.root = dec(location.hash.slice(3)); } catch (e) { /* broken link: start fresh */ }
  if (!state.root || !state.root.type) state.root = JSON.parse(JSON.stringify(TEMPLATES[0].config));
  if (BMC_USER) { const a = $('#bmc'); a.href = 'https://www.buymeacoffee.com/' + encodeURIComponent(BMC_USER); a.hidden = false; }
  bind(); renderForm();
  // icon suggestions: load the MDI name list once, in the background
  fetch('https://cdn.jsdelivr.net/npm/@mdi/svg@7.4.47/meta.json').then((r) => r.json())
    .then((meta) => { $('#icons').innerHTML = meta.map((m) => `<option value="mdi:${m.name}">`).join(''); }).catch(() => {});
}
start();
