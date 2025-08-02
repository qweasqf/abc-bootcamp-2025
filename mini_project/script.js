document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM 요소 가져오기
    const selectionPanel = document.getElementById('selection-panel');
    const gamePanel = document.getElementById('game-panel');
    const initialMessage = document.getElementById('initial-message');
    const gameScreen = document.getElementById('game-screen');

    const selectAlpacaBtn = document.getElementById('select-alpaca');
    const selectOctopusBtn = document.getElementById('select-octopus');

    const animalImage = document.getElementById('animal-image');
    const infoBox = document.getElementById('info-box');
    const feedBtn = document.getElementById('feed-btn');
    const gaugeBar = document.getElementById('gauge-bar');
    const resetBtn = document.getElementById('reset-btn');
    // 시행횟수 박스
    const trialCountBox = document.getElementById('trial-count');
    // 저장버튼
    const saveBtn = document.getElementById('save-btn');
    // 기록 테이블
    const recordTableBody = document.getElementById('record-table-body');
    // 새로 키우기 버튼 추가
    const newGameBtn = document.getElementById('new-game-btn'); // 새로 추가된 버튼 요소
    // 확률 테이블 관련 요소 추가
    const probabilityTableBox = document.getElementById('probability-table-box');
    const probabilityTableBody = document.getElementById('probability-table-body');

    // 2. 게임 상태 변수
    let selectedAnimal = null;
    let currentLevel = 1;
    let isFeeding = false;
    let feedTimer = null;
    let gaugeAnimationComplete = false; // 게이지 애니메이션 완료 여부 추적

    // 시행횟수, 저장버튼, 기록테이블 관련 변수 및 초기화
    const MAX_TRIAL = 100;
    let currentTrial = 0;

    // 3. 게임 설정 데이터 (문어/알파카 분리)
    const alpacaLevelData = {
        1: { success: 100, failure: 0, runaway: 0 },
        2: { success: 60, failure: 40, runaway: 0 },
        3: { success: 50, failure: 50, runaway: 0 },
        4: { success: 40, failure: 60, runaway: 0 },
        5: { success: 30, failure: 70, runaway: 0 },
        6: { success: 20, failure: 77, runaway: 3 },
        7: { success: 10, failure: 84, runaway: 4 },
        8: { success: 5, failure: 90, runaway: 5 },
        9: { message: "최고 레벨 달성!" } // 알파카 최고 레벨
    };
    const octopusLevelData = {
        1: { success: 100, failure: 0, runaway: 0 },
        2: { success: 50, failure: 50, runaway: 0 },
        3: { success: 25, failure: 75, runaway: 0 },
        4: { success: 10, failure: 87, runaway: 3 },
        5: { success: 5, failure: 90, runaway: 5 },
        6: { message: "최고 레벨 달성!" }// 문어 최고 레벨
    };

    // 4. 핵심 기능 함수
    // 시행횟수 UI 업데이트
    function updateTrialUI() {
        trialCountBox.textContent = `시행횟수 ${currentTrial}/${MAX_TRIAL}`;
    }

    // 확률 표 업데이트 함수
    function updateProbabilityTable(animal) {
        probabilityTableBody.innerHTML = ''; // 기존 내용 지우기
        const dataTable = animal === '알파카' ? alpacaLevelData : octopusLevelData;
        const maxLevel = animal === '알파카' ? 8 : 5; // 메시지 레벨 전까지 표시

        for (let level = 1; level <= maxLevel; level++) {
            const data = dataTable[level];
            const row = document.createElement('tr');
            const success = data.success !== undefined ? `${data.success}%` : '0%';
            const failure = data.failure !== undefined ? `${data.failure}%` : '0%';
            const runaway = data.runaway !== undefined ? `${data.runaway}%` : '0%';

            row.innerHTML = `
                <td>${level}</td>
                <td>${success}</td>
                <td>${failure}</td>
                <td>${runaway}</td>
            `;
            probabilityTableBody.appendChild(row);
        }
        probabilityTableBox.classList.remove('hidden'); // 확률 표 보이게 하기
    }


    function updateGameUI() {
        let imageTier;
        const animalMaxMessageLevel = selectedAnimal === '알파카' ? 9 : 7; // 메시지 출력될 최고 레벨

        if (selectedAnimal === '알파카') {
            if (currentLevel >= 1 && currentLevel <= 2) {
                imageTier = 1;
            } else if (currentLevel >= 3 && currentLevel <= 5) {
                imageTier = 2;
            } else if (currentLevel >= 6 && currentLevel <= 8) {
                imageTier = 3;
            } else if (currentLevel >= 9) { // 알파카 최고 레벨
                imageTier = 4;
            }
        } else if (selectedAnimal === '문어') {
            if (currentLevel >= 1 && currentLevel <= 2) {
                imageTier = 1;
            } else if (currentLevel >= 3 && currentLevel <= 4) {
                imageTier = 2;
            } else if (currentLevel === 5) {
                imageTier = 3;
            } else if (currentLevel >= 6) { // 문어 최고 레벨
                imageTier = 4;
            }
        }

        const animalFileName = selectedAnimal === '알파카' ? 'a' : 'o';
        animalImage.src = `images/${animalFileName}${imageTier}.png`;

        // 시행횟수 UI
        updateTrialUI();

        // 레벨별 데이터
        const dataTable = selectedAnimal === '알파카' ? alpacaLevelData : octopusLevelData;
        
        if (currentLevel >= animalMaxMessageLevel) {
            infoBox.textContent = dataTable[animalMaxMessageLevel].message;
            feedBtn.classList.add('hidden');
            resetBtn.classList.remove('hidden');
            // newGameBtn.classList.remove('hidden'); // 새로 키우기 버튼은 항상 보이므로 여기서는 제거하지 않음
        } else {
            const data = dataTable[currentLevel];
            let levelDownText = '하락';
            // 알파카와 문어 모두 2레벨에서는 실패해도 레벨 유지
            if (currentLevel === 2) levelDownText = '유지';
            let infoText = `레벨: ${currentLevel}\n`;
            infoText += `성공: ${data.success}%\n`;
            if (currentLevel > 1) infoText += `실패(${levelDownText}): ${data.failure}%\n`;
            if (data.runaway > 0) infoText += `도망: ${data.runaway}%`;
            infoBox.textContent = infoText.trim();
            feedBtn.classList.remove('hidden'); // 다시 먹이주기 버튼 보이게
            resetBtn.classList.add('hidden'); // 리셋 버튼 숨기기
            // newGameBtn.classList.add('hidden'); // 새로 키우기 버튼은 항상 보이므로 여기서는 숨기지 않음
        }
    }

    function startGame(animal) {
        selectedAnimal = animal;
        currentLevel = 1;
        isFeeding = false;
        currentTrial = 0; // 게임 시작 시 시행횟수 초기화
        updateTrialUI();

        // UI 업데이트
        document.querySelectorAll('.animal-choice-btn').forEach(btn => btn.classList.remove('selected'));
        const selectedBtn = animal === '알파카' ? selectAlpacaBtn : selectOctopusBtn;
        selectedBtn.classList.add('selected');

        initialMessage.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        feedBtn.classList.remove('hidden');
        resetBtn.classList.add('hidden');
        // newGameBtn.classList.remove('hidden'); // '새로 키우기' 버튼은 항상 보이도록 유지
        feedBtn.textContent = '먹이주기';

        // 게이지 바 초기화
        gaugeBar.style.transition = 'none';
        gaugeBar.style.width = '0%';
        gaugeAnimationComplete = false;

        updateGameUI();
        updateProbabilityTable(animal); // 게임 시작 시 확률 표 업데이트
    }

    function handleFeedResult() {
        // 이 함수는 gaugeAnimationComplete가 true일 때만 호출되어야 함
        if (!gaugeAnimationComplete) { 
            console.warn("handleFeedResult가 게이지 애니메이션 완료 전에 호출되었습니다.");
            return;
        }
        
        if (currentTrial >= MAX_TRIAL) {
            infoBox.textContent = "최대 시행 횟수에 도달했습니다!";
            feedBtn.classList.add('hidden');
            resetBtn.classList.remove('hidden');
            // newGameBtn.classList.remove('hidden'); // 새로 키우기 버튼 보이게
            isFeeding = false;
            return;
        }

        currentTrial++; // 시행 횟수 증가
        updateTrialUI();

        const dataTable = selectedAnimal === '알파카' ? alpacaLevelData : octopusLevelData;
        const data = dataTable[currentLevel];
        const random = Math.random() * 100;
        let result = '';

        const animalMaxPlayableLevel = selectedAnimal === '알파카' ? 8 : 6; // 플레이 가능한 최고 레벨 (메시지 레벨 -1)

        if (random < data.success) {
            result = Math.random() < 0.05 ? '대성공' : '성공';
            // 최고 레벨까지 상승 가능하도록 수정
            currentLevel = Math.min(animalMaxPlayableLevel + (selectedAnimal === '알파카' ? 1 : 1), currentLevel + (result === '대성공' ? 2 : 1)); 
            animalImage.classList.add('result-anim'); // 성공/대성공 시 애니메이션 추가
        } else if (random < data.success + data.failure) {
            result = '실패';
            // 알파카와 문어 모두 2레벨에서는 실패해도 레벨 유지
            if (currentLevel > 2) currentLevel--;
            animalImage.classList.add('result-anim'); // 실패 시에도 애니메이션 추가
        } else {
            result = '도망';
        }

        if (result === '도망') {
            const runawayAnimal = selectedAnimal === '알파카' ? 'ar' : 'or';
            animalImage.src = `images/${runawayAnimal}.png`;
            infoBox.textContent = '동물이 도망가버렸습니다...';
            feedBtn.classList.add('hidden');
            resetBtn.classList.remove('hidden');
            // newGameBtn.classList.remove('hidden'); // 새로 키우기 버튼 보이게
            isFeeding = false;
        } else {
            infoBox.textContent = `${result}!`; // 결과 메시지 먼저 출력
            setTimeout(() => {
                animalImage.classList.remove('result-anim'); // 애니메이션 제거
                updateGameUI(); // 1초 후 레벨 정보 업데이트
                isFeeding = false;
            }, 1000); // 1초 지연
        }
        // 게이지가 100%에 도달하여 결과가 처리된 후에는 0%로 초기화
        gaugeBar.style.transition = 'none';
        gaugeBar.style.width = '0%';
        // handleFeedResult가 완료되었으므로, 다음 먹이주기를 위해 gaugeAnimationComplete를 false로 초기화할 준비.
        // 하지만 실제 초기화는 startFeeding에서 이루어지는 것이 더 안전.
        // gaugeAnimationComplete = false; // 여기서 바로 초기화하면 다음 키업/마우스업 이벤트에서 문제가 될 수 있음.
    }

    function resetGame() {
        selectedAnimal = null;
        gameScreen.classList.add('hidden');
        initialMessage.classList.remove('hidden');
        document.querySelectorAll('.animal-choice-btn').forEach(btn => btn.classList.remove('selected'));
        // 게임 리셋 시 trialCount도 초기화되도록 (선택적으로)
        currentTrial = 0;
        currentLevel = 1; // 레벨도 초기화
        updateTrialUI();
        animalImage.classList.remove('result-anim'); // 리셋 시 애니메이션 클래스 제거
        // newGameBtn.classList.remove('hidden'); // 새로 키우기 버튼은 항상 보이므로 숨기지 않음
        
        // 게이지 바 초기화
        gaugeBar.style.transition = 'none';
        gaugeBar.style.width = '0%';
        gaugeAnimationComplete = false;
        isFeeding = false; // 상태 초기화
        
        probabilityTableBox.classList.add('hidden'); // 리셋 시 확률 표 숨기기
        updateGameUI(); // UI 초기화 (이것이 가장 마지막에 와야 함)
    }

    function startFeeding() {
        // 플레이 가능한 최고 레벨 (메시지 레벨 -1)
        const animalMaxPlayableLevel = selectedAnimal === '알파카' ? 8 : 6;
        if (isFeeding || currentLevel > animalMaxPlayableLevel || currentTrial >= MAX_TRIAL) return;

        isFeeding = true; // 먹이 주기 시작
        gaugeAnimationComplete = false; // 게이지 애니메이션 완료 여부 초기화
        gaugeBar.style.transition = 'width 0.8s linear';
        gaugeBar.style.width = '100%';

        feedTimer = setTimeout(() => {
            gaugeAnimationComplete = true; // 게이지 애니메이션 완료 표시
            handleFeedResult();
        }, 800); // 0.8초 동안 누르고 있어야 성공
    }

    function cancelFeeding() {
        clearTimeout(feedTimer);
        // 게이지 애니메이션이 완료되지 않았고, 먹이 주기 중일 때만 게이지 바를 0%로 초기화
        if (!gaugeAnimationComplete && isFeeding) { 
            gaugeBar.style.transition = 'width 0.2s linear';
            gaugeBar.style.width = '0%';
        }
        isFeeding = false; // 먹이 주기 취소 시 상태 리셋
        // gaugeAnimationComplete는 성공 여부에 따라 handleFeedResult에서 true로 설정되므로, 여기서는 변경하지 않음.
        // 다음 먹이 주기 시 startFeeding에서 false로 초기화됨.
    }

    // 5. 이벤트 리스너 설정
    selectAlpacaBtn.addEventListener('click', () => startGame('알파카'));
    selectOctopusBtn.addEventListener('click', () => startGame('문어'));
    resetBtn.addEventListener('click', resetGame);
    newGameBtn.addEventListener('click', resetGame); // 새로 키우기 버튼에도 resetGame 연결

    feedBtn.addEventListener('mousedown', startFeeding);
    feedBtn.addEventListener('mouseup', () => {
        // 게이지 애니메이션이 완료되지 않았고, 먹이 주기 중일 때만 cancelFeeding 호출
        if (isFeeding && !gaugeAnimationComplete) {
            cancelFeeding();
        }
    });
    feedBtn.addEventListener('mouseleave', () => {
        // 게이지 애니메이션이 완료되지 않았고, 먹이 주기 중일 때만 cancelFeeding 호출
        if (isFeeding && !gaugeAnimationComplete) {
            cancelFeeding();
        }
    });
    feedBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startFeeding(); });
    feedBtn.addEventListener('touchend', () => {
        // 게이지 애니메이션이 완료되지 않았고, 먹이 주기 중일 때만 cancelFeeding 호출
        if (isFeeding && !gaugeAnimationComplete) {
            cancelFeeding();
        }
    });

    // 저장하기 버튼 이벤트
    saveBtn.addEventListener('click', () => {
        if (!selectedAnimal) {
            alert("동물을 먼저 선택해주세요!"); // 동물 선택 안 했을 때 메시지 추가
            return;
        }
        // 기록 테이블에 현재 상태 추가
        addRecord(selectedAnimal, currentLevel, currentTrial);
        // 레벨을 1로 초기화하고 UI 업데이트
        currentLevel = 1;
        currentTrial = 0; // 저장 후 시행횟수도 초기화 (선택 사항)
        
        infoBox.textContent = "동물이 저장되었습니다! 새로운 모험을 시작하세요.";
        feedBtn.classList.add('hidden'); // 먹이주기 버튼 숨김
        resetBtn.classList.add('hidden'); // 다른 동물 키우기 버튼 숨김 (새로 키우기가 있으므로)
        // newGameBtn.classList.remove('hidden'); // 새로 키우기 버튼은 항상 보이므로 여기서는 제거하지 않음
        animalImage.classList.remove('result-anim'); // 애니메이션 클래스 제거
        gaugeBar.style.transition = 'none'; // 게이지 바 초기화
        gaugeBar.style.width = '0%';
        gaugeAnimationComplete = false;
        isFeeding = false; // 먹이 주기 상태 초기화

        updateTrialUI(); // UI 업데이트를 saveBtn 클릭 마지막에 수행
        updateGameUI();
        // probabilityTableBox.classList.add('hidden'); // <-- 이 줄을 제거했습니다.
    });

    // 스페이스바로 먹이주기
    let spacePressed = false;
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !spacePressed && !feedBtn.classList.contains('hidden')) {
            e.preventDefault(); // 스페이스바 기본 동작(스크롤) 방지
            spacePressed = true;
            startFeeding();
        }
    });
    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space' && spacePressed) {
            e.preventDefault(); // 스페이스바 기본 동작(스크롤) 방지
            spacePressed = false;
            // 스페이스바를 떼었을 때, 게이지가 완료되지 않았고, 현재 먹이 주기 중일 때만 cancelFeeding 호출
            if (isFeeding && !gaugeAnimationComplete) { 
                cancelFeeding();
            }
        }
    });

    // 기록 테이블에 기록 추가 함수
    function addRecord(animal, level, trial) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${animal}</td><td>${level}</td><td>${trial}</td>`;
        recordTableBody.appendChild(row);
    }

    console.log("게임 스크립트가 2단 레이아웃으로 업데이트되었습니다.");

    // 초기 로드 시 '새로 키우기' 버튼이 항상 보이도록 처리 (hidden 클래스 제거)
    newGameBtn.classList.remove('hidden');
});
