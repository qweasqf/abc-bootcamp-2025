const socket = io();
let battleId = null;
let currentBattleQuestion = 0;
let myScore = 0;
let opponentScore = 0;
let battleQuestions = [];
let battleTimer;
let timeLeft = 20;

// 테마 관리
function applyTheme(theme) {
    const body = document.body;
    const navbar = document.querySelector('.navbar');
    const cards = document.querySelectorAll('.card');
    
    let actualTheme = theme;
    if (theme === 'auto') {
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    if (actualTheme === 'dark') {
        body.classList.add('bg-dark');
        body.classList.remove('bg-light');
        body.style.color = '#ffffff';
        
        if (navbar) {
            navbar.classList.add('navbar-dark', 'bg-dark');
            navbar.classList.remove('navbar-light', 'bg-light');
        }
        
        cards.forEach(card => {
            card.classList.add('bg-dark', 'text-white');
            card.classList.remove('bg-light');
            card.style.border = '1px solid #495057';
        });
    } else {
        body.classList.add('bg-light');
        body.classList.remove('bg-dark');
        body.style.color = '#212529';
        
        if (navbar) {
            navbar.classList.add('navbar-light', 'bg-light');
            navbar.classList.remove('navbar-dark', 'bg-dark');
        }
        
        cards.forEach(card => {
            card.classList.add('bg-light');
            card.classList.remove('bg-dark', 'text-white');
            card.style.border = '1px solid #dee2e6';
            card.style.color = '#212529';
        });
    }
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
}

// 페이지 로드 시 대기열 참가
window.addEventListener('load', function() {
    // 저장된 테마 적용
    const savedTheme = localStorage.getItem('theme') || 'auto';
    applyTheme(savedTheme);
    
    // 시스템 테마 변경 감지
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const currentTheme = localStorage.getItem('theme') || 'auto';
        if (currentTheme === 'auto') {
            applyTheme('auto');
        }
    });
    
    socket.emit('join_battle_queue');
});

// Socket.IO 이벤트 리스너
socket.on('waiting_for_opponent', function() {
    console.log('상대방 대기 중...');
});

socket.on('battle_matched', function(data) {
    battleId = data.battle_id;
    document.getElementById('player2-name').textContent = data.opponent;
    
    // 화면 전환
    document.getElementById('waiting-screen').style.display = 'none';
    document.getElementById('battle-screen').style.display = 'block';
    
    // 배틀 시작
    startBattle();
});

socket.on('battle_question', function(data) {
    showBattleQuestion(data.question);
});

socket.on('opponent_answered', function(data) {
    updateOpponentScore(data.score);
});

socket.on('battle_ended', function(data) {
    showBattleResult(data);
});

socket.on('error', function(data) {
    alert(data.message);
});

function startBattle() {
    // 배틀용 문제 생성 (다양한 분야에서 무작위 선택)
    generateBattleQuestions();
}

