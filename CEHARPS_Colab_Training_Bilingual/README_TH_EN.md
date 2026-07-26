# CEHARPS Colab Training + Pathumma RAG — Thai/English line-by-line edition

ชุดนี้แยกการทำงานเป็น 8 สมุดงานเพื่อให้ตรวจข้อผิดพลาดและรันซ้ำเฉพาะส่วนได้ง่าย / This package separates the workflow into eight notebooks so each stage can be tested and rerun independently.

## ลำดับการรัน / Run order

1. `00_setup_and_config.ipynb` — ตั้งค่าโครงการ / configure the project.
2. `01_download_and_validate_datasets.ipynb` — ดาวน์โหลดและตรวจข้อมูล / download and validate data.
3. `02_prepare_health_data.ipynb` — ตรวจและแบ่งข้อมูลเชิงพื้นที่ / validate and spatially split health data.
4. `03_train_health_models.ipynb` — ฝึก Random Forest และ XGBoost / train Random Forest and XGBoost.
5. `04_train_habitat_segmentation.ipynb` — ฝึก U-Net และ DeepLabV3+ / train U-Net and DeepLabV3+.
6. `05_shap_uncertainty_and_ranking.ipynb` — SHAP, bootstrap และเลือกพื้นที่ภายใต้งบ / explain, quantify uncertainty, and optimize the portfolio.
7. `06_pathumma_rag_chatbot.ipynb` — สร้างดัชนีค้นคืนและ Chatbot ด้วย Pathumma / build the retrieval index and Pathumma chatbot.
8. `07_final_validation_and_export.ipynb` — ตรวจไฟล์และส่งออก ZIP / validate and export artifacts.

## Pathumma RAG Chatbot

อัปโหลด PDF, DOCX, TXT, Markdown, CSV หรือ JSON ที่ได้รับอนุมัติลง `MyDrive/CEHARPS/knowledge_base/` แล้วรันสมุดงาน 06 บน Colab GPU รุ่น T4 หรือสูงกว่า ระบบใช้ `BAAI/bge-m3` สร้าง embedding, FAISS ค้นคืนข้อความ และ `nectec/pathumma-thaillm-8b-think-3.0.0` สร้างคำตอบภาษาไทยพร้อมแหล่งอ้างอิง / Upload approved files to `MyDrive/CEHARPS/knowledge_base/`, then run notebook 06 on a T4-or-better Colab GPU. The pipeline uses BGE-M3 embeddings, FAISS retrieval, and Pathumma-ThaiLLM for Thai answers with source citations.

RAG ไม่ใช่การฝึก Pathumma ใหม่ และคำตอบยังต้องผ่านการตรวจสอบโดยผู้เชี่ยวชาญก่อนใช้ตัดสินใจจริง / RAG does not retrain Pathumma, and domain experts must review answers before operational decisions.

## ข้อมูลที่ใช้ / Data use

- MagSet-2 public sample ใช้ทดสอบการจำแนกถิ่นที่อยู่เท่านั้น / The MagSet-2 public sample is only for habitat-segmentation testing.
- GMW หรือ habitat mask ห้ามใช้เป็นป้ายสุขภาพ MHI / GMW or habitat masks must not be used as MHI health labels.
- ค่าเริ่มต้น `health_mode="demo"` สร้างข้อมูลสังเคราะห์เพื่อ smoke test เท่านั้น / The default `health_mode="demo"` creates synthetic data for smoke testing only.
- ก่อนใช้แข่งขัน ให้อัปโหลด `health_features_real.csv` ที่มีข้อมูลภาคสนามหรือข้อมูล DMCR แล้วเปลี่ยน `health_mode` เป็น `real` ในส่วน 00 / Before competition use, upload field/DMCR-backed `health_features_real.csv` and change `health_mode` to `real` in part 00.

## คอลัมน์ข้อมูลสุขภาพขั้นต่ำ / Minimum health-data columns

`sample_id, site_id, spatial_block, MHI` และตัวแปรเชิงตัวเลขอย่างน้อยหนึ่งคอลัมน์ / plus at least one numeric predictor.

แนะนำให้ตั้งชื่อตัวแปรด้วย `state_`, `pressure_`, `trend_`, และ `context_` เพื่อแยกบทบาทและลดการนับซ้ำ / Prefix predictors with `state_`, `pressure_`, `trend_`, and `context_` to clarify roles and reduce double counting.

## การอธิบายโค้ด / Code explanations

ทุกบรรทัดคำสั่งมีคอมเมนต์ `TH:` และ `EN:` อธิบายหน้าที่ของบรรทัดนั้น ส่วนบรรทัดว่างและเครื่องหมายปิดโครงสร้างไม่มีคอมเมนต์เพราะไม่ใช่คำสั่งทำงาน / Every executable line has `TH:` and `EN:` comments explaining its role. Blank lines and structural closing delimiters are not executable statements.

## ข้อจำกัดสำคัญ / Critical limitations

- SHAP อธิบายพฤติกรรมของโมเดล ไม่พิสูจน์เหตุและผล / SHAP explains model behavior; it does not establish causality.
- ช่วง bootstrap สะท้อนความแปรปรวนจากข้อมูลและโมเดลตามวิธีที่กำหนด ไม่ครอบคลุมความไม่แน่นอนทุกชนิด / Bootstrap intervals reflect the specified data/model variation, not every source of uncertainty.
- ชุด MagSet-2 sample มีเพียง 23 คู่และไม่ได้เป็น spatially independent benchmark จึงห้ามใช้ metric เป็นผลการแข่งขัน / The 23-pair MagSet-2 sample is not a spatially independent benchmark; its metrics are not competition evidence.
- คะแนนค้นคืนและการแสดงแหล่งข้อมูลช่วยลดความเสี่ยงแต่ไม่รับประกันว่าคำตอบถูกต้องทุกกรณี / Retrieval scores and displayed sources reduce risk but do not guarantee correctness.
