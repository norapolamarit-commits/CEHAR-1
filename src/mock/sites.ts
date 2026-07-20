import type { CeharPoint, EcosystemType, ShapFeature, Site } from '@/types'
import {
  computeCehar,
  computeRestorationPriority,
  round1,
  toRiskLevel,
} from '@/lib/cehar'

/**
 * ข้อมูลจำลองของพื้นที่นำร่อง 8 แห่งตามชายฝั่งไทย
 *
 * ⚠️ MOCK DATA — ตัวเลขทั้งหมดในไฟล์นี้เป็นค่าสมมติเพื่อสาธิต UI เท่านั้น
 * ยังไม่ได้มาจากการประมวลผลภาพดาวเทียมหรือแบบจำลอง ML จริง
 * พิกัดเป็นพิกัดจริงโดยประมาณของพื้นที่นั้น ๆ
 *
 * TODO(backend): แทนที่ทั้งไฟล์ด้วยผลลัพธ์จาก GET /api/sites
 * โครงสร้างที่ backend ต้องส่งกลับดูได้ที่ src/types/index.ts
 */

/** ค่าฐานของแบบจำลอง (base value ของ SHAP) — คะแนนเฉลี่ยก่อนพิจารณาปัจจัยรายพื้นที่ */
export const MODEL_BASE_VALUE = 62

interface RawSite {
  id: string
  name: string
  province: string
  coast: 'gulf' | 'andaman'
  lat: number
  lng: number
  areaKm2: number
  shi: number | null
  mhi: number | null
  chi: number | null
  /** ส่วนต่าง CEHAR เทียบ 12 เดือนก่อน */
  trend12m: number
  /** ค่าคงที่สำหรับสุ่มแบบ deterministic — เปลี่ยนแล้วกราฟจะเปลี่ยนรูป */
  seed: number
  shap: ShapFeature[]
  summary: string
  recommendations: string[]
}

