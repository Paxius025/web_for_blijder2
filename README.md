# Seeing Eyes — VisionAssist Platform

ระบบช่วยเหลือผู้พิการทางสายตา ด้วยกล้อง Arduino/ESP32 + AI วิเคราะห์ฉาก + เสียงภาษาไทย

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Frontend       │────▶│  Backend (FastAPI)    │────▶│  PostgreSQL 16  │
│  Expo / Web     │     │  YOLO · Gemini · gTTS │     │  Docker         │
│  :8081          │     │  :8000  (native)      │     │  :5432          │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
                                    ▲
                              Arduino Camera
```

> **Architecture:** PostgreSQL รันใน Docker เท่านั้น — Backend และ Frontend รันบน Windows โดยตรงเพื่อให้เข้าถึงอินเทอร์เน็ตได้เต็มที่ (gTTS, Gemini AI)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Expo 54 (React Native + Web), Expo Router, NativeWind, Zustand |
| Backend | FastAPI, Python 3.11, Uvicorn |
| AI / Vision | YOLOv8n (object detection), Google Gemini 1.5 Flash (scene description), gTTS (TTS ภาษาไทย) |
| Database | PostgreSQL 16, SQLAlchemy, asyncpg |
| Infrastructure | Docker (PostgreSQL only) |

---

## Prerequisites

- **Docker Desktop** — สำหรับ PostgreSQL เท่านั้น
- **Python 3.11** — [python.org](https://www.python.org/downloads/)
- **Node.js 20+** — [nodejs.org](https://nodejs.org/)
- **Google Gemini API key** — [aistudio.google.com](https://aistudio.google.com)

---

## Setup

### 1. ตั้งค่า Environment

สร้างไฟล์ `.env` ที่ root ของโปรเจกต์:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://postgres:123456@localhost:5432/caregiver_system
```

### 2. เริ่ม PostgreSQL (Docker)

```bash
docker compose up -d
```

Docker จะรันแค่ `db` service (PostgreSQL 16) บน port 5432

ตรวจสอบ:
```bash
docker compose ps
# blijder2-db-1   Up (healthy)   0.0.0.0:5432->5432/tcp
```

### 3. ติดตั้ง Backend

```bash
cd backend

# สร้าง virtual environment
python -m venv venv

# เปิดใช้งาน venv
venv\Scripts\activate        # Windows CMD/PowerShell
# หรือ
source venv/Scripts/activate # Git Bash

# ติดตั้ง dependencies
pip install -r requirements.txt
pip install imageio-ffmpeg    # ffmpeg สำหรับแปลงไฟล์เสียง (bundled, ไม่ต้องติดตั้งแยก)
```

### 4. รัน Backend

```bash
# ใน Git Bash (จาก backend/)
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 ./venv/Scripts/python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

หรือใน PowerShell:
```powershell
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"
Set-Location backend
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

ตรวจสอบว่า backend พร้อม:
```bash
curl http://localhost:8000/health
# {"status":"healthy","models_loaded":true,"gemini_available":true,...}
```

### 5. รัน Frontend

```bash
cd frontend
npm install
npx expo start --web
```

เปิด browser ที่ [http://localhost:8081](http://localhost:8081)

---

## URLs

| Service | URL |
|---|---|
| Web App | http://localhost:8081 |
| API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## Project Structure

```
.
├── docker-compose.yml        # PostgreSQL เท่านั้น
├── .env                      # GEMINI_API_KEY + DATABASE_URL
├── backend/
│   ├── venv/                 # Python virtual environment (ไม่ commit)
│   ├── main.py               # FastAPI entry point
│   ├── auth.py               # /auth/* routes
│   ├── ai_router.py          # /detect, /audio, /logs, ...
│   ├── database.py           # Async DB connection
│   ├── models.py             # SQLAlchemy table models
│   ├── requirements.txt
│   ├── uploads/              # ภาพที่รับจาก Arduino (ไม่ commit)
│   ├── outputs/              # ภาพหลัง YOLO (ไม่ commit)
│   └── audio/                # ไฟล์เสียง .mp3 (ไม่ commit)
└── frontend/
    ├── app/
    │   ├── index.tsx          # หน้า Login
    │   ├── register.tsx       # หน้า Register
    │   └── (tabs)/            # แท็บหลัก
    ├── store/                 # Zustand state
    └── constants/api.ts       # API_BASE_URL config
```

---

## Database Schema

| Table | Columns สำคัญ |
|---|---|
| `users` | username, password_hash, full_name, emergency_contact, disability_details |
| `devices` | device_serial, user_id, device_name, is_active |
| `job_logs` | job_uuid, device_serial, status, result_text, image_path, audio_path |

ตาราง DB สร้างอัตโนมัติเมื่อ backend เริ่มต้น (`metadata.create_all(engine)`)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ใช่ | Google Gemini API key (รับจาก aistudio.google.com) |
| `DATABASE_URL` | ใช่ | `postgresql://postgres:123456@localhost:5432/caregiver_system` |

---

## Arduino / Device Integration

Arduino ส่งภาพมาที่ Backend ผ่าน HTTP POST:

```
POST /detect
Header: X-Device-Serial: <device_serial>
Body: { "file": "<base64_image>" }
```

Backend ตอบกลับ `{ "job_id": "...", "status": "queued" }` แล้ว poll ผลลัพธ์ได้ที่:
- `GET /status/{job_id}` — สถานะการประมวลผล
- `GET /audio/{job_id}` — ไฟล์เสียง mp3 ภาษาไทย
- `GET /image/{job_id}` — ภาพผลลัพธ์

---

## Common Commands

```bash
# หยุด PostgreSQL
docker compose down

# ลบ database ทั้งหมด (reset)
docker compose down -v

# ดู log backend (ถ้ารันใน background)
tail -f /tmp/backend.log

# ทดสอบ detect ผ่าน Postman endpoint
curl -X POST http://localhost:8000/detectpostman \
  -F "file=@test_image.jpg" \
  -F "enable_speech=true" \
  -F "device_serial=SE-001"
```

---

## Notes

- **ffmpeg** — ใช้ `imageio-ffmpeg` (bundled binary) ไม่ต้องติดตั้ง ffmpeg แยก
- **YOLO model** — `yolov8n.pt` ดาวน์โหลดอัตโนมัติเมื่อ backend เริ่มครั้งแรก (~6 MB)
- **gTTS** — ต้องใช้อินเทอร์เน็ต, มี timeout 8 วินาที, ถ้าไม่มีเน็ตจะข้ามและไม่มีเสียง
- **Gemini** — ต้องใช้อินเทอร์เน็ต, มี timeout 10 วินาที, ถ้าหมดเวลาจะใช้ fallback text แทน
- **Frontend mobile** — แก้ `frontend/constants/api.ts` บรรทัด `http://172.20.10.3:8000` เป็น IP จริงของเครื่อง backend