function generateBattleQuestions() {
    const categories = ['수학', '상식', '역사', '과학'];
    const difficulties = ['하', '중', '상'];
    const questionPromises = [];
    
    // 5문제 생성 (무작위 분야, 무작위 난이도)
    for (let i = 0; i < 5; i++) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        
        questionPromises.push(
            fetch(`/api/quiz/${randomCategory}/${randomDifficulty}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        const question = data[Math.floor(Math.random() * data.length)];
                        question.category = randomCategory;
                        question.difficulty = randomDifficulty;
                        return question;
                    }
                    return null;
                })
        );
    }
    
    Promise.all(questionPromises)
        .then(questions => {
            battleQuestions = questions.filter(q => q !== null);
            if (battleQuestions.length > 0) {
                showBattleQuestion(battleQuestions[0]);
            }
        })
        .catch(error => {
            console.error('Error generating battle questions:', error);
        });
}

function showBattleQuestion(question) {
    if (!question) return;
    
    // 문제 정보 업데이트
    document.getElementById('battle-current-question').textContent = currentBattleQuestion + 1;
    document.getElementById('battle-category').textContent = question.category + ' (' + question.difficulty + '급)';
    document.getElementById('battle-question-text').textContent = question.question;
    
    // 선택지 생성
    const optionsContainer = document.getElementById('battle-options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'mb-2';
        optionDiv.innerHTML = `
            <button class="btn btn-outline-primary w-100 battle-option-btn" onclick="selectBattleAnswer('${option}', this, '${question.difficulty}')">
                ${String.fromCharCode(65 + index)}. ${option}
            </button>
        `;
        optionsContainer.appendChild(optionDiv);
    });
    
    // 타이머 시작
    startBattleTimer();
    
    // 대기 메시지 숨기기
    document.getElementById('waiting-next').style.display = 'none';
}

function selectBattleAnswer(selectedAnswer, buttonElement, difficulty) {
    const question = battleQuestions[currentBattleQuestion];
    const isCorrect = selectedAnswer === question.correct_answer;
    
    // 타이머 정지
    clearInterval(battleTimer);
    
    // 모든 버튼 비활성화
    const allButtons = document.querySelectorAll('.battle-option-btn');
    allButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent.includes(question.correct_answer)) {
            btn.className = 'btn btn-success w-100 battle-option-btn';
        } else if (btn === buttonElement && !isCorrect) {
            btn.className = 'btn btn-danger w-100 battle-option-btn';
        }
    });
    
    // 점수 계산
    if (isCorrect) {
        const points = getPoints(difficulty);
        myScore += points;
        document.getElementById('player1-score').textContent = myScore + '점';
    }
    
    // 상대방에게 점수 전송
    socket.emit('answer_submitted', {
        battle_id: battleId,
        score: myScore,
        is_correct: isCorrect
    });
    
    // 다음 문제 준비
    setTimeout(() => {
        nextBattleQuestion();
    }, 2000);
}

function startBattleTimer() {
    timeLeft = 20;
    document.getElementById('battle-timer').textContent = timeLeft;
    
    battleTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('battle-timer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            // 시간 초과
            clearInterval(battleTimer);
            const allButtons = document.querySelectorAll('.battle-option-btn');
            allButtons.forEach(btn => {
                btn.disabled = true;
                if (btn.textContent.includes(battleQuestions[currentBattleQuestion].correct_answer)) {
                    btn.className = 'btn btn-success w-100 battle-option-btn';
                }
            });
            
            // 상대방에게 시간 초과 전송
            socket.emit('answer_submitted', {
                battle_id: battleId,
                score: myScore,
                is_correct: false
            });
            
            setTimeout(() => {
                nextBattleQuestion();
            }, 2000);
        }
    }, 1000);
}

function nextBattleQuestion() {
    currentBattleQuestion++;
    
    if (currentBattleQuestion >= battleQuestions.length) {
        // 배틀 완료
        endBattle();
    } else {
        // 다음 문제 표시
        showBattleQuestion(battleQuestions[currentBattleQuestion]);
    }
}

function updateOpponentScore(score) {
    opponentScore = score;
    document.getElementById('player2-score').textContent = opponentScore + '점';
}

function endBattle() {
    // 결과 화면 표시
    document.getElementById('battle-screen').style.display = 'none';
    document.getElementById('battle-result-screen').style.display = 'block';
    
    // 결과 계산
    document.getElementById('my-final-score').textContent = myScore;
    document.getElementById('opponent-final-score').textContent = opponentScore;
    
    if (myScore > opponentScore) {
        document.getElementById('result-icon').textContent = '🏆';
        document.getElementById('battle-result-text').textContent = '승리!';
        document.getElementById('battle-result-text').className = 'text-success';
    } else if (myScore < opponentScore) {
        document.getElementById('result-icon').textContent = '😢';
        document.getElementById('battle-result-text').textContent = '패배...';
        document.getElementById('battle-result-text').className = 'text-danger';
    } else {
        document.getElementById('result-icon').textContent = '🤝';
        document.getElementById('battle-result-text').textContent = '무승부!';
        document.getElementById('battle-result-text').className = 'text-warning';
    }
}

function cancelWaiting() {
    socket.disconnect();
    window.location.href = '/dashboard';
}

function findNewBattle() {
    // 변수 초기화
    battleId = null;
    currentBattleQuestion = 0;
    myScore = 0;
    opponentScore = 0;
    battleQuestions = [];
    clearInterval(battleTimer);
    
    // 화면 초기화
    document.getElementById('battle-result-screen').style.display = 'none';
    document.getElementById('waiting-screen').style.display = 'block';
    document.getElementById('player1-score').textContent = '0점';
    document.getElementById('player2-score').textContent = '0점';
    
    // 새로운 배틀 찾기
    socket.emit('join_battle_queue');
}

function getPoints(difficulty) {
    const pointsMap = {
        '하': 1,
        '중': 3,
        '상': 5
    };
    return pointsMap[difficulty] || 1;
}
