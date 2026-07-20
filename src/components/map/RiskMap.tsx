import { useEffect } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { Site } from '@/types'
import { RISK_COLOR } from '@/lib/cehar'

/** จุดกึ่งกลางเริ่มต้น — ครอบคลุมทั้งอ่าวไทยและอันดามัน */
const THAILAND_CENTER: [number, number] = [10.2, 100.0]
const DEFAULT_ZOOM = 6

interface RiskMapProps {
  sites: Site[]
  selectedId: string | null
  onSelect: (siteId: string) => void
}

/** ขนาดวงกลมสื่อถึงขนาดพื้นที่ประเมิน (ใช้ sqrt เพื่อให้พื้นที่วงกลมเป็นสัดส่วนกับ areaKm2) */
function markerRadius(areaKm2: number): number {
  return 7 + Math.sqrt(areaKm2) * 0.85
}

/** เลื่อนแผนที่ไปยังพื้นที่ที่ถูกเลือก */
function FlyToSelected({ sites, selectedId }: { sites: Site[]; selectedId: string | null }) {
  const map = useMap()

  useEffect(() => {
    if (!selectedId) return
    const site = sites.find((s) => s.id === selectedId)
    if (!site) return
    map.flyTo([site.lat, site.lng], Math.max(map.getZoom(), 8), { duration: 0.8 })
  }, [map, selectedId, sites])

  return null
}

/**
 * ปรับขนาดแผนที่เมื่อ container เปลี่ยนขนาด (เช่น เปิด/ปิดแผงด้านข้าง)
 *
 * ต้องเรียก invalidateSize ซ้ำหลัง layout รอบแรกด้วย เพราะ Leaflet วัดขนาด
 * container ตอนสร้างแผนที่ ซึ่งบางครั้งเกิดก่อนที่เบราว์เซอร์จะจัดวางเสร็จ
 * ผลคือแผนที่จำขนาดผิดและโหลด tile ไม่เต็มพื้นที่
 */
function ResizeOnLayoutChange() {
  const map = useMap()

  useEffect(() => {
    const refresh = () => map.invalidateSize()

    const observer = new ResizeObserver(refresh)
    observer.observe(map.getContainer())

    const raf = requestAnimationFrame(refresh)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [map])

  return null
}

export function RiskMap({ sites, selectedId, onSelect }: RiskMapProps) {
  return (
    <MapContainer
      center={THAILAND_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="size-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ResizeOnLayoutChange />
      <FlyToSelected sites={sites} selectedId={selectedId} />

      {sites.map((site) => {
        const isSelected = site.id === selectedId
        const color = RISK_COLOR[site.riskLevel]

        return (
          <CircleMarker
            key={site.id}
            center={[site.lat, site.lng]}
            radius={markerRadius(site.areaKm2)}
            pathOptions={{
              color: isSelected ? '#1B4965' : color,
              weight: isSelected ? 3 : 1.5,
              opacity: 1,
              fillColor: color,
              fillOpacity: isSelected ? 0.85 : 0.6,
            }}
            eventHandlers={{ click: () => onSelect(site.id) }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1}>
              <span className="text-xs font-semibold text-navy">{site.name}</span>
              <span className="tabular ml-1.5 text-xs text-navy/60">CEHAR {site.cehar}</span>
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
