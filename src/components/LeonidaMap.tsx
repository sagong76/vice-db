import { memo } from 'react';

/**
 * Stylized dark-mode SVG map of GTA 6 Leonida.
 * Uses a 0–100 viewBox so map pins (positioned by percentage) align perfectly.
 * Regions: Vice Beach (east), Starfish Island, Lake Leonida (center),
 * Port Gellhorn (west), Grassrivers (southwest), Leonida Keys (south).
 */
function LeonidaMapBase() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Interactive map of Leonida"
    >
      <defs>
        {/* Ocean gradient */}
        <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1622" />
          <stop offset="50%" stopColor="#0c1a2a" />
          <stop offset="100%" stopColor="#08121e" />
        </linearGradient>
        {/* Land gradient */}
        <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#141b16" />
          <stop offset="50%" stopColor="#121814" />
          <stop offset="100%" stopColor="#10160f" />
        </linearGradient>
        {/* Beach / sand */}
        <linearGradient id="sand" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a1f1a" />
          <stop offset="100%" stopColor="#222a20" />
        </linearGradient>
        {/* Lake water */}
        <radialGradient id="lake" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#0d2030" />
          <stop offset="100%" stopColor="#091828" />
        </radialGradient>
        {/* Swamp */}
        <linearGradient id="swamp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e1814" />
          <stop offset="100%" stopColor="#0a130f" />
        </linearGradient>
        {/* Port concrete */}
        <linearGradient id="port" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#15191e" />
          <stop offset="100%" stopColor="#11141a" />
        </linearGradient>
        {/* Grid pattern */}
        <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#00f0ff" strokeWidth="0.08" opacity="0.25" />
        </pattern>
        {/* Contour pattern */}
        <pattern id="contour" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="0.3" fill="#1a2a38" opacity="0.5" />
        </pattern>
        {/* Glow filter */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* === OCEAN BACKGROUND === */}
      <rect x="0" y="0" width="100" height="100" fill="url(#ocean)" />
      <rect x="0" y="0" width="100" height="100" fill="url(#contour)" />

      {/* Ocean wave lines */}
      <g stroke="#0e2238" strokeWidth="0.15" fill="none" opacity="0.5">
        <path d="M 0 8 Q 25 9 50 8 T 100 8" />
        <path d="M 0 12 Q 30 13 60 12 T 100 12" />
        <path d="M 0 88 Q 25 89 50 88 T 100 88" />
        <path d="M 0 92 Q 30 93 60 92 T 100 92" />
        <path d="M 0 96 Q 25 97 50 96 T 100 96" />
      </g>

      {/* === MAIN LANDMASS === */}
      {/* The main island/peninsula covering center-east */}
      <path
        d="
          M 28 5
          C 35 3 42 4 48 5
          L 58 4 C 66 3 74 4 82 6
          L 88 8 C 92 10 94 14 95 18
          L 96 24 C 97 30 96 36 95 42
          L 94 48 C 93 54 94 60 92 64
          L 89 68 C 86 70 83 69 80 68
          L 75 66 C 71 68 68 72 65 76
          L 62 80 C 58 84 54 82 50 78
          L 46 74 C 42 76 38 78 34 76
          L 30 73 C 26 70 24 66 22 62
          L 20 56 C 18 52 19 48 22 44
          L 25 40 C 22 36 20 32 22 28
          L 25 22 C 23 18 25 12 28 8
          Z
        "
        fill="url(#land)"
        stroke="#1e2a22"
        strokeWidth="0.3"
      />

      {/* Western landmass - Port Gellhorn area */}
      <path
        d="
          M 2 50
          C 6 48 10 50 14 53
          L 18 56 C 22 58 25 62 26 66
          L 27 72 C 26 78 23 82 19 85
          L 14 88 C 9 90 5 88 2 84
          L 1 78 C 0 72 1 66 2 60
          Z
        "
        fill="url(#land)"
        stroke="#1e2a22"
        strokeWidth="0.3"
      />

      {/* Grassrivers - southwest wetland peninsula */}
      <path
        d="
          M 8 80
          C 12 79 18 81 22 84
          L 28 88 C 32 91 35 94 32 97
          L 28 99 C 22 99 16 97 10 95
          L 6 92 C 3 89 4 84 8 80
          Z
        "
        fill="url(#swamp)"
        stroke="#161e1a"
        strokeWidth="0.3"
      />

      {/* Everglands - southeast */}
      <path
        d="
          M 62 72
          C 66 71 72 73 76 76
          L 82 80 C 86 83 89 86 88 90
          L 85 94 C 80 96 74 95 68 93
          L 63 90 C 59 87 58 82 60 78
          Z
        "
        fill="url(#swamp)"
        stroke="#161e1a"
        strokeWidth="0.3"
      />

      {/* === STARFISH ISLAND === */}
      <path
        d="
          M 44 58
          C 47 56 51 56 54 58
          L 56 61 C 57 64 56 67 54 69
          L 51 71 C 48 71 45 70 43 68
          L 42 64 C 41 61 42 59 44 58
          Z
        "
        fill="url(#land)"
        stroke="#1e2a22"
        strokeWidth="0.3"
      />
      {/* Starfish island palm detail */}
      <circle cx="49" cy="64" r="0.8" fill="#1a2820" opacity="0.6" />
      <circle cx="47" cy="61" r="0.5" fill="#1a2820" opacity="0.5" />
      <circle cx="52" cy="66" r="0.5" fill="#1a2820" opacity="0.5" />

      {/* === LEONIDA KEYS (southern islands) === */}
      <g fill="url(#land)" stroke="#1e2a22" strokeWidth="0.25">
        <path d="M 52 84 C 55 83 58 84 60 86 L 61 89 C 59 91 56 91 53 90 L 51 88 Z" />
        <path d="M 63 88 C 66 87 69 88 71 90 L 71 93 C 68 94 65 93 63 91 Z" />
        <path d="M 73 90 C 76 89 79 90 80 92 L 79 95 C 76 96 73 95 72 93 Z" />
        <path d="M 56 93 C 58 92 60 93 61 95 L 60 97 C 58 98 56 97 55 95 Z" />
        <ellipse cx="67" cy="95" rx="3" ry="1.5" />
      </g>

      {/* Small northern islets */}
      <g fill="url(#land)" stroke="#1e2a22" strokeWidth="0.2" opacity="0.8">
        <ellipse cx="72" cy="12" rx="2.5" ry="1.5" />
        <ellipse cx="80" cy="16" rx="1.8" ry="1.2" />
        <circle cx="76" cy="20" r="1" />
      </g>

      {/* === LAKE LEONIDA (center) === */}
      <ellipse cx="35" cy="38" rx="10" ry="8" fill="url(#lake)" stroke="#0d2030" strokeWidth="0.3" filter="url(#softGlow)" />
      {/* Lake shoreline detail */}
      <ellipse cx="35" cy="38" rx="10" ry="8" fill="none" stroke="#102838" strokeWidth="0.15" opacity="0.6" />
      {/* Small island in lake */}
      <ellipse cx="37" cy="36" rx="1.5" ry="1" fill="#111814" opacity="0.7" />

      {/* === BEACHES (sand coastline) === */}
      {/* Vice Beach - east coast */}
      <path
        d="
          M 93 16 C 95 20 96 28 95 36 L 94 44 C 93 50 94 56 92 60
          L 89 64 C 87 62 86 58 86 54 L 87 46 C 88 38 88 28 90 20
          L 92 16 Z
        "
        fill="url(#sand)"
        opacity="0.55"
      />
      {/* Washington Beach */}
      <path
        d="M 38 44 C 40 47 42 50 41 53 L 39 55 C 37 53 36 49 37 46 Z"
        fill="url(#sand)"
        opacity="0.5"
      />

      {/* === DISTRICTS / CITY BLOCKS === */}
      {/* Vice City Downtown blocks */}
      <g fill="#161c1a" stroke="#1c2a22" strokeWidth="0.12" opacity="0.7">
        <rect x="48" y="42" width="5" height="4" rx="0.3" />
        <rect x="54" y="42" width="4" height="4" rx="0.3" />
        <rect x="59" y="43" width="5" height="5" rx="0.3" />
        <rect x="48" y="47" width="4" height="5" rx="0.3" />
        <rect x="53" y="48" width="5" height="4" rx="0.3" />
        <rect x="59" y="49" width="4" height="4" rx="0.3" />
        <rect x="50" y="53" width="5" height="4" rx="0.3" />
        <rect x="56" y="54" width="4" height="3" rx="0.3" />
      </g>

      {/* Port Gellhorn industrial blocks */}
      <g fill="#151920" stroke="#1a2030" strokeWidth="0.12" opacity="0.7">
        <rect x="6" y="58" width="4" height="5" rx="0.2" />
        <rect x="11" y="60" width="5" height="4" rx="0.2" />
        <rect x="17" y="62" width="4" height="5" rx="0.2" />
        <rect x="7" y="66" width="5" height="4" rx="0.2" />
        <rect x="13" y="68" width="4" height="4" rx="0.2" />
        <rect x="18" y="70" width="4" height="3" rx="0.2" />
      </g>

      {/* Vice Beach resort blocks */}
      <g fill="#181c18" stroke="#1e2620" strokeWidth="0.12" opacity="0.6">
        <rect x="78" y="22" width="4" height="5" rx="0.3" />
        <rect x="83" y="25" width="4" height="4" rx="0.3" />
        <rect x="79" y="29" width="5" height="4" rx="0.3" />
        <rect x="85" y="32" width="3" height="5" rx="0.3" />
        <rect x="80" y="36" width="4" height="4" rx="0.3" />
      </g>

      {/* === ROADS / HIGHWAYS === */}
      {/* Main highway running east-west across center */}
      <g fill="none" stroke="#2a3344" strokeWidth="0.5" opacity="0.6">
        <path d="M 3 52 C 15 50 28 48 40 46 C 52 44 65 45 78 48 C 85 50 90 52 94 54" />
        <path d="M 5 50 C 18 48 30 46 42 44 C 54 42 66 43 78 46" strokeWidth="0.35" stroke="#1e2838" />
      </g>
      {/* Highway dashes */}
      <path
        d="M 3 52 C 15 50 28 48 40 46 C 52 44 65 45 78 48 C 85 50 90 52 94 54"
        fill="none"
        stroke="#3a4a60"
        strokeWidth="0.15"
        strokeDasharray="1.5 1.5"
        opacity="0.5"
      />

      {/* North-south arterial */}
      <g fill="none" stroke="#2a3344" strokeWidth="0.4" opacity="0.55">
        <path d="M 55 8 C 56 18 54 28 55 38 C 56 48 54 58 55 68 C 56 76 54 84 55 92" />
      </g>
      <path
        d="M 55 8 C 56 18 54 28 55 38 C 56 48 54 58 55 68 C 56 76 54 84 55 92"
        fill="none"
        stroke="#3a4a60"
        strokeWidth="0.12"
        strokeDasharray="1.5 1.5"
        opacity="0.5"
      />

      {/* Port Gellhorn access road */}
      <g fill="none" stroke="#222a38" strokeWidth="0.35" opacity="0.5">
        <path d="M 26 66 C 22 64 18 62 14 64 C 10 66 6 68 3 70" />
        <path d="M 24 72 C 20 74 16 76 12 78 C 8 80 5 82 3 84" />
      </g>

      {/* Beachfront boulevard */}
      <g fill="none" stroke="#2a3344" strokeWidth="0.35" opacity="0.5">
        <path d="M 88 20 C 90 28 92 36 90 44 C 89 50 90 56 88 60" />
      </g>

      {/* Everglands backroad */}
      <g fill="none" stroke="#1e2820" strokeWidth="0.3" opacity="0.4">
        <path d="M 62 76 C 66 74 70 76 74 78 C 78 80 82 82 85 84" />
        <path d="M 65 82 C 68 80 72 82 75 84 C 78 86 80 88 82 90" />
      </g>

      {/* Grassrivers waterways */}
      <g fill="none" stroke="#0d2030" strokeWidth="0.25" opacity="0.5">
        <path d="M 10 82 C 14 84 18 83 22 85 C 26 87 28 90 30 93" />
        <path d="M 15 88 C 18 89 21 88 24 90 C 27 92 29 94 30 96" />
      </g>

      {/* === GREEN AREAS / PARKS === */}
      <g fill="#111612" stroke="#182018" strokeWidth="0.15" opacity="0.6">
        <ellipse cx="68" cy="48" rx="4" ry="3" />
        <ellipse cx="30" cy="22" rx="3" ry="2.5" />
        <ellipse cx="72" cy="60" rx="3" ry="2" />
      </g>

      {/* === DOCKS / PIER details === */}
      {/* Port Gellhorn docks */}
      <g stroke="#1a2030" strokeWidth="0.2" opacity="0.6">
        <line x1="6" y1="56" x2="6" y2="52" />
        <line x1="10" y1="55" x2="10" y2="51" />
        <line x1="14" y1="56" x2="14" y2="52" />
        <line x1="18" y1="57" x2="18" y2="53" />
      </g>
      {/* Vice Beach Marina docks */}
      <g stroke="#1e2620" strokeWidth="0.2" opacity="0.6">
        <line x1="82" y1="40" x2="85" y2="42" />
        <line x1="83" y1="42" x2="86" y2="44" />
        <line x1="81" y1="43" x2="84" y2="45" />
      </g>

      {/* === BRIDGES === */}
      {/* Bridge to Starfish Island */}
      <g stroke="#2a3344" strokeWidth="0.3" opacity="0.5">
        <line x1="44" y1="56" x2="46" y2="58" />
        <line x1="54" y1="56" x2="52" y2="58" />
      </g>
      {/* Bridge to Leonida Keys */}
      <g stroke="#2a3344" strokeWidth="0.25" opacity="0.4">
        <line x1="58" y1="80" x2="56" y2="84" />
        <line x1="65" y1="78" x2="65" y2="86" />
      </g>

      {/* === GRID OVERLAY === */}
      <rect x="0" y="0" width="100" height="100" fill="url(#grid)" />

      {/* === REGION LABELS === */}
      <g fill="#5b6a86" fontFamily="Inter, sans-serif" fontWeight="600" opacity="0.85">
        {/* Vice Beach */}
        <text x="82" y="30" fontSize="1.8" textAnchor="middle" fill="#00f0ff" opacity="0.5" filter="url(#softGlow)">
          VICE BEACH
        </text>
        {/* Vice City Downtown */}
        <text x="55" y="50" fontSize="1.8" textAnchor="middle" fill="#ff2a85" opacity="0.45" filter="url(#softGlow)">
          VICE CITY
        </text>
        {/* Lake Leonida */}
        <text x="35" y="39" fontSize="1.5" textAnchor="middle" fill="#3a6a8a" opacity="0.6">
          LAKE LEONIDA
        </text>
        {/* Port Gellhorn */}
        <text x="14" y="64" fontSize="1.6" textAnchor="middle" fill="#5b6a86" opacity="0.6">
          PORT GELLHORN
        </text>
        {/* Grassrivers */}
        <text x="20" y="92" fontSize="1.5" textAnchor="middle" fill="#3a5a3a" opacity="0.6">
          GRASSRIVERS
        </text>
        {/* Leonida Keys */}
        <text x="66" y="93" fontSize="1.4" textAnchor="middle" fill="#5b6a86" opacity="0.5">
          LEONIDA KEYS
        </text>
        {/* Starfish Island */}
        <text x="49" y="65" fontSize="1.1" textAnchor="middle" fill="#5b6a86" opacity="0.5">
          STARFISH IS.
        </text>
        {/* Everglands */}
        <text x="75" y="82" fontSize="1.4" textAnchor="middle" fill="#3a5a3a" opacity="0.5">
          EVERGLANDS
        </text>
        {/* Washington Beach */}
        <text x="41" y="52" fontSize="1.1" textAnchor="middle" fill="#5b6a86" opacity="0.45">
          WASH. BEACH
        </text>
      </g>

      {/* === COMPASS ROSE === */}
      <g transform="translate(8, 10)" opacity="0.4">
        <circle cx="0" cy="0" r="2.5" fill="none" stroke="#00f0ff" strokeWidth="0.15" />
        <path d="M 0 -2.2 L 0.5 0 L 0 2.2 L -0.5 0 Z" fill="#00f0ff" opacity="0.6" />
        <text x="0" y="-3" fontSize="1.2" textAnchor="middle" fill="#00f0ff" fontFamily="Inter, sans-serif" fontWeight="700">
          N
        </text>
      </g>

      {/* === SUBTLE NEON BORDER === */}
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="#00f0ff" strokeWidth="0.15" opacity="0.3" />
    </svg>
  );
}

export const LeonidaMap = memo(LeonidaMapBase);