const RAW_SITES: RawSite[] = [
  {
    id: 'kung-krabaen',
    name: 'อ่าวคุ้งกระเบน',
    province: 'จันทบุรี',
    coast: 'gulf',
    lat: 12.5847,
    lng: 101.9053,
    areaKm2: 24,
    shi: 71,
    mhi: 78,
    chi: null,
    trend12m: 1.8,
    seed: 1041,
    shap: [
      { feature: 'การเปลี่ยนแปลงแนวชายฝั่ง', featureEn: 'Shoreline change', contribution: 5.4, observed: '+0.3 ม./ปี (ตะกอนทับถม)' },
      { feature: 'การใช้ประโยชน์ที่ดิน', featureEn: 'LULC', contribution: 4.6, observed: 'ป่าชายเลนคงสภาพ 92%' },
      { feature: 'ความขุ่นของน้ำ', featureEn: 'Turbidity', contribution: 2.1, observed: '4.8 NTU' },
      { feature: 'แรงกดดันจากมนุษย์', featureEn: 'Human pressure', contribution: -1.9, observed: 'บ่อเลี้ยงกุ้ง 11 แห่งรอบอ่าว' },
      { feature: 'คลอโรฟิลล์-เอ', featureEn: 'Chlorophyll-a', contribution: -1.2, observed: '2.6 มก./ลบ.ม.' },
      { feature: 'อุณหภูมิผิวน้ำทะเล', featureEn: 'SST', contribution: -0.8, observed: '30.1 °C (+0.4 จากค่าปกติ)' },
      { feature: 'ความลึกน้ำ', featureEn: 'Bathymetry', contribution: 1.1, observed: 'เฉลี่ย 3.2 ม.' },
      { feature: 'การขยายตัวของเมือง', featureEn: 'Urban expansion', contribution: -0.9, observed: '0.4%/ปี ในลุ่มน้ำ' },
      { feature: 'การทรุดตัวของแผ่นดิน', featureEn: 'Land subsidence', contribution: -0.5, observed: '2 มม./ปี' },
    ],
    summary:
      'อ่าวคุ้งกระเบนอยู่ในกลุ่มพื้นที่สุขภาพดีที่สุดของชุดข้อมูล ป่าชายเลนคงสภาพสูงถึง 92% และแนวชายฝั่งมีตะกอนทับถมมากกว่าถูกกัดเซาะ ซึ่งเป็นสัญญาณบวกที่หาได้ยากในอ่าวไทยฝั่งตะวันออก แนวโน้ม 12 เดือนดีขึ้นเล็กน้อย ปัจจัยลบหลักคือแรงกดดันจากบ่อเพาะเลี้ยงสัตว์น้ำโดยรอบ ซึ่งยังอยู่ในระดับที่จัดการได้',
    recommendations: [
      'คงมาตรการแนวกันชนป่าชายเลนรอบบ่อเพาะเลี้ยง และเฝ้าระวังการขยายพื้นที่บ่อใหม่',
      'ใช้พื้นที่นี้เป็นแปลงอ้างอิง (reference site) สำหรับสอบเทียบดัชนีของพื้นที่อื่นในอ่าวไทยตะวันออก',
      'ติดตามคลอโรฟิลล์-เอ ต่อเนื่อง หากเกิน 4 มก./ลบ.ม. ให้ตรวจสอบการระบายน้ำจากบ่อเลี้ยง',
    ],
  },
  {
    id: 'tha-chin-estuary',
    name: 'ปากแม่น้ำท่าจีน',
    province: 'สมุทรสาคร',
    coast: 'gulf',
    lat: 13.4802,
    lng: 100.2711,
    areaKm2: 38,
    shi: null,
    mhi: 34,
    chi: null,
    trend12m: -4.2,
    seed: 2277,
    shap: [
      { feature: 'การเปลี่ยนแปลงแนวชายฝั่ง', featureEn: 'Shoreline change', contribution: -9.8, observed: '−4.1 ม./ปี (กัดเซาะรุนแรง)' },
      { feature: 'แรงกดดันจากมนุษย์', featureEn: 'Human pressure', contribution: -8.6, observed: 'ความหนาแน่นอุตสาหกรรมสูงสุดในชุดข้อมูล' },
      { feature: 'ความขุ่นของน้ำ', featureEn: 'Turbidity', contribution: -6.2, observed: '31.5 NTU' },
      { feature: 'คลอโรฟิลล์-เอ', featureEn: 'Chlorophyll-a', contribution: -4.4, observed: '12.8 มก./ลบ.ม. (ยูโทรฟิเคชัน)' },
      { feature: 'การใช้ประโยชน์ที่ดิน', featureEn: 'LULC', contribution: -3.1, observed: 'ป่าชายเลนคงสภาพ 46%' },
      { feature: 'อุณหภูมิผิวน้ำทะเล', featureEn: 'SST', contribution: -0.6, observed: '31.0 °C' },
      { feature: 'ความลึกน้ำ', featureEn: 'Bathymetry', contribution: 0.7, observed: 'เฉลี่ย 2.1 ม.' },
      { feature: 'การขยายตัวของเมือง', featureEn: 'Urban expansion', contribution: -5.2, observed: '3.8%/ปี (สูงสุดในชุดข้อมูล)' },
      { feature: 'การทรุดตัวของแผ่นดิน', featureEn: 'Land subsidence', contribution: -7.4, observed: '18 มม./ปี จากการสูบน้ำบาดาล' },
    ],
    summary:
      'ปากแม่น้ำท่าจีนเป็นพื้นที่วิกฤตที่สุดในชุดข้อมูล ดัชนีสุขภาพป่าชายเลนอยู่ที่ 34 และยังทรุดลงต่อเนื่อง ปัจจัยฉุดหลักคือการกัดเซาะชายฝั่งราว 4 เมตรต่อปี ซึ่งมีต้นเหตุอยู่บนบก — แผ่นดินทรุดถึง 18 มม./ปี จากการสูบน้ำบาดาล ทำให้ระดับน้ำทะเลสัมพัทธ์สูงขึ้นเร็วกว่าที่ป่าชายเลนจะสะสมตะกอนตามทัน ซ้ำด้วยเมืองที่ขยายตัว 3.8% ต่อปีและภาวะยูโทรฟิเคชันจากน้ำทิ้ง พื้นที่ป่าชายเลนคงสภาพเหลือไม่ถึงครึ่ง',
    recommendations: [
      'ผลักดันมาตรการควบคุมการสูบน้ำบาดาลในลุ่มน้ำ เพราะการปลูกป่าชายเลนทดแทนจะไม่ยั่งยืนตราบใดที่แผ่นดินยังทรุด 18 มม./ปี',
      'เร่งมาตรการชะลอคลื่นและดักตะกอน (ไม้ไผ่ชะลอคลื่น/เสาคอนกรีต) ในจุดกัดเซาะรุนแรงก่อนปลูกป่าชายเลนทดแทน',
      'ตรวจสอบแหล่งปล่อยน้ำทิ้งต้นน้ำที่ทำให้คลอโรฟิลล์-เอ สูงถึง 12.8 มก./ลบ.ม.',
    ],
  },
  {
    id: 'sattahip-samaesan',
    name: 'อ่าวสัตหีบ–หมู่เกาะแสมสาร',
    province: 'ชลบุรี',
    coast: 'gulf',
    lat: 12.5766,
    lng: 100.9484,
    areaKm2: 31,
    shi: 58,
    mhi: null,
    chi: 52,
    trend12m: -2.6,
    seed: 3312,
    shap: [
      { feature: 'แรงกดดันจากมนุษย์', featureEn: 'Human pressure', contribution: -5.9, observed: 'ท่าเรือ + กิจกรรมดำน้ำหนาแน่น' },
      { feature: 'อุณหภูมิผิวน้ำทะเล', featureEn: 'SST', contribution: -4.3, observed: '31.4 °C (DHW 3.1)' },
      { feature: 'ความขุ่นของน้ำ', featureEn: 'Turbidity', contribution: -3.4, observed: '9.7 NTU' },
      { feature: 'คลอโรฟิลล์-เอ', featureEn: 'Chlorophyll-a', contribution: -2.2, observed: '4.9 มก./ลบ.ม.' },
      { feature: 'ความลึกน้ำ', featureEn: 'Bathymetry', contribution: 1.6, observed: 'เฉลี่ย 8.4 ม.' },
      { feature: 'การใช้ประโยชน์ที่ดิน', featureEn: 'LULC', contribution: 1.2, observed: 'พื้นที่เขตทหารเรือช่วยจำกัดการพัฒนา' },
      { feature: 'การเปลี่ยนแปลงแนวชายฝั่ง', featureEn: 'Shoreline change', contribution: -0.9, observed: '−0.6 ม./ปี' },
      { feature: 'การขยายตัวของเมือง', featureEn: 'Urban expansion', contribution: -3.1, observed: '2.6%/ปี (พื้นที่ EEC)' },
      { feature: 'การทรุดตัวของแผ่นดิน', featureEn: 'Land subsidence', contribution: -1.2, observed: '4 มม./ปี' },
    ],
    summary:
      'อ่าวสัตหีบ–แสมสารอยู่ในระดับความเสี่ยงปานกลางค่อนไปทางสูง ปะการัง (CHI 52) แย่กว่าหญ้าทะเล (SHI 58) โดยมีความเครียดเชิงความร้อนสะสม DHW 3.1 ซึ่งเข้าใกล้เกณฑ์เตือนภัยฟอกขาว จุดเด่นคือสถานะพื้นที่เขตทหารเรือช่วยจำกัดการพัฒนาชายฝั่ง แต่แรงกดดันจากท่าเรือและการท่องเที่ยวดำน้ำยังเป็นปัจจัยลบอันดับหนึ่ง',
    recommendations: [
      'กำหนดโควตานักดำน้ำต่อวันในจุดที่ปะการังเสียหายมากที่สุด และติดตั้งทุ่นผูกเรือเพิ่มเพื่อเลี่ยงการทิ้งสมอ',
      'เฝ้าระวัง DHW รายสัปดาห์ในช่วงเดือน เม.ย.–มิ.ย. ซึ่งเป็นช่วงเสี่ยงฟอกขาวสูงสุด',
      'สำรวจแปลงหญ้าทะเลซ้ำเพื่อยืนยันว่า SHI ที่ลดลงมาจากตะกอนจากท่าเรือหรือจากปัจจัยตามฤดูกาล',
    ],
  },
  {
    id: 'koh-tao',
    name: 'เกาะเต่า',
    province: 'สุราษฎร์ธานี',
    coast: 'gulf',
    lat: 10.0956,
    lng: 99.8403,
    areaKm2: 21,
    shi: null,
    mhi: null,
    chi: 38,
    trend12m: -6.4,
    seed: 4408,
    shap: [
      { feature: 'อุณหภูมิผิวน้ำทะเล', featureEn: 'SST', contribution: -12.7, observed: '31.9 °C (DHW 6.8)' },
      { feature: 'แรงกดดันจากมนุษย์', featureEn: 'Human pressure', contribution: -7.4, observed: 'ร้านดำน้ำ 60+ แห่ง นักท่องเที่ยวหนาแน่น' },
      { feature: 'ความขุ่นของน้ำ', featureEn: 'Turbidity', contribution: -3.3, observed: '6.1 NTU (สูงกว่าค่าปกติของเกาะ)' },
      { feature: 'คลอโรฟิลล์-เอ', featureEn: 'Chlorophyll-a', contribution: -2.4, observed: '3.4 มก./ลบ.ม.' },
      { feature: 'ความลึกน้ำ', featureEn: 'Bathymetry', contribution: -1.8, observed: 'แนวปะการังส่วนใหญ่ตื้นกว่า 6 ม.' },
      { feature: 'การใช้ประโยชน์ที่ดิน', featureEn: 'LULC', contribution: -1.2, observed: 'สิ่งปลูกสร้างริมหาดเพิ่ม 8% ใน 5 ปี' },
      { feature: 'การเปลี่ยนแปลงแนวชายฝั่ง', featureEn: 'Shoreline change', contribution: 4.8, observed: '−0.1 ม./ปี (ค่อนข้างเสถียร)' },
      { feature: 'การขยายตัวของเมือง', featureEn: 'Urban expansion', contribution: -4.1, observed: 'สิ่งปลูกสร้างเพิ่ม 3.1%/ปี' },
      { feature: 'การทรุดตัวของแผ่นดิน', featureEn: 'Land subsidence', contribution: 1.6, observed: '<1 มม./ปี (ฐานหินแกรนิต)' },
    ],
    summary:
      'เกาะเต่ามีแนวโน้มทรุดตัวเร็วที่สุดในชุดข้อมูล (−6.4 ใน 12 เดือน) ตัวขับหลักคือความเครียดเชิงความร้อน DHW 6.8 ซึ่งเกินเกณฑ์ Bleaching Alert Level 1 ของ NOAA แล้ว ซ้ำเติมด้วยแรงกดดันจากการท่องเที่ยวดำน้ำที่หนาแน่นที่สุดของอ่าวไทย แนวปะการังส่วนใหญ่อยู่ในน้ำตื้นกว่า 6 เมตร จึงไม่มีชั้นน้ำลึกช่วยกันความร้อน',
    recommendations: [
      'ประกาศปิดจุดดำน้ำที่ฟอกขาวรุนแรงชั่วคราวจนกว่า DHW จะลดต่ำกว่า 4',
      'ลดแรงกดดันที่ควบคุมได้ทันที (สมอเรือ ครีมกันแดด น้ำเสียจากรีสอร์ต) เพราะความร้อนเป็นปัจจัยที่ควบคุมไม่ได้ในระยะสั้น',
      'ตั้งจุดสำรวจถาวรเพื่อวัดอัตราการฟื้นตัวหลังเหตุการณ์ฟอกขาว และคัดเลือกโคโลนีทนร้อนไว้ขยายพันธุ์',
    ],
  },
  {
    id: 'pattani-bay',
    name: 'อ่าวปัตตานี',
    province: 'ปัตตานี',
    coast: 'gulf',
    lat: 6.8895,
    lng: 101.2913,
    areaKm2: 74,
    shi: 33,
    mhi: 40,
    chi: null,
    trend12m: -4.6,
    seed: 5519,
    shap: [
      { feature: 'ความขุ่นของน้ำ', featureEn: 'Turbidity', contribution: -9.1, observed: '24.6 NTU' },
      { feature: 'การใช้ประโยชน์ที่ดิน', featureEn: 'LULC', contribution: -7.3, observed: 'ป่าชายเลนคงสภาพ 51%' },
      { feature: 'แรงกดดันจากมนุษย์', featureEn: 'Human pressure', contribution: -6.4, observed: 'ประมงพื้นบ้านหนาแน่น + ชุมชนริมอ่าว' },
      { feature: 'คลอโรฟิลล์-เอ', featureEn: 'Chlorophyll-a', contribution: -3.8, observed: '9.2 มก./ลบ.ม.' },
      { feature: 'การเปลี่ยนแปลงแนวชายฝั่ง', featureEn: 'Shoreline change', contribution: -2.6, observed: '−1.7 ม./ปี' },
      { feature: 'ความลึกน้ำ', featureEn: 'Bathymetry', contribution: -0.9, observed: 'เฉลี่ย 1.8 ม. (อ่าวปิดตื้น)' },
      { feature: 'อุณหภูมิผิวน้ำทะเล', featureEn: 'SST', contribution: 4.6, observed: '30.4 °C (ไม่เกินเกณฑ์เสี่ยง)' },
      { feature: 'การขยายตัวของเมือง', featureEn: 'Urban expansion', contribution: -2.8, observed: '1.9%/ปี รอบอ่าว' },
      { feature: 'การทรุดตัวของแผ่นดิน', featureEn: 'Land subsidence', contribution: -3.6, observed: '8 มม./ปี (ที่ราบดินอ่อน)' },
    ],
    summary:
      'อ่าวปัตตานีมีคะแนนต่ำที่สุดฝั่งหญ้าทะเล (SHI 33) ปัญหาหลักไม่ใช่ความร้อน แต่เป็นความขุ่นของน้ำที่สูงถึง 24.6 NTU ซึ่งตัดแสงที่หญ้าทะเลต้องใช้สังเคราะห์แสง ประกอบกับสภาพอ่าวกึ่งปิดที่ตื้นมาก ทำให้ตะกอนและสารอาหารสะสมโดยแลกเปลี่ยนน้ำได้ช้า เป็นพื้นที่ที่มาตรการจัดการต้นน้ำน่าจะเห็นผลชัดกว่ามาตรการในทะเล',
    recommendations: [
      'ตรวจหาต้นตอตะกอนจากลุ่มน้ำปัตตานีและแม่น้ำสายบุรี ก่อนลงทุนปลูกหญ้าทะเลทดแทน (ปลูกในน้ำขุ่นมักไม่รอด)',
      'ฟื้นฟูป่าชายเลนแนวกันชนรอบอ่าวเพื่อดักตะกอนก่อนลงสู่แปลงหญ้าทะเล',
      'ทำงานร่วมกับกลุ่มประมงพื้นบ้านเรื่องเขตห้ามใช้เครื่องมือลากอวนในแปลงหญ้าทะเลที่เหลืออยู่',
    ],
  },
  {
    id: 'koh-libong',
    name: 'เกาะลิบง–หาดเจ้าไหม',
    province: 'ตรัง',
    coast: 'andaman',
    lat: 7.2467,
    lng: 99.3958,
    areaKm2: 136,
    shi: 76,
    mhi: 80,
    chi: 66,
    trend12m: 0.9,
    seed: 6624,
    shap: [
      { feature: 'การใช้ประโยชน์ที่ดิน', featureEn: 'LULC', contribution: 6.8, observed: 'ป่าชายเลนคงสภาพ 95% (เขตห้ามล่าสัตว์ป่า)' },
      { feature: 'ความขุ่นของน้ำ', featureEn: 'Turbidity', contribution: 4.2, observed: '3.1 NTU' },
      { feature: 'การเปลี่ยนแปลงแนวชายฝั่ง', featureEn: 'Shoreline change', contribution: 2.9, observed: '+0.1 ม./ปี' },
      { feature: 'ความลึกน้ำ', featureEn: 'Bathymetry', contribution: 1.4, observed: 'แปลงหญ้าทะเลกว้าง ระดับ 1–4 ม.' },
      { feature: 'แรงกดดันจากมนุษย์', featureEn: 'Human pressure', contribution: -1.6, observed: 'ท่องเที่ยวเชิงนิเวศ ระดับปานกลาง' },
      { feature: 'อุณหภูมิผิวน้ำทะเล', featureEn: 'SST', contribution: -1.3, observed: '30.6 °C (DHW 1.4)' },
      { feature: 'คลอโรฟิลล์-เอ', featureEn: 'Chlorophyll-a', contribution: -0.8, observed: '1.9 มก./ลบ.ม.' },
      { feature: 'การขยายตัวของเมือง', featureEn: 'Urban expansion', contribution: 1.4, observed: 'แทบไม่ขยายตัว (เขตห้ามล่าฯ)' },
      { feature: 'การทรุดตัวของแผ่นดิน', featureEn: 'Land subsidence', contribution: 0.8, observed: '<1 มม./ปี' },
    ],
    summary:
      'เกาะลิบง–หาดเจ้าไหม เป็นแปลงหญ้าทะเลผืนใหญ่ที่สุดในชุดข้อมูลและมีสุขภาพดีที่สุดเมื่อเทียบขนาดพื้นที่ สถานะพื้นที่คุ้มครองสะท้อนออกมาเป็นป่าชายเลนคงสภาพถึง 95% และน้ำใส (3.1 NTU) ซึ่งเป็นเงื่อนไขสำคัญของแหล่งหญ้าทะเลที่เป็นถิ่นอาศัยพะยูน จุดที่อ่อนที่สุดของพื้นที่คือแนวปะการัง (CHI 66) ที่เริ่มมีความเครียดเชิงความร้อนสะสม',
    recommendations: [
      'รักษาระดับความขุ่นให้ต่ำกว่า 5 NTU เป็นตัวชี้วัดหลักของพื้นที่ เพราะเป็นเงื่อนไขอยู่รอดของแปลงหญ้าทะเลพะยูน',
      'ใช้เป็นพื้นที่อ้างอิงสำหรับสอบเทียบดัชนีฝั่งอันดามัน',
      'เฝ้าระวังแนวปะการังรอบเกาะเพิ่มเติม เนื่องจากเป็น sub-index เดียวที่ต่ำกว่า 70',
    ],
  },
  {
    id: 'phang-nga-bay',
    name: 'อ่าวพังงา',
    province: 'พังงา',
    coast: 'andaman',
    lat: 8.2988,
    lng: 98.5545,
    areaKm2: 190,
    shi: 63,
    mhi: 71,
    chi: null,
    trend12m: -1.2,
    seed: 7735,
    shap: [
      { feature: 'การใช้ประโยชน์ที่ดิน', featureEn: 'LULC', contribution: 5.1, observed: 'ป่าชายเลนคงสภาพ 88%' },
      { feature: 'ความลึกน้ำ', featureEn: 'Bathymetry', contribution: 2.2, observed: 'อ่าวกึ่งปิด เฉลี่ย 5.6 ม.' },
      { feature: 'แรงกดดันจากมนุษย์', featureEn: 'Human pressure', contribution: -3.4, observed: 'เรือนำเที่ยว 400+ ลำ/วันช่วงไฮซีซัน' },
      { feature: 'ความขุ่นของน้ำ', featureEn: 'Turbidity', contribution: -2.8, observed: '11.4 NTU' },
      { feature: 'คลอโรฟิลล์-เอ', featureEn: 'Chlorophyll-a', contribution: -1.1, observed: '3.0 มก./ลบ.ม.' },
      { feature: 'การเปลี่ยนแปลงแนวชายฝั่ง', featureEn: 'Shoreline change', contribution: 0.6, observed: '+0.2 ม./ปี' },
      { feature: 'อุณหภูมิผิวน้ำทะเล', featureEn: 'SST', contribution: 2.4, observed: '30.3 °C' },
      { feature: 'การขยายตัวของเมือง', featureEn: 'Urban expansion', contribution: -2.2, observed: '1.4%/ปี (ท่องเที่ยว)' },
      { feature: 'การทรุดตัวของแผ่นดิน', featureEn: 'Land subsidence', contribution: 0.6, observed: 'เสถียร — ฐานหินปูน' },
    ],
    summary:
      'อ่าวพังงาเป็นพื้นที่ประเมินที่ใหญ่ที่สุด (190 ตร.กม.) และป่าชายเลนยังคงสภาพดีถึง 88% ทำให้ MHI อยู่ที่ 71 แต่หญ้าทะเล (SHI 63) ถูกกดด้วยความขุ่นจากการสัญจรของเรือนำเที่ยวและตะกอนจากลำน้ำ แนวโน้มโดยรวมทรุดลงเล็กน้อย ยังไม่ถึงระดับวิกฤต แต่ควรจับตาเพราะขนาดพื้นที่ทำให้ผลกระทบต่อประมงและการกักเก็บคาร์บอนสูงมาก',
    recommendations: [
      'กำหนดเส้นทางเดินเรือนำเที่ยวให้เลี่ยงแปลงหญ้าทะเล และจำกัดความเร็วในเขตน้ำตื้นเพื่อลดการฟุ้งของตะกอน',
      'ใช้ศักยภาพการกักเก็บคาร์บอนของป่าชายเลนผืนนี้เป็นข้อเสนอขอทุนฟื้นฟูเชิงบลูคาร์บอน',
      'ติดตาม SHI รายไตรมาส หากลดต่ำกว่า 55 ให้ยกระดับเป็นพื้นที่เฝ้าระวังพิเศษ',
    ],
  },
  {
    id: 'mu-koh-surin',
    name: 'หมู่เกาะสุรินทร์',
    province: 'พังงา',
    coast: 'andaman',
    lat: 9.4147,
    lng: 97.8654,
    areaKm2: 18,
    shi: 69,
    mhi: null,
    chi: 63,
    trend12m: -3.8,
    seed: 8846,
    shap: [
      { feature: 'ความขุ่นของน้ำ', featureEn: 'Turbidity', contribution: 5.6, observed: '1.8 NTU (ใสที่สุดในชุดข้อมูล)' },
      { feature: 'แรงกดดันจากมนุษย์', featureEn: 'Human pressure', contribution: 3.2, observed: 'อยู่ในอุทยานฯ ปิดฤดูมรสุม' },
      { feature: 'อุณหภูมิผิวน้ำทะเล', featureEn: 'SST', contribution: -8.9, observed: '31.6 °C (DHW 5.2)' },
      { feature: 'ความลึกน้ำ', featureEn: 'Bathymetry', contribution: 1.9, observed: 'มีแนวปะการังลึกถึง 18 ม.' },
      { feature: 'คลอโรฟิลล์-เอ', featureEn: 'Chlorophyll-a', contribution: 0.8, observed: '0.9 มก./ลบ.ม.' },
      { feature: 'การเปลี่ยนแปลงแนวชายฝั่ง', featureEn: 'Shoreline change', contribution: 0.4, observed: 'ค่อนข้างเสถียร' },
      { feature: 'การใช้ประโยชน์ที่ดิน', featureEn: 'LULC', contribution: 1.2, observed: 'ไม่มีการพัฒนาบนเกาะนอกเขตอุทยานฯ' },
      { feature: 'การขยายตัวของเมือง', featureEn: 'Urban expansion', contribution: 2.1, observed: 'ไม่มีการพัฒนา (อุทยานฯ)' },
      { feature: 'การทรุดตัวของแผ่นดิน', featureEn: 'Land subsidence', contribution: 0.9, observed: 'เสถียร' },
    ],
    summary:
      'หมู่เกาะสุรินทร์มีสภาพแวดล้อมพื้นฐานดีที่สุด — น้ำใสที่สุด (1.8 NTU) แรงกดดันจากมนุษย์ต่ำ และอยู่ในเขตอุทยานแห่งชาติ แต่คะแนนกลับถูกฉุดลงด้วยปัจจัยเดียวคือความเครียดเชิงความร้อน (DHW 5.2) ซึ่งเป็นภัยที่มาตรการจัดการในพื้นที่แก้ไม่ได้ กรณีนี้แสดงข้อจำกัดของการอนุรักษ์เชิงพื้นที่ต่อภัยคุกคามระดับโลกได้ชัดเจน',
    recommendations: [
      'ให้ความสำคัญกับแนวปะการังน้ำลึก (10–18 ม.) ในฐานะแหล่งหลบภัยเชิงความร้อน (thermal refugia) และแหล่งตัวอ่อนสำหรับฟื้นฟูแนวน้ำตื้น',
      'คงมาตรการปิดพื้นที่ตามฤดูกาลไว้ เพราะเป็นตัวแปรบวกที่ควบคุมได้จริงเพียงไม่กี่ตัวของพื้นที่นี้',
      'รายงานสถานะเป็นกรณีศึกษาว่าพื้นที่คุ้มครองอย่างเดียวไม่พอรับมือคลื่นความร้อนทะเล',
    ],
  },
]

