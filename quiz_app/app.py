try:
    from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
    from flask_socketio import SocketIO, emit, join_room, leave_room
except ImportError:
    print("Flask 패키지가 설치되지 않았습니다. 다음 명령어로 설치해주세요:")
    print("pip install Flask Flask-SocketIO")
    exit(1)

import sqlite3
import json
import hashlib
import random
import os
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'quiz_app_secret_key_2025'
socketio = SocketIO(app, cors_allowed_origins="*")

# 현재 접속 중인 사용자 세션 추적
connected_users = set()

# JSON 파싱을 위한 필터 추가
@app.template_filter('from_json')
def from_json_filter(value):
    try:
        return json.loads(value) if value else []
    except (json.JSONDecodeError, TypeError):
        return []

# 데이터베이스 초기화
def init_db():
    conn = sqlite3.connect('quiz_app.db')
    cursor = conn.cursor()
    
    # 사용자 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 게임 기록 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS game_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            game_type TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            total_questions INTEGER DEFAULT 0,
            correct_answers INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # 문제 저장 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS saved_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            question_id TEXT NOT NULL,
            question_text TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            user_answer TEXT,
            is_correct BOOLEAN DEFAULT FALSE,
            category TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            explanation TEXT,
            options TEXT,
            saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # 기존 테이블에 explanation과 options 컬럼 추가 (이미 있으면 무시)
    try:
        cursor.execute('ALTER TABLE saved_questions ADD COLUMN explanation TEXT')
    except sqlite3.OperationalError:
        pass  # 컬럼이 이미 존재함
        
    try:
        cursor.execute('ALTER TABLE saved_questions ADD COLUMN options TEXT')
    except sqlite3.OperationalError:
        pass  # 컬럼이 이미 존재함
    
    conn.commit()
    conn.close()

# 퀴즈 데이터 로드 - 새로운 구조
def load_quiz_data():
    try:
        # Get the absolute path to the data file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, 'data', 'quiz_data.json')
        
        with open(data_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Quiz data file not found at: {data_path}")
        return {"categories": {}}
    except json.JSONDecodeError as e:
        print(f"Error parsing quiz data JSON: {e}")
        return {"categories": {}}

# 비밀번호 해시화
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# 대기열 관리
waiting_players = []
active_battles = {}

@app.route('/')
def index():
    if 'user_id' in session:
        return render_template('dashboard.html')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        password_hash = hash_password(password)
        
        conn = sqlite3.connect('quiz_app.db')
        cursor = conn.cursor()
        
        try:
            cursor.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)',
                         (username, password_hash))
            conn.commit()
            flash('회원가입이 완료되었습니다!')
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash('이미 존재하는 사용자명입니다.')
        finally:
            conn.close()
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        password_hash = hash_password(password)
        
        conn = sqlite3.connect('quiz_app.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, username FROM users WHERE username = ? AND password_hash = ?',
                      (username, password_hash))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            session['user_id'] = user[0]
            session['username'] = user[1]
            # 접속 사용자 추가
            connected_users.add(session['user_id'])
            return redirect(url_for('dashboard'))
        else:
            flash('잘못된 사용자명 또는 비밀번호입니다.')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    # 접속 사용자에서 제거
    if 'user_id' in session:
        connected_users.discard(session['user_id'])
    session.clear()
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    # 접속 사용자 추가 (세션이 있지만 추가되지 않은 경우)
    connected_users.add(session['user_id'])
    return render_template('dashboard.html')

@app.route('/solo_quiz')
def solo_quiz():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    connected_users.add(session['user_id'])
    return render_template('solo_quiz.html')

@app.route('/battle_quiz')
def battle_quiz():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    connected_users.add(session['user_id'])
    return render_template('battle_quiz.html')

