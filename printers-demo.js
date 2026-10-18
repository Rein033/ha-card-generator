/* Live preview for Universal 3D Cards: loads the real card and gives it a small fake Home Assistant with example
   printers, so the preview shows exactly what the card does (drawing, view, options). */
const P3D_URL = 'https://cdn.jsdelivr.net/gh/Rein033/universal-3d-cards@v0.1.0/universal-3d-cards.js';

// Minimal stand-ins for Home Assistant's own elements, only used on this page.
if (!customElements.get('ha-card')) {
  customElements.define('ha-card', class extends HTMLElement {
    connectedCallback() { Object.assign(this.style, { display: 'block', background: 'var(--card-background-color)', borderRadius: '12px',
      boxShadow: '0 1px 2px rgba(0,0,0,.14), 0 1px 1px rgba(0,0,0,.08)', color: 'var(--primary-text-color)' }); }
  });
}
if (!customElements.get('ha-icon')) {
  customElements.define('ha-icon', class extends HTMLElement {
    static get observedAttributes() { return ['icon']; }
    attributeChangedCallback() { this.r(); }
    connectedCallback() { this.r(); }
    r() {
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      const n = (this.getAttribute('icon') || '').replace('mdi:', '');
      this.shadowRoot.innerHTML = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css"><i class="mdi mdi-${n}" style="font-size:var(--mdc-icon-size,24px);line-height:1;display:block"></i>`;
      if (!this.style.display) this.style.display = 'inline-flex';
    }
  });
}

