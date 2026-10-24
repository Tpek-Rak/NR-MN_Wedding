import json

with open('ornaments_raw.json', 'r', encoding='utf-8') as f:
    orns = json.load(f)

# JavaScript generator functions
js_code = f'''// Khmer Traditional & Modern Decorative SVG Ornaments
const Ku = `{orns["Ku"]}`;
const qu = `{orns["qu"]}`;
const Ju = `{orns["Ju"]}`;
const Yu = `{orns["Yu"]}`;
const Xu = `{orns["Xu"]}`;
const Lu = `{orns["Lu"]}`;

const cleanSvg = (e) => e.replace(/^<svg[^>]*>/, '').replace(/<\\/svg>\\s*$/, '');
const getViewBox = (e) => (e.match(/viewBox="0 0 (\\d+) (\\d+)"/) || [0, 100, 100]).slice(1).map(Number);

export const ORN = {{
  crest: {{ g: cleanSvg(Ku), wh: getViewBox(Ku) }},
  corner: {{ g: cleanSvg(qu), wh: getViewBox(qu) }},
  divider: {{ g: cleanSvg(Ju), wh: getViewBox(Ju) }},
  medallion: {{ g: cleanSvg(Yu), wh: getViewBox(Yu) }},
  flap: {{ g: cleanSvg(Xu), wh: getViewBox(Xu) }}
}};

export const renderSvg = (name, cls = "") => {{
  const item = ORN[name];
  if (!item) return "";
  return `<svg class="${{cls}}" viewBox="0 0 ${{item.wh[0]}} ${{item.wh[1]}}" aria-hidden="true">${{item.g}}</svg>`;
}};

export const renderCrest = (cls = "") => renderSvg("crest", `kbach-crest ${{cls}}`);
export const renderDivider = (cls = "") => renderSvg("divider", `kbach-divider ${{cls}}`);
export const renderMedallion = (cls = "") => renderSvg("medallion", `kbach-medallion ${{cls}}`);
export const renderFlapBorder = (cls = "") => renderSvg("flap", `kbach-flapborder ${{cls}}`);

export const renderCorner = (pos = "tl") => {{
  const [w, h] = ORN.corner.wh;
  const transforms = {{
    tl: "",
    tr: `translate(${{w}} 0) scale(-1 1)`,
    bl: `translate(0 ${{h}}) scale(1 -1)`,
    br: `translate(${{w}} ${{h}}) scale(-1 -1)`
  }};
  return `
    <svg class="kbach-corner kb-${{pos}}" viewBox="0 0 ${{w}} ${{h}}" aria-hidden="true">
      <g transform="${{transforms[pos] || ""}}">
        <g class="kb-sway">${{ORN.corner.g}}</g>
      </g>
    </svg>
  `;
}};

export const renderButterfly = (cls = "") => `
  <svg class="butterfly ${{cls}}" viewBox="0 0 100 80" aria-hidden="true">
    <g class="wing-l"><g transform="translate(100 0) scale(-1 1)">${{Lu}}</g></g>
    <g class="wing-r">${{Lu}}</g>
    <ellipse cx="50" cy="40" rx="3" ry="12" fill="url(#g-foil)" />
    <path d="M48 30 C45 20 40 18 36 17" fill="none" stroke="url(#g-foil)" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M52 30 C55 20 60 18 64 17" fill="none" stroke="url(#g-foil)" stroke-width="1.2" stroke-linecap="round"/>
  </svg>
`;

// Scallop path math generator
const roundCoord = (n) => Math.round(n * 10000) / 10000;

export const generateScallopPath = (segments = 9, depth = 0.028) => {{
  let path = "M0 0 L1 0 ";
  const addCurve = (x1, y1, x2, y2) => {{
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const nx = -(y2 - y1) / dist;
    const ny = (x2 - x1) / dist;
    for (let i = 0; i < segments; i++) {{
      const startX = x1 + (x2 - x1) * i / segments;
      const startY = y1 + (y2 - y1) * i / segments;
      const endX = x1 + (x2 - x1) * (i + 1) / segments;
      const endY = y1 + (y2 - y1) * (i + 1) / segments;
      const midX = (startX + endX) / 2 + nx * depth;
      const midY = (startY + endY) / 2 + ny * depth;
      path += `Q${{roundCoord(midX)}} ${{roundCoord(midY)}} ${{roundCoord(endX)}} ${{roundCoord(endY)}} `;
    }}
  }};
  addCurve(1, 0, 0.5, 1);
  addCurve(0.5, 1, 0, 0);
  return path + "Z";
}};

export const generateScallopFoilPath = () => {{
  return generateScallopPath(9, 0.028).replace(/-?\\d*\\.?\\d+/g, (e) => roundCoord(parseFloat(e) * 100));
}};

// Uneven organic poured wax edge
export const generatePouredEdgePath = (cx, cy, radius, seed = 3) => {{
  let d = "";
  for (let i = 0; i <= 64; i++) {{
    const angle = (i / 64) * Math.PI * 2;
    const r = radius * (1 + 0.035 * Math.sin(angle * 7 + seed) + 0.025 * Math.sin(angle * 13 + seed * 2) + 0.02 * Math.cos(angle * 4 + seed));
    const px = roundCoord(cx + Math.cos(angle) * r);
    const py = roundCoord(cy + Math.sin(angle) * r);
    d += `${{i ? "L" : "M"}}${{px}} ${{py}} `;
  }}
  return d + "Z";
}};

// Wax seal with specular lighting & debossed crest
export const renderWaxSeal = () => {{
  const [cw, ch] = ORN.medallion.wh;
  const scale = 66 / cw;
  return `
    <svg viewBox="0 0 140 140" aria-hidden="true" class="wax-svg">
      <defs>
        <radialGradient id="wax-grad" cx="38%" cy="32%" r="75%">
          <stop offset="0" stop-color="#f5df9b"/>
          <stop offset="45%" stop-color="#b98c35"/>
          <stop offset="100%" stop-color="#644410"/>
        </radialGradient>
        <filter id="wax-lit" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="blur"/>
          <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.9" specularExponent="24" lighting-color="#fff8e7" result="spec">
            <fePointLight x="20" y="-10" z="90"/>
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specAlpha"/>
          <feComposite in="SourceGraphic" in2="specAlpha" operator="arithmetic" k1="0" k2="1" k3="0.8" k4="0"/>
        </filter>
        <filter id="wax-press" x="-30%" y="-30%" width="160%" height="160%">
          <feOffset dx="-1.2" dy="-1.2" in="SourceAlpha" result="hi"/>
          <feFlood flood-color="#3b2706" flood-opacity="0.8"/>
          <feComposite in2="hi" operator="in" result="dark"/>
          <feOffset dx="1.2" dy="1.4" in="SourceAlpha" result="lo"/>
          <feFlood flood-color="#fff3cf" flood-opacity="0.75"/>
          <feComposite in2="lo" operator="in" result="light"/>
          <feMerge>
            <feMergeNode in="light"/>
            <feMergeNode in="dark"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Drop shadow -->
      <path d="${{generatePouredEdgePath(70, 72, 60, 5)}}" fill="#000" opacity="0.38" transform="translate(2 5)" style="filter:blur(4px)"/>
      <!-- Poured wax body -->
      <g filter="url(#wax-lit)">
        <path d="${{generatePouredEdgePath(70, 70, 60, 5)}}" fill="url(#wax-grad)"/>
        <circle cx="70" cy="70" r="44" fill="#a97d2c"/>
      </g>
      <!-- Inner rim & beaded ring -->
      <circle cx="70" cy="70" r="44" fill="none" stroke="#5e400f" stroke-opacity="0.6" stroke-width="1.4"/>
      <circle cx="70" cy="70" r="39" fill="none" stroke="#f3dc9c" stroke-opacity="0.4" stroke-width="0.8" stroke-dasharray="1.6 3"/>
      <!-- Debossed medallion crest -->
      <g filter="url(#wax-press)" transform="translate(70 70)">
        <g transform="translate(-33 ${{-(ch * scale) / 2}}) scale(${{scale}})">
          ${{ORN.medallion.g}}
        </g>
      </g>
    </svg>
  `;
}};

// Name logo lockup
export const renderNameLockup = (groom = "នរៈ", bride = "មិនា", cls = "", showCrest = true) => {{
  const [cw, ch] = ORN.crest.wh;
  const scale = 220 / cw;
  return `
    <div class="lockup ${{cls}}" role="img" aria-label="${{groom}} & ${{bride}}">
      <svg class="lk-orn" viewBox="0 0 600 470" aria-hidden="true">
        ${{showCrest ? `
          <g class="lk-crest" transform="translate(300 60) scale(0.5)">
            <g transform="translate(-110 ${{-(ch * scale) + 6}}) scale(${{scale}})">
              ${{ORN.crest.g}}
            </g>
          </g>
        ` : ""}}
        <path class="lk-swash" d="M40 292 C110 318 170 314 206 296 C236 280 238 254 220 250 C202 246 196 272 214 284 C240 302 262 294 272 284" />
        <path class="lk-swash lk-swash2" d="M318 446 C392 460 476 456 566 438" />
        <path class="lk-heart" d="M266 316 C259 304 244 308 246 321 C248 332 266 341 266 348 C266 341 284 332 286 321 C288 308 273 304 266 316 Z" />
      </svg>
      <span class="lk-name lk-groom" aria-hidden="true">${{groom}}</span>
      <span class="lk-name lk-bride" aria-hidden="true">${{bride}}</span>
      <div class="lk-butterfly" aria-hidden="true">${{renderButterfly("is-resting")}}</div>
    </div>
  `;
}};
'''

with open('src/assets/ornaments.js', 'w', encoding='utf-8') as f:
    f.write(js_code)
print("Successfully generated src/assets/ornaments.js")