/* ------------------------------------------------------------------
   ตัวช่วยสร้างข้อมูลแบบ deterministic
   ใช้ seed เพื่อให้กราฟไม่เปลี่ยนรูปทุกครั้งที่ re-render
   ------------------------------------------------------------------ */

/** ตัวสุ่ม mulberry32 — เร็ว เล็ก และให้ผลเหมือนเดิมทุกครั้งเมื่อ seed เท่ากัน */
function makeRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

/** เดือนย้อนหลัง 12 เดือนนับถึงเดือนปัจจุบัน (เก่า → ใหม่) */
function lastTwelveMonths(): Array<{ label: string; key: string }> {
  const now = new Date()
  const months: Array<{ label: string; key: string }> = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const buddhistYear = (d.getFullYear() + 543) % 100
    months.push({
      label: `${THAI_MONTHS[d.getMonth()]} ${String(buddhistYear).padStart(2, '0')}`,
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    })
  }
  return months
}

/**
 * สร้างประวัติ 12 เดือนที่ "จบ" ที่ค่า CEHAR ปัจจุบันพอดี
 * เดินจากค่าเมื่อ 12 เดือนก่อน (cehar − trend) มาถึงปัจจุบันแบบเชิงเส้น
 * แล้วเติมความผันผวนตามฤดูกาล + สัญญาณรบกวนเล็กน้อย
 */
