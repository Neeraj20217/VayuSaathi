import type { SkylineKey } from "@/lib/atmosphere";

interface CitySkylineSvgProps {
  skyline: SkylineKey;
  farColor: string;
  midColor: string;
  accentColor: string;
  cutoutColor?: string;
  farOpacity: number;
  landmarkOpacity: number;
  contrast: number;
}

export function CitySkylineSvg({
  skyline,
  farColor,
  midColor,
  accentColor,
  cutoutColor = "#FFFFFF",
  farOpacity,
  landmarkOpacity,
  contrast,
}: CitySkylineSvgProps) {
  return (
    <svg
      viewBox="0 0 1440 200"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      className="pointer-events-none h-full w-full select-none transition-[filter,opacity] duration-700 ease-out motion-reduce:transition-none"
      style={{ filter: `contrast(${contrast})` }}
    >
      {/* Distant buildings for the dedicated city scenes */}
      {skyline !== "generic" && skyline !== "telangana" && <g
        fill={farColor}
        opacity={farOpacity}
        className="transition-opacity duration-700 ease-out motion-reduce:transition-none"
      >
        <path d="M0 200V154h38v-18h26v18h28v-28h36v28h30v-14h24v14h42v-36h44v36h26v-20h30v20h48v-26h34v26h46v-18h28v18h36v-34h40v34h30v-16h34v16h44v-28h36v28h32v-22h28v22h46v-38h40v38h32v-16h36v16h42v-24h38v24h46v-30h34v30h44v-18h32v18h46v-26h36v26h46v-16h36v16h42V200H0Z" />
      </g>}

      {/* Mid-ground city landmark composition */}
      <g
        opacity={landmarkOpacity}
        className="transition-opacity duration-700 ease-out motion-reduce:transition-none"
      >
        {skyline === "hyderabad" && (
          <HyderabadCharminar
            midColor={midColor}
            accentColor={accentColor}
            cutoutColor={cutoutColor}
          />
        )}
        {skyline === "delhi" && (
          <DelhiIndiaGate
            midColor={midColor}
            accentColor={accentColor}
            cutoutColor={cutoutColor}
          />
        )}
        {skyline === "mumbai" && (
          <MumbaiGateway
            midColor={midColor}
            accentColor={accentColor}
            cutoutColor={cutoutColor}
          />
        )}
        {skyline === "bengaluru" && (
          <BengaluruVidhanaSoudha
            midColor={midColor}
            accentColor={accentColor}
            cutoutColor={cutoutColor}
          />
        )}
        {skyline === "kolkata" && (
          <KolkataHowrahBridge midColor={midColor} accentColor={accentColor} />
        )}
        {(skyline === "generic" || skyline === "telangana") && (
          <Landscape regional={skyline === "telangana"} midColor={midColor} accentColor={accentColor} />
        )}
      </g>
    </svg>
  );
}

