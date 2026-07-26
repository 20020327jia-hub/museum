document.addEventListener('DOMContentLoaded', () => {
    // --- 题库数据 (已移除中文) ---
    const questions = [
        {
            qEn: "As you step into a cold, dimly lit 19th-century cell, what draws your attention first?",
            aEn: "The physical details...",
            bEn: "The atmosphere..."
        },
        {
            qEn: "You discover a pair of heavy iron shackles...",
            aEn: "\"How exactly did this mechanism work...\"",
            bEn: "\"Who was the person forced to wear this...\""
        },
        {
            qEn: "How do you prefer to uncover the hidden truths of this dark heritage?",
            aEn: "By analyzing evidence...",
            bEn: "By listening to personal stories..."
        }
    ];

    let currentQuestionIndex = 0;
    let detectiveScore = 0;
    let ghostScore = 0;

    const screens = {
        home: document.getElementById('home-screen'),
        quiz: document.getElementById('quiz-screen'),
        result: document.getElementById('result-screen')
    };
    
    const startBtn = document.getElementById('startBtn');
    const qNum = document.getElementById('current-q-num');
    const qBox = document.getElementById('question-box');
    const optAEn = document.getElementById('optA-en');
    const optBEn = document.getElementById('optB-en');
    const btnA = document.getElementById('optionA');
    const btnB = document.getElementById('optionB');

    // 屏幕无缝切换
    const switchScreen = (hideScreen, showScreen) => {
        hideScreen.classList.remove('active');
        setTimeout(() => {
            showScreen.classList.add('active');
        }, 1200); 
    };

    // 渲染题目
    const loadQuestion = () => {
        const q = questions[currentQuestionIndex];
        qNum.innerText = currentQuestionIndex + 1;
        
        qBox.style.opacity = 0;
        btnA.style.opacity = 0;
        btnB.style.opacity = 0;

        setTimeout(() => {
            qBox.innerHTML = `<p>${q.qEn}</p>`;
            optAEn.innerText = q.aEn;
            optBEn.innerText = q.bEn;

            qBox.style.opacity = 1;
            btnA.style.opacity = 1;
            btnB.style.opacity = 1;
        }, 600); 
    };

    // 答题逻辑
    const handleAnswer = (isDetective) => {
        if (isDetective) {
            detectiveScore++;
        } else {
            ghostScore++;
        }

        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            loadQuestion(); 
        } else {
            showResult();   
        }
    };

    // 显示结果
    const showResult = () => {
        const isDetective = detectiveScore > ghostScore;
        
        const title = document.getElementById('result-title');
        const descEn = document.getElementById('result-desc-en');
        const taskEn = document.getElementById('result-task-en');

        if (isDetective) {
            title.innerText = "You are The Detective! 🕵️‍♂️";
            descEn.innerText = "Your journey is driven by logic and analysis. You observe details others miss.";
        } else {
            title.innerText = "You are The Ghost! 👻";
            descEn.innerText = "Your journey is driven by empathy. You feel the echoes of the stories left behind.";
        }

        taskEn.innerText = " Your First Task: Head to the Punishment Display on the Ground Floor...";

        switchScreen(screens.quiz, screens.result);
    };

    // --- 事件监听 ---
    startBtn.addEventListener('click', () => {
        loadQuestion();
        switchScreen(screens.home, screens.quiz);
    });

    btnA.addEventListener('click', () => handleAnswer(true));
    btnB.addEventListener('click', () => handleAnswer(false));

    // --- 地图弹窗逻辑 ---
    const mapModal = document.getElementById('mapModal');
    const openMapBtns = document.querySelectorAll('.open-map-btn'); 
    const closeMapBtn = document.getElementById('closeMapBtn');

    const openModal = () => {
        mapModal.style.display = 'flex';
        setTimeout(() => mapModal.classList.add('show'), 10);
    };

    const closeModal = () => {
        mapModal.classList.remove('show');
        setTimeout(() => mapModal.style.display = 'none', 300);
    };

    openMapBtns.forEach(btn => btn.addEventListener('click', openModal));
    closeMapBtn.addEventListener('click', closeModal);
    mapModal.addEventListener('click', (e) => {
        if (e.target === mapModal) closeModal();
    });
});