@app.route('/history')
def history():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    conn = sqlite3.connect('quiz_app.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT question_text, correct_answer, user_answer, is_correct, 
               category, difficulty, saved_at, explanation, options 
        FROM saved_questions 
        WHERE user_id = ? 
        ORDER BY saved_at DESC
    ''', (session['user_id'],))
    saved_questions = cursor.fetchall()
    conn.close()
    
    return render_template('history.html', questions=saved_questions)

@app.route('/api/quiz')
def get_quiz_questions():
    categories_param = request.args.get('categories', '')
    question_count = int(request.args.get('count', 5))
    
    quiz_data = load_quiz_data()
    
    # 카테고리를 콤마로 분리
    selected_categories = [cat.strip() for cat in categories_param.split(',') if cat.strip()]
    all_questions = []
    
    # 선택된 카테고리들에서 문제 수집
    for category in selected_categories:
        if category in quiz_data.get('categories', {}):
            questions = quiz_data['categories'][category]
            # 각 문제에 카테고리 정보 추가
            for question in questions:
                question_copy = question.copy()
                question_copy['category'] = category
                all_questions.append(question_copy)
    
    if all_questions:
        # 요청된 문제 수만큼 랜덤 선택 (제한 없음)
        max_questions = min(question_count, len(all_questions))
        return jsonify(random.sample(all_questions, max_questions))
    
    return jsonify([])

# 이전 API (호환성을 위해 유지)
@app.route('/api/quiz/<categories>/<int:question_count>')
def get_quiz_questions_legacy(categories, question_count):
    quiz_data = load_quiz_data()
    
    # 카테고리를 콤마로 분리
    selected_categories = [cat.strip() for cat in categories.split(',')]
    all_questions = []
    
    # 선택된 카테고리들에서 문제 수집
    for category in selected_categories:
        if category in quiz_data.get('categories', {}):
            questions = quiz_data['categories'][category]
            all_questions.extend(questions)
    
    if all_questions:
        # 요청된 문제 수만큼 랜덤 선택 (제한 없음)
        max_questions = min(question_count, len(all_questions))
        return jsonify(random.sample(all_questions, max_questions))
    
    return jsonify([])

@app.route('/api/save_question', methods=['POST'])
def save_question():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'})
    
    data = request.json
    conn = sqlite3.connect('quiz_app.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO saved_questions 
        (user_id, question_id, question_text, correct_answer, user_answer, 
         is_correct, category, difficulty, explanation, options)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (session['user_id'], data['question_id'], data['question_text'],
          data['correct_answer'], data.get('user_answer', ''),
          data.get('is_correct', False), data.get('category', '혼합'), 
          data.get('difficulty', ''), data.get('explanation', ''),
          json.dumps(data.get('options', []), ensure_ascii=False)))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/online_users')
def get_online_users():
    # 현재 활성 세션의 사용자 수를 반환
    return jsonify({'count': len(connected_users)})

# Socket.IO 이벤트 (배틀 모드)
@socketio.on('join_battle_queue')
def handle_join_queue(data):
    user_id = session.get('user_id')
    username = session.get('username')
    
    if not user_id:
        emit('error', {'message': '로그인이 필요합니다.'})
        return
    
    player_info = {
        'user_id': user_id,
        'username': username,
        'socket_id': request.sid
    }
    
    waiting_players.append(player_info)
    
    if len(waiting_players) >= 2:
        # 배틀 매칭
        player1 = waiting_players.pop(0)
        player2 = waiting_players.pop(0)
        
        battle_id = f"battle_{random.randint(1000, 9999)}"
        active_battles[battle_id] = {
            'player1': player1,
            'player2': player2,
            'questions': [],
            'scores': {player1['user_id']: 0, player2['user_id']: 0}
        }
        
        # 두 플레이어에게 배틀 시작 알림
        socketio.emit('battle_matched', {
            'battle_id': battle_id,
            'opponent': player2['username']
        }, room=player1['socket_id'])
        
        socketio.emit('battle_matched', {
            'battle_id': battle_id,
            'opponent': player1['username']
        }, room=player2['socket_id'])
    else:
        emit('waiting_for_opponent')

if __name__ == '__main__':
    init_db()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
