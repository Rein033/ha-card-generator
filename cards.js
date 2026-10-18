/* Card definitions: the form fields and a preview renderer per Home Assistant card type.
   Field types: text, textarea, entity, entities, icon, color, select, bool, number, cards (child cards), action. */

const COLORS = ['primary', 'accent', 'red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal',
  'green', 'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'brown', 'grey', 'blue-grey', 'black', 'white', 'disabled'];
const COLOR_HEX = { primary: 'var(--hc-primary)', accent: 'var(--hc-accent)', red: '#f44336', pink: '#e91e63', purple: '#926bc7',
  'deep-purple': '#6e41ab', indigo: '#3f51b5', blue: '#2196f3', 'light-blue': '#03a9f4', cyan: '#00bcd4', teal: '#009688', green: '#4caf50',
  'light-green': '#8bc34a', lime: '#cddc39', yellow: '#ffeb3b', amber: '#ffc107', orange: '#ff9800', 'deep-orange': '#ff6f22',
  brown: '#795548', grey: '#9e9e9e', 'blue-grey': '#607d8b', black: '#000', white: '#fff', disabled: '#bdbdbd' };
const colorOf = (c, fallback) => (c ? COLOR_HEX[c] || c : fallback);

/* A small demo house, so previews look real. Unknown entities get a sensible state from their domain. */
const DEMO = {
  'light.living_room': { state: 'on', name: 'Living room', icon: 'mdi:sofa', attrs: { brightness: 180, rgb_color: [255, 190, 120] } },
  'light.kitchen': { state: 'on', name: 'Kitchen', icon: 'mdi:ceiling-light', attrs: { brightness: 255 } },
  'light.bedroom': { state: 'off', name: 'Bedroom', icon: 'mdi:bed' },
  'light.garden': { state: 'off', name: 'Garden', icon: 'mdi:outdoor-lamp' },
  'switch.coffee_machine': { state: 'on', name: 'Coffee machine', icon: 'mdi:coffee-maker' },
  'switch.fridge_plug': { state: 'on', name: 'Fridge', icon: 'mdi:fridge-outline' },
  'climate.living_room': { state: 'heat', name: 'Thermostat', icon: 'mdi:thermostat', attrs: { current_temperature: 20.5, temperature: 21, hvac_modes: ['off', 'heat', 'cool', 'auto'] } },
  'sensor.living_room_temperature': { state: '21.4', name: 'Living room temperature', icon: 'mdi:thermometer', unit: '°C' },
  'sensor.outside_temperature': { state: '11.2', name: 'Outside', icon: 'mdi:thermometer', unit: '°C' },
  'sensor.humidity': { state: '54', name: 'Humidity', icon: 'mdi:water-percent', unit: '%' },
  'sensor.power_usage': { state: '412', name: 'Power usage', icon: 'mdi:flash', unit: 'W' },
  'sensor.solar_power': { state: '1830', name: 'Solar', icon: 'mdi:solar-power', unit: 'W' },
  'sensor.phone_battery': { state: '76', name: 'Phone battery', icon: 'mdi:battery-70', unit: '%' },
  'binary_sensor.front_door': { state: 'off', name: 'Front door', icon: 'mdi:door-closed' },
  'binary_sensor.motion_hallway': { state: 'on', name: 'Hallway motion', icon: 'mdi:motion-sensor' },
  'cover.living_room_blinds': { state: 'open', name: 'Blinds', icon: 'mdi:blinds-open', attrs: { current_position: 70 } },
  'lock.front_door': { state: 'locked', name: 'Front door lock', icon: 'mdi:lock' },
  'media_player.living_room_speaker': { state: 'playing', name: 'Speaker', icon: 'mdi:speaker', attrs: { media_title: 'Lo-fi beats' } },
  'person.alex': { state: 'home', name: 'Alex', icon: 'mdi:account' },
  'weather.home': { state: 'partlycloudy', name: 'Home', icon: 'mdi:weather-partly-cloudy', attrs: { temperature: 14, humidity: 72 } },
  'vacuum.robot': { state: 'docked', name: 'Robot vacuum', icon: 'mdi:robot-vacuum' },
  'sensor.x1c_print_status': { state: 'running', name: 'X1C print status', icon: 'mdi:printer-3d', attrs: { progress: 46 } },
};
const DOMAIN_DEFAULT = { light: ['on', 'mdi:lightbulb'], switch: ['on', 'mdi:toggle-switch'], sensor: ['42', 'mdi:eye'], binary_sensor: ['off', 'mdi:radiobox-blank'],
  climate: ['heat', 'mdi:thermostat'], cover: ['closed', 'mdi:window-shutter'], lock: ['locked', 'mdi:lock'], media_player: ['idle', 'mdi:speaker'],
  person: ['home', 'mdi:account'], weather: ['sunny', 'mdi:weather-sunny'], fan: ['off', 'mdi:fan'], vacuum: ['docked', 'mdi:robot-vacuum'],
  scene: ['scening', 'mdi:palette'], script: ['off', 'mdi:script-text'], input_boolean: ['on', 'mdi:toggle-switch'], camera: ['idle', 'mdi:cctv'] };

function ent(id) {
  if (!id) return { id: '', state: 'unknown', name: 'Entity', icon: 'mdi:help-circle-outline', attrs: {}, domain: '' };
  const d = DEMO[id];
  const domain = id.split('.')[0];
  if (d) return { id, domain, attrs: {}, ...d };
  const [state, icon] = DOMAIN_DEFAULT[domain] || ['unknown', 'mdi:help-circle-outline'];
  const name = (id.split('.')[1] || id).replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  return { id, domain, state, name, icon, attrs: {}, unit: domain === 'sensor' ? '' : undefined };
}
const isOn = (e) => ['on', 'open', 'playing', 'home', 'heat', 'cool', 'auto', 'unlocked', 'cleaning'].includes(e.state);
const fmtState = (e) => {
  const map = { on: 'On', off: 'Off', open: 'Open', closed: 'Closed', locked: 'Locked', unlocked: 'Unlocked', home: 'Home', not_home: 'Away',
    playing: 'Playing', idle: 'Idle', heat: 'Heat', cool: 'Cool', auto: 'Auto', docked: 'Docked', partlycloudy: 'Partly cloudy', sunny: 'Sunny', running: 'Printing' };
  if (e.domain === 'light' && e.state === 'on' && e.attrs.brightness != null) return Math.round(e.attrs.brightness / 2.55) + '%';
  if (e.domain === 'cover' && e.attrs.current_position != null) return `${map[e.state] || e.state} · ${e.attrs.current_position}%`;
  return (map[e.state] || e.state) + (e.unit ? ' ' + e.unit : '');
};
const activeColor = (e) => {
  if (!isOn(e)) return 'var(--hc-off)';
  if (e.domain === 'light') return e.attrs.rgb_color ? `rgb(${e.attrs.rgb_color.join(',')})` : '#ffb300';
  if (e.domain === 'climate') return e.state === 'cool' ? '#2196f3' : '#ff6f22';
  if (e.domain === 'binary_sensor') return '#ff9800';
  return 'var(--hc-primary)';
};

const h = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (i, extra = '') => `<i class="mdi ${h(String(i || 'mdi:help').replace('mdi:', 'mdi-'))}" ${extra}></i>`;
const entityList = (v) => (Array.isArray(v) ? v : []).map((x) => (typeof x === 'string' ? { entity: x } : x)).filter((x) => x && x.entity);

/* Very small Jinja-ish preview for templates: states('x'), state_attr('x','y') and plain text. */
function tpl(text) {
  return String(text ?? '').replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, expr) => {
    let m = expr.match(/^states\(['"]([^'"]+)['"]\)(.*)$/);
    if (m) { const e = ent(m[1]); return e.state + (/\|/.test(m[2]) ? '' : ''); }
    m = expr.match(/^state_attr\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/);
    if (m) return String(ent(m[1]).attrs[m[2]] ?? '');
    return '…';
  }).replace(/\{%[^%]*%\}/g, '');
}

