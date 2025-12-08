# 🧠 KoBERT 기반 리뷰 판별 서비스 (Flask + React + MySQL)

사용자가 입력한 리뷰 문장을 **생성형 리뷰인지 / 실제 리뷰인지 자동으로 판별하는 웹 서비스**입니다.  
백엔드는 **Flask + HuggingFace Transformers**,  
프론트엔드는 **React(Vite)**,  
데이터 저장은 **MySQL**을 사용합니다.

---

## 🚀 주요 기능

### 🔍 KoBERT 기반 리뷰 판별
- 사전 학습된 KoBERT 모델 기반 텍스트 분류
- 리뷰가 **생성형 리뷰인지 / 실제 리뷰인지** 자동 판별

### 📝 판별 내역 저장
- MySQL DB에 리뷰 및 결과 저장
- 최신 10개 로그 조회 기능 제공

### 💻 React 웹 UI 제공
- 리뷰 입력 → 결과 확인
- 최근 저장된 판별 기록 표시

---

## 📁 프로젝트 구조
vision-up/
├── backend/
│ ├── app.py
│ ├── requirements.txt
│ ├── checkpoint-462/ ← Google Drive 저장 (GitHub 제외)
│ └── flask_kobert/ ← 가상환경(venv) (GitHub 제외)
│
└── frontend/
├── src/
├── public/
├── package.json
└── vite.config.js

---

## 🧪 API 명세

### ▶ POST `/predict`
입력된 리뷰 문장을 분석하여 생성형/실제 리뷰 반환

**Request**
```json
{
  "text": "이 가게 떡볶이 진짜 맛있어요!"
}
```

**Response**
```json
{
  "result": "실제 리뷰"
}
```

### ▶ GET `/api/recent`
저장된 판별 결과 중 최신 10개 조회

**Response**
```json
[
  {
    "id": 1,
    "text": "친절하고 음식도 맛있었어요.",
    "pred_label": "실제 리뷰",
    "created_at": "2025-12-01T05:37:11.234Z"
  }
]
```

---

## 📦 모델 설치 안내
대용량 모델(checkpoint-462)은 GitHub에 업로드되지 않습니다.
다음 절차에 따라 직접 설치해야 합니다:

1. Google Drive에서 checkpoint-462 다운로드
2. backend 폴더 안에 그대로 넣기

---

## 실행 방법
1. net start MySQL80 (서버 실행되어 있는지 확인)

2. Backend (Flask)
cd backend
.\flask_kobert\Scripts\activate
pip install -r requirements.txt
python app.py

3. Frontend (React)
cd frontend
npm install (최초)
npm run dev

---

## 기술 스택
Backend
- Flask
- SQLAlchemy
- PyMySQL
- HuggingFace Transformers
- PyTorch

Frontend
- React (Vite)
- JavaScript
- CSS

Database
- MySQL 8.0

---

## 라이선스
2025-2 비전업 팀 프로젝트입니다.