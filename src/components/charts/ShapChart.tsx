import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ShapFeature } from '@/types'

interface ShapChartProps {
  data: ShapFeature[]
  height?: number
}

const POSITIVE = '#1C7293'
const NEGATIVE = '#C0392B'

interface TooltipPayloadItem {
  payload: ShapFeature
}

function ShapTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload

  return (
    <div className="max-w-64 rounded-xl border border-navy/12 bg-white p-3 text-xs shadow-lg shadow-navy/10">
      <p className="font-semibold text-navy">{item.feature}</p>
      <p className="text-navy/50">{item.featureEn}</p>
      <p className="mt-2 text-navy/75">
        ค่าที่ตรวจวัด: <span className="font-medium text-navy">{item.observed}</span>
      </p>
      <p className="mt-1 text-navy/75">
        ผลต่อคะแนน:{' '}
        <span
          className="tabular font-semibold"
          style={{ color: item.contribution >= 0 ? POSITIVE : NEGATIVE }}
        >
          {item.contribution >= 0 ? '+' : '−'}
          {Math.abs(item.contribution).toFixed(1)}
        </span>
      </p>
    </div>
  )
}

/**
 * กราฟแท่งแนวนอนแสดงค่า SHAP
 * แท่งขวา (น้ำเงิน) = ปัจจัยที่ดันคะแนนสุขภาพขึ้น
 * แท่งซ้าย (แดง) = ปัจจัยที่ฉุดคะแนนลง
 */
export function ShapChart({ data, height = 320 }: ShapChartProps) {
  // เรียงให้ปัจจัยที่มีผลมากที่สุดอยู่บนสุด
  const sorted = [...data].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
  const maxAbs = Math.max(...sorted.map((d) => Math.abs(d.contribution)), 1)
  const bound = Math.ceil(maxAbs * 1.15)
  // บังคับให้แกนสมมาตรและมี 0 อยู่ตรงกลางเสมอ อ่านทิศทางของแท่งได้ทันที
  const half = Math.round(bound / 2)
  const ticks = [-bound, -half, 0, half, bound]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
        barCategoryGap="22%"
      >
        <XAxis
          type="number"
          domain={[-bound, bound]}
          ticks={ticks}
          tick={{ fontSize: 11, fill: '#1B4965', opacity: 0.6 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="feature"
          width={132}
          tick={{ fontSize: 11.5, fill: '#1B4965' }}
          tickLine={false}
          axisLine={false}
        />
        <ReferenceLine x={0} stroke="#1B4965" strokeOpacity={0.25} />
        <Tooltip content={<ShapTooltip />} cursor={{ fill: 'rgba(27,73,101,0.04)' }} />
        <Bar dataKey="contribution" radius={[4, 4, 4, 4]} isAnimationActive={false}>
          {sorted.map((item) => (
            <Cell
              key={item.featureEn}
              fill={item.contribution >= 0 ? POSITIVE : NEGATIVE}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
