from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flasgger import Swagger
import torch

app = Flask(__name__)
CORS(app)  # React(3000) → Flask(8000) 요청 허용

# -------------------- Swagger 설정 --------------------
app.config["SWAGGER"] = {
    "title": "KoBERT Review Classifier API",
    "uiversion": 3,
}
swagger = Swagger(app)

# -------------------- DB 설정 --------------------
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://seonga:seonga1108@localhost:3306/review_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    pred_label = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

# -------------------- 모델 로딩 --------------------
model_path = "./checkpoint-462"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
model.eval()

def predict_label(text: str) -> str:
    with torch.no_grad():
        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding="max_length",
            max_length=128,
            return_token_type_ids=False,
        )
        outputs = model(**inputs)
        pred = torch.argmax(outputs.logits, dim=1).item()
        return "생성형 리뷰" if pred == 1 else "실제 리뷰"

# -------------------- API 엔드포인트 --------------------
@app.route("/predict", methods=["POST"])
def predict():
    """
    리뷰 생성형/실제 판별 API

    ---
    tags:
      - Review
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - text
          properties:
            text:
              type: string
              example: "이 가게 진짜 맛있음"
    responses:
      200:
        description: OK
        schema:
          type: object
          properties:
            result:
              type: string
              example: "실제 리뷰"
    """
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "텍스트가 필요합니다."}), 400

    text = data["text"]
    result = predict_label(text)

    # 로그 저장
    review = Review(text=text, pred_label=result)
    db.session.add(review)
    db.session.commit()

    return jsonify({"result": result})


# -------------------- 최근 기록 API --------------------
@app.route("/api/recent", methods=["GET"])
def recent_reviews():
    """
    최근 10개의 리뷰 기록 불러오기

    ---
    tags:
      - Review
    responses:
      200:
        description: Review logs
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              text:
                type: string
              pred_label:
                type: string
              created_at:
                type: string
    """
    rows = Review.query.order_by(Review.created_at.desc()).limit(10).all()
    return jsonify([
        {
            "id": r.id,
            "text": r.text,
            "pred_label": r.pred_label,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ])


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)