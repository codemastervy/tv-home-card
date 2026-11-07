/* tv-home-card.js — "TV Home" card for Home Assistant
 * https://github.com/codemastervy/tv-home-card  (MIT License)
 * A 10-foot, remote-first dashboard: persistent left rail, big focus glow, D-pad spatial
 * navigation (arrows / OK / Back), live cameras with full-screen view, room rows, lights grid,
 * front-door person alert. Works with touch/mouse too. Config comes from the card YAML.
 */
const TVH_VERSION = "1.1.0";

const css = `
:host{display:block;height:100%;--u:min(calc(100vw/1920),calc(100vh/1080));
  --bg:var(--primary-background-color,#111111);--card:var(--card-background-color,var(--ha-card-background,#1c1c1c));
  --fg:var(--primary-text-color,#e1e1e1);--dim:var(--secondary-text-color,#9b9b9b);--line:var(--divider-color,rgba(225,225,225,.12));
  --r:calc(var(--u)*30);--focus:var(--primary-text-color,#fff);
  --red:244,67,54;--amber:255,193,7;--teal:0,150,136;--green:76,175,80;--orange:255,152,0;--pink:233,30,99;--brown:121,85,72;
  --blue:33,150,243;--purple:156,39,176;--lgreen:139,195,74;--grey:158,158,158;
  font-family:var(--paper-font-body1_-_font-family,Roboto,"Segoe UI",system-ui,sans-serif);color:var(--fg)}
*{box-sizing:border-box}
.root{position:relative;width:100%;height:100%;overflow:hidden;background:var(--bg)}
.layout{position:relative;z-index:1;display:grid;grid-template-columns:calc(var(--u)*520) minmax(0,1fr);grid-template-rows:minmax(0,1fr);gap:calc(var(--u)*40);
  height:100%;padding:calc(var(--u)*54) calc(var(--u)*64)}
/* ---------- rail ---------- */
.rail{display:flex;flex-direction:column;gap:calc(var(--u)*18);min-height:0;overflow-y:auto;scrollbar-width:none;padding:calc(var(--u)*10);margin:calc(var(--u)*-10);scroll-behavior:smooth}
.rail::-webkit-scrollbar{display:none}
.clock{font-size:calc(var(--u)*120);font-weight:400;letter-spacing:-.02em;line-height:.95}
.clock small{font-size:.3em;font-weight:500;margin-left:.2em;color:var(--dim);letter-spacing:0}
.greet{font-size:calc(var(--u)*44);font-weight:400;line-height:1.15;margin-top:calc(var(--u)*6)}
.date{font-size:calc(var(--u)*28);color:var(--dim);margin-top:calc(var(--u)*2)}
.wx{display:flex;align-items:center;gap:calc(var(--u)*16);font-size:calc(var(--u)*30)}
.wx ha-icon{--mdc-icon-size:calc(var(--u)*56);color:rgb(var(--amber))}
.wx b{font-size:calc(var(--u)*48);font-weight:500}
.wx span{color:var(--dim)}
.chips{display:flex;flex-direction:column;gap:calc(var(--u)*12);align-items:flex-start;flex:none}
.chip{display:flex;align-items:center;gap:calc(var(--u)*14);padding:calc(var(--u)*14) calc(var(--u)*24);max-width:100%;
  border-radius:calc(var(--u)*60);background:var(--card);border:1px solid var(--line);font-size:calc(var(--u)*27);font-weight:600}
.chip ha-icon{--mdc-icon-size:calc(var(--u)*34);color:rgb(var(--c,var(--grey)))}
.chip .t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dot{width:calc(var(--u)*18);height:calc(var(--u)*18);border-radius:50%;display:inline-block}
.dots{display:flex;gap:calc(var(--u)*7)}
.nav{display:flex;flex-direction:column;gap:calc(var(--u)*14);margin-top:auto;flex:none}
.navb{display:flex;align-items:center;gap:calc(var(--u)*22);padding:calc(var(--u)*22) calc(var(--u)*28);border-radius:var(--r);
  font-size:calc(var(--u)*34);font-weight:500;background:var(--card);border:1px solid var(--line)}
.navb ha-icon{--mdc-icon-size:calc(var(--u)*46);color:rgb(var(--c))}
.navb .sub{display:block;font-size:calc(var(--u)*24);color:var(--dim);font-weight:400;margin-top:calc(var(--u)*2)}
.navb.on{border-color:rgba(var(--c),.7);background:linear-gradient(rgba(var(--c),.10),rgba(var(--c),.10)),var(--card)}
/* ---------- focus ---------- */
[data-f]{cursor:pointer;outline:none;transition:transform .16s ease,box-shadow .16s ease,border-color .2s}
[data-f].f{transform:scale(1.045);box-shadow:0 0 0 calc(var(--u)*5) var(--focus),0 calc(var(--u)*14) calc(var(--u)*40) rgba(0,0,0,.65);z-index:5;position:relative}
.navb.f,.chip.f{transform:scale(1.03)}
/* ---------- stage ---------- */
.stage{position:relative;min-width:0;min-height:0}
.pane{position:absolute;inset:0;opacity:0;pointer-events:none;transform:translateY(calc(var(--u)*24));transition:opacity .28s,transform .28s}
.pane.show{opacity:1;pointer-events:auto;transform:none}
.cams{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:calc(var(--u)*30);height:100%}
.cam{position:relative;border-radius:var(--r);overflow:hidden;background:#000;border:1px solid var(--line)}
.cam img{width:100%;height:100%;object-fit:cover;display:block}
.cam .lbl{position:absolute;left:calc(var(--u)*18);bottom:calc(var(--u)*18);display:flex;gap:calc(var(--u)*12);align-items:center;
  font-size:calc(var(--u)*28);font-weight:600;padding:calc(var(--u)*10) calc(var(--u)*22);border-radius:calc(var(--u)*60);
  background:rgba(17,17,17,.78);border:1px solid var(--line)}
.live{width:calc(var(--u)*14);height:calc(var(--u)*14);border-radius:50%;background:rgb(var(--red));animation:pulse 1.6s infinite;flex:none}
@keyframes pulse{50%{opacity:.25}}
.cam .badge{position:absolute;right:calc(var(--u)*18);top:calc(var(--u)*18);font-size:calc(var(--u)*26);font-weight:600;padding:calc(var(--u)*8) calc(var(--u)*20);
  border-radius:calc(var(--u)*60);background:rgb(var(--red));display:none}
.cam.alert{border-color:rgb(var(--red));box-shadow:0 0 0 calc(var(--u)*4) rgb(var(--red))}
.cam.alert .badge{display:block}
.cam .off[hidden]{display:none}
.cam .off{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:calc(var(--u)*30);color:var(--dim)}
.wxcard{border-radius:var(--r);padding:calc(var(--u)*34);background:var(--card);border:1px solid var(--line);display:flex;flex-direction:column}
.wxnow{display:flex;align-items:center;gap:calc(var(--u)*26)}
.wxnow ha-icon{--mdc-icon-size:calc(var(--u)*104);color:rgb(var(--amber))}
.wxnow .big{font-size:calc(var(--u)*88);font-weight:400;line-height:1}
.wxnow .cond{font-size:calc(var(--u)*30);color:var(--dim);margin-top:calc(var(--u)*6)}
.fc{display:grid;grid-template-columns:repeat(5,1fr);gap:calc(var(--u)*10);margin-top:auto}
.fc div{text-align:center;font-size:calc(var(--u)*26);color:var(--dim);display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*6)}
.fc ha-icon{--mdc-icon-size:calc(var(--u)*48);color:var(--fg)}
.fc b{color:var(--fg);font-size:calc(var(--u)*30);font-weight:600}
.fc .rain{color:rgb(var(--blue));font-size:calc(var(--u)*22)}
/* rooms + lights */
.scroll{height:100%;overflow:hidden;position:relative}
.scrollin{transition:transform .3s ease;padding:calc(var(--u)*12) calc(var(--u)*12) calc(var(--u)*200)}
.h1{display:flex;align-items:center;gap:calc(var(--u)*18);font-size:calc(var(--u)*46);font-weight:400;margin:0 0 calc(var(--u)*22)}
.h1 ha-icon{--mdc-icon-size:calc(var(--u)*48)}
.room{margin-bottom:calc(var(--u)*30)}
.rh{display:flex;align-items:center;gap:calc(var(--u)*16);font-size:calc(var(--u)*36);font-weight:400;margin:0 0 calc(var(--u)*14) calc(var(--u)*6)}
.rh ha-icon{--mdc-icon-size:calc(var(--u)*42);color:rgb(var(--c,var(--grey)))}
.rh small{font-size:calc(var(--u)*26);color:var(--dim);font-weight:400}
.row{display:flex;gap:calc(var(--u)*22);transition:transform .3s ease;padding:calc(var(--u)*12) calc(var(--u)*6)}
.rowwrap{overflow:hidden;margin:0 calc(var(--u)*-6)}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:calc(var(--u)*22)}
.tile{flex:0 0 calc((100% - 3*calc(var(--u)*22))/4);height:calc(var(--u)*190);border-radius:var(--r);padding:calc(var(--u)*24);background:var(--card);
  border:1px solid var(--line);display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;--c:var(--grey)}
.grid .tile{flex:none}
.ic{width:calc(var(--u)*72);height:calc(var(--u)*72);border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:rgba(var(--grey),.2);transition:background .3s}
.tile ha-icon{--mdc-icon-size:calc(var(--u)*42);color:rgb(var(--grey));transition:color .3s}
.tile .n{font-size:calc(var(--u)*30);font-weight:600;line-height:1.15}
.tile .s{font-size:calc(var(--u)*24);color:var(--dim);margin-top:calc(var(--u)*4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tile.on .ic{background:rgba(var(--c),.22)}
.tile.on ha-icon{color:rgb(var(--c))}
.tile.na{opacity:.45}
.tile.act .ic{background:rgba(var(--amber),.2)}.tile.act ha-icon{color:rgb(var(--amber))}
/* full screen camera */
.full{position:absolute;inset:0;z-index:20;background:#000;display:none}
.full.show{display:block}
.full img{width:100%;height:100%;object-fit:contain}
.fbar{position:absolute;left:0;right:0;bottom:0;padding:calc(var(--u)*40) calc(var(--u)*64) calc(var(--u)*48);
  background:linear-gradient(transparent,rgba(0,0,0,.85));display:flex;align-items:flex-end;gap:calc(var(--u)*24)}
.ftitle{font-size:calc(var(--u)*46);font-weight:500;display:flex;align-items:center;gap:calc(var(--u)*16);margin-right:auto}
.fhint{position:absolute;top:calc(var(--u)*40);right:calc(var(--u)*64);font-size:calc(var(--u)*24);color:var(--dim);background:rgba(17,17,17,.75);
  padding:calc(var(--u)*10) calc(var(--u)*22);border-radius:calc(var(--u)*60);border:1px solid var(--line)}
.btn{display:flex;align-items:center;gap:calc(var(--u)*14);padding:calc(var(--u)*16) calc(var(--u)*28);border-radius:calc(var(--u)*60);
  font-size:calc(var(--u)*28);font-weight:600;background:var(--card);border:1px solid var(--line)}
.btn ha-icon{--mdc-icon-size:calc(var(--u)*36);color:rgb(var(--grey))}
.btn.on ha-icon{color:rgb(var(--amber))}
/* modal + toast */
.modal{position:absolute;inset:0;z-index:40;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.7)}
.modal.show{display:flex}
.box{min-width:calc(var(--u)*760);border-radius:var(--r);padding:calc(var(--u)*48);background:var(--card);border:1px solid var(--line);text-align:center}
.box h2{font-size:calc(var(--u)*44);font-weight:500;margin:0 0 calc(var(--u)*12)}
.box p{font-size:calc(var(--u)*30);color:var(--dim);margin:0 0 calc(var(--u)*36)}
.box .big{font-size:calc(var(--u)*110);font-weight:400;margin:calc(var(--u)*10) 0 calc(var(--u)*30)}
.box .btn ha-icon{color:var(--fg)}
.bbar{display:flex;gap:calc(var(--u)*22);justify-content:center}
.toast{position:absolute;z-index:30;right:calc(var(--u)*64);top:calc(var(--u)*54);width:calc(var(--u)*640);border-radius:var(--r);overflow:hidden;
  background:var(--card);border:1px solid rgb(var(--red));box-shadow:0 0 0 calc(var(--u)*4) rgb(var(--red)),0 calc(var(--u)*30) calc(var(--u)*80) rgba(0,0,0,.7);
  transform:translateX(130%);transition:transform .45s cubic-bezier(.2,.9,.3,1.2)}
.toast.show{transform:none}
.toast img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#000}
.toast .tt{padding:calc(var(--u)*18) calc(var(--u)*24);font-size:calc(var(--u)*30);font-weight:600;display:flex;align-items:center;gap:calc(var(--u)*12)}
.toast .tt span{margin-left:auto;font-size:calc(var(--u)*22);color:var(--dim);font-weight:400}
.ver{position:absolute;right:calc(var(--u)*20);bottom:calc(var(--u)*10);font-size:calc(var(--u)*16);color:var(--dim);opacity:.4;z-index:2}
@media (orientation:portrait){
  .layout{grid-template-columns:1fr;grid-template-rows:auto 1fr;padding:calc(var(--u)*40)}
  .rail{display:grid;grid-template-columns:1fr 1fr;gap:calc(var(--u)*16)}
  .nav{grid-column:1/-1;flex-direction:row;margin:0}.navb{flex:1;justify-content:center}
  .chips{grid-column:1/-1;flex-direction:row;flex-wrap:wrap}
  .cams{grid-template-columns:1fr;grid-template-rows:repeat(4,minmax(calc(var(--u)*500),1fr))}
  .pane{overflow:auto}
}
`;

