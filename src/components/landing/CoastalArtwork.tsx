/**
 * ภาพประกอบหน้าแรก — วาดด้วย SVG ทั้งหมด ไม่ใช้ไฟล์รูป
 *
 * เล่าเรื่องเดียวกับระบบ: ดาวเทียมสแกนชายฝั่ง → เรือสำรวจเก็บข้อมูลภาคสนาม →
 * จุดตรวจวัดในระบบนิเวศเชื่อมกันเป็นโครงข่ายข้อมูล
 *
 * โทนสีอิงภาพอ้างอิง: น้ำทะเลเข้มจัด + เส้นโครงข่ายสีฟ้าสว่าง (cyan) ตัดกันสูง
 * ใช้ preserveAspectRatio="slice" เพื่อให้เต็มคอลัมน์เสมอไม่ว่าจอสูงแค่ไหน
 */

/** สีหลักของโครงข่ายข้อมูล */
const CYAN = '#38bdf8'
const CYAN_BRIGHT = '#7dd3fc'

/** จุดตรวจวัดในโครงข่าย */
const NODES = [
  { x: 118, y: 236, r: 20 },
  { x: 298, y: 168, r: 13 },
  { x: 206, y: 402, r: 16 },
  { x: 404, y: 330, r: 12 },
  { x: 146, y: 618, r: 20 },
  { x: 332, y: 556, r: 13 },
  { x: 252, y: 792, r: 15 },
  { x: 470, y: 702, r: 12 },
  { x: 92, y: 470, r: 10 },
  { x: 396, y: 902, r: 11 },
]

/** เส้นเชื่อมระหว่างจุด (อ้างอิงด้วย index ของ NODES) */
const LINKS: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 5],
  [4, 6],
  [5, 6],
  [5, 7],
  [6, 7],
  [2, 8],
  [4, 8],
  [6, 9],
  [7, 9],
]

/** ฝูงปลา: จุดกึ่งกลาง + จำนวนตัว + ทิศทาง */
const SCHOOLS = [
  { x: 430, y: 430, count: 7, flip: false },
  { x: 132, y: 522, count: 5, flip: true },
  { x: 392, y: 856, count: 6, flip: false },
  { x: 244, y: 664, count: 4, flip: true },
]

