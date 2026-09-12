# Robot Position Tracker

FastAPI + WebSocket 로 여러 대의 로봇 위치를 실시간으로 보여주는 토이 프로젝트. 실제 로봇 대신 `app/simulator.py`가 랜덤 워크로 움직이는 더미 로봇 데이터를 생성한다.

## 구조

- `app/simulator.py` — 필드 안에서 벽에 부딪히면 방향을 바꾸며 돌아다니는 더미 로봇 시뮬레이터
- `app/main.py` — FastAPI 앱. 0.2초 간격으로 시뮬레이터를 진행시키고 연결된 모든 클라이언트에 브로드캐스트하는 백그라운드 태스크, `/ws/robots` 웹소켓 엔드포인트
- `app/static/index.html` — Canvas로 로봇 위치/방향/배터리를 그려주는 단일 페이지 프론트엔드

## 실행

```bash
cd toy/robot-tracker
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

브라우저에서 http://localhost:8000 접속.

## 동작 방식

1. 서버 시작 시 로봇 3대를 임의 위치에 생성한다.
2. 백그라운드 태스크가 0.2초마다 각 로봇을 전진시키고(약간의 랜덤 조향 포함), 필드 경계에 닿으면 반사시킨다.
3. 클라이언트가 `/ws/robots`에 연결하면 즉시 현재 스냅샷을 받고, 이후 매 틱마다 전체 로봇 위치를 JSON으로 받는다.
4. 프론트엔드는 받은 좌표를 캔버스 좌표로 스케일링해 점 + 방향 화살표로 그린다.