const DEFAULTS = {
  greeting_name: "",
  weather: "weather.forecast_home",
  bins: "",                  // optional, see README (state + attributes when / bins_raw / days)
  server: "",                // optional, see README (containers_running / containers_total / cpu_pct / cpu_temp)
  adguard_queries: "",       // optional: sensor with DNS queries (e.g. AdGuard Home "DNS queries")
  adguard_blocked: "",       // optional: sensor with blocked queries
  adguard_pause_script: "",  // optional: script run (after a confirm) when the ad-blocking chip is pressed
  idle_back_seconds: 120,
  alert_seconds: 30,
  cameras: [],
  rooms: [],
  lights: [],
  lights_exclude: [],
};

const BIN_COLORS = { red: "#e53935", yellow: "#fdd835", blue: "#1e88e5", green: "#43a047", glass: "#1e88e5", purple: "#8e24aa" };
const WX_ICON = {
  "clear-night": "mdi:weather-night", cloudy: "mdi:weather-cloudy", exceptional: "mdi:alert-circle-outline", fog: "mdi:weather-fog",
  hail: "mdi:weather-hail", lightning: "mdi:weather-lightning", "lightning-rainy": "mdi:weather-lightning-rainy",
  partlycloudy: "mdi:weather-partly-cloudy", pouring: "mdi:weather-pouring", rainy: "mdi:weather-rainy", snowy: "mdi:weather-snowy",
  "snowy-rainy": "mdi:weather-snowy-rainy", sunny: "mdi:weather-sunny", windy: "mdi:weather-windy", "windy-variant": "mdi:weather-windy-variant",
};
const WX_TEXT = { "clear-night": "Clear", partlycloudy: "Partly cloudy", "lightning-rainy": "Stormy", "snowy-rainy": "Sleet", "windy-variant": "Windy" };
const DOMAIN_ICON = { light: "mdi:lightbulb", fan: "mdi:fan", switch: "mdi:toggle-switch", cover: "mdi:garage", climate: "mdi:radiator",
  media_player: "mdi:television", sensor: "mdi:information-outline", binary_sensor: "mdi:checkbox-blank-circle-outline", script: "mdi:play", scene: "mdi:palette" };