export function CoastalArtwork() {
  return (
    <svg
      viewBox="0 0 640 1000"
      preserveAspectRatio="xMidYMid slice"
      className="size-full"
      role="img"
      aria-label="ภาพประกอบแนวคิดระบบ: ดาวเทียมและเรือสำรวจเก็บข้อมูลระบบนิเวศชายฝั่งเป็นโครงข่าย"
    >
      <defs>
        {/* ความลึกของน้ำ — ตื้น/สว่างด้านบน ลึก/มืดด้านล่าง */}
        <linearGradient id="ocean" x1="0.15" y1="0" x2="0.55" y2="1">
          <stop offset="0%" stopColor="#0b3a5e" />
          <stop offset="40%" stopColor="#062440" />
          <stop offset="100%" stopColor="#020c18" />
        </linearGradient>

        <linearGradient id="land" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#24544a" />
          <stop offset="55%" stopColor="#173b3c" />
          <stop offset="100%" stopColor="#0e2a33" />
        </linearGradient>

        {/* ลำแสงสแกนของดาวเทียมและโซนาร์ของเรือ */}
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0.5" />
          <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
        </linearGradient>

        <radialGradient id="nodeGlow">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0.65" />
          <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
        </radialGradient>

        {/* แถบสเปกตรัมสี — สื่อถึงดัชนีเชิงสเปกตรัมจากภาพดาวเทียม */}
        <linearGradient id="spectrum" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="30%" stopColor="#4ade80" />
          <stop offset="60%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>

        {/* แสงเรืองรอบชายฝั่ง ทำให้ดูมีความลึกแบบภาพถ่ายทางอากาศ */}
        <radialGradient id="coastGlow" cx="0.25" cy="0.12" r="0.55">
          <stop offset="0%" stopColor="#1d7fb8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1d7fb8" stopOpacity="0" />
        </radialGradient>

        <filter id="soften" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>

        <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
          <path d="M46 0H0V46" fill="none" stroke={CYAN} strokeOpacity="0.06" strokeWidth="1" />
        </pattern>
      </defs>

      <style>{`
        .pulse { transform-box: fill-box; transform-origin: center; animation: cg-pulse 3.6s ease-out infinite; }
        .pulse-b { animation-delay: 1.2s; }
        .pulse-c { animation-delay: 2.4s; }
        .drift { animation: cg-drift 9s ease-in-out infinite; }
        .drift-b { animation-delay: 3s; }
        .drift-c { animation-delay: 6s; }
        .flicker { animation: cg-flicker 4.5s ease-in-out infinite; }

        @keyframes cg-pulse {
          0%   { transform: scale(0.55); opacity: 0.9; }
          70%  { transform: scale(2.2);  opacity: 0; }
          100% { transform: scale(2.2);  opacity: 0; }
        }
        @keyframes cg-drift {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(16px); }
        }
        @keyframes cg-flicker {
          0%, 100% { opacity: 0.35; }
          50%      { opacity: 0.9; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pulse, .drift, .flicker { animation: none; }
          .pulse { opacity: 0.25; }
        }
      `}</style>

      {/* ---------- ทะเลและกริดข้อมูล ---------- */}
      <rect width="640" height="1000" fill="url(#ocean)" />
      <rect width="640" height="1000" fill="url(#coastGlow)" />
      <rect width="640" height="1000" fill="url(#grid)" />

      {/* ---------- แผ่นดินและชายฝั่ง (รูปทรงอ่าว/แหลมให้ดูเป็นธรรมชาติ) ---------- */}
      <path
        d="M0 0 H352 C338 40 310 58 286 74 C258 92 238 84 214 100
           C188 118 190 146 166 162 C142 178 116 168 96 184
           C74 202 78 228 58 244 C38 260 14 258 0 276 Z"
        fill="url(#land)"
      />
      <path
        d="M352 0 C338 40 310 58 286 74 C258 92 238 84 214 100
           C188 118 190 146 166 162 C142 178 116 168 96 184
           C74 202 78 228 58 244 C38 260 14 258 0 276"
        fill="none"
        stroke={CYAN_BRIGHT}
        strokeOpacity="0.55"
        strokeWidth="1.6"
        filter="url(#glow)"
      />

      {/* เกาะเล็ก กระจายให้เหมือนหมู่เกาะ */}
      {[
        { cx: 214, cy: 300, rx: 27, ry: 15, rot: -18 },
        { cx: 96, cy: 360, rx: 18, ry: 10, rot: 12 },
        { cx: 486, cy: 208, rx: 21, ry: 12, rot: -8 },
        { cx: 158, cy: 258, rx: 12, ry: 7, rot: 24 },
        { cx: 540, cy: 452, rx: 15, ry: 9, rot: 16 },
      ].map((isle) => (
        <ellipse
          key={`${isle.cx}-${isle.cy}`}
          cx={isle.cx}
          cy={isle.cy}
          rx={isle.rx}
          ry={isle.ry}
          transform={`rotate(${isle.rot} ${isle.cx} ${isle.cy})`}
          fill="url(#land)"
          opacity="0.88"
        />
      ))}

      {/* ---------- เส้นชั้นความลึก (bathymetry) ---------- */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M-20 ${318 + i * 118} C 140 ${274 + i * 118}, 250 ${388 + i * 118}, 400 ${340 + i * 118} S 580 ${288 + i * 118}, 660 ${328 + i * 118}`}
          fill="none"
          stroke={CYAN}
          strokeOpacity={0.2 - i * 0.025}
          strokeWidth="1.2"
        />
      ))}

      {/* แถบสเปกตรัมสี */}
      <path
        d="M150 660 C 250 626, 330 700, 448 646"
        fill="none"
        stroke="url(#spectrum)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M150 660 C 250 626, 330 700, 448 646"
        fill="none"
        stroke="url(#spectrum)"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.3"
        filter="url(#soften)"
      />

      {/* ---------- โครงข่ายข้อมูล ---------- */}
      <g filter="url(#glow)">
        {LINKS.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke={CYAN}
            strokeOpacity="0.45"
            strokeWidth="1.2"
          />
        ))}
      </g>

      {/* ---------- ดาวเทียม + ลำแสงสแกน ---------- */}
      <g>
        <polygon points="404,132 288,172 520,172" fill="url(#beam)" />
        <g transform="translate(404 108)" filter="url(#glow)">
          <rect x="-13" y="-9" width="26" height="18" rx="4" fill="#0e2a3c" stroke={CYAN_BRIGHT} strokeOpacity="0.9" strokeWidth="1.4" />
          <rect x="-46" y="-6" width="28" height="12" rx="2" fill="#12384d" stroke={CYAN} strokeOpacity="0.8" strokeWidth="1" />
          <rect x="18" y="-6" width="28" height="12" rx="2" fill="#12384d" stroke={CYAN} strokeOpacity="0.8" strokeWidth="1" />
          <circle cx="0" cy="0" r="3.5" fill={CYAN_BRIGHT} />
        </g>
      </g>

      {/* ---------- เรือสำรวจ ---------- */}
      {[
        { x: 336, y: 296, scale: 1 },
        { x: 196, y: 838, scale: 1.3 },
      ].map((boat) => (
        <g key={boat.y} transform={`translate(${boat.x} ${boat.y}) scale(${boat.scale})`}>
          {/* กรวยโซนาร์ */}
          <polygon points="0,10 -36,92 36,92" fill="url(#beam)" opacity="0.8" />
          {/* ตัวเรือ */}
          <g filter="url(#glow)">
            <path d="M-32 6 L32 6 L24 18 L-24 18 Z" fill="#0f2c40" stroke={CYAN_BRIGHT} strokeOpacity="0.85" strokeWidth="1.3" />
            <rect x="-13" y="-9" width="24" height="15" rx="2.5" fill="#164058" stroke={CYAN_BRIGHT} strokeOpacity="0.7" strokeWidth="1.1" />
            <rect x="-4" y="-19" width="9" height="10" rx="1.5" fill="#1b5070" stroke={CYAN} strokeOpacity="0.6" strokeWidth="1" />
            <line x1="18" y1="6" x2="18" y2="-14" stroke={CYAN} strokeOpacity="0.75" strokeWidth="1.1" />
          </g>
          <circle cx="18" cy="-16" r="2.4" fill={CYAN_BRIGHT} className="flicker" />
        </g>
      ))}

      {/* ---------- จุดตรวจวัด ---------- */}
      {NODES.map((node, i) => (
        <g key={`${node.x}-${node.y}`}>
          <circle cx={node.x} cy={node.y} r={node.r * 2.6} fill="url(#nodeGlow)" />
          <g filter="url(#glow)">
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill="none"
              stroke={CYAN_BRIGHT}
              strokeOpacity="0.85"
              strokeWidth="1.5"
            />
            <circle cx={node.x} cy={node.y} r={node.r * 0.34} fill={CYAN_BRIGHT} />
          </g>
          {i % 3 === 0 && (
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill="none"
              stroke={CYAN}
              strokeWidth="1.2"
              className={`pulse ${i === 3 ? 'pulse-b' : i === 6 ? 'pulse-c' : ''}`}
            />
          )}
        </g>
      ))}

      {/* ---------- ฝูงปลา ---------- */}
      {SCHOOLS.map((school, s) => (
        <g
          key={`${school.x}-${school.y}`}
          className={`drift ${s === 1 ? 'drift-b' : s === 2 ? 'drift-c' : ''}`}
          opacity="0.65"
        >
          {Array.from({ length: school.count }, (_, i) => {
            const col = i % 3
            const row = Math.floor(i / 3)
            const fx = school.x + col * 26 + (row % 2) * 13
            const fy = school.y + row * 20
            const dir = school.flip ? -1 : 1
            return (
              <g key={i} transform={`translate(${fx} ${fy}) scale(${dir} 1)`}>
                <ellipse cx="0" cy="0" rx="8" ry="3.2" fill={CYAN_BRIGHT} fillOpacity="0.8" />
                <path d="M8 0 L14 -4 L14 4 Z" fill={CYAN_BRIGHT} fillOpacity="0.65" />
              </g>
            )
          })}
        </g>
      ))}

      {/* ---------- แผง HUD จำลอง ---------- */}
      {[
        { x: 380, y: 470, w: 118, h: 62 },
        { x: 74, y: 706, w: 96, h: 50 },
        { x: 430, y: 754, w: 104, h: 54 },
      ].map((panel) => (
        <g key={panel.y}>
          <rect
            x={panel.x}
            y={panel.y}
            width={panel.w}
            height={panel.h}
            rx="7"
            fill="#07253a"
            fillOpacity="0.8"
            stroke={CYAN}
            strokeOpacity="0.4"
            strokeWidth="1"
          />
          {[0, 1, 2].map((line) => (
            <rect
              key={line}
              x={panel.x + 11}
              y={panel.y + 13 + line * 13}
              width={(panel.w - 22) * (line === 1 ? 0.62 : line === 2 ? 0.44 : 0.85)}
              height="4"
              rx="2"
              fill={CYAN}
              fillOpacity={0.6 - line * 0.12}
            />
          ))}
        </g>
      ))}

      {/* เงาไล่ระดับด้านขวา ให้กลืนกับพื้นหลังของหน้า */}
      <rect x="440" width="200" height="1000" fill="url(#fadeRight)" />
      <defs>
        <linearGradient id="fadeRight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#050a14" stopOpacity="0" />
          <stop offset="100%" stopColor="#050a14" stopOpacity="0.95" />
        </linearGradient>
      </defs>
    </svg>
  )
}