function buildHistory(cehar: number, trend12m: number, seed: number): CeharPoint[] {
  const random = makeRandom(seed)
  const months = lastTwelveMonths()
  const start = cehar - trend12m

  return months.map((month, i) => {
    const progress = i / (months.length - 1)
    const linear = start + (cehar - start) * progress
    // ความผันผวนตามฤดูกาล (คลื่นความร้อนช่วงกลางปี) + noise
    const seasonal = Math.sin((i / 12) * Math.PI * 2) * 1.4
    const noise = (random() - 0.5) * 1.6
    // จุดสุดท้ายต้องตรงกับ CEHAR ปัจจุบันเป๊ะ ๆ
    const value = i === months.length - 1 ? cehar : linear + seasonal + noise

    return {
      label: month.label,
      key: month.key,
      cehar: round1(Math.min(100, Math.max(0, value))),
    }
  })
}

/**
 * ปรับสเกล SHAP ให้ผลรวมของ contribution เท่ากับ (CEHAR − ค่าฐานของโมเดล) พอดี
 * เพื่อให้กราฟ SHAP อ่านได้ตรงตามนิยาม: f(x) = base value + Σ contributions
 */
function normalizeShap(shap: ShapFeature[], cehar: number): ShapFeature[] {
  const target = cehar - MODEL_BASE_VALUE
  const sum = shap.reduce((acc, f) => acc + f.contribution, 0)
  if (Math.abs(sum) < 0.001) return shap

  const scale = target / sum
  return shap
    .map((f) => ({ ...f, contribution: round1(f.contribution * scale) }))
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
}