const ACTION_FIELD = (name = 'tap_action') => ({ name, type: 'action', label: name === 'tap_action' ? 'Tap action' : 'Hold action' });
const GRID_FIELD = { name: 'grid_options', type: 'grid', label: 'Width in sections view' };

const CARDS = [
  { type: 'tile', label: 'Tile', group: 'Home Assistant', icon: 'mdi:card-outline', desc: 'The modern default card for one entity.',
    fields: [{ name: 'entity', type: 'entity', required: true }, { name: 'name', type: 'text' }, { name: 'icon', type: 'icon' },
      { name: 'color', type: 'color' }, { name: 'vertical', type: 'bool', label: 'Vertical layout' }, { name: 'hide_state', type: 'bool' },
      { name: 'features', type: 'select', multiple: true, label: 'Features', options: ['light-brightness', 'cover-open-close', 'cover-position', 'climate-hvac-modes', 'target-temperature', 'fan-speed', 'vacuum-commands'], map: (v) => v.map((t) => ({ type: t })) , unmap: (v) => (v || []).map((x) => x.type) },
      ACTION_FIELD(), GRID_FIELD],
    defaults: { entity: 'light.living_room' },
    preview: (c) => {
      const e = ent(c.entity); const col = c.color ? colorOf(c.color) : activeColor(e);
      const feats = (c.features || []).map((f) => f.type);
      return `<div class="hc-card tile ${c.vertical ? 'vert' : ''}" style="--tc:${col}">
        <div class="tile-row"><span class="tile-ic ${isOn(e) || c.color ? 'on' : ''}">${icon(c.icon || e.icon)}</span>
          <span class="tile-txt"><b>${h(c.name || e.name)}</b>${c.hide_state ? '' : `<small>${h(fmtState(e))}</small>`}</span></div>
        ${feats.map((f) => (f === 'light-brightness' || f === 'cover-position' || f === 'target-temperature' || f === 'fan-speed'
          ? `<div class="feat-bar"><i style="width:${e.attrs.brightness ? Math.round(e.attrs.brightness / 2.55) : 60}%"></i></div>`
          : `<div class="feat-btns">${(f === 'climate-hvac-modes' ? ['mdi:fire', 'mdi:snowflake', 'mdi:power'] : f === 'vacuum-commands' ? ['mdi:play', 'mdi:pause', 'mdi:home'] : ['mdi:arrow-up', 'mdi:stop', 'mdi:arrow-down']).map((i) => `<span>${icon(i)}</span>`).join('')}</div>`)).join('')}
      </div>`;
    } },
  { type: 'entities', label: 'Entities', group: 'Home Assistant', icon: 'mdi:format-list-bulleted', desc: 'A list of entities with their state.',
    fields: [{ name: 'title', type: 'text' }, { name: 'icon', type: 'icon' }, { name: 'entities', type: 'entities', required: true },
      { name: 'show_header_toggle', type: 'bool' }, { name: 'state_color', type: 'bool', label: 'Colour icons by state' }, GRID_FIELD],
    defaults: { title: 'Living room', entities: ['light.living_room', 'sensor.living_room_temperature', 'binary_sensor.front_door'] },
    preview: (c) => `<div class="hc-card pad">${c.title ? `<div class="card-title">${c.icon ? icon(c.icon) : ''}${h(c.title)}</div>` : ''}
      ${entityList(c.entities).map((x) => { const e = ent(x.entity); const toggle = ['light', 'switch', 'input_boolean', 'fan'].includes(e.domain);
        return `<div class="ent-row"><span class="ent-ic" style="color:${c.state_color && isOn(e) ? activeColor(e) : 'var(--hc-icon)'}">${icon(x.icon || e.icon)}</span>
          <span class="ent-name">${h(x.name || e.name)}</span>${toggle ? `<span class="switch ${isOn(e) ? 'on' : ''}"></span>` : `<span class="ent-state">${h(fmtState(e))}</span>`}</div>`; }).join('')}</div>` },
  { type: 'button', label: 'Button', group: 'Home Assistant', icon: 'mdi:gesture-tap-button', desc: 'A big button that toggles or runs an action.',
    fields: [{ name: 'entity', type: 'entity' }, { name: 'name', type: 'text' }, { name: 'icon', type: 'icon' }, { name: 'show_name', type: 'bool', default: true },
      { name: 'show_state', type: 'bool' }, { name: 'show_icon', type: 'bool', default: true }, { name: 'icon_height', type: 'text', placeholder: '60px' }, ACTION_FIELD(), GRID_FIELD],
    defaults: { entity: 'switch.coffee_machine', show_state: true },
    preview: (c) => { const e = ent(c.entity);
      return `<div class="hc-card btn-card">${c.show_icon === false ? '' : `<span class="btn-ic" style="color:${isOn(e) ? activeColor(e) : 'var(--hc-icon)'};font-size:${h(c.icon_height || '56px')}">${icon(c.icon || e.icon)}</span>`}
        ${c.show_name === false ? '' : `<b>${h(c.name || e.name)}</b>`}${c.show_state ? `<small>${h(fmtState(e))}</small>` : ''}</div>`; } },
  { type: 'glance', label: 'Glance', group: 'Home Assistant', icon: 'mdi:eye-outline', desc: 'Several entities side by side.',
    fields: [{ name: 'title', type: 'text' }, { name: 'entities', type: 'entities', required: true }, { name: 'columns', type: 'number', min: 1, max: 8 },
      { name: 'show_name', type: 'bool', default: true }, { name: 'show_state', type: 'bool', default: true }, { name: 'state_color', type: 'bool' }, GRID_FIELD],
    defaults: { entities: ['person.alex', 'binary_sensor.front_door', 'lock.front_door', 'sensor.outside_temperature'] },
    preview: (c) => { const list = entityList(c.entities);
      return `<div class="hc-card pad">${c.title ? `<div class="card-title">${h(c.title)}</div>` : ''}<div class="glance" style="grid-template-columns:repeat(${c.columns || Math.min(5, list.length || 1)},1fr)">
        ${list.map((x) => { const e = ent(x.entity); return `<div>${c.show_name === false ? '' : `<small>${h(x.name || e.name)}</small>`}<span style="color:${c.state_color && isOn(e) ? activeColor(e) : 'var(--hc-icon)'}">${icon(x.icon || e.icon)}</span>${c.show_state === false ? '' : `<small>${h(fmtState(e))}</small>`}</div>`; }).join('')}</div></div>`; } },
  { type: 'gauge', label: 'Gauge', group: 'Home Assistant', icon: 'mdi:gauge', desc: 'A dial for a number, with coloured ranges.',
    fields: [{ name: 'entity', type: 'entity', required: true, domain: 'sensor' }, { name: 'name', type: 'text' }, { name: 'unit', type: 'text' },
      { name: 'min', type: 'number' }, { name: 'max', type: 'number' }, { name: 'needle', type: 'bool' },
      { name: 'severity', type: 'severity', label: 'Colour ranges (from value)' }, GRID_FIELD],
    defaults: { entity: 'sensor.power_usage', min: 0, max: 3000, severity: { green: 0, yellow: 1500, red: 2500 } },
    preview: (c) => { const e = ent(c.entity); const v = parseFloat(e.state) || 0; const min = c.min ?? 0, max = c.max ?? 100;
      const f = Math.max(0, Math.min(1, (v - min) / (max - min || 1)));
      const sev = c.severity || {}; const col = sev.red != null && v >= sev.red ? '#f44336' : sev.yellow != null && v >= sev.yellow ? '#ffc107' : sev.green != null && v >= sev.green ? '#4caf50' : 'var(--hc-primary)';
      const L = Math.PI * 70;
      return `<div class="hc-card gauge"><svg viewBox="0 0 180 104"><path d="M20 94 A70 70 0 0 1 160 94" class="g-trk"/><path d="M20 94 A70 70 0 0 1 160 94" class="g-val" style="stroke:${col};stroke-dasharray:${L * f} ${L}"/>
        ${c.needle ? `<line x1="90" y1="94" x2="${90 - 60 * Math.cos(Math.PI * f)}" y2="${94 - 60 * Math.sin(Math.PI * f)}" stroke="var(--hc-text)" stroke-width="3" stroke-linecap="round"/>` : ''}</svg>
        <b>${h(e.state)} ${h(c.unit ?? e.unit ?? '')}</b><small>${h(c.name || e.name)}</small></div>`; } },
  { type: 'thermostat', label: 'Thermostat', group: 'Home Assistant', icon: 'mdi:thermostat', desc: 'Dial to set a climate device.',
    fields: [{ name: 'entity', type: 'entity', required: true, domain: 'climate' }, { name: 'name', type: 'text' }, GRID_FIELD],
    defaults: { entity: 'climate.living_room' },
    preview: (c) => { const e = ent(c.entity); const t = e.attrs.temperature ?? 21, cur = e.attrs.current_temperature ?? 20;
      return `<div class="hc-card thermo"><svg viewBox="0 0 160 140"><path d="M30 120 A62 62 0 1 1 130 120" class="g-trk"/><path d="M30 120 A62 62 0 1 1 130 120" class="g-val" style="stroke:${activeColor(e)};stroke-dasharray:180 400"/></svg>
        <div class="th-mid"><small>${h(fmtState(e))}</small><b>${h(t)}<sup>°C</sup></b><small>${icon('mdi:thermometer')} ${h(cur)} °C</small></div>
        <div class="th-name">${h(c.name || e.name)}</div></div>`; } },
  { type: 'light', label: 'Light', group: 'Home Assistant', icon: 'mdi:lightbulb', desc: 'Brightness dial for a light.',
    fields: [{ name: 'entity', type: 'entity', required: true, domain: 'light' }, { name: 'name', type: 'text' }, { name: 'icon', type: 'icon' }, GRID_FIELD],
    defaults: { entity: 'light.living_room' },
    preview: (c) => { const e = ent(c.entity); const p = isOn(e) ? Math.round((e.attrs.brightness ?? 255) / 2.55) : 0;
      return `<div class="hc-card thermo"><svg viewBox="0 0 160 140"><path d="M30 120 A62 62 0 1 1 130 120" class="g-trk"/><path d="M30 120 A62 62 0 1 1 130 120" class="g-val" style="stroke:${activeColor(e)};stroke-dasharray:${3.4 * p} 400"/></svg>
        <div class="th-mid"><span style="font-size:40px;color:${activeColor(e)}">${icon(c.icon || e.icon)}</span><b>${p}%</b></div><div class="th-name">${h(c.name || e.name)}</div></div>`; } },
  { type: 'weather-forecast', label: 'Weather', group: 'Home Assistant', icon: 'mdi:weather-partly-cloudy', desc: 'Current weather and forecast.',
    fields: [{ name: 'entity', type: 'entity', required: true, domain: 'weather' }, { name: 'name', type: 'text' }, { name: 'show_forecast', type: 'bool', default: true },
      { name: 'forecast_type', type: 'select', options: ['daily', 'hourly', 'twice_daily'] }, GRID_FIELD],
    defaults: { entity: 'weather.home', forecast_type: 'daily' },
    preview: (c) => { const e = ent(c.entity);
      return `<div class="hc-card pad weather"><div class="w-top"><span class="w-ic">${icon('mdi:weather-partly-cloudy')}</span><div><b>${h(fmtState(e))}</b><small>${h(c.name || e.name)}</small></div><div class="w-t">${h(e.attrs.temperature ?? 14)}°</div></div>
        ${c.show_forecast === false ? '' : `<div class="w-days">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => `<div><small>${d}</small>${icon(['mdi:weather-sunny', 'mdi:weather-cloudy', 'mdi:weather-rainy', 'mdi:weather-partly-cloudy', 'mdi:weather-sunny'][i])}<b>${[16, 13, 11, 14, 17][i]}°</b></div>`).join('')}</div>`}</div>`; } },
  { type: 'markdown', label: 'Markdown', group: 'Home Assistant', icon: 'mdi:language-markdown', desc: 'Text, lists and templates.',
    fields: [{ name: 'title', type: 'text' }, { name: 'content', type: 'textarea', required: true }, { name: 'text_only', type: 'bool', label: 'No card background' }, GRID_FIELD],
    defaults: { content: "## Welcome home\nIt is **{{ states('sensor.outside_temperature') }} °C** outside." },
    preview: (c) => `<div class="hc-card pad ${c.text_only ? 'bare' : ''}">${c.title ? `<div class="card-title">${h(c.title)}</div>` : ''}<div class="md">${markdown(tpl(c.content))}</div></div>` },
  { type: 'heading', label: 'Heading', group: 'Home Assistant', icon: 'mdi:format-header-1', desc: 'A title with badges, for sections.',
    fields: [{ name: 'heading', type: 'text', required: true }, { name: 'icon', type: 'icon' }, { name: 'heading_style', type: 'select', options: ['title', 'subtitle'] },
      { name: 'badges', type: 'entities', label: 'Badges', map: (v) => v.map((x) => ({ type: 'entity', entity: typeof x === 'string' ? x : x.entity })), unmap: (v) => (v || []).map((x) => x.entity) }, GRID_FIELD],
    defaults: { heading: 'Living room', icon: 'mdi:sofa' },
    preview: (c) => `<div class="heading ${c.heading_style === 'subtitle' ? 'sub' : ''}">${c.icon ? icon(c.icon) : ''}<span>${h(c.heading)}</span>
      <span class="badges">${(c.badges || []).map((b) => { const e = ent(b.entity); return `<span class="badge">${icon(e.icon)}${h(fmtState(e))}</span>`; }).join('')}</span></div>` },
  { type: 'vertical-stack', label: 'Vertical stack', group: 'Layout', icon: 'mdi:view-agenda-outline', desc: 'Cards under each other.',
    fields: [{ name: 'title', type: 'text' }, { name: 'cards', type: 'cards' }, GRID_FIELD], defaults: { cards: [] },
    preview: (c, render) => `<div class="stack v">${c.title ? `<div class="stack-title">${h(c.title)}</div>` : ''}${(c.cards || []).map(render).join('') || '<div class="empty">Add cards to this stack</div>'}</div>` },
  { type: 'horizontal-stack', label: 'Horizontal stack', group: 'Layout', icon: 'mdi:view-column-outline', desc: 'Cards next to each other.',
    fields: [{ name: 'title', type: 'text' }, { name: 'cards', type: 'cards' }, GRID_FIELD], defaults: { cards: [] },
    preview: (c, render) => `<div class="stack h">${c.title ? `<div class="stack-title">${h(c.title)}</div>` : ''}<div class="hrow">${(c.cards || []).map(render).join('') || '<div class="empty">Add cards to this stack</div>'}</div></div>` },
  { type: 'grid', label: 'Grid', group: 'Layout', icon: 'mdi:view-grid-outline', desc: 'Cards in a grid.',
    fields: [{ name: 'title', type: 'text' }, { name: 'columns', type: 'number', min: 1, max: 6 }, { name: 'square', type: 'bool', default: true }, { name: 'cards', type: 'cards' }, GRID_FIELD],
    defaults: { columns: 2, square: false, cards: [] },
    preview: (c, render) => `<div class="stack">${c.title ? `<div class="stack-title">${h(c.title)}</div>` : ''}<div class="gridc ${c.square === false ? '' : 'sq'}" style="grid-template-columns:repeat(${c.columns || 3},minmax(0,1fr))">${(c.cards || []).map(render).join('') || '<div class="empty">Add cards to this grid</div>'}</div></div>` },
  { type: 'custom:mushroom-entity-card', label: 'Mushroom entity', group: 'Mushroom', icon: 'mdi:mushroom-outline', desc: 'Minimal entity card (needs Mushroom from HACS).',
    fields: [{ name: 'entity', type: 'entity', required: true }, { name: 'name', type: 'text' }, { name: 'icon', type: 'icon' }, { name: 'icon_color', type: 'color' },
      { name: 'layout', type: 'select', options: ['default', 'vertical', 'horizontal'] }, { name: 'primary_info', type: 'select', options: ['name', 'state', 'last-changed', 'none'] },
      { name: 'secondary_info', type: 'select', options: ['state', 'name', 'last-changed', 'none'] }, { name: 'fill_container', type: 'bool' }, ACTION_FIELD(), GRID_FIELD],
    defaults: { entity: 'sensor.living_room_temperature', icon_color: 'orange' },
    preview: (c) => mushroom(c, ent(c.entity)) },
  { type: 'custom:mushroom-light-card', label: 'Mushroom light', group: 'Mushroom', icon: 'mdi:lightbulb-outline', desc: 'Light with brightness bar (Mushroom).',
    fields: [{ name: 'entity', type: 'entity', required: true, domain: 'light' }, { name: 'name', type: 'text' }, { name: 'icon', type: 'icon' },
      { name: 'layout', type: 'select', options: ['default', 'vertical', 'horizontal'] }, { name: 'show_brightness_control', type: 'bool' }, { name: 'use_light_color', type: 'bool' },
      { name: 'fill_container', type: 'bool' }, ACTION_FIELD(), GRID_FIELD],
    defaults: { entity: 'light.living_room', show_brightness_control: true, use_light_color: true },
    preview: (c) => { const e = ent(c.entity);
      return mushroom({ ...c, icon_color: null }, e, c.use_light_color ? activeColor(e) : isOn(e) ? '#ffb300' : null,
        c.show_brightness_control ? `<div class="feat-bar m"><i style="width:${isOn(e) ? Math.round((e.attrs.brightness ?? 255) / 2.55) : 0}%;background:${c.use_light_color ? activeColor(e) : '#ffb300'}"></i></div>` : ''); } },
  { type: 'custom:mushroom-template-card', label: 'Mushroom template', group: 'Mushroom', icon: 'mdi:code-braces', desc: 'Your own text with templates (Mushroom).',
    fields: [{ name: 'primary', type: 'text' }, { name: 'secondary', type: 'text' }, { name: 'icon', type: 'icon' }, { name: 'icon_color', type: 'color' },
      { name: 'entity', type: 'entity' }, { name: 'layout', type: 'select', options: ['default', 'vertical', 'horizontal'] }, { name: 'fill_container', type: 'bool' }, ACTION_FIELD(), GRID_FIELD],
    defaults: { primary: 'Good evening', secondary: "{{ states('sensor.outside_temperature') }} °C outside", icon: 'mdi:home-heart', icon_color: 'pink' },
    preview: (c) => mushroom({ ...c, name: tpl(c.primary) }, { ...ent(c.entity), name: tpl(c.primary), icon: c.icon || 'mdi:shape' }, null, '', tpl(c.secondary)) },
  { type: 'custom:mushroom-chips-card', label: 'Mushroom chips', group: 'Mushroom', icon: 'mdi:dots-horizontal-circle-outline', desc: 'Small chips, great as a header (Mushroom).',
    fields: [{ name: 'chips', type: 'entities', label: 'Chips (entities)', map: (v) => v.map((x) => ({ type: 'entity', entity: typeof x === 'string' ? x : x.entity })), unmap: (v) => (v || []).filter((x) => x.entity).map((x) => x.entity) },
      { name: 'alignment', type: 'select', options: ['start', 'center', 'end', 'justify'] }, GRID_FIELD],
    defaults: { chips: [{ type: 'entity', entity: 'person.alex' }, { type: 'entity', entity: 'sensor.outside_temperature' }, { type: 'entity', entity: 'light.living_room' }], alignment: 'center' },
    preview: (c) => `<div class="chips ${h(c.alignment || 'start')}">${(c.chips || []).map((x) => { const e = ent(x.entity); return `<span class="chip">${icon(x.icon || e.icon, `style="color:${isOn(e) ? activeColor(e) : 'var(--hc-icon)'}"`)}${h(fmtState(e))}</span>`; }).join('')}</div>` },
  { type: 'custom:button-card', label: 'button-card', group: 'Community', icon: 'mdi:button-cursor', desc: 'Highly styleable button (needs button-card from HACS).',
    fields: [{ name: 'entity', type: 'entity' }, { name: 'name', type: 'text' }, { name: 'icon', type: 'icon' }, { name: 'color_type', type: 'select', options: ['icon', 'card', 'label-card', 'blank-card'] },
      { name: 'color', type: 'color' }, { name: 'show_state', type: 'bool' }, { name: 'show_name', type: 'bool', default: true }, { name: 'size', type: 'text', placeholder: '40%' },
      { name: 'styles', type: 'styles', label: 'Card height / corner radius' }, ACTION_FIELD(), ACTION_FIELD('hold_action'), GRID_FIELD],
    defaults: { entity: 'light.kitchen', color_type: 'card', show_state: true, styles: { card: [{ height: '120px' }, { 'border-radius': '20px' }] } },
    preview: (c) => { const e = ent(c.entity); const on = isOn(e); const col = colorOf(c.color, activeColor(e));
      const card = Object.assign({}, ...((c.styles && c.styles.card) || []));
      const bg = c.color_type === 'card' && on ? col : 'var(--hc-card)';
      return `<div class="hc-card bcard" style="background:${bg};height:${h(card.height || 'auto')};border-radius:${h(card['border-radius'] || '12px')};color:${c.color_type === 'card' && on ? '#111' : 'var(--hc-text)'}">
        <span style="font-size:${h(c.size || '40%') === '40%' ? '42px' : h(c.size)};color:${c.color_type === 'icon' && on ? col : 'inherit'}">${icon(c.icon || e.icon)}</span>
        ${c.show_name === false ? '' : `<b>${h(c.name || e.name)}</b>`}${c.show_state ? `<small>${h(fmtState(e))}</small>` : ''}</div>`; } },
  { type: 'custom:printer-3d-card', label: 'Universal 3D Printer', group: 'Universal 3D Cards', icon: 'mdi:printer-3d', desc: 'Any 3D printer: Bambu, Klipper, Creality, Anycubic, OctoPrint.',
    fields: [{ name: 'entity', type: 'entity', required: true }, { name: 'name', type: 'text' }, { name: 'view', type: 'select', options: ['printer', 'preview', 'camera'] },
      { name: 'drawing', type: 'select', options: ['auto', 'bambu', 'bedslinger', 'voron', 'k1', 'kobra', 'enclosed'] }, { name: 'show_slicer', type: 'bool', default: true },
      { name: 'show_temperatures', type: 'bool', default: true }, { name: 'show_controls', type: 'bool', default: true }, { name: 'show_view_switch', type: 'bool', default: true }, GRID_FIELD],
    defaults: { entity: 'sensor.x1c_print_status' },
    preview: (c) => `<printer-3d-card data-cfg="${h(JSON.stringify(c))}"></printer-3d-card>` },
  { type: 'custom:printer-3d-group-card', label: 'Universal 3D Printer group', group: 'Universal 3D Cards', icon: 'mdi:format-list-checks', desc: 'All 3D printers in one list.',
    fields: [{ name: 'title', type: 'text' }, { name: 'entities', type: 'entities' }, { name: 'show_idle', type: 'bool', default: true }, GRID_FIELD],
    defaults: { title: 'Printers' },
    preview: (c) => `<printer-3d-group-card data-cfg="${h(JSON.stringify(c))}"></printer-3d-group-card>` },
];