const P3D_HASS = (() => {
  const now = Date.now(), THUMB = 'https://pic2-cdn.creality.com/gcode/thumb/525284689e4079cf50c42c702ebe5d1f';
  const hass = { entities: {}, states: {}, devices: {}, locale: { language: 'en' }, callService: async () => {} };
  const add = (platform, dev, list) => list.forEach(([id, state, attrs = {}, key]) => {
    hass.entities[id] = { entity_id: id, device_id: dev, platform, translation_key: key || null };
    hass.states[id] = { entity_id: id, state: String(state), attributes: attrs, last_updated: String(now) };
  });
  hass.devices = { x1: { id: 'x1', name: 'X1 Carbon', model: 'X1C' }, ams: { id: 'ams', name: 'AMS', model: 'AMS', via_device_id: 'x1' },
    a1: { id: 'a1', name: 'A1', model: 'A1' }, vor: { id: 'vor', name: 'Voron 2.4', model: 'Voron' }, k1c: { id: 'k1c', name: 'K1C', model: 'K1C' },
    ks1: { id: 'ks1', name: 'Kobra S1', model: 'Anycubic Kobra S1' } };
  add('bambu_lab', 'x1', [['sensor.x1c_print_status', 'running', {}, 'print_status'], ['sensor.x1c_print_progress', 46, {}, 'print_progress'],
    ['sensor.x1c_remaining_time', 114, { unit_of_measurement: 'min' }, 'remaining_time'], ['sensor.x1c_task_name', 'Articulated Dragon', {}, 'subtask_name'],
    ['sensor.x1c_nozzle_temperature', 220, {}, 'nozzle_temp'], ['sensor.x1c_nozzle_target_temperature', 220, {}, 'target_nozzle_temp'],
    ['sensor.x1c_bed_temperature', 55, {}, 'bed_temp'], ['sensor.x1c_bed_target_temperature', 55, {}, 'target_bed_temp'], ['sensor.x1c_chamber_temperature', 38, {}, 'chamber_temp'],
    ['binary_sensor.x1c_online', 'on', {}, 'online'], ['button.x1c_pause', 'unknown', {}, 'pause'], ['button.x1c_resume', 'unknown', {}, 'resume'], ['button.x1c_stop', 'unknown', {}, 'stop'],
    ['light.x1c_chamber_light', 'on', {}, 'chamber_light'], ['image.x1c_cover_image', '2026', { entity_picture: THUMB }, 'cover_image'],
    ['sensor.x1c_current_layer', 210, {}, 'current_layer'], ['sensor.x1c_total_layers', 455, {}, 'total_layers'], ['sensor.x1c_print_weight', 61, { unit_of_measurement: 'g' }, 'print_weight'],
    ['camera.x1c_camera', 'streaming', { access_token: 'demo', entity_picture: THUMB }, 'camera']]);
  add('bambu_lab', 'ams', [['sensor.ams_tray_1', 'PLA Basic', { color: '#E8DB2CFF', type: 'PLA' }, 'tray'], ['sensor.ams_tray_2', 'PLA Matte', { color: '#2C8F4AFF', active: true, type: 'PLA' }, 'tray'],
    ['sensor.ams_tray_3', 'PETG', { color: '#FFFFFFFF', type: 'PETG' }, 'tray'], ['sensor.ams_tray_4', 'Empty', { color: '#00000000' }, 'tray']]);
  add('bambu_lab', 'a1', [['sensor.a1_print_status', 'running', {}, 'print_status'], ['sensor.a1_print_progress', 72, {}, 'print_progress'], ['sensor.a1_remaining_time', 24, { unit_of_measurement: 'min' }, 'remaining_time'],
    ['sensor.a1_task_name', 'Phone stand', {}, 'subtask_name'], ['sensor.a1_nozzle_temperature', 215, {}, 'nozzle_temp'], ['sensor.a1_bed_temperature', 60, {}, 'bed_temp'],
    ['binary_sensor.a1_online', 'on', {}, 'online'], ['image.a1_cover_image', '2026', { entity_picture: THUMB }, 'cover_image'], ['button.a1_pause', 'unknown', {}, 'pause'], ['button.a1_stop', 'unknown', {}, 'stop']]);
  add('moonraker', 'vor', [['sensor.voron_current_print_state', 'printing'], ['sensor.voron_progress', 33, {}], ['sensor.voron_print_time_left', 2.4, { unit_of_measurement: 'h' }],
    ['sensor.voron_filename', 'Voron_cube_ABS_0.2_3h1m.gcode'], ['sensor.voron_extruder_temperature', 248], ['sensor.voron_heater_bed_temperature', 105],
    ['sensor.voron_current_layer', 61], ['sensor.voron_total_layer', 150], ['sensor.voron_filament_used', 9.4, { unit_of_measurement: 'm' }], ['sensor.voron_printer_state', 'ready'],
    ['button.voron_pause_print', 'unknown'], ['button.voron_cancel_print', 'unknown'], ['camera.voron_thumbnail', 'idle', { entity_picture: THUMB }]]);
  add('ha_creality_ws', 'k1c', [['sensor.k1c_print_status', 'printing', { file: 'Benchy.stl_PLA_1h2m3s.gcode' }, 'print_status'], ['sensor.k1c_print_progress', 58, {}, 'print_progress'],
    ['sensor.k1c_print_left_time', 1700, { unit_of_measurement: 's' }, 'print_left_time'], ['sensor.k1c_nozzle_temperature', 220, {}, 'nozzle_temperature'],
    ['sensor.k1c_bed_temperature', 50, {}, 'bed_temperature'], ['sensor.k1c_chamber_temperature', 31, {}, 'chamber_temperature'],
    ['image.k1c_current_print_preview', '2026', { entity_picture: THUMB }, 'current_print_preview'], ['light.k1c_light', 'on', {}, 'light']]);
  add('anycubic_cloud', 'ks1', [['binary_sensor.ks1_online', 'on', {}, 'printer_online'], ['binary_sensor.ks1_busy', 'on', {}, 'job_in_progress'],
    ['sensor.ks1_progress', 64, {}, 'job_progress'], ['sensor.ks1_job', 'Skull_bowl_PLA_0.2_12h21m43s', { slicer: 'AnycubicSlicer', layer_height: 0.2, filament_types: ['PLA'] }, 'job_name'],
    ['sensor.ks1_time_remaining', 260, { unit_of_measurement: 'min' }, 'job_time_remaining'], ['image.ks1_preview', 'unknown', { entity_picture: THUMB }, 'job_image_url'],
    ['sensor.ks1_nozzle', 219, {}, 'curr_nozzle_temp'], ['sensor.ks1_bed', 55, {}, 'curr_hotbed_temp'], ['sensor.ks1_slot', 1, {}, 'ace_loaded_slot'],
    ['sensor.ks1_s1', 'PLA', { color_hex: '#E10600', spool_loaded: true }, 'ace_slot_1'], ['sensor.ks1_s2', 'PLA', { color_hex: '#F5821F', spool_loaded: true }, 'ace_slot_2']]);
  return hass;
})();

/* Example printers the entity field suggests. */
const P3D_ENTITIES = ['sensor.x1c_print_status', 'sensor.a1_print_status', 'sensor.voron_current_print_state', 'sensor.k1c_print_status', 'sensor.ks1_progress'];

const P3D_READY = import(P3D_URL).then(() => customElements.whenDefined('printer-3d-card')).catch(() => null);

/* Called after every preview render: give the real cards their config and the fake hass. */
function hydratePrinters(root) {
  const els = root.querySelectorAll('printer-3d-card[data-cfg], printer-3d-group-card[data-cfg]');
  if (!els.length) return;
  P3D_READY.then(() => els.forEach((el) => {
    try {
      const cfg = JSON.parse(el.dataset.cfg);
      if (el.localName === 'printer-3d-card' && !P3D_HASS.entities[cfg.entity]) cfg.entity = 'sensor.x1c_print_status';
      if (cfg.entities) cfg.entities = cfg.entities.filter((e) => P3D_HASS.entities[e]);
      el.setConfig(cfg);
      el.hass = P3D_HASS;
    } catch (e) { el.outerHTML = `<div class="hc-card pad unknown">Preview error: ${h(e.message)}</div>`; }
  }));
}
