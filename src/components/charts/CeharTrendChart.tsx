import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CeharPoint } from '@/types'
import { RISK_COLOR } from '@/lib/cehar'

interface CeharTrendChartProps {
  data: CeharPoint[]
  height?: number
  /** แสดงเส้นเกณฑ์ความเสี่ยงที่ 70 และ 40 */
  showThresholds?: boolean
  color?: string
  /** ชื่อชุดข้อมูลที่แสดงใน tooltip */
  seriesLabel?: string
}

/** กราฟแนวโน้มคะแนน CEHAR ย้อนหลัง พร้อมเส้นเกณฑ์ความเสี่ยง */
export function CeharTrendChart({
  data,
  height = 260,
  showThresholds = true,
  color = '#1C7293',
  seriesLabel = 'CEHAR',
}: CeharTrendChartProps) {
  // ขยายแกน Y ตามช่วงของข้อมูลจริง ไม่ใช่ปัดเป็นหลักสิบตายตัว
  // (ถ้าปัดตายตัว ข้อมูลที่แกว่งแค่ 5 คะแนนจะถูกบีบจนเส้นแบนราบ อ่านแนวโน้มไม่ออก)
  const values = data.map((d) => d.cehar)
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const padding = Math.max(4, (hi - lo) * 0.55)
  const min = Math.max(0, Math.floor((lo - padding) / 5) * 5)
  const max = Math.min(100, Math.ceil((hi + padding) / 5) * 5)

  // วาดเส้นเกณฑ์เฉพาะเส้นที่อยู่ในกรอบแกน Y จริง ๆ
  const thresholds = showThresholds
    ? ([
        { value: 70, color: RISK_COLOR.low, label: 'เสี่ยงต่ำ ≥ 70', position: 'insideTopRight' as const },
        { value: 40, color: RISK_COLOR.high, label: 'เสี่ยงสูง < 40', position: 'insideBottomRight' as const },
      ].filter((t) => t.value > min && t.value < max))
    : []

  const gradientId = `cehar-gradient-${color.replace('#', '')}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -14 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.42} />
            <stop offset="55%" stopColor={color} stopOpacity={0.14} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke="#1B4965" strokeOpacity={0.08} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#1B4965', opacity: 0.6 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={12}
        />
        <YAxis
          domain={[min, max]}
          tick={{ fontSize: 11, fill: '#1B4965', opacity: 0.6 }}
          tickLine={false}
          axisLine={false}
          width={46}
        />

        {thresholds.map((threshold) => (
          <ReferenceLine
            key={threshold.value}
            y={threshold.value}
            stroke={threshold.color}
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={{
              value: threshold.label,
              position: threshold.position,
              fontSize: 10,
              fill: threshold.color,
            }}
          />
        ))}

        <Tooltip
          cursor={{ stroke: '#1B4965', strokeOpacity: 0.2 }}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid rgba(27,73,101,0.12)',
            fontSize: 12,
            fontFamily: 'inherit',
            boxShadow: '0 8px 24px rgba(27,73,101,0.12)',
          }}
          labelStyle={{ color: '#1B4965', fontWeight: 600 }}
          formatter={(value) => [Number(value).toFixed(1), seriesLabel]}
        />

        <Area
          type="monotone"
          dataKey="cehar"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