function mushroom(c, e, iconColor, extra = '', secondaryText) {
  const col = iconColor || (c.icon_color ? colorOf(c.icon_color) : isOn(e) ? activeColor(e) : null);
  const primary = c.primary_info === 'none' ? '' : c.primary_info === 'state' ? fmtState(e) : (c.name || e.name);
  const secondary = secondaryText !== undefined ? secondaryText : c.secondary_info === 'none' ? '' : c.secondary_info === 'name' ? e.name : c.secondary_info === 'last-changed' ? '2 minutes ago' : fmtState(e);
  return `<div class="hc-card mush ${h(c.layout || 'default')} ${c.fill_container ? 'fill' : ''}">
    <div class="m-row"><span class="m-ic" style="${col ? `color:${col};background:color-mix(in srgb, ${col} 20%, transparent)` : ''}">${icon(c.icon || e.icon)}</span>
    <span class="m-txt"><b>${h(primary)}</b>${secondary ? `<small>${h(secondary)}</small>` : ''}</span></div>${extra}</div>`;
}

/* Tiny markdown for the preview: headings, bold, italics, lists, paragraphs. */
function markdown(src) {
  const lines = h(src).split('\n'); let out = '', list = false;
  for (const l of lines) {
    const inline = (t) => t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
    if (/^\s*[-*] /.test(l)) { if (!list) { out += '<ul>'; list = true; } out += `<li>${inline(l.replace(/^\s*[-*] /, ''))}</li>`; continue; }
    if (list) { out += '</ul>'; list = false; }
    const m = l.match(/^(#{1,3}) (.*)$/);
    if (m) out += `<h${m[1].length + 1}>${inline(m[2])}</h${m[1].length + 1}>`;
    else if (l.trim()) out += `<p>${inline(l)}</p>`;
  }
  return out + (list ? '</ul>' : '');
}

const TEMPLATES = [
  { name: 'Room with lights', icon: 'mdi:sofa', config: { type: 'vertical-stack', cards: [
    { type: 'heading', heading: 'Living room', icon: 'mdi:sofa', badges: [{ type: 'entity', entity: 'sensor.living_room_temperature' }, { type: 'entity', entity: 'sensor.humidity' }] },
    { type: 'grid', columns: 2, square: false, cards: [
      { type: 'tile', entity: 'light.living_room', features: [{ type: 'light-brightness' }] }, { type: 'tile', entity: 'light.kitchen', features: [{ type: 'light-brightness' }] },
      { type: 'tile', entity: 'cover.living_room_blinds', features: [{ type: 'cover-open-close' }] }, { type: 'tile', entity: 'media_player.living_room_speaker' }] }] } },
  { name: 'Climate', icon: 'mdi:thermostat', config: { type: 'horizontal-stack', cards: [{ type: 'thermostat', entity: 'climate.living_room' },
    { type: 'gauge', entity: 'sensor.humidity', min: 0, max: 100, name: 'Humidity', severity: { green: 35, yellow: 60, red: 75 } }] } },
  { name: 'Mushroom header', icon: 'mdi:mushroom-outline', config: { type: 'vertical-stack', cards: [
    { type: 'custom:mushroom-template-card', primary: 'Good evening, Alex', secondary: "{{ states('sensor.outside_temperature') }} °C · partly cloudy", icon: 'mdi:home-heart', icon_color: 'pink', fill_container: true },
    { type: 'custom:mushroom-chips-card', alignment: 'center', chips: [{ type: 'entity', entity: 'person.alex' }, { type: 'entity', entity: 'lock.front_door' }, { type: 'entity', entity: 'sensor.power_usage' }] }] } },
  { name: 'Energy', icon: 'mdi:flash', config: { type: 'grid', columns: 2, square: false, cards: [
    { type: 'gauge', entity: 'sensor.power_usage', name: 'Usage', min: 0, max: 3000, needle: true, severity: { green: 0, yellow: 1500, red: 2500 } },
    { type: 'gauge', entity: 'sensor.solar_power', name: 'Solar', min: 0, max: 4000, severity: { green: 1000, yellow: 300, red: 0 } }] } },
  { name: '3D printer', icon: 'mdi:printer-3d', config: { type: 'custom:printer-3d-card', entity: 'sensor.x1c_print_status' } },
  { name: 'Status buttons', icon: 'mdi:gesture-tap-button', config: { type: 'grid', columns: 3, square: true, cards: [
    { type: 'custom:button-card', entity: 'light.kitchen', color_type: 'card', show_state: true }, { type: 'custom:button-card', entity: 'switch.coffee_machine', color_type: 'card', show_state: true },
    { type: 'custom:button-card', entity: 'light.bedroom', color_type: 'card', show_state: true }] } },
];
