import { useId } from 'react';
import styles from './Cassette.module.css';

const DARK_SHADE = {
  '#C0392B': '#922b21',
  '#2A7D6F': '#1a4d45',
  '#2C3E6B': '#1a2540',
  '#8B4513': '#5a2d0c',
  '#5B2D8E': '#3a1d5a',
};

function getDarkShade(color) {
  return DARK_SHADE[color] ?? DARK_SHADE[color?.toUpperCase()] ?? '#111';
}

// Calculates 6 spoke line endpoints at 60° intervals from r_inner=14 to r_outer=38
function getSpokes(cx, cy) {
  return [0, 60, 120, 180, 240, 300].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return {
      key: deg,
      x1: (cx + 14 * Math.cos(rad)).toFixed(2),
      y1: (cy + 14 * Math.sin(rad)).toFixed(2),
      x2: (cx + 38 * Math.cos(rad)).toFixed(2),
      y2: (cy + 38 * Math.sin(rad)).toFixed(2),
    };
  });
}

function Reel({ cx, cy, color, id, spinning }) {
  const reelStyle = {
    transformBox: 'fill-box',
    transformOrigin: 'center center',
    animation: spinning ? 'spin 2s linear infinite' : 'none',
  };

  return (
    <g id={id} style={reelStyle}>
      {/* Outer dark ring */}
      <circle cx={cx} cy={cy} r="52" fill="#1A1208" stroke="#1A1208" strokeWidth="2" />
      {/* Middle coloured ring */}
      <circle cx={cx} cy={cy} r="38" fill={color} stroke="#1A1208" strokeWidth="1.5" />
      {/* Hub */}
      <circle cx={cx} cy={cy} r="14" fill="#1A1208" />
      {/* 6 spokes */}
      {getSpokes(cx, cy).map(({ key, x1, y1, x2, y2 }) => (
        <line
          key={key}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#FFF8EC"
          strokeWidth="2"
          opacity="0.6"
        />
      ))}
      {/* Tiny centre hole */}
      <circle cx={cx} cy={cy} r="5" fill="#FFF8EC" opacity="0.3" />
    </g>
  );
}

export default function Cassette({
  color = '#2A7D6F',
  title = '',
  fromName = '',
  toName = '',
  spinning = false,
}) {
  const uid = useId().replace(/:/g, '');
  const darkShade = getDarkShade(color);

  const displayTitle = title || 'UNTITLED';
  const displayFrom  = fromName || '—';
  const displayTo    = toName   || '—';
  const labelLine    = `${displayFrom} → ${displayTo}`;

  // Truncate title so it fits inside the label
  const truncTitle = displayTitle.length > 24 ? displayTitle.slice(0, 24) + '…' : displayTitle;
  const truncLabel = labelLine.length > 30 ? labelLine.slice(0, 30) + '…' : labelLine;

  const screwData = [
    { cx: 32,  cy: 32  },
    { cx: 468, cy: 32  },
    { cx: 32,  cy: 288 },
    { cx: 468, cy: 288 },
  ];

  return (
    <svg
      viewBox="0 0 500 320"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.cassette}
      role="img"
      aria-label={`Cassette: ${displayTitle}`}
    >
      {/* ── 1. Outer shell ── */}
      <rect
        x="10" y="10" width="480" height="300" rx="20"
        fill={color}
        stroke="#1A1208"
        strokeWidth="3"
      />

      {/* ── 2. Corner screws ── */}
      {screwData.map(({ cx, cy }) => (
        <g key={`${cx}-${cy}`}>
          <circle
            cx={cx} cy={cy} r="10"
            fill={color}
            style={{ filter: 'brightness(0.7)' }}
            stroke="#1A1208"
            strokeWidth="2"
          />
          {/* + screw slot */}
          <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke="#1A1208" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke="#1A1208" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ))}

      {/* ── 3. Label area ── */}
      <rect
        x="60" y="20" width="380" height="130" rx="8"
        fill="#FFF8EC"
        stroke="#1A1208"
        strokeWidth="1.5"
      />

      {/* ── 4. Label text ── */}
      {/* Tape title */}
      <text
        x="250" y="65"
        textAnchor="middle"
        fontFamily="'Playfair Display', serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="22"
        fill="#1A1208"
      >
        {truncTitle}
      </text>
      {/* From → To */}
      <text
        x="250" y="88"
        textAnchor="middle"
        fontFamily="'Caveat', cursive"
        fontSize="14"
        fill="#8B6F3A"
      >
        {truncLabel}
      </text>
      {/* SIDE A */}
      <text
        x="250" y="138"
        textAnchor="middle"
        fontFamily="'Space Mono', monospace"
        fontSize="9"
        letterSpacing="3"
        fill="#B0977A"
      >
        ✦  SIDE A  ✦
      </text>

      {/* ── 5. Tape window ── */}
      <rect
        x="185" y="165" width="130" height="50" rx="6"
        fill="#1A1208"
        opacity="0.75"
      />

      {/* ── 6. Tape ribbon curve ── */}
      <path
        d="M 195 205 Q 250 180 305 205"
        stroke="#FFF8EC"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
      />

      {/* ── 7 & 8. Reels ── */}
      <Reel cx={145} cy={210} color={color} id={`reel-left-${uid}`}  spinning={spinning} />
      <Reel cx={355} cy={210} color={color} id={`reel-right-${uid}`} spinning={spinning} />

      {/* ── 9. Bottom ridge ── */}
      <rect
        x="80" y="268" width="340" height="22" rx="6"
        fill={darkShade}
        stroke="#1A1208"
        strokeWidth="1.5"
      />
    </svg>
  );
}