function HyderabadCharminar({
  midColor,
  accentColor,
  cutoutColor,
}: {
  midColor: string;
  accentColor: string;
  cutoutColor: string;
}) {
  return (
    <g>
      {/* Left heritage arcade & Hussain Sagar fountain hint */}
      <path
        fill={midColor}
        d="M80 200v-52h180v52H80Zm22-36c0-10 14-10 14 0v36h-14v-36Zm36 0c0-10 14-10 14 0v36h-14v-36Zm36 0c0-10 14-10 14 0v36h-14v-36Zm36 0c0-10 14-10 14 0v36h-14v-36Z"
        opacity="0.72"
      />
      <path
        fill={midColor}
        d="M320 200v-32h580v32H320Z"
        opacity="0.45"
      />

      {/* Charminar monument */}
      <g transform="translate(880, 14)">
        {/* Central structure */}
        <rect x="46" y="72" width="148" height="114" fill={midColor} />
        {/* Roof parapet & arcade frieze */}
        <rect x="42" y="64" width="156" height="10" fill={accentColor} />
        <path
          fill={accentColor}
          d="M96 64c0-18 48-18 48 0H96Zm24-22l-3 8h6l-3-8Z"
        />
        {/* Upper arcade niches */}
        <path
          fill={cutoutColor}
          fillOpacity="0.4"
          d="M62 90a7 7 0 0 1 14 0v14H62V90Zm28 0a7 7 0 0 1 14 0v14H90V90Zm28 0a7 7 0 0 1 14 0v14h-14V90Zm28 0a7 7 0 0 1 14 0v14h-14V90Z"
        />
        {/* Grand central pointed arch */}
        <path
          fill={cutoutColor}
          fillOpacity="0.58"
          d="M92 186v-44c0-20 28-30 28-30s28 10 28 30v44H92Z"
        />
        {/* Four iconic minarets (2 front prominent, 2 rear inner) */}
        {[
          { x: 26, w: 20, top: 14, color: accentColor },
          { x: 56, w: 14, top: 26, color: midColor },
          { x: 170, w: 14, top: 26, color: midColor },
          { x: 194, w: 20, top: 14, color: accentColor },
        ].map((m, i) => (
          <g key={i}>
            <rect x={m.x} y={m.top + 22} width={m.w} height={186 - (m.top + 22)} fill={m.color} />
            {/* Tiered balconies */}
            <rect x={m.x - 3} y={m.top + 48} width={m.w + 6} height="5" rx="1" fill={accentColor} />
            <rect x={m.x - 3} y={m.top + 86} width={m.w + 6} height="5" rx="1" fill={accentColor} />
            {/* Minaret dome */}
            <path
              fill={accentColor}
              d={`M${m.x} ${m.top + 22}c0-13 ${m.w}-13 ${m.w} 0H${m.x}Z`}
            />
            <rect x={m.x + m.w / 2 - 1} y={m.top + 4} width="2" height="9" fill={accentColor} />
          </g>
        ))}
      </g>

      {/* Right historic gatehouse & trees */}
      <path
        fill={midColor}
        d="M1155 200v-58h195v58h-195Zm28-40c0-14 26-14 26 0v40h-26v-40Zm56 0c0-18 32-18 32 0v40h-32v-40Zm58 0c0-14 26-14 26 0v40h-26v-40Z"
        opacity="0.78"
      />
      <circle cx="1132" cy="176" r="18" fill={accentColor} opacity="0.6" />
      <circle cx="1376" cy="172" r="22" fill={accentColor} opacity="0.55" />
    </g>
  );
}

function DelhiIndiaGate({
  midColor,
  accentColor,
  cutoutColor,
}: {
  midColor: string;
  accentColor: string;
  cutoutColor: string;
}) {
  return (
    <g>
      {/* Tree-lined Kartavya Path canopy */}
      {[120, 170, 230, 290, 360, 1080, 1140, 1210, 1280, 1340].map((cx, i) => (
        <circle key={i} cx={cx} cy={176 + (i % 2) * 5} r={18 + (i % 3) * 4} fill={midColor} opacity="0.65" />
      ))}
      {/* Secretariat / sandstone colonnade wings */}
      <path
        fill={midColor}
        d="M140 200v-44h240v44H140Zm40-54c0-14 32-14 32 0h-32Z"
        opacity="0.72"
      />
      <path
        fill={midColor}
        d="M1060 200v-44h240v44h-240Zm168-54c0-14 32-14 32 0h-32Z"
        opacity="0.72"
      />

      {/* India Gate Monument */}
      <g transform="translate(860, 24)">
        {/* Stepped base */}
        <rect x="20" y="162" width="180" height="14" fill={accentColor} />
        {/* Main sandstone piers */}
        <rect x="34" y="44" width="152" height="118" fill={midColor} />
        {/* Top cornice & frieze */}
        <rect x="26" y="34" width="168" height="12" fill={accentColor} />
        <rect x="38" y="24" width="144" height="10" fill={midColor} />
        {/* Top sandstone dome cupola */}
        <path fill={accentColor} d="M90 24c0-16 40-16 40 0H90Z" />
        {/* Tall central archway */}
        <path
          fill={cutoutColor}
          fillOpacity="0.66"
          d="M84 162V94c0-18 26-26 26-26s26 8 26 26v68H84Z"
        />
        {/* Side recessed arches */}
        <path
          fill={cutoutColor}
          fillOpacity="0.38"
          d="M50 162v-36c0-8 14-8 14 0v36H50Zm106 0v-36c0-8 14-8 14 0v36h-14Z"
        />
        {/* Amar Jawan Jyoti subtle plinth */}
        <rect x="103" y="150" width="14" height="12" fill={accentColor} />
      </g>

      {/* Distant Rashtrapati Bhavan dome hint on the left */}
      <g transform="translate(460, 118)" opacity="0.58">
        <rect x="0" y="42" width="170" height="40" fill={midColor} />
        <path fill={accentColor} d="M58 42c0-26 54-26 54 0H58Z" />
        <rect x="83" y="8" width="4" height="12" fill={accentColor} />
      </g>
    </g>
  );
}

