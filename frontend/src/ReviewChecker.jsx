import React, { useState, useEffect } from "react";
import "./ReviewChecker.css";

function ReviewChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const fetchRecent = async () => {
    setRecentLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/recent");
      const data = await res.json();
      setRecent(data);
    } catch (err) {
      console.error("최근 기록 조회 실패:", err);
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handlePredict = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (data.result) {
        setResult(data.result);
        setText("");          // 성공 시 입력창 비우기
        fetchRecent();        // 최근 기록 새로고침
      } else if (data.error) {
        setResult(data.error);
      } else {
        setResult("알 수 없는 응답입니다.");
      }
    } catch (err) {
      console.error(err);
      setResult("서버 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rc-page">
      <div className="rc-container">
        <header className="rc-header">
          <h1 className="rc-title">동대문 엽기 떡볶이 리뷰 판별기</h1>
          <p className="rc-subtitle">
            리뷰 문장을 입력하면 <span>생성형 리뷰</span>인지 <span>실제 리뷰</span>인지 판별합니다.
          </p>
        </header>

        <section className="rc-card rc-input-card">
          <label className="rc-label" htmlFor="review-input">
            리뷰 내용
          </label>
          <textarea
            id="review-input"
            rows={4}
            className="rc-textarea"
            placeholder="예) 이 가게 떡볶이 진짜 맛있고 직원도 친절했어요!"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="rc-actions">
            <button
              className="rc-button"
              onClick={handlePredict}
              disabled={loading || !text.trim()}
            >
              {loading ? "분석 중..." : "판별하기"}
            </button>
          </div>

          {result && (
            <div className="rc-result">
              <span className="rc-result-label">결과</span>
              <span className="rc-result-value">{result}</span>
            </div>
          )}
        </section>

        <section className="rc-card rc-recent-card">
          <div className="rc-recent-header">
            <h2>최근 판별 기록</h2>
            <button
              className="rc-link-button"
              onClick={fetchRecent}
              disabled={recentLoading}
            >
              {recentLoading ? "불러오는 중..." : "새로고침"}
            </button>
          </div>

          {recent.length === 0 && !recentLoading && (
            <p className="rc-empty">아직 저장된 기록이 없습니다.</p>
          )}

          {recent.length > 0 && (
            <ul className="rc-recent-list">
              {recent.map((item) => (
                <li key={item.id} className="rc-recent-item">
                  <div className="rc-recent-top">
                    <span
                      className={
                        "rc-badge " +
                        (item.pred_label === "생성형 리뷰"
                          ? "rc-badge-ai"
                          : "rc-badge-real")
                      }
                    >
                      {item.pred_label}
                    </span>
                    <span className="rc-date">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="rc-recent-text">{item.text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default ReviewChecker;
