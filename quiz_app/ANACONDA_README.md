# 한국어 퀴즈 앱

## 🚀 실행 방법 (Anaconda 사용자)

### 1. Anaconda Prompt에서 실행
```bash
# Anaconda Prompt 열기
# 프로젝트 폴더로 이동
cd "c:\Work\abc-bootcamp-2025\quiz_app"

# 앱 실행
python app.py
```

### 2. 또는 배치 파일 실행
- `run_with_anaconda.bat` 파일을 더블클릭
- Anaconda Prompt에서 자동으로 실행됩니다

### 3. 브라우저에서 접속
- http://localhost:5000 접속

## 📋 필요한 패키지
```bash
pip install Flask Flask-SocketIO
```

## 🎮 게임 기능

### 솔로 퀴즈
- **11개 분야**: 일반상식, 역사, 과학, 시사, 영화, 드라마, 게임, 웹툰, 애니메이션, 수도, 연애심리
- **문제 수 선택**: 5, 10, 15, 20문제
- **다중 분야 선택**: 여러 분야를 섞어서 출제
- **점수 시스템**: 정답당 5점 (난이도 구분 없음)
- **테마 모드**: 라이트/다크/자동 모드 지원

### 1대1 대전
- 실시간 대전 기능
- 대기열 시스템

### 문제 기록
- 풀었던 문제 히스토리
- 정답/오답 확인
- 해설 제공

## 🛠️ 문제 해결

### "퀴즈 데이터를 불러올 수 없음" 오류
1. Anaconda Prompt에서 실행하세요
2. `data/quiz_data.json` 파일이 있는지 확인하세요
3. 파일 경로가 올바른지 확인하세요

### Flask 패키지 오류
```bash
pip install Flask Flask-SocketIO
```

## 📁 파일 구조
```
quiz_app/
├── app.py                 # 메인 애플리케이션
├── run_with_anaconda.bat  # Anaconda용 실행 파일
├── requirements.txt       # 필요한 패키지 목록
├── quiz_app.db           # SQLite 데이터베이스
├── data/
│   └── quiz_data.json    # 퀴즈 문제 데이터
├── templates/            # HTML 템플릿
├── static/              # CSS, JS 파일
└── README.md            # 이 파일
```
