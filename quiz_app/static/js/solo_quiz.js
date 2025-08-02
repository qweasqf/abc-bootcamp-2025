let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let correctAnswers = 0;
let timer;
let timeLeft = 30;
let selectedCategories = [];
let questionCount = 5;

// 테마 관리
function applyTheme(theme) {
    const body = document.body;
    const navbar = document.querySelector('.navbar');
    const cards = document.querySelectorAll('.card');
    
    let actualTheme = theme;
    if (theme === 'auto') {
        // 시스템 다크 모드 설정 확인
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
        body.style.color = '#212529'; // Bootstrap의 기본 텍스트 색상 (검은색)
        
        if (navbar) {
            navbar.classList.add('navbar-light', 'bg-light');
            navbar.classList.remove('navbar-dark', 'bg-dark');
        }
        
        cards.forEach(card => {
            card.classList.add('bg-light');
            card.classList.remove('bg-dark', 'text-white');
            card.style.border = '1px solid #dee2e6';
            card.style.color = '#212529'; // 카드 텍스트도 검은색으로
        });
    }
}

// 페이지 로드 시 저장된 테마 적용
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    document.querySelector(`input[name="theme"][value="${savedTheme}"]`).checked = true;
    applyTheme(savedTheme);
    
    // 시스템 테마 변경 감지 (auto 모드일 때)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const currentTheme = document.querySelector('input[name="theme"]:checked').value;
        if (currentTheme === 'auto') {
            applyTheme('auto');
        }
    });
});

// 테마 변경 이벤트
function changeTheme() {
    const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
    localStorage.setItem('theme', selectedTheme);
    applyTheme(selectedTheme);
}

// 네비게이션 바의 테마 설정 함수
function setTheme(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
}

function startQuiz() {
    // 선택된 카테고리들 가져오기
    const categoryCheckboxes = document.querySelectorAll('input[name="categories"]:checked');
    selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value);
    
    if (selectedCategories.length === 0) {
        alert('최소 하나의 분야를 선택해주세요.');
        return;
    }
    
    // 문제 수 가져오기
    questionCount = parseInt(document.getElementById('question-count').value);
    
    // 퀴즈 데이터 가져오기
    const categoryParam = selectedCategories.join(',');
    fetch(`/api/quiz?categories=${encodeURIComponent(categoryParam)}&count=${questionCount}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert('선택한 분야의 문제가 없습니다.');
                return;
            }
            
            currentQuestions = data;
            currentQuestionIndex = 0;
            score = 0;
            correctAnswers = 0;
            
            // 화면 전환
            document.getElementById('setup-screen').style.display = 'none';
            document.getElementById('quiz-screen').style.display = 'block';
            
            // 총 문제 수 설정
            document.getElementById('total-questions').textContent = currentQuestions.length;
            document.getElementById('total-questions-2').textContent = currentQuestions.length;
            
            // 첫 번째 문제 표시
            showQuestion();
        })
        .catch(error => {
            console.error('Error fetching quiz data:', error);
            alert('퀴즈 데이터를 불러오는데 실패했습니다.');
        });
}

function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // 문제 정보 업데이트
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('question-category').textContent = question.category || '복합';
    document.getElementById('question-text').textContent = question.question;
    
    // 선택지를 랜덤하게 섞기
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    
    // 선택지 생성
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    shuffledOptions.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'mb-2';
        optionDiv.innerHTML = `
            <button class="btn btn-outline-primary w-100 option-btn" onclick="selectAnswer('${option}', this)">
                ${String.fromCharCode(65 + index)}. ${option}
            </button>
        `;
        optionsContainer.appendChild(optionDiv);
    });
    
    // 타이머 시작
    startTimer();
    
    // 다음 버튼 숨기기
    document.getElementById('next-btn').style.display = 'none';
}

function selectAnswer(selectedAnswer, buttonElement) {
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.correct_answer;
    
    // 타이머 정지
    clearInterval(timer);
    
    // 모든 버튼 비활성화
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent.includes(question.correct_answer)) {
            btn.className = 'btn btn-success w-100 option-btn';
        } else if (btn === buttonElement && !isCorrect) {
            btn.className = 'btn btn-danger w-100 option-btn';
        }
    });
    
    // 점수 업데이트 - 100점 / 총 문제 수
    if (isCorrect) {
        correctAnswers++;
        const pointsPerQuestion = Math.round(100 / currentQuestions.length);
        score += pointsPerQuestion;
    }
    
    // 문제 저장
    saveQuestion(question, selectedAnswer, isCorrect);
    
    // 점수 및 정답 수 업데이트
    updateStats();
    
    // 다음 버튼 표시
    document.getElementById('next-btn').style.display = 'block';
}

function startTimer() {
    timeLeft = 30;
    document.getElementById('timer').textContent = timeLeft;
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            // 시간 초과 - 자동으로 틀린 것으로 처리
            clearInterval(timer);
            const allButtons = document.querySelectorAll('.option-btn');
            allButtons.forEach(btn => {
                btn.disabled = true;
                if (btn.textContent.includes(currentQuestions[currentQuestionIndex].correct_answer)) {
                    btn.className = 'btn btn-success w-100 option-btn';
                }
            });
            
            // 문제 저장 (시간 초과)
            saveQuestion(currentQuestions[currentQuestionIndex], '', false);
            updateStats();
            document.getElementById('next-btn').style.display = 'block';
        }
    }, 1000);
}

function updateStats() {
    document.getElementById('current-score').textContent = score;
    document.getElementById('correct-count').textContent = correctAnswers;
}

function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= currentQuestions.length) {
        // 퀴즈 완료
        showResults();
    } else {
        // 다음 문제 표시
        showQuestion();
    }
}

function showResults() {
    // 화면 전환
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    
    // 결과 표시
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-correct').textContent = correctAnswers;
    const finalAccuracy = Math.round((correctAnswers / currentQuestions.length) * 100);
    document.getElementById('final-accuracy').textContent = finalAccuracy;
}

function restartQuiz() {
    // 화면 초기화
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('setup-screen').style.display = 'block';
    
    // 변수 초기화
    currentQuestions = [];
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    clearInterval(timer);
}

function saveQuestion(question, userAnswer, isCorrect) {
    const data = {
        question_id: question.id,
        question_text: question.question,
        correct_answer: question.correct_answer,
        user_answer: userAnswer,
        is_correct: isCorrect,
        category: question.category || selectedCategories.join(','),
        explanation: question.explanation || '',
        options: question.options || []
    };
    
    fetch('/api/save_question', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .catch(error => {
        console.error('Error saving question:', error);
    });
}

// 카테고리 선택 헬퍼 함수들
function selectAllCategories() {
    const checkboxes = document.querySelectorAll('input[name="categories"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}

function clearAllCategories() {
    const checkboxes = document.querySelectorAll('input[name="categories"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}