function ecosystemsOf(raw: RawSite): EcosystemType[] {
  const list: EcosystemType[] = []
  if (raw.shi !== null) list.push('seagrass')
  if (raw.mhi !== null) list.push('mangrove')
  if (raw.chi !== null) list.push('coral')
  return list
}

/** วันประมวลผลล่าสุด — สมมติว่าเป็นวันแรกของเดือนปัจจุบัน */
function lastUpdatedIso(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

/** พื้นที่นำร่องทั้งหมดพร้อมค่าที่คำนวณแล้ว */
export const MOCK_SITES: Site[] = RAW_SITES.map((raw) => {
  const cehar = computeCehar({ shi: raw.shi, mhi: raw.mhi, chi: raw.chi })
  return {
    id: raw.id,
    name: raw.name,
    province: raw.province,
    coast: raw.coast,
    lat: raw.lat,
    lng: raw.lng,
    areaKm2: raw.areaKm2,
    ecosystems: ecosystemsOf(raw),
    shi: raw.shi,
    mhi: raw.mhi,
    chi: raw.chi,
    cehar,
    riskLevel: toRiskLevel(cehar),
    trend12m: raw.trend12m,
    shap: normalizeShap(raw.shap, cehar),
    history: buildHistory(cehar, raw.trend12m, raw.seed),
    restorationPriorityScore: computeRestorationPriority({
      cehar,
      trend12m: raw.trend12m,
      areaKm2: raw.areaKm2,
    }),
    summary: raw.summary,
    recommendations: raw.recommendations,
    lastUpdated: lastUpdatedIso(),
  }
})
