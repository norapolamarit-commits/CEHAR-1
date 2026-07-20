import type { RiskLevel } from '@/types'
import { RISK_COLOR, RISK_LABEL, clamp } from '@/lib/cehar'

interface GaugeProps {
  /** คะแนน 0–100 */
  value: number
  level: RiskLevel
  size?: number
}

const START_ANGLE = 150
const SWEEP = 240
const RADIUS = 70
const CENTER = 90

function polarToCartesian(angleDeg: number, radius = RADIUS): [number, number] {
  const rad = (angleDeg * Math.PI) / 180
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)]
}

/** สร้าง path ของส่วนโค้งจากมุมเริ่มถึงมุมจบ (องศา, หมุนตามเข็มนาฬิกา) */
function arcPath(startAngle: number, endAngle: number): string {
  const [x1, y1] = polarToCartesian(startAngle)
  const [x2, y2] = polarToCartesian(endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}`
}

/** เกจครึ่งวงกลมแสดงคะแนน CEHAR พร้อมแถบระดับความเสี่ยงเป็นฉากหลัง */
export function Gauge({ value, level, size = 180 }: GaugeProps) {
  const safeValue = clamp(value, 0, 100)
  const valueAngle = START_ANGLE + (SWEEP * safeValue) / 100

  // ขอบเขตของแต่ละระดับความเสี่ยงบนหน้าปัด (0–39 / 40–69 / 70–100)
  const zones: Array<{ from: number; to: number; color: string }> = [
    { from: 0, to: 40, color: RISK_COLOR.high },
    { from: 40, to: 70, color: RISK_COLOR.medium },
    { from: 70, to: 100, color: RISK_COLOR.low },
  ]

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 180 150"
        width={size}
        height={size * (150 / 180)}
        role="img"
        aria-label={`คะแนน CEHAR ${safeValue} จาก 100 — ${RISK_LABEL[level]}`}
      >
        {/* แถบโซนความเสี่ยงจาง ๆ เป็นฉากหลัง */}
        {zones.map((zone) => (
          <path
            key={zone.from}
            d={arcPath(
              START_ANGLE + (SWEEP * zone.from) / 100,
              START_ANGLE + (SWEEP * zone.to) / 100,
            )}
            fill="none"
            stroke={zone.color}
            strokeOpacity={0.18}
            strokeWidth={14}
            strokeLinecap="butt"
          />
        ))}

        {/* ส่วนโค้งของคะแนนจริง */}
        <path
          d={arcPath(START_ANGLE, valueAngle)}
          fill="none"
          stroke={RISK_COLOR[level]}
          strokeWidth={14}
          strokeLinecap="round"
        />

        {/* ตัวเลขคะแนน */}
        <text
          x={CENTER}
          y={CENTER + 8}
          textAnchor="middle"
          className="tabular"
          fontSize="38"
          fontWeight="600"
          fill="#1B4965"
        >
          {safeValue.toFixed(1)}
        </text>
        <text x={CENTER} y={CENTER + 30} textAnchor="middle" fontSize="12" fill="#1B4965" fillOpacity="0.55">
          CEHAR · เต็ม 100
        </text>

        {/* ป้ายปลายสเกล */}
        <text x={24} y={144} textAnchor="middle" fontSize="11" fill="#1B4965" fillOpacity="0.45">
          0
        </text>
        <text x={156} y={144} textAnchor="middle" fontSize="11" fill="#1B4965" fillOpacity="0.45">
          100
        </text>
      </svg>
    </div>
  )
}