function MumbaiGateway({
  midColor,
  accentColor,
  cutoutColor,
}: {
  midColor: string;
  accentColor: string;
  cutoutColor: string;
}) {
  return (
    <g>
      {/* Arabian Sea promenade horizontal line */}
      <rect x="0" y="192" width="1440" height="8" fill={accentColor} opacity="0.35" />

      {/* Adjacent Taj Palace heritage wing & dome */}
      <g transform="translate(650, 74)" opacity="0.72">
        <rect x="0" y="50" width="190" height="76" fill={midColor} />
        <path fill={accentColor} d="M68 50c0-28 54-28 54 0H68Z" />
        <rect x="94" y="12" width="2" height="14" fill={accentColor} />
        <path
          fill={cutoutColor}
          fillOpacity="0.4"
          d="M22 78a8 8 0 0 1 16 0v18H22V78Zm32 0a8 8 0 0 1 16 0v18H54V78Zm70 0a8 8 0 0 1 16 0v18h-16V78Zm32 0a8 8 0 0 1 16 0v18h-16V78Z"
        />
      </g>

      {/* Gateway of India */}
      <g transform="translate(900, 30)">
        {/* Central & flanking wings */}
        <rect x="16" y="74" width="228" height="96" fill={midColor} />
        <rect x="74" y="42" width="112" height="128" fill={midColor} />
        <rect x="68" y="34" width="124" height="10" fill={accentColor} />
        {/* Four corner octagonal turrets with domes */}
        {[12, 70, 174, 232].map((tx, i) => (
          <g key={i}>
            <rect x={tx} y={i === 1 || i === 2 ? 22 : 54} width="16" height={i === 1 || i === 2 ? 148 : 116} fill={accentColor} />
            <path
              fill={accentColor}
              d={`M${tx} ${i === 1 || i === 2 ? 22 : 54}c0-11 16-11 16 0h-16Z`}
            />
          </g>
        ))}
        {/* Grand central Indo-Saracenic arch */}
        <path
          fill={cutoutColor}
          fillOpacity="0.65"
          d="M100 170v-62c0-22 30-32 30-32s30 10 30 32v62h-60Z"
        />
        {/* Side arches */}
        <path
          fill={cutoutColor}
          fillOpacity="0.46"
          d="M36 170v-44c0-14 14-20 14-20s14 6 14 20v44H36Zm160 0v-44c0-14 14-20 14-20s14 6 14 20v44h-28Z"
        />
      </g>

      {/* Marine Drive art-deco buildings on the left */}
      <path
        fill={midColor}
        d="M90 200v-62h72v62H90Zm84 0v-78h64v78h-64Zm76 0v-52h86v52h-86Z"
        opacity="0.65"
      />
    </g>
  );
}

