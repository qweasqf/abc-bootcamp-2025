# abc-bootcamp-2025

유클리드소프트 데이터탐험가의 AI활용 실습 수업에서 배우고 실습한 내용들을 정리한 저장소입니다.

## 폴더 및 파일 구조
- `01-cli.py ~ 03-cli.py, 05-cli-streaming.py, 06-cli-chat.py`: 다양한 OpenAI API 활용 CLI 예제
- `04-webapp.py`: Streamlit 기반 웹앱 예제
- `ai.py`: 관상 분석 AI 함수
- `audio.py`: gTTS, pygame을 활용한 음성 합성 및 재생 예제
- `generator_01.py`: 파이썬 제너레이터 예제
- `mini_project/`, `quiz_app/`: 미니 프로젝트 및 퀴즈 앱 예제
- `requirements.txt`: 필요 패키지 목록
- 기타: 크롤링, HTML, 이미지 등 실습 자료 포함

## 주요 기술 및 라이브러리
- Python 3.13
- OpenAI API
- python-dotenv
- streamlit
- gTTS, pygame
- requests, httpx

## 설치 및 실행 방법
1. Python 3.13 환경을 준비합니다.
2. 패키지 설치:
   ```bash
   pip install -r requirements.txt
   ```
3. 환경 변수 파일 `.env`에 OpenAI API 키를 설정합니다.
   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```
4. 각 예제 파일을 실행하여 실습할 수 있습니다.
   ```bash
   python 01-cli.py
   streamlit run 04-webapp.py
   # 등
   ```

## 참고
- 본 저장소는 교육 및 실습 목적입니다.
- 문의: 유클리드소프트 데이터탐험가 과정 담당자