const TOGGLE = ["light", "fan", "switch", "media_player", "input_boolean"];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

class TvHomeCard extends HTMLElement {
  setConfig(config) {
    this._cfg = Object.assign({}, DEFAULTS, config || {});
    this._mode = "cameras";
    this._built = false;
    if (this.shadowRoot) this._build();
  }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: "full", rows: "auto" }; }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    if (!this._built && this._cfg) this._build();
    this._key = (e) => this._onKey(e);
    window.addEventListener("keydown", this._key, true);
    this._pop = (e) => this._onPop(e);
    window.addEventListener("popstate", this._pop);
    this._tick = setInterval(() => this._clock(), 1000 * 15);
    this._wxTimer = setInterval(() => this._loadForecast(), 30 * 60 * 1000);
    this._kiosk();
    this.style.height = /[?&]kiosk\b/.test(location.search) ? "100vh" : "calc(100vh - var(--header-height, 56px))";
    this._ro = new ResizeObserver(() => {
      const b = this.getBoundingClientRect(); if (!b.width || !b.height) return;
      this.style.setProperty("--u", Math.min(b.width / 1920, b.height / 1080) + "px");
    });
    this._ro.observe(this);
  }
  disconnectedCallback() {
    window.removeEventListener("keydown", this._key, true);
    window.removeEventListener("popstate", this._pop);
    if (this._ro) this._ro.disconnect();
    clearInterval(this._tick); clearInterval(this._wxTimer); clearTimeout(this._idle); clearTimeout(this._toastT);
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (!this._built) return;
    if (first) { this._loadForecast(); this._clock(); }
    this._update();
  }

  /* ------------------------------------------------------------------ build */
  _build() {
    const c = this._cfg, r = this.shadowRoot;
    const cams = c.cameras.slice(0, 3);
    const camHtml = cams.map((k, i) => `
      <div class="cam" data-f data-act="cam" data-i="${i}" id="cam${i}">
        <img alt="">
        <div class="off" hidden>Camera offline</div>
        <div class="badge">Person</div>
        <div class="lbl"><i class="live"></i>${esc(k.name)}</div>
      </div>`).join("");
    const roomsHtml = c.rooms.map((rm, ri) => `
      <div class="room">
        <div class="rh" style="--c:var(--${esc(rm.color || "grey")})"><ha-icon icon="${esc(rm.icon || "mdi:home")}"></ha-icon>${esc(rm.name)}<small id="rs${ri}"></small></div>
        <div class="rowwrap"><div class="row" id="row${ri}">
          ${rm.devices.map((d, di) => this._tileHtml(d, `r${ri}d${di}`)).join("")}
        </div></div>
      </div>`).join("");
    const lights = this._lightList();
    r.innerHTML = `<style>${css}</style>
    <div class="root">
      <div class="layout">
        <div class="rail">
          <div><div class="clock" id="clock"></div><div class="greet" id="greet"></div><div class="date" id="date"></div></div>
          <div class="wx" id="wx"></div>
          <div class="chips">
            <div class="chip" data-f data-act="go" data-mode="lights" style="--c:var(--amber)"><ha-icon icon="mdi:lightbulb-group"></ha-icon><span class="t" id="c_lights"></span></div>
            ${c.bins ? `<div class="chip" id="c_binsw" style="--c:var(--green)"><ha-icon icon="mdi:trash-can-outline"></ha-icon><span class="t" id="c_bins"></span><span class="dots" id="c_dots"></span></div>` : ""}
            ${c.server ? `<div class="chip" id="c_srvw" style="--c:var(--green)"><ha-icon icon="mdi:server" id="c_srvi"></ha-icon><span class="t" id="c_srv"></span></div>` : ""}
            ${c.adguard_queries || c.adguard_pause_script ? `<div class="chip" ${c.adguard_pause_script ? "data-f " : ""}data-act="ads" style="--c:var(--blue)"><ha-icon icon="mdi:shield-check" id="c_adsi"></ha-icon><span class="t" id="c_ads"></span></div>` : ""}
          </div>
          <div class="nav">
            <div class="navb" data-f data-act="go" data-mode="cameras" id="n_cameras" style="--c:var(--red)"><ha-icon icon="mdi:cctv"></ha-icon><div>Cameras<span class="sub" id="ns_cameras"></span></div></div>
            <div class="navb" data-f data-act="go" data-mode="rooms" id="n_rooms" style="--c:var(--teal)"><ha-icon icon="mdi:home-heart"></ha-icon><div>Rooms<span class="sub" id="ns_rooms"></span></div></div>
            <div class="navb" data-f data-act="go" data-mode="lights" id="n_lights" style="--c:var(--amber)"><ha-icon icon="mdi:lightbulb-group"></ha-icon><div>Lights<span class="sub" id="ns_lights"></span></div></div>
          </div>
        </div>
        <div class="stage">
          <div class="pane" id="p_cameras"><div class="cams">${camHtml}
            <div class="wxcard" id="wxcard"></div></div></div>
          <div class="pane" id="p_rooms"><div class="scroll"><div class="scrollin" id="si_rooms"><div class="h1"><ha-icon icon="mdi:floor-plan"></ha-icon>Rooms</div>${roomsHtml}</div></div></div>
          <div class="pane" id="p_lights"><div class="scroll"><div class="scrollin" id="si_lights"><div class="h1"><ha-icon icon="mdi:lightbulb-group-outline"></ha-icon>Lights</div>
            <div class="grid">
              <div class="tile act" data-f data-act="alloff"><div class="ic"><ha-icon icon="mdi:lightbulb-off-outline"></ha-icon></div><div><div class="n">All lights off</div><div class="s" id="alloff_s"></div></div></div>
              ${lights.map((d, i) => this._tileHtml(d, `l${i}`)).join("")}
            </div></div></div></div>
        </div>
      </div>
      <div class="full" id="full"><img id="fimg" alt=""><div class="fhint">◀ ▶ switch camera · ▼ controls · Back to close</div>
        <div class="fbar"><div class="ftitle" id="ftitle"></div><div id="facts" style="display:flex;gap:calc(var(--u)*18)"></div></div></div>
      <div class="toast" id="toast"><img id="timg" alt=""><div class="tt"><i class="live"></i><span id="ttxt" style="margin:0;color:#fff;font-size:inherit;font-weight:700"></span><span>OK = full screen</span></div></div>
      <div class="modal" id="modal"><div class="box" id="mbox"></div></div>
      <div class="ver">TV Home ${TVH_VERSION}</div>
    </div>`;
    r.querySelector(".root").addEventListener("click", (e) => {
      const el = e.target.closest("[data-f]");
      if (el) { this._focus(el); this._activate(el); }
      else if (e.target.closest("#toast")) this._openFull(this._alertCam ?? 0);
    });
    this._built = true;
    this._setMode("cameras", true);
    if (this._hass) { this._loadForecast(); this._clock(); this._update(); }
  }

  _lightList() {
    const c = this._cfg;
    if (c.lights && c.lights.length) return c.lights;
    const seen = new Set(); const out = [];
    for (const rm of c.rooms) for (const d of rm.devices) {
      if (d.entity && d.entity.startsWith("light.") && !seen.has(d.entity) && !c.lights_exclude.includes(d.entity)) {
        seen.add(d.entity); out.push(Object.assign({}, d, { name: d.lights_name || d.name, room: rm.name }));
      }
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }

  _tileHtml(d, id) {
    const dom = (d.entity || "").split(".")[0];
    return `<div class="tile" data-f data-act="dev" data-id="${id}" data-e="${esc(d.entity)}">
      <div class="ic"><ha-icon icon="${esc(d.icon || DOMAIN_ICON[dom] || "mdi:circle")}"></ha-icon></div>
      <div><div class="n">${esc(d.name)}</div><div class="s"></div></div></div>`;
  }

  _dev(id) {
    const m = /^r(\d+)d(\d+)$/.exec(id);
    if (m) return this._cfg.rooms[+m[1]].devices[+m[2]];
    const l = /^l(\d+)$/.exec(id);
    return l ? this._lightList()[+l[1]] : null;
  }

  /* ----------------------------------------------------------------- update */
  _st(e) { return this._hass && e ? this._hass.states[e] : undefined; }
  _url(p) { return this._hass && this._hass.hassUrl ? this._hass.hassUrl(p) : p; }

  _update() {
    const r = this.shadowRoot, h = this._hass, c = this._cfg;
    if (!h || !r) return;
    // weather (rail + card)
    const w = this._st(c.weather);
    if (w) {
      const icon = WX_ICON[w.state] || "mdi:weather-partly-cloudy";
      const txt = WX_TEXT[w.state] || cap(String(w.state).replace(/-/g, " "));
      const unit = w.attributes.temperature_unit || "°C";
      const t = Math.round(w.attributes.temperature);
      this._html("wx", `<ha-icon icon="${icon}"></ha-icon><div><b>${t}°</b> <span>${esc(txt)}</span></div>`);
      const fc = (this._fc || []).slice(0, 5).map((f) => {
        const d = new Date(f.datetime);
        const day = d.toLocaleDateString(undefined, { weekday: "short" });
        const rain = f.precipitation_probability != null ? `<span class="rain">${Math.round(f.precipitation_probability)}%</span>` : "";
        return `<div>${esc(day)}<ha-icon icon="${WX_ICON[f.condition] || "mdi:weather-cloudy"}"></ha-icon><b>${Math.round(f.temperature)}°</b>${f.templow != null ? Math.round(f.templow) + "°" : ""}${rain}</div>`;
      }).join("");
      const hum = w.attributes.humidity != null ? ` · ${Math.round(w.attributes.humidity)}% humidity` : "";
      const wind = w.attributes.wind_speed != null ? ` · wind ${Math.round(w.attributes.wind_speed)} ${esc(w.attributes.wind_speed_unit || "")}` : "";
      this._html("wxcard", `<div class="wxnow"><ha-icon icon="${icon}"></ha-icon><div><div class="big">${t}${esc(unit)}</div><div class="cond">${esc(txt)}${hum}${wind}</div></div></div><div class="fc">${fc}</div>`);
      this._sky(w.state);
    }
    // chips
    const lightsOn = Object.keys(h.states).filter((k) => k.startsWith("light.") && h.states[k].state === "on" && !c.lights_exclude.includes(k));
    this._text("c_lights", lightsOn.length === 1 ? "1 light on" : `${lightsOn.length} lights on`);
    const camsUp = this._cfg.cameras.slice(0, 3).filter((k) => { const x = this._st(k.entity); return x && x.state !== "unavailable"; }).length;
    this._text("ns_cameras", `${camsUp} live`);
    this._text("ns_lights", lightsOn.length ? `${lightsOn.length} on` : "All off");
    this._text("ns_rooms", `${this._cfg.rooms.length} rooms`);
    this._text("alloff_s", lightsOn.length ? `${lightsOn.length} on now` : "Everything's off");
    const b = this._st(c.bins);
    if (b) {
      this._text("c_bins", `${b.attributes.when || ""} · ${b.state}`);
      const raw = String(b.attributes.bins_raw || "").split(/\s+/).filter(Boolean);
      this._html("c_dots", raw.map((x) => `<i class="dot" style="background:${BIN_COLORS[x] || "#9e9e9e"}"></i>`).join(""));
      const days = parseInt(b.attributes.days, 10);
      r.getElementById("c_binsw").style.borderColor = !isNaN(days) && days <= 1 ? "rgb(var(--red))" : "";
    } else this._text("c_bins", "Bins: no data");
    const s = this._st(c.server);
    if (s) {
      const a = s.attributes, down = a.containers_down || [], sick = a.unhealthy || [];
      const bad = !a.containers_total || down.length, warn = sick.length || (a.cpu_temp || 0) >= 75;
      this._text("c_srv", `${a.containers_running ?? "?"}/${a.containers_total ?? "?"} up · CPU ${a.cpu_pct ?? "?"}% · ${a.cpu_temp ?? "?"}°`);
      r.getElementById("c_srvw").style.setProperty("--c", bad ? "var(--red)" : warn ? "var(--orange)" : "var(--green)");
    } else this._text("c_srv", "Server: no data");
    const q = parseInt((this._st(c.adguard_queries) || {}).state, 10), bl = parseInt((this._st(c.adguard_blocked) || {}).state, 10);
    this._text("c_ads", q > 0 && !isNaN(bl) ? `Ads blocked ${Math.round((100 * bl) / q)}%` : "Ad blocking");
    // cameras
    c.cameras.slice(0, 3).forEach((k, i) => this._camImg(r.querySelector(`#cam${i} img`), k.entity, `cam${i}`));
    let alertIdx = null;
    c.cameras.slice(0, 3).forEach((k, i) => {
      const on = k.person && (this._st(k.person) || {}).state === "on";
      r.getElementById(`cam${i}`).classList.toggle("alert", !!on);
      if (on && k.alert && alertIdx === null) alertIdx = i;
    });
    this._alertCheck(alertIdx);
    if (this._fullIdx != null) { this._camImg(r.getElementById("fimg"), c.cameras[this._fullIdx].entity, "full"); this._renderFullActs(); }
    if (this._alertCam != null) this._camImg(r.getElementById("timg"), c.cameras[this._alertCam].entity, "toast");
    // tiles
    r.querySelectorAll(".tile[data-e]").forEach((el) => this._paintTile(el));
    // room summaries
    c.rooms.forEach((rm, ri) => {
      const n = rm.devices.filter((d) => (this._st(d.entity) || {}).state === "on" && /^(light|fan|switch)\./.test(d.entity)).length;
      this._text(`rs${ri}`, n ? `· ${n} on` : "");
    });
    if (this._modal && this._modal.kind === "climate") this._renderModal();
  }

  _camImg(img, entity, key) {
    if (!img) return;
    const st = this._st(entity);
    const off = img.parentElement.querySelector(".off");
    if (!st || st.state === "unavailable") { img.removeAttribute("src"); if (off) off.hidden = false; this["_src_" + key] = null; return; }
    if (off) off.hidden = true;
    const pic = st.attributes.entity_picture || "";
    const src = this._url(pic.replace("/api/camera_proxy/", "/api/camera_proxy_stream/"));
    if (this["_src_" + key] !== src) { this["_src_" + key] = src; img.src = src; }
  }

  _paintTile(el) {
    const d = this._dev(el.dataset.id); if (!d) return;
    const st = this._st(d.entity), s = el.querySelector(".s"), dom = d.entity.split(".")[0];
    el.classList.toggle("na", !st || st.state === "unavailable");
    if (!st) { s.textContent = "Not found"; el.classList.remove("on"); return; }
    const a = st.attributes; let on = false, txt = cap(st.state), col = "var(--amber)";
    if (dom === "light") {
      on = st.state === "on";
      if (on) { txt = a.brightness != null ? `On · ${Math.round((a.brightness / 255) * 100)}%` : "On"; if (a.rgb_color) col = a.rgb_color.join(","); }
    } else if (dom === "fan") { on = st.state === "on"; col = "var(--blue)"; if (on && a.percentage != null) txt = `On · ${a.percentage}%`; }
    else if (dom === "switch" || dom === "input_boolean") { on = st.state === "on"; }
    else if (dom === "cover") { on = st.state === "open" || st.state === "opening"; col = "var(--orange)"; }
    else if (dom === "climate") {
      on = st.state !== "off"; col = "var(--red)";
      const cur = a.current_temperature != null ? `${a.current_temperature}° now` : ""; const tgt = a.temperature != null ? ` · set ${a.temperature}°` : "";
      txt = on ? `${cur}${tgt}` : `Off${cur ? " · " + cur : ""}`;
    } else if (dom === "media_player") {
      on = !["off", "standby", "unavailable", "unknown"].includes(st.state); col = "var(--purple)";
      txt = on ? (a.media_title ? a.media_title : a.app_name ? a.app_name : cap(st.state)) : "Off";
    } else if (dom === "sensor" || dom === "binary_sensor") {
      txt = cap(String(st.state).replace(/_/g, " ")); on = /run|on|open/i.test(st.state) && !/off/i.test(st.state); col = "var(--green)";
    }
    if (st.state === "unavailable") txt = "Unavailable";
    if (d.room && el.dataset.id.startsWith("l")) txt = `${d.room} · ${txt}`;
    el.classList.toggle("on", on); el.style.setProperty("--c", col); s.textContent = txt;
  }

  _text(id, t) { const e = this.shadowRoot.getElementById(id); if (e && e.textContent !== t) e.textContent = t; }
  _html(id, h) { const e = this.shadowRoot.getElementById(id); if (e && e._h !== h) { e._h = h; e.innerHTML = h; } }

  _clock() {
    if (!this.shadowRoot || !this._built) return;
    const now = new Date(), H = now.getHours();
    const t = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?(am|pm)/i, (m, p) => `<small>${p.toUpperCase()}</small>`);
    this._html("clock", t);
    const part = H < 12 ? "morning" : H < 17 ? "afternoon" : "evening";
    this._text("greet", `Good ${part}${this._cfg.greeting_name ? ", " + this._cfg.greeting_name : ""}`);
    this._text("date", now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }));
    const w = this._st(this._cfg.weather); this._sky(w ? w.state : "");
  }

  _sky() {}

  async _loadForecast() {
    const h = this._hass; if (!h || !h.connection) return;
    try {
      const res = await h.connection.sendMessagePromise({ type: "call_service", domain: "weather", service: "get_forecasts",
        target: { entity_id: this._cfg.weather }, service_data: { type: "daily" }, return_response: true });
      const resp = res && res.response ? res.response : res;
      this._fc = ((resp || {})[this._cfg.weather] || {}).forecast || [];
      this._update();
    } catch (e) { console.warn("tv-home: forecast", e); }
  }

  /* -------------------------------------------------------------- navigation */
  _focusables() {
    const r = this.shadowRoot;
    let scope;
    if (this._modal) scope = r.getElementById("modal");
    else if (this._fullIdx != null) scope = r.getElementById("full");
    else scope = r.querySelector(".layout");
    return [...scope.querySelectorAll("[data-f]")].filter((el) => {
      const p = el.closest(".pane"); if (p && !p.classList.contains("show")) return false;
      return el.offsetParent !== null || el.getClientRects().length;
    });
  }
  _focus(el) {
    if (!el) return;
    if (this._cur && this._cur !== el) this._cur.classList.remove("f");
    this._cur = el; el.classList.add("f");
    this._scrollInto(el);
  }
  _scrollInto(el) {
    const rail = el.closest(".rail");
    if (rail) {
      // the left menu scrolls when it doesn't fit (short windows / TVs with a smaller viewport)
      const pad = 24, rr = rail.getBoundingClientRect(), b = el.getBoundingClientRect();
      if (b.bottom > rr.bottom - pad) rail.scrollTop += b.bottom - rr.bottom + pad;
      else if (b.top < rr.top + pad) rail.scrollTop -= rr.top - b.top + pad;
      if (el.id === "n_cameras" && rail.scrollHeight <= rail.clientHeight) rail.scrollTop = 0;
    }
    const row = el.closest(".row");
    if (row) {
      const wrap = row.parentElement, idx = [...row.children].indexOf(el);
      const gap = parseFloat(getComputedStyle(row).columnGap || getComputedStyle(row).gap) || 0;
      const w = el.offsetWidth + gap;
      const visible = Math.max(1, Math.floor((wrap.clientWidth + gap + 2) / w));
      const shift = Math.max(0, idx - visible + 1) * w;
      row.style.transform = `translateX(${-shift}px)`;
    }
    const si = el.closest(".scrollin");
    if (si) {
      const box = si.parentElement;
      const target = el.closest(".room") || el;
      let y = target.offsetTop - box.clientHeight * 0.18;
      y = Math.max(0, Math.min(y, si.scrollHeight - box.clientHeight));
      si.style.transform = `translateY(${-y}px)`;
    }
  }
  _move(dir) {
    const list = this._focusables(); if (!list.length) return;
    if (!this._cur || !list.includes(this._cur)) return this._focus(list[0]);
    const inRow = this._cur.closest(".row");
    if (inRow && (dir === "left" || dir === "right")) {
      const sib = dir === "right" ? this._cur.nextElementSibling : this._cur.previousElementSibling;
      if (sib) return this._focus(sib);
      if (dir === "left") return this._focus(this.shadowRoot.getElementById("n_" + this._mode));
      return;
    }
    const a = this._cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = null, bestS = Infinity;
    for (const el of list) {
      if (el === this._cur) continue;
      const b = el.getBoundingClientRect(), bx = b.left + b.width / 2, by = b.top + b.height / 2;
      const dx = bx - ax, dy = by - ay;
      let main, cross;
      if (dir === "left") { if (b.right > a.left + 4 && dx >= -4) continue; main = -dx; cross = Math.abs(dy); }
      else if (dir === "right") { if (b.left < a.right - 4 && dx <= 4) continue; main = dx; cross = Math.abs(dy); }
      else if (dir === "up") { if (b.bottom > a.top + 4 && dy >= -4) continue; main = -dy; cross = Math.abs(dx); }
      else { if (b.top < a.bottom - 4 && dy <= 4) continue; main = dy; cross = Math.abs(dx); }
      if (main <= 0) continue;
      const s = main + cross * 2.2;
      if (s < bestS) { bestS = s; best = el; }
    }
    // rows scroll horizontally: allow focus to reach hidden-right tiles in the same row
    if (!best && (dir === "right" || dir === "left") && this._cur.closest(".row")) {
      const sib = dir === "right" ? this._cur.nextElementSibling : this._cur.previousElementSibling;
      if (sib) best = sib;
    }
    if (best) this._focus(best);
    else if (dir === "left" && !this._modal && this._fullIdx == null) this._focus(this.shadowRoot.getElementById("n_" + this._mode));
  }

  _onKey(e) {
    if (!this.isConnected || !this._built) return;
    // let HA dialogs (more-info etc.) keep the keyboard
    if (this._haDialogOpen()) return;
    const k = e.key;
    const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
    const back = ["Escape", "Backspace", "GoBack", "BrowserBack"].includes(k) || e.keyCode === 4;
    const ok = ["Enter", "NumpadEnter", "Select", " "].includes(k) || e.keyCode === 23 || e.keyCode === 66;
    if (!map[k] && !back && !ok) return;
    const t = e.composedPath && e.composedPath()[0];
    if (t && /INPUT|TEXTAREA/.test(t.tagName || "")) return;
    e.preventDefault(); e.stopPropagation();
    this._poke();
    if (map[k]) {
      if (this._fullIdx != null && !this._modal) {
        const inActs = this._cur && this._cur.closest("#facts");
        if (!inActs) {
          if (k === "ArrowLeft" || k === "ArrowRight") return this._cycleFull(k === "ArrowRight" ? 1 : -1);
          if (k === "ArrowDown") { const f = this.shadowRoot.querySelector("#facts [data-f]"); if (f) this._focus(f); }
          return;
        }
        if (k === "ArrowUp") { this._cur.classList.remove("f"); this._cur = null; return; }
        if (k === "ArrowDown") return;
      }
      return this._move(map[k]);
    }
    if (ok) {
      if (this._toastOn && !this._modal && this._fullIdx == null) return this._openFull(this._alertCam);
      return this._cur && this._activate(this._cur);
    }
    if (back) this._back();
  }
  _haDialogOpen() {
    try {
      const ha = document.querySelector("home-assistant"); if (!ha || !ha.shadowRoot) return false;
      for (const d of ha.shadowRoot.querySelectorAll("ha-more-info-dialog, dialog-box, ha-dialog")) {
        if (d.hasAttribute("open")) return true;
        const inner = d.shadowRoot && d.shadowRoot.querySelector("ha-dialog[open], ha-md-dialog[open], dialog[open]");
        if (inner) return true;
      }
    } catch (e) {}
    return false;
  }
  _back() {
    if (this._modal) return this._closeModal();
    if (this._fullIdx != null) return this._closeFull();
    if (this._toastOn) return this._hideToast();
    if (this._mode !== "cameras") return this._setMode("cameras");
  }
  _onPop() {
    // Android/browser Back when we pushed a history entry
    if (this._ignorePop) { this._ignorePop = false; return; }
    if (this._modal || this._fullIdx != null || this._mode !== "cameras") { this._popped = true; this._back(); this._popped = false; }
  }
  _push() { try { history.pushState(Object.assign({}, history.state, { tvHome: Date.now() }), "", location.href); this._pushed = (this._pushed || 0) + 1; } catch (e) {} }
  _unpush() { if (!this._popped && this._pushed > 0) { this._pushed--; this._ignorePop = true; try { history.back(); } catch (e) {} } else if (this._popped && this._pushed > 0) this._pushed--; }

  _poke() {
    clearTimeout(this._idle);
    const s = this._cfg.idle_back_seconds;
    if (s > 0) this._idle = setTimeout(() => { if (!this._modal) { if (this._fullIdx != null) this._closeFull(); if (this._mode !== "cameras") this._setMode("cameras"); } }, s * 1000);
  }

  _setMode(m, init) {
    const r = this.shadowRoot; const prev = this._mode; this._mode = m;
    ["cameras", "rooms", "lights"].forEach((x) => {
      r.getElementById("p_" + x).classList.toggle("show", x === m);
      r.getElementById("n_" + x).classList.toggle("on", x === m);
    });
    if (!init) {
      if (prev === "cameras" && m !== "cameras") this._push();
      else if (prev !== "cameras" && m === "cameras") this._unpush();
    }
    const si = r.getElementById("si_" + m); if (si) si.style.transform = "";
    r.querySelectorAll(".row").forEach((x) => (x.style.transform = ""));
    if (!init) {
      const firstIn = r.querySelector(`#p_${m} [data-f]`);
      this._focus(m === "cameras" ? r.getElementById("n_cameras") : firstIn || r.getElementById("n_" + m));
    } else this._focus(r.getElementById("n_cameras"));
    this._poke();
  }

  /* ---------------------------------------------------------------- actions */
  _call(domain, service, data) { return this._hass.callService(domain, service, data); }

  _activate(el) {
    const act = el.dataset.act;
    if (act === "go") return this._setMode(el.dataset.mode);
    if (act === "cam") return this._openFull(+el.dataset.i);
    if (act === "ads" && this._cfg.adguard_pause_script) return this._confirm("Ad blocking", "Pause ad blocking for 10 minutes (or turn it back on)?", () => this._call("script", "turn_on", { entity_id: this._cfg.adguard_pause_script }));
    if (act === "alloff") return this._confirm("All lights off", "Turn off every light in the house?", () => {
      const ids = Object.keys(this._hass.states).filter((k) => k.startsWith("light.") && this._hass.states[k].state === "on" && !this._cfg.lights_exclude.includes(k));
      if (ids.length) this._call("light", "turn_off", { entity_id: ids });
    });
    if (act === "dev") return this._devAction(this._dev(el.dataset.id));
    if (act === "fact") return this._devAction(this._factList()[+el.dataset.i]);
    if (act === "mok") { const f = this._modal && this._modal.ok; this._closeModal(); if (f) f(); return; }
    if (act === "mno") return this._closeModal();
    if (act === "tdown" || act === "tup") return this._nudgeTemp(act === "tup" ? 1 : -1);
    if (act === "tpow") { const e = this._modal.entity; const st = this._st(e); return this._call("climate", st && st.state !== "off" ? "turn_off" : "turn_on", { entity_id: e }); }
  }

  _devAction(d) {
    if (!d) return;
    const dom = d.entity.split(".")[0], st = this._st(d.entity);
    if (d.action === "info" || dom === "sensor" || dom === "binary_sensor") return this._moreInfo(d.entity);
    if (dom === "cover") return this._confirm(d.name, d.confirm || `Move the ${d.name.toLowerCase()}?`, () => this._call("cover", "toggle", { entity_id: d.entity }));
    if (dom === "climate") return this._climateModal(d);
    if (dom === "script") return this._call("script", "turn_on", { entity_id: d.entity });
    if (dom === "scene") return this._call("scene", "turn_on", { entity_id: d.entity });
    if (TOGGLE.includes(dom) || dom === "input_boolean") {
      const go = () => this._call(dom === "input_boolean" ? "input_boolean" : dom, "toggle", { entity_id: d.entity });
      return d.confirm ? this._confirm(d.name, d.confirm, go) : go();
    }
    this._moreInfo(d.entity);
  }
  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  /* ------------------------------------------------------------- full screen */
  _openFull(i) {
    if (i == null) return;
    this._hideToast(true);
    const wasOpen = this._fullIdx != null;
    this._fullIdx = i;
    const r = this.shadowRoot; r.getElementById("full").classList.add("show");
    this._camImg(r.getElementById("fimg"), this._cfg.cameras[i].entity, "full");
    r.getElementById("ftitle").innerHTML = `<i class="live"></i>${esc(this._cfg.cameras[i].name)}`;
    this._renderFullActs(true);
    r.querySelector(".fhint").textContent = this._factList().length ? "◀ ▶ switch camera · ▼ controls · Back to close" : "◀ ▶ switch camera · Back to close";
    if (!wasOpen) this._push();
    if (this._cur) this._cur.classList.remove("f");
    this._cur = null;
  }
  _factList() { const k = this._cfg.cameras[this._fullIdx]; return (k && k.actions) || []; }
  _renderFullActs(force) {
    const box = this.shadowRoot.getElementById("facts");
    const acts = this._factList();
    const h = acts.map((d, i) => {
      const st = this._st(d.entity); const on = st && ["on", "open", "opening"].includes(st.state);
      const sfx = d.entity.startsWith("cover.") && st ? ` · ${cap(st.state)}` : on ? " · On" : st ? " · Off" : "";
      return `<div class="btn${on ? " on" : ""}" data-f data-act="fact" data-i="${i}"><ha-icon icon="${esc(d.icon || DOMAIN_ICON[d.entity.split(".")[0]])}"></ha-icon>${esc(d.name)}${esc(sfx)}</div>`;
    }).join("");
    if (force || box._h !== h) {
      const curI = this._cur && this._cur.closest("#facts") ? this._cur.dataset.i : null;
      box._h = h; box.innerHTML = h;
      if (curI != null) { const el = box.querySelector(`[data-i="${curI}"]`); if (el) { this._cur = el; el.classList.add("f"); } }
    }
  }
  _cycleFull(step) {
    const n = Math.min(3, this._cfg.cameras.length);
    const i = (this._fullIdx + step + n) % n, r = this.shadowRoot;
    this._fullIdx = i;
    this._camImg(r.getElementById("fimg"), this._cfg.cameras[i].entity, "full");
    r.getElementById("ftitle").innerHTML = `<i class="live"></i>${esc(this._cfg.cameras[i].name)}`;
    this._renderFullActs(true);
    r.querySelector(".fhint").textContent = this._factList().length ? "◀ ▶ switch camera · ▼ controls · Back to close" : "◀ ▶ switch camera · Back to close";
    if (this._cur) this._cur.classList.remove("f"); this._cur = null;
  }
  _closeFull() {
    const r = this.shadowRoot, i = this._fullIdx;
    this._fullIdx = null; this._src_full = null;
    r.getElementById("full").classList.remove("show"); r.getElementById("fimg").removeAttribute("src");
    this._unpush();
    this._focus(r.getElementById("cam" + i) && this._mode === "cameras" ? r.getElementById("cam" + i) : r.getElementById("n_" + this._mode));
  }

  /* ----------------------------------------------------------------- alerts */
  _alertCheck(idx) {
    if (idx != null && this._lastAlert !== idx && this._fullIdx == null) {
      this._alertCam = idx; this._toastOn = true;
      const r = this.shadowRoot;
      r.getElementById("ttxt").textContent = `Someone at the ${this._cfg.cameras[idx].name.toLowerCase()}`;
      this._camImg(r.getElementById("timg"), this._cfg.cameras[idx].entity, "toast");
      r.getElementById("toast").classList.add("show");
      clearTimeout(this._toastT);
      this._toastT = setTimeout(() => this._hideToast(), (this._cfg.alert_seconds || 30) * 1000);
    }
    this._lastAlert = idx;
  }
  _hideToast(keepCam) {
    this._toastOn = false; clearTimeout(this._toastT);
    const r = this.shadowRoot; r.getElementById("toast").classList.remove("show");
    if (!keepCam) setTimeout(() => { if (!this._toastOn) { r.getElementById("timg").removeAttribute("src"); this._src_toast = null; } }, 600);
  }

  /* ----------------------------------------------------------------- modals */
  _confirm(title, text, ok) {
    this._modal = { kind: "confirm", ok, prevFocus: this._cur };
    this._html("mbox", `<h2>${esc(title)}</h2><p>${esc(text)}</p><div class="bbar">
      <div class="btn" data-f data-act="mok"><ha-icon icon="mdi:check"></ha-icon>Yes</div>
      <div class="btn" data-f data-act="mno"><ha-icon icon="mdi:close"></ha-icon>Cancel</div></div>`);
    this._openModal();
  }
  _climateModal(d) { this._modal = { kind: "climate", entity: d.entity, name: d.name, prevFocus: this._cur }; this._renderModal(); this._openModal(); }
  _renderModal() {
    const m = this._modal; if (!m || m.kind !== "climate") return;
    const st = this._st(m.entity) || { state: "unavailable", attributes: {} }, a = st.attributes;
    const on = st.state !== "off" && st.state !== "unavailable";
    const curF = this._cur && this._cur.dataset.act;
    this._html("mbox", `<h2>${esc(m.name)}</h2><p>${a.current_temperature != null ? `Room is ${a.current_temperature}°` : ""}${on ? " · " + cap(st.state) : " · Off"}</p>
      <div class="big">${a.temperature != null ? a.temperature + "°" : "–"}</div>
      <div class="bbar"><div class="btn" data-f data-act="tdown"><ha-icon icon="mdi:minus"></ha-icon>Cooler</div>
      <div class="btn" data-f data-act="tup"><ha-icon icon="mdi:plus"></ha-icon>Warmer</div>
      <div class="btn${on ? " on" : ""}" data-f data-act="tpow"><ha-icon icon="mdi:power"></ha-icon>${on ? "Turn off" : "Turn on"}</div></div>`);
    if (curF) { const el = this.shadowRoot.querySelector(`#mbox [data-act="${curF}"]`); if (el) { this._cur = el; el.classList.add("f"); } }
  }
  _nudgeTemp(dir) {
    const m = this._modal, st = this._st(m.entity); if (!st) return;
    const a = st.attributes, step = a.target_temp_step || 0.5;
    let t = (m.pending ?? a.temperature ?? 20) + dir * step;
    t = Math.max(a.min_temp ?? 5, Math.min(a.max_temp ?? 35, Math.round(t * 10) / 10));
    m.pending = t;
    const big = this.shadowRoot.querySelector("#mbox .big"); if (big) big.textContent = t + "°";
    clearTimeout(m.t); m.t = setTimeout(() => { this._call("climate", "set_temperature", { entity_id: m.entity, temperature: t }); m.pending = null; }, 700);
  }
  _openModal() {
    this.shadowRoot.getElementById("modal").classList.add("show");
    if (this._cur) this._cur.classList.remove("f"); this._cur = null;
    this._focus(this.shadowRoot.querySelector("#mbox [data-f]"));
    this._push();
  }
  _closeModal() {
    const m = this._modal; this._modal = null;
    this.shadowRoot.getElementById("modal").classList.remove("show");
    this._unpush();
    if (m && m.prevFocus && m.prevFocus.isConnected) this._focus(m.prevFocus); else this._move("left");
  }

  /* ------------------------------------------------------------------ kiosk */
  _kiosk() {
    if (!/[?&]kiosk\b/.test(location.search)) return;
    const hide = () => {
      try {
        const ha = document.querySelector("home-assistant"); const main = ha.shadowRoot.querySelector("home-assistant-main");
        const drawer = main.shadowRoot.querySelector("ha-drawer"); if (drawer) drawer.style.setProperty("--mdc-drawer-width", "0px");
        const sb = main.shadowRoot.querySelector("ha-sidebar"); if (sb) sb.style.display = "none";
        const panel = main.shadowRoot.querySelector("partial-panel-resolver ha-panel-lovelace") || main.shadowRoot.querySelector("ha-panel-lovelace");
        const huiRoot = panel && panel.shadowRoot.querySelector("hui-root");
        const tb = huiRoot && huiRoot.shadowRoot.querySelector(".header, app-header, .toolbar"); if (tb) tb.style.display = "none";
        const view = huiRoot && huiRoot.shadowRoot.querySelector("#view"); if (view) { view.style.paddingTop = "0"; view.style.minHeight = "100vh"; }
      } catch (e) {}
    };
    hide(); setTimeout(hide, 500); setTimeout(hide, 2000);
  }
}

if (!customElements.get("tv-home-card")) {
  customElements.define("tv-home-card", TvHomeCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: "tv-home-card", name: "TV Home", description: "Remote-first TV dashboard for Android TV / Google TV" });
  console.info(`%c TV-HOME-CARD %c ${TVH_VERSION} `, "background:#7cc4ff;color:#000;font-weight:700", "background:#222;color:#fff");
}
