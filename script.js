document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    //  资源预加载 (Image Preloading)
    // ==========================================
    const preloadImages = () => {
        const imgDetective = new Image();
        imgDetective.src = "detective.jpg";
        
        const imgGhost = new Image();
        imgGhost.src = "ghost.jpg";
    };
    preloadImages();

   // =// ==========================================
    // 🎛️ 全局音频控制面板 (Audio Manager) - 稳定纯净版
    // ==========================================
    const AudioManager = {
        config: {
            master: 1.0,  
            bgm: 0.4,     
            sfx: 1.0,     
            ui: 0.3,      
            isMuted: false 
        },

        elements: {
            bgm1: document.getElementById('bgm1'),
            bgm2: document.getElementById('bgm2'),
            bgm3: document.getElementById('bgm3'),
            whip: document.getElementById('whipAudio'),
            btnClick: document.getElementById('btnClickAudio'),
            muteBtn: document.getElementById('muteToggle'),
            gazhi: document.getElementById('gazhiAudio'),
            breath: document.getElementById('breathAudio'),
            angry: document.getElementById('angryAudio'),
            relievedBreath: document.getElementById('relievedBreathAudio'),
            step: document.getElementById('stepAudio')
        },

        currentBGM: null, 

        // 【修复点 1】：终极暴力静音法
        toggleMute: function() {
            this.config.isMuted = !this.config.isMuted;
            this.config.master = this.config.isMuted ? 0.0 : 1.0;

            // 直接绕过对象，暴力搜索网页上所有的 <audio> 标签，全部掐断
            const allAudioTags = document.querySelectorAll('audio');
            allAudioTags.forEach(track => {
                track.muted = this.config.isMuted;
            });

            // 同步更新右上角的 UI 图标状态
            const muteBtn = document.getElementById('muteToggle');
            if (muteBtn) {
                muteBtn.innerText = this.config.isMuted ? '🔇' : '🔊';
                muteBtn.classList.toggle('muted', this.config.isMuted);
            }
        },

        playBGM: function(bgmId) {
            const track = this.elements[bgmId];
            if (!track) return;
            if (this.currentBGM && this.currentBGM !== track) {
                this.currentBGM.pause();
                this.currentBGM.currentTime = 0;
            }
            track.volume = this.config.bgm * this.config.master;
            track.play().catch(e => console.warn('BGM blocked:', e));
            this.currentBGM = track;
        },

        playSFX: function(sfxId) {
            const track = this.elements[sfxId];
            if (!track) return;
            track.volume = this.config.sfx * this.config.master;
            track.currentTime = 0; 
            track.play().catch(e => console.warn('SFX blocked:', e));
        },

        stopSFX: function(sfxId) {
            const track = this.elements[sfxId];
            if (!track) return;
            track.pause();
            track.currentTime = 0;
        },

        playUI: function() {
            const track = this.elements.btnClick;
            if (!track) return;
            track.volume = this.config.ui * this.config.master;
            track.currentTime = 0; 
            track.play().catch(e => console.warn('UI blocked:', e));
        }
    };

    // ==========================================
    // 监听全局事件 (静音切换与 UI 音效)
    // ==========================================
    document.body.addEventListener('click', (e) => {
        // 【修复点 2】：彻底删除了导致翻车的 unlockAllAudio();
        
        // 如果点击了静音图标，立刻执行静音逻辑
        if (e.target.closest('#muteToggle')) {
            AudioManager.toggleMute();
            return;
        }
        
        // 如果点击了普通按钮，播放 UI 滴答声
        if (e.target.closest('button')) {
            AudioManager.playUI();
        }
    });

    // --- 全局状态变量 ---
    let isDetective = false;       
    let currentQuestionIndex = 0;  
    let detectiveScore = 0;        
    let ghostScore = 0;            
    let unlockedUpTo = 0;          
    let selectedArtifactId = null; 

    // --- 展品数据库 (5 个核心展品的完整配置) ---
    const artifactsData = [
        {
            id: 0,
            title: "1. The Gibbet",
            img: "gibbet.jpg",
            pw: "1767",
            prompt: "Look at the physical plaque of The Gibbet.<br>In what year did Robert Downe commit the crime?",
            detNarrative: "This heavy iron cage was not just for killing, but for public display. Check the museum plaque carefully. What is this convict's number?",
            detOptions: ["A1-561", "A3-563", "C2-570"],
            detCorrectIndex: 1, 
            detFeedback: "Correct. Accessing File A3-563: Robert Downe. He didn't escape. His body was hung in this cage as a public warning.",
            ghostType: "hold",  
            ghostInstruction: "Press and hold to calm the spirit.",
            ghostFeedback: "\"He didn't run away. So he was left here to rot in the wind, as a warning to everyone passing by...\""
        },
        {
            id: 1,
            title: "2. Scold's Bridle",
            img: "bridle.jpg",
            pw: "1799",
            prompt: "Look at the physical plaque.<br>In what year was the Bridle forced upon the beggar?",
            detNarrative: "This object was usually used for women, but it was forced onto a blind male beggar. Look at the metal piece that goes inside the mouth. Why did the guards use this on him?",
            detOptions: ["To blind him", "To press his tongue down and keep him quiet", "To protect his head"],
            detCorrectIndex: 1,
            detFeedback: "Correct. It was a brutal method of complete silencing.",
            ghostType: "wipe",  
            ghostInstruction: "Swipe repeatedly to clear the fog of history.",
            ghostFeedback: "\"Darkness. Then cold metal in the mouth. Justice brutally took away his last voice.\""
        },
        {
            id: 2,
            title: "3. Flogging Block",
            img: "flooging blook.jpg",
            pw: "1863",
            prompt: "Look at the physical plaque.<br>Enter the code:",
            detNarrative: "This block was introduced to enforce the Garrotters Act. Read the museum plaque carefully. What specific crimes led a convict to be strapped to this block? ",
            detOptions: ["Treason and Murder", "Robbery and Strangulation", "Debt and Fraud"],
            detCorrectIndex: 1,
            detFeedback: "Correct. The Garrotters Act specifically targeted violent robberies involving strangulation.",
            ghostType: "multitouch-whip", 
            ghostInstruction: "Place and hold two fingers on the holes to accept the punishment.",
            ghostFeedback: "Arms pulled tight. The rough wood against your chest. Then... the agonizing crack of the whip. "
        },
        {
            id: 3,
            title: "4. Pillory",
            img: "pillory.jpg",
            pw: "12",
            prompt: "Look at the Pillory records.<br>At what hour (PM) was Daniel punished?",
            detNarrative: "The offender's head and hands were locked in this wood. Records show Daniel Clay was punished in a busy market at 12 PM. Why choose this specific time and place?",
            detOptions: ["To give him sunlight", "For guard shifts", "To attract maximum crowd for public humiliation"],
            detCorrectIndex: 2,
            detFeedback: "Correct. Public humiliation was the primary goal of the pillory.",
            ghostType: "swipe", 
            ghostInstruction: "Swipe left and right to look around the angry crowd.",
            ghostFeedback: "\"Locked in the wood with angry eyes staring at you. Here, the anger of the crowd is the worst punishment.\""
        },
        {
            id: 4,
            title: "5. Cat-o-Nine-Tails",
            img: "whip.jpg",
            pw: "1770",
            prompt: "Check the Whip's display.<br>Enter the year of the record:",
            detNarrative: "This whip is called the 'Cat-o-Nine-Tails'. Look closely at the end of the whip. What physical design gave it this animal-like name?",
            detOptions: ["Made of cat skin", "Nine knotted cords leaving marks like cat scratches", "Sounds like a cat"],
            detCorrectIndex: 1,
            detFeedback: "Correct. The nine knots tore the skin like the claws of a cat.",
            ghostType: "tap", 
            ghostInstruction: "Tap rhythmically 3 times to mimic the weary steps.",
            ghostFeedback: "\"Just for some curtains... he was forced to walk naked across the town...\""
        }
    ];

    // --- DOM 元素获取 ---
    const screens = {
        home: document.getElementById('home-screen'),
        prologue: document.getElementById('prologue-screen'),
        quiz: document.getElementById('quiz-screen'),
        result: document.getElementById('result-screen'),
        hub: document.getElementById('hub-screen'),
        artifact: document.getElementById('artifact-screen')
    };

    const switchScreen = (hideScreen, showScreen) => {
        hideScreen.classList.remove('active');
        setTimeout(() => { showScreen.classList.add('active'); }, 1200); 
    };

    // --- 1. 启动序列与 BGM 播放 ---
    document.getElementById('enterBtn').addEventListener('click', () => {
        AudioManager.playBGM('bgm1'); 
        switchScreen(screens.home, screens.prologue);
    });
    
    const headphoneModal = document.getElementById('headphoneModal');
    document.getElementById('discoverBtn').addEventListener('click', () => {
        headphoneModal.style.display = 'flex';
        setTimeout(() => headphoneModal.classList.add('show'), 10);
    });
    document.getElementById('headphoneReadyBtn').addEventListener('click', () => {
        headphoneModal.classList.remove('show');
        setTimeout(() => {
            headphoneModal.style.display = 'none';
            loadQuestion(); 
            switchScreen(screens.prologue, screens.quiz);
        }, 400);
    });

    // --- 2. 交互测试 (Quiz) 逻辑 ---
    const questions = [
        { qEn: "As you step into a cold, dimly lit 19th-century cell, what draws your attention first?", aEn: "The physical details...", bEn: "The atmosphere..." },
        { qEn: "You discover a pair of heavy iron shackles...", aEn: "\"How exactly did this mechanism work...\"", bEn: "\"Who was the person forced to wear this...\"" },
        { qEn: "How do you prefer to uncover the hidden truths of this dark heritage?", aEn: "By analyzing evidence...", bEn: "By listening to personal stories..." }
    ];

    const loadQuestion = () => {
        const q = questions[currentQuestionIndex];
        document.getElementById('current-q-num').innerText = currentQuestionIndex + 1;
        const qBox = document.getElementById('question-box');
        const btnA = document.getElementById('optionA');
        const btnB = document.getElementById('optionB');
        
        qBox.style.opacity = 0; btnA.style.opacity = 0; btnB.style.opacity = 0;
        setTimeout(() => {
            qBox.innerHTML = `<p>${q.qEn}</p>`;
            document.getElementById('optA-en').innerText = q.aEn; 
            document.getElementById('optB-en').innerText = q.bEn;
            qBox.style.opacity = 1; btnA.style.opacity = 1; btnB.style.opacity = 1;
        }, 600);
    };

    document.getElementById('optionA').addEventListener('click', () => handleAnswer(true));
    document.getElementById('optionB').addEventListener('click', () => handleAnswer(false));

    const handleAnswer = (choseDetective) => {
        if (choseDetective) detectiveScore++; else ghostScore++;
        currentQuestionIndex++;
        
        if (currentQuestionIndex < questions.length) {
            loadQuestion(); 
        } else {
            showResult();   
        }
    };

    const showResult = () => {
        isDetective = detectiveScore > ghostScore; 
        const title = document.getElementById('result-title');
        const desc = document.getElementById('result-desc-en');
        const resultImg = document.getElementById('result-img'); 
        
        if (isDetective) {
            title.innerText = "You are The Detective! ";
            desc.innerText = "Your journey is driven by logic and analysis. You observe details others miss.";
            resultImg.src = "detective.jpg"; 
            AudioManager.playBGM('bgm2'); 
        } else {
            title.innerText = "You are The Ghost! ";
            desc.innerText = "Your journey is driven by empathy. You feel the echoes of the stories left behind.";
            resultImg.src = "ghost.jpg"; 
            AudioManager.playBGM('bgm3'); 
        }
        
        switchScreen(screens.quiz, screens.result);
    };

    document.getElementById('toHubBtn').addEventListener('click', () => {
        updateHubUI();
        switchScreen(screens.result, screens.hub);
    });

    // --- 3. 展品导航中心 (Hub) 逻辑 ---
    const updateHubUI = () => {
        const items = document.querySelectorAll('.artifact-item');
        items.forEach((item, index) => {
            item.classList.remove('active-artifact', 'locked', 'completed-artifact');
            if (index < unlockedUpTo) {
                item.classList.add('completed-artifact');
                item.innerText = artifactsData[index].title + " (Explored)";
            } else if (index === unlockedUpTo) {
                item.classList.add('active-artifact');
                item.innerText = artifactsData[index].title;
            } else {
                item.classList.add('locked');
                item.innerText = artifactsData[index].title;
            }
        });
    };

    const unlockModal = document.getElementById('unlockModal');
    const unlockInput = document.getElementById('unlockInput');
    const unlockError = document.getElementById('unlockError');
    const unlockPromptText = document.getElementById('unlockPromptText');

    document.querySelector('.artifact-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('active-artifact') || e.target.classList.contains('completed-artifact')) {
            selectedArtifactId = parseInt(e.target.getAttribute('data-id'));
            openUnlockModal();
        }
    });
    
    document.getElementById('navUnlockBtn').addEventListener('click', () => {
        selectedArtifactId = unlockedUpTo; 
        if (selectedArtifactId < artifactsData.length) openUnlockModal();
    });

    const openUnlockModal = () => {
        const data = artifactsData[selectedArtifactId];
        unlockPromptText.innerHTML = data.prompt; 
        unlockInput.value = '';
        unlockError.style.opacity = 0;
        unlockModal.style.display = 'flex';
        setTimeout(() => unlockModal.classList.add('show'), 10);
    };

    document.getElementById('cancelUnlockBtn').addEventListener('click', () => {
        unlockModal.classList.remove('show');
        setTimeout(() => unlockModal.style.display = 'none', 400);
    });

    document.getElementById('submitUnlockBtn').addEventListener('click', () => {
        const data = artifactsData[selectedArtifactId];
        if (unlockInput.value.trim() === data.pw) {
            unlockModal.classList.remove('show');
            setTimeout(() => {
                unlockModal.style.display = 'none';
                renderArtifactScreen(data);
                switchScreen(screens.hub, screens.artifact);
            }, 400);
        } else {
            unlockError.style.opacity = 1;
            unlockInput.value = '';
        }
    });

    // --- 4. 动态渲染具体展品交互页 ---
    const renderArtifactScreen = (data) => {
        document.getElementById('artifactImg').src = data.img;
        document.getElementById('returnHubBtn').style.display = 'none';
        
        const detUI = document.getElementById('detective-ui');
        const ghostUI = document.getElementById('ghost-ui');
        
        detUI.classList.remove('active');
        ghostUI.classList.remove('active');

        if (isDetective) {
            detUI.classList.add('active');
            document.getElementById('det-narrative').innerText = data.detNarrative;
            const mcqContainer = document.getElementById('det-mcq');
            mcqContainer.innerHTML = '';
            
            data.detOptions.forEach((optText, index) => {
                const btn = document.createElement('button');
                btn.className = 'mcq-btn';
                btn.innerText = optText;
                btn.onclick = function() {
                    if (index === data.detCorrectIndex) {
                        this.classList.add('correct');
                        Array.from(mcqContainer.children).forEach(b => b.style.pointerEvents = 'none');
                        document.getElementById('det-feedback').innerText = data.detFeedback;
                        document.getElementById('det-feedback').style.display = 'block';
                        document.getElementById('returnHubBtn').style.display = 'block';
                    } else {
                        this.classList.add('wrong');
                    }
                };
                mcqContainer.appendChild(btn);
            });
            document.getElementById('det-feedback').style.display = 'none';

        } else {
            ghostUI.classList.add('active');
            document.getElementById('ghost-feedback').style.display = 'none';
            document.getElementById('ghost-feedback').innerText = data.ghostFeedback;
            
            // The Gibbet 幽灵线开场嘎吱声
            if (data.id === 0) {
                AudioManager.playSFX('gazhi');
            }

            setupGhostInteraction(data);
        }
    };

    const setupGhostInteraction = (data) => {
        const container = document.getElementById('ghost-interaction-area');
        container.style.pointerEvents = 'auto'; 
        
        container.innerHTML = `<p class="instruction-text">${data.ghostInstruction}</p>`;
        
        const completeGhost = () => {
            document.getElementById('ghost-feedback').style.display = 'block';
            document.getElementById('returnHubBtn').style.display = 'block';
            container.style.pointerEvents = 'none'; 
        };

        if (data.ghostType === 'hold') {
            const holdBtn = document.createElement('button');
            holdBtn.className = 'hold-btn';
            holdBtn.innerHTML = `<div class="hold-progress" id="holdProg"></div><span class="hold-text">Hold 3 Seconds</span>`;
            container.appendChild(holdBtn);
            
            let timer;
            const startHold = (e) => {
                e.preventDefault(); 
                document.getElementById('holdProg').style.transition = `width 3s linear`;
                document.getElementById('holdProg').style.width = '100%';
                
                // 播放喘气声
                AudioManager.playSFX('breath');

                timer = setTimeout(() => {
                    AudioManager.stopSFX('breath');
                    completeGhost(); 
                }, 3000); 
            };
            const endHold = (e) => {
                if (e) e.preventDefault();
                clearTimeout(timer);
                document.getElementById('holdProg').style.transition = 'none';
                document.getElementById('holdProg').style.width = '0%';
                void document.getElementById('holdProg').offsetWidth; 
                
                // 松手停止喘气声
                AudioManager.stopSFX('breath');
            };
            
            holdBtn.addEventListener('mousedown', startHold); holdBtn.addEventListener('touchstart', startHold);
            holdBtn.addEventListener('mouseup', endHold); holdBtn.addEventListener('mouseleave', endHold);
            holdBtn.addEventListener('touchend', endHold); holdBtn.addEventListener('touchcancel', endHold);
        } 
        
        else if (data.ghostType === 'wipe') {
            const wipeArea = document.createElement('div');
            wipeArea.className = 'wipe-area';
            wipeArea.innerHTML = `<div class="wipe-text" id="wipeText">The Truth</div><div class="wipe-fog" id="wipeFog" style="transition: none;"></div>`;
            container.appendChild(wipeArea);
            
            let fogOpacity = 1.0;
            let isWiping = false; 

            const startWipe = () => { isWiping = true; };
            const stopWipe = () => { isWiping = false; };

            const handleWipe = (e) => {
                if (e.cancelable) e.preventDefault(); 
                if (e.type === 'mousemove' && !isWiping) return;

                fogOpacity -= 0.05; 
                const fog = document.getElementById('wipeFog');
                if (fog) fog.style.opacity = fogOpacity;

                if (fogOpacity <= 0) {
                    wipeArea.removeEventListener('mousemove', handleWipe);
                    wipeArea.removeEventListener('touchmove', handleWipe);
                    wipeArea.removeEventListener('mousedown', startWipe);
                    window.removeEventListener('mouseup', stopWipe);
                    
                    const wt = document.getElementById('wipeText');
                    if (wt) wt.style.opacity = 1;
                    
                    completeGhost();
                }
            };
            
            wipeArea.addEventListener('mousedown', startWipe);
            window.addEventListener('mouseup', stopWipe);
            wipeArea.addEventListener('mousemove', handleWipe);
            wipeArea.addEventListener('touchmove', handleWipe, { passive: false });
        }

        // --- 类型 3：高级全屏视差特效 (专属于 Pillory 颈手枷) ---
        else if (data.ghostType === 'swipe') {
            
            document.getElementById('artifactImg').style.display = 'none';

            container.innerHTML = `
                <div id="parallax-container" class="parallax-container">
                    <div id="eyes-layer"></div>
                    <img src="${data.img}" id="pillory-parallax-img">
                    <div id="instruction-text" style="position: absolute; top: 20%; z-index: 3; font-size: 1.1rem; text-align: center; opacity: 0.8; transition: opacity 1s; pointer-events: none;">Drag to look around...<br>They are watching you.</div>
                    <div id="flash-overlay-pillory" class="flash-overlay-pillory"></div>
                    <div id="pillory-ending-ui" style="position: absolute; z-index: 11; opacity: 0; pointer-events: none; transition: opacity 2s ease-in; text-align: center; width: 80%;">
                        <p style="font-size: 1.2rem; line-height: 1.6; font-style: italic; margin-bottom: 3rem; text-shadow: 0 0 10px rgba(255,255,255,0.2);">"Locked in the wood, their hateful stares were the true torture."<br><br></p>
                    </div>
                </div>
            `;
            
            const parallaxBox = document.getElementById('parallax-container');
            const eyesLayer = document.getElementById('eyes-layer');
            const imgEl = document.getElementById('pillory-parallax-img');
            const instructionText = document.getElementById('instruction-text');
            const flashOverlay = document.getElementById('flash-overlay-pillory');
            const endingUI = document.getElementById('pillory-ending-ui');
            const angryAudio = document.getElementById('angryAudio');
            
            let isDragging = false, isFinished = false, audioStarted = false;
            let startX = 0, startY = 0, currentX = 0, currentY = 0, accumulatedDist = 0;
            
            // 【修复 2：降低阈值】将触发结局的像素距离从 2000 下调到 800，确保电脑鼠标也能轻松触发
            const THRESHOLD = 800; 

            for (let i = 0; i < 35; i++) {
                const eye = document.createElement('div');
                eye.className = 'angry-eyes';
                eye.style.left = Math.random() * 95 + '%';
                eye.style.top = Math.random() * 95 + '%';
                eye.style.transform = `scale(${0.5 + Math.random() * 0.8})`; 
                eyesLayer.appendChild(eye);
            }
            const allEyes = document.querySelectorAll('.angry-eyes');

            const startDrag = (e) => {
                if (isFinished) return;
                isDragging = true;
                const touch = e.touches ? e.touches[0] : e;
                startX = touch.clientX - currentX; 
                startY = touch.clientY - currentY;
                
                instructionText.style.opacity = 0; 
                
                if (!audioStarted && angryAudio) {
                    try { angryAudio.volume = 0; } catch(err){}
                    angryAudio.play().catch(()=>{});
                    audioStarted = true;
                }
            };

            const doDrag = (e) => {
                if (!isDragging || isFinished) return;
                if (e.cancelable) e.preventDefault(); 
                
                const touch = e.touches ? e.touches[0] : e;
                const newX = touch.clientX - startX; 
                const newY = touch.clientY - startY;
                
                const moveDist = Math.sqrt(Math.pow(newX - currentX, 2) + Math.pow(newY - currentY, 2));
                accumulatedDist += moveDist;
                currentX = newX; currentY = newY;

                imgEl.style.transform = `translate3d(${currentX * 0.15}px, ${currentY * 0.15}px, 0)`;
                eyesLayer.style.transform = `translate3d(${-currentX * 0.4}px, ${-currentY * 0.4}px, 0)`;

                const progress = Math.min(accumulatedDist / THRESHOLD, 1);
                allEyes.forEach(eye => eye.style.opacity = progress * 3);
                
                if (audioStarted && angryAudio) {
                    try { angryAudio.volume = Math.min(progress, 1.0) * AudioManager.config.master; } catch(err){}
                }

                if (accumulatedDist >= THRESHOLD) {
                    isFinished = true;
                    
                    flashOverlay.classList.add('flash-active-pillory');
                    allEyes.forEach(eye => eye.style.display = 'none');
                    
                    // 【修复 1：绝对次数淡出法】使用定死执行 20 次倒数的方式，彻底绕开 iOS 的音量锁死 Bug
                    if (angryAudio) {
                        let steps = 20;
                        let fade = setInterval(() => {
                            steps--;
                            if (steps > 0) {
                                // 电脑/安卓端依然能享受到音量渐渐变小的效果
                                try { angryAudio.volume = (steps / 20) * AudioManager.config.master; } catch(err){}
                            } else {
                                // 不管支持不支持改变音量，20次一到，强行终止声音！
                                angryAudio.pause();
                                angryAudio.currentTime = 0;
                                clearInterval(fade);
                            }
                        }, 50); // 20次 * 50毫秒 = 1秒内结束
                    }
                    
                    setTimeout(() => { 
                        AudioManager.playSFX('relievedBreath'); 
                    }, 300);
                    
                    setTimeout(() => {
                        endingUI.style.opacity = 1;
                        endingUI.style.pointerEvents = 'auto';
                        document.getElementById('returnHubBtn').style.display = 'block';
                    }, 1000); 
                }
            };

            const endDrag = () => isDragging = false;

            parallaxBox.addEventListener('mousedown', startDrag);
            parallaxBox.addEventListener('touchstart', startDrag, {passive: false});
            window.addEventListener('mousemove', doDrag);
            window.addEventListener('touchmove', doDrag, {passive: false});
            window.addEventListener('mouseup', endDrag);
            window.addEventListener('touchend', endDrag);
        }

        // --- 类型 4：基础的节奏点击 (例如 Cat-o-Nine-Tails) ---
        else if (data.ghostType === 'tap') {
            const tapBtn = document.createElement('button');
            tapBtn.className = 'tap-btn';
            tapBtn.innerText = "TAP";
            container.appendChild(tapBtn);
            
            let taps = 0;
            tapBtn.addEventListener('click', () => {
                // 【关键新增】：每次点击按钮，立刻播放一次沉重的脚步声
                AudioManager.playSFX('step');
                
                taps++;
                if (taps >= 3) {
                    // 稍微延时一点点再显示通关文案，让最后一步的脚步声有时间响起
                    setTimeout(completeGhost, 300); 
                }
            });
        }
        
        else if (data.ghostType === 'multitouch-whip') {
            const floggingArea = document.createElement('div');
            floggingArea.className = 'flogging-area';
            floggingArea.innerHTML = `
                <div class="finger-hole" id="hole1"></div>
                <div class="finger-hole" id="hole2"></div>
                <div class="whip-slash" id="whipSlash"></div>
            `;
            container.appendChild(floggingArea);

            const hole1 = document.getElementById('hole1');
            const hole2 = document.getElementById('hole2');
            const whipSlash = document.getElementById('whipSlash');
            
            const artifactScreen = document.getElementById('artifact-screen');
            const flashOverlay = document.getElementById('bloodFlash');
            const whipAudio = document.getElementById('whipAudio');

            let whipTimer = null;
            let isPunished = false;
            let audioUnlocked = false; // 用来标记鞭子音频是否已经对手机解锁

            const resetTension = () => {
                if (isPunished) return;
                clearTimeout(whipTimer);
                whipTimer = null;
                hole1.classList.remove('active');
                hole2.classList.remove('active');
                artifactScreen.classList.remove('shake-active'); 
            };

            const executeWhip = () => {
                AudioManager.playSFX('whip'); 

                artifactScreen.classList.remove('shake-active');
                flashOverlay.classList.remove('flash-active');
                void flashOverlay.offsetWidth; 
                flashOverlay.classList.add('flash-active');
                whipSlash.classList.remove('slash-active');
                void whipSlash.offsetWidth;
                whipSlash.classList.add('slash-active');
                hole1.style.opacity = 0;
                hole2.style.opacity = 0;

                setTimeout(() => {
                    completeGhost(); 
                }, 500); 
            };

            // 核心事件监听：移动端双点长按
            floggingArea.addEventListener('touchstart', (e) => {
                e.preventDefault(); 
                if (isPunished) return;

                // 【关键修复】：只为鞭子做专属的无声解锁，悄悄骗过 iOS 系统
                if (!audioUnlocked && whipAudio) {
                    whipAudio.volume = 0; // 绝对零度静音，防止漏音
                    let p = whipAudio.play();
                    if (p !== undefined) {
                        p.then(() => { 
                            whipAudio.pause(); 
                            whipAudio.currentTime = 0; 
                        }).catch(() => {});
                    }
                    audioUnlocked = true;
                }

                if (e.touches.length === 2 && !whipTimer) {
                    hole1.classList.add('active');
                    hole2.classList.add('active');
                    artifactScreen.classList.add('shake-active'); 

                    whipTimer = setTimeout(() => {
                        isPunished = true;
                        executeWhip(); 
                    }, 3000); 
                }
            }, { passive: false });

            floggingArea.addEventListener('touchend', (e) => {
                if (e.touches.length < 2) resetTension();
            });
            floggingArea.addEventListener('touchcancel', resetTension);

            // 电脑端鼠标降级兼容
            floggingArea.addEventListener('mousedown', () => {
                if (isPunished) return;
                
                // 电脑端同样加上解锁逻辑，做到双端统一
                if (!audioUnlocked && whipAudio) {
                    whipAudio.volume = 0;
                    let p = whipAudio.play();
                    if (p !== undefined) {
                        p.then(() => { whipAudio.pause(); whipAudio.currentTime = 0; }).catch(() => {});
                    }
                    audioUnlocked = true;
                }

                hole1.classList.add('active');
                hole2.classList.add('active');
                artifactScreen.classList.add('shake-active');
                whipTimer = setTimeout(() => {
                    isPunished = true;
                    executeWhip();
                }, 3000);
            });
            window.addEventListener('mouseup', resetTension);
        }
    };

    // 返回导航中心事件
    document.getElementById('returnHubBtn').addEventListener('click', () => {
        if (selectedArtifactId === unlockedUpTo && unlockedUpTo < 4) {
            unlockedUpTo++;
        } else if (selectedArtifactId === 4) {
            unlockedUpTo = 5; 
        }
        updateHubUI();
        switchScreen(screens.artifact, screens.hub);
    });

    // --- 地图模态框 (Map Modal) 全局逻辑 ---
    const mapModal = document.getElementById('mapModal');
    document.querySelectorAll('.open-map-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            mapModal.style.display = 'flex';
            setTimeout(() => mapModal.classList.add('show'), 10);
        });
    });
    
    const closeMap = () => {
        mapModal.classList.remove('show');
        setTimeout(() => mapModal.style.display = 'none', 400);
    };
    document.getElementById('closeMapBtn').addEventListener('click', closeMap);
    mapModal.addEventListener('click', (e) => { if (e.target === mapModal) closeMap(); });
});