function BengaluruVidhanaSoudha({
  midColor,
  accentColor,
  cutoutColor,
}: {
  midColor: string;
  accentColor: string;
  cutoutColor: string;
}) {
  return (
    <g>
      {/* Cubbon Park tree canopy */}
      {[100, 160, 220, 280, 1210, 1270, 1340].map((cx, i) => (
        <circle key={i} cx={cx} cy={178} r={20 + (i % 2) * 5} fill={accentColor} opacity="0.58" />
      ))}

      {/* Vidhana Soudha grand facade */}
      <g transform="translate(740, 32)">
        {/* Ceremonial plinth & steps */}
        <rect x="20" y="148" width="420" height="20" fill={accentColor} />
        {/* Main neo-Dravidian colonnade */}
        <rect x="36" y="84" width="388" height="64" fill={midColor} />
        <rect x="30" y="76" width="400" height="8" fill={accentColor} />
        {/* Grand central stepped tower & dome */}
        <rect x="180" y="50" width="100" height="34" fill={midColor} />
        <rect x="196" y="34" width="68" height="16" fill={accentColor} />
        <path fill={accentColor} d="M206 34c0-20 48-20 48 0h-48Z" />
        <rect x="229" y="6" width="2" height="12" fill={accentColor} />

        {/* Corner domed pavilions */}
        {[46, 124, 304, 382].map((px, i) => (
          <g key={i}>
            <rect x={px} y="60" width="32" height="16" fill={midColor} />
            <path fill={accentColor} d={`M${px} 60c0-13 32-13 32 0h-32Z`} />
          </g>
        ))}

        {/* Vertical colonnade arches */}
        {Array.from({ length: 12 }).map((_, idx) => (
          <rect
            key={idx}
            x={54 + idx * 30}
            y="98"
            width="12"
            height="38"
            rx="6"
            fill={cutoutColor}
            fillOpacity="0.45"
          />
        ))}
      </g>
    </g>
  );
}

function KolkataHowrahBridge({ midColor, accentColor }: { midColor: string; accentColor: string }) {
  return (
    <g>
      {/* Hooghly riverfront & Victoria Memorial hint on the left */}
      <g transform="translate(210, 108)" opacity="0.65">
        <rect x="0" y="42" width="160" height="50" fill={midColor} />
        <path fill={accentColor} d="M54 42c0-26 52-26 52 0H54Z" />
        <rect x="79" y="6" width="2" height="12" fill={accentColor} />
      </g>

      {/* Howrah Bridge (Rabindra Setu) cantilever steel span */}
      <g transform="translate(560, 26)">
        {/* Bridge deck */}
        <rect x="0" y="138" width="840" height="8" fill={accentColor} />
        {/* Twin main cantilever towers */}
        <rect x="190" y="20" width="16" height="154" fill={accentColor} />
        <rect x="610" y="20" width="16" height="154" fill={accentColor} />
        {/* Top cross-bracing & cantilever trusses */}
        <path
          fill="none"
          stroke={midColor}
          strokeWidth="4.5"
          strokeLinejoin="round"
          d="M20 138 L198 24 L310 66 L410 82 L510 66 L618 24 L796 138"
        />
        <path
          fill="none"
          stroke={accentColor}
          strokeWidth="3"
          d="M80 138 L198 54 L270 138 L310 66 L360 138 L410 82 L460 138 L510 66 L550 138 L618 54 L736 138"
        />
        {/* Vertical hanger rods */}
        {[140, 250, 310, 360, 410, 460, 510, 560, 675].map((vx) => (
          <line
            key={vx}
            x1={vx}
            y1="78"
            x2={vx}
            y2="138"
            stroke={midColor}
            strokeWidth="2"
          />
        ))}
      </g>
    </g>
  );
}

function Landscape({ regional, midColor, accentColor }: {
  regional: boolean;
  midColor: string;
  accentColor: string;
}) {
  return (
    <g>
      <path fill={midColor} opacity="0.55" d="M0 200V159Q160 98 310 148T600 136Q780 68 930 124T1200 126Q1320 90 1440 140V200Z" />
      {regional && (
        <path fill={accentColor} d="M710 200q42-38 86-35 12-30 48-33 24-29 62-19 34 5 44 33 36-7 56 21 53 1 93 33Z" />
      )}
      <path fill={midColor} d="M0 200V186Q240 160 490 184T940 180Q1180 151 1440 184V200Z" />
    </g>
  );
}
