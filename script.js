/* ==========================================================================
   Surprise Website - Interactive Logic & Audio Engine
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------------------------
    // 1. Audio Engine (Web Audio API)
    // ----------------------------------------------------------------------
    let audioCtx = null;
    let isSoundMuted = false;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Play a crystal chime note (Bubble Pops, Transitions)
    function playChime(freq, type = 'sine', duration = 0.8) {
        if (isSoundMuted) return;
        initAudio();
        
        try {
            const now = audioCtx.currentTime;
            
            // Primary tone
            const osc1 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            osc1.type = type;
            osc1.frequency.setValueAtTime(freq, now);
            gain1.gain.setValueAtTime(0.15, now);
            gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);
            
            // Secondary overtone (an octave higher for music-box chime clarity)
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(freq * 2, now);
            gain2.gain.setValueAtTime(0.08, now);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + (duration * 0.7));
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            
            osc1.start(now);
            osc1.stop(now + duration);
            
            osc2.start(now);
            osc2.stop(now + duration);
        } catch (e) {
            console.error("Audio error", e);
        }
    }

    // Play a sequence of chimes (Success / Open Gift)
    function playChord(frequencies, delayBetween = 100, type = 'sine') {
        if (isSoundMuted) return;
        frequencies.forEach((freq, idx) => {
            setTimeout(() => {
                playChime(freq, type, 1.2);
            }, idx * delayBetween);
        });
    }

    // Toggle Sound Button
    const soundToggle = document.getElementById("sound-toggle");
    soundToggle.addEventListener("click", () => {
        isSoundMuted = !isSoundMuted;
        const icon = soundToggle.querySelector("i");
        if (isSoundMuted) {
            icon.className = "fas fa-volume-mute";
            soundToggle.style.background = "rgba(212, 65, 142, 0.2)";
        } else {
            icon.className = "fas fa-volume-up";
            soundToggle.style.background = "rgba(255, 255, 255, 0.08)";
            initAudio();
            playChime(523.25, 'sine', 0.3); // Quick indicator sound (C5)
        }
    });


    // ----------------------------------------------------------------------
    // 2. Background Glowing Particle System
    // ----------------------------------------------------------------------
    const bgCanvas = document.getElementById("bg-particles");
    const bgCtx = bgCanvas.getContext("2d");
    
    let particles = [];
    const particleCount = 45;

    function resizeCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * bgCanvas.width;
            this.y = Math.random() * bgCanvas.height + bgCanvas.height;
            this.size = Math.random() * 4 + 1;
            this.speedY = Math.random() * 0.8 + 0.2;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.color = Math.random() > 0.5 ? 'rgba(212, 65, 142, 0.15)' : 'rgba(6, 190, 182, 0.15)';
            this.glow = Math.random() * 10 + 5;
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            if (this.y < -10) {
                this.reset();
            }
        }

        draw() {
            bgCtx.shadowBlur = this.glow;
            bgCtx.shadowColor = this.color;
            bgCtx.fillStyle = this.color;
            bgCtx.beginPath();
            bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            bgCtx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        const p = new Particle();
        p.y = Math.random() * bgCanvas.height; // Spread initially
        particles.push(p);
    }


    // ----------------------------------------------------------------------
    // 3. Screen-wide Confetti & Balloon Particle System
    // ----------------------------------------------------------------------
    const confettiCanvas = document.getElementById("confetti-canvas");
    const confettiCtx = confettiCanvas.getContext("2d");
    let confettiList = [];
    let isConfettiActive = false;

    function resizeConfettiCanvas() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
    resizeConfettiCanvas();
    window.addEventListener("resize", resizeConfettiCanvas);

    class Confetti {
        constructor(isBalloon = false) {
            this.isBalloon = isBalloon;
            this.x = Math.random() * confettiCanvas.width;
            this.y = isBalloon ? confettiCanvas.height + 50 : -20;
            this.size = isBalloon ? Math.random() * 20 + 20 : Math.random() * 8 + 6;
            this.color = `hsl(${Math.random() * 360}, 85%, 65%)`;
            this.speedY = isBalloon ? -(Math.random() * 1.5 + 1) : Math.random() * 3 + 2;
            this.speedX = Math.random() * 2 - 1;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = Math.random() * 0.1 - 0.05;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            if (!this.isBalloon) {
                this.rotation += this.rotationSpeed;
            }
        }

        draw() {
            confettiCtx.save();
            confettiCtx.translate(this.x, this.y);
            confettiCtx.fillStyle = this.color;

            if (this.isBalloon) {
                // Balloon body
                confettiCtx.beginPath();
                confettiCtx.ellipse(0, 0, this.size * 0.7, this.size, 0, 0, Math.PI * 2);
                confettiCtx.fill();
                
                // Balloon string
                confettiCtx.beginPath();
                confettiCtx.moveTo(0, this.size);
                confettiCtx.quadraticCurveTo(5, this.size + 10, -5, this.size + 20);
                confettiCtx.strokeStyle = "rgba(255,255,255,0.4)";
                confettiCtx.lineWidth = 1.5;
                confettiCtx.stroke();
            } else {
                // Confetti rectangle
                confettiCtx.rotate(this.rotation);
                confettiCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            }
            confettiCtx.restore();
        }
    }

    function triggerConfettiBurst(amount = 120) {
        initAudio();
        playChord([261.63, 329.63, 392.00, 523.25], 80, 'triangle'); // C Major Chord
        isConfettiActive = true;
        
        // Spawn normal confetti
        for (let i = 0; i < amount; i++) {
            confettiList.push(new Confetti(false));
        }

        // Spawn some balloons
        for (let i = 0; i < 15; i++) {
            confettiList.push(new Confetti(true));
        }
    }


    // ----------------------------------------------------------------------
    // 4. Combined Animation Loop
    // ----------------------------------------------------------------------
    function animate() {
        // Clear background particles canvas
        bgCtx.shadowBlur = 0;
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        // Draw background particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Handle Confetti
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        if (isConfettiActive) {
            confettiList.forEach((c, idx) => {
                c.update();
                c.draw();
                
                // Out of screen checks
                if (c.y > confettiCanvas.height + 50 || c.y < -50 || c.x < -50 || c.x > confettiCanvas.width + 50) {
                    confettiList.splice(idx, 1);
                }
            });

            if (confettiList.length === 0) {
                isConfettiActive = false;
            }
        }

        requestAnimationFrame(animate);
    }
    animate();


    // ----------------------------------------------------------------------
    // 5. Stage Navigation System
    // ----------------------------------------------------------------------
    const stages = {
        intro: document.getElementById("intro-screen"),
        stage1: document.getElementById("stage-1"),
        stage2: document.getElementById("stage-2"),
        stage3: document.getElementById("stage-3"),
        stage4: document.getElementById("stage-4")
    };

    function switchStage(currentKey, nextKey) {
        const currentStage = stages[currentKey];
        const nextStage = stages[nextKey];

        currentStage.style.opacity = "0";
        currentStage.style.transform = "translateY(-30px)";
        
        setTimeout(() => {
            currentStage.classList.add("stage-hidden");
            currentStage.classList.remove("active-stage");
            
            nextStage.classList.remove("stage-hidden");
            
            // Allow redraw
            setTimeout(() => {
                nextStage.classList.add("active-stage");
                nextStage.style.opacity = "1";
                nextStage.style.transform = "translateY(0)";
                
                // Special actions upon entering a stage
                if (nextKey === 'stage2') {
                    initBubbleWrap();
                } else if (nextKey === 'stage3') {
                    initWheel();
                } else if (nextKey === 'stage4') {
                    // Set current date
                    const dateEl = document.getElementById("current-date");
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    dateEl.textContent = new Date().toLocaleDateString('en-US', options);
                }
            }, 50);
        }, 500);
    }


    // ----------------------------------------------------------------------
    // 6. Stage Intro: Click The Gift Box
    // ----------------------------------------------------------------------
    const giftBoxBtn = document.getElementById("gift-box-btn");
    giftBoxBtn.addEventListener("click", () => {
        initAudio();
        
        // Pop sound sequence
        playChord([293.66, 381.99, 587.33, 880.00], 60, 'sine');
        
        // Burst sound trigger & quick float particle effect
        isConfettiActive = true;
        for (let i = 0; i < 40; i++) {
            const c = new Confetti(false);
            // Center the initial burst of particles around the gift box coordinates
            const boxRect = giftBoxBtn.getBoundingClientRect();
            c.x = boxRect.left + boxRect.width / 2;
            c.y = boxRect.top + boxRect.height / 2;
            c.speedY = Math.random() * 8 - 4;
            c.speedX = Math.random() * 8 - 4;
            confettiList.push(c);
        }

        // Animate open box lid fly off!
        const lid = document.querySelector(".gift-lid");
        lid.style.transform = "translateY(-60px) rotate(15deg) scale(0.9)";
        lid.style.opacity = "0";

        setTimeout(() => {
            switchStage('intro', 'stage1');
        }, 600);
    });


    // ----------------------------------------------------------------------
    // 7. Stage 1: Polaroid Memory Carousel
    // ----------------------------------------------------------------------
    const cards = document.querySelectorAll(".polaroid-card");
    const prevBtn = document.getElementById("prev-card-btn");
    const nextBtn = document.getElementById("next-card-btn");
    const toStage2Btn = document.getElementById("to-stage-2-btn");
    let currentCardIndex = 0;

    function updateCarousel() {
        cards.forEach((card, idx) => {
            card.className = "polaroid-card"; // Clear
            if (idx === currentCardIndex) {
                card.classList.add("active-card");
            } else if (idx === currentCardIndex - 1) {
                card.classList.add("prev-card");
            } else if (idx === currentCardIndex + 1) {
                card.classList.add("next-card");
            }
        });

        // Controls disable handling
        prevBtn.disabled = currentCardIndex === 0;
        nextBtn.disabled = currentCardIndex === cards.length - 1;
    }

    prevBtn.addEventListener("click", () => {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            playChime(329.63, 'triangle', 0.2); // Mi5 note
            updateCarousel();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentCardIndex < cards.length - 1) {
            currentCardIndex++;
            playChime(392.00, 'triangle', 0.2); // Sol5 note
            updateCarousel();
        }
    });

    toStage2Btn.addEventListener("click", () => {
        playChime(523.25, 'sine', 0.4); // C5 note
        switchStage('stage1', 'stage2');
    });


    // ----------------------------------------------------------------------
    // 8. Stage 2: Satisfying Bubble Wrap
    // ----------------------------------------------------------------------
    const bubbleGrid = document.getElementById("bubble-grid");
    const popCountEl = document.getElementById("pop-count");
    const toStage3Btn = document.getElementById("to-stage-3-btn");
    let bubblesPopped = 0;
    const totalBubbles = 24;

    function initBubbleWrap() {
        bubbleGrid.innerHTML = "";
        bubblesPopped = 0;
        popCountEl.textContent = "0";
        toStage3Btn.disabled = true;
        toStage3Btn.textContent = "Pop all bubbles to continue! 🔒";

        // Dynamic frequencies representing "Can't Help Falling in Love" (Elvis Presley) for romantic vibes!
        const loveMelody = [
            523.25, // C5 (Wise)
            659.25, // E5 (men)
            783.99, // G5 (say)
            523.25, // C5 (on-)
            587.33, // D5 (ly)
            659.25, // E5 (fools)
            587.33, // D5 (rush)
            392.00, // G4 (in)
            
            587.33, // D5 (But)
            659.25, // E5 (I)
            698.46, // F5 (can't)
            659.25, // E5 (help)
            587.33, // D5 (fal-)
            523.25, // C5 (ling)
            587.33, // D5 (in)
            659.25, // E5 (love)
            587.33, // D5 (with)
            523.25, // C5 (you)

            392.00, // G4 (Shall)
            523.25, // C5 (I)
            659.25, // E5 (stay)
            783.99, // G5 (Would)
            523.25, // C5 (it)
            587.33, // D5 (be)
            659.25, // E5 (a)
            587.33  // D5 (sin)
        ];

        for (let i = 0; i < totalBubbles; i++) {
            const bubble = document.createElement("div");
            bubble.className = "bubble glow-effect";
            
            bubble.addEventListener("click", () => {
                if (!bubble.classList.contains("popped")) {
                    bubble.classList.add("popped");
                    bubblesPopped++;
                    popCountEl.textContent = bubblesPopped;

                    // Choose the next note from the love melody progression
                    const noteFreq = loveMelody[(bubblesPopped - 1) % loveMelody.length];
                    playChime(noteFreq, 'sine', 0.6);

                    // Add dynamic sparkle sparks
                    for (let j = 0; j < 5; j++) {
                        const c = new Confetti(false);
                        const bubbleRect = bubble.getBoundingClientRect();
                        c.x = bubbleRect.left + bubbleRect.width / 2;
                        c.y = bubbleRect.top + bubbleRect.height / 2;
                        c.speedY = Math.random() * 4 - 2;
                        c.speedX = Math.random() * 4 - 2;
                        c.size = Math.random() * 3 + 2;
                        confettiList.push(c);
                    }
                    isConfettiActive = true;

                    // Grid complete logic
                    if (bubblesPopped === totalBubbles) {
                        playChord([523.25, 659.25, 783.99, 1046.50], 90, 'sine'); // Arpeggio success chimes
                        toStage3Btn.removeAttribute("disabled");
                        toStage3Btn.innerHTML = "Awesome! Let's Go! ➔";
                    }
                }
            });

            bubbleGrid.appendChild(bubble);
        }
    }

    toStage3Btn.addEventListener("click", () => {
        switchStage('stage2', 'stage3');
    });


    // ----------------------------------------------------------------------
    // 9. Stage 3: The Appreciation Wheel
    // ----------------------------------------------------------------------
    const wheelCanvas = document.getElementById("wheel-canvas");
    const wheelCtx = wheelCanvas.getContext("2d");
    const spinBtn = document.getElementById("spin-btn");
    const toStage4Btn = document.getElementById("to-stage-4-btn");
    const wheelResult = document.getElementById("wheel-result");

    const affirmations = [
        "Your beautiful smile! 😊",
        "Your calming presence! 🕊",
        "Your brilliant mind! 🧠",
        "Your unmatched kindness! ✨",
        "Your lovely laughter! 🌸",
        "Your golden heart! 💛"
    ];

    const segmentColors = [
        "#d4418e", // Pink
        "#130e29", // Purple
        "#06beb6", // Cyan
        "#ffb703", // Gold
        "#9b5de5", // Lilac
        "#00bbf9"  // Sky blue
    ];

    let startAngle = 0;
    const arc = Math.PI / (affirmations.length / 2);
    let spinTimeout = null;
    let spinAngleStart = 10;
    let spinTime = 0;
    let spinTimeTotal = 0;

    function drawWheel() {
        const radius = wheelCanvas.width / 2;
        wheelCtx.clearRect(0,0,wheelCanvas.width,wheelCanvas.height);
        
        affirmations.forEach((aff, idx) => {
            const angle = startAngle + idx * arc;
            wheelCtx.fillStyle = segmentColors[idx];
            
            // Draw segment
            wheelCtx.beginPath();
            wheelCtx.moveTo(radius, radius);
            wheelCtx.arc(radius, radius, radius - 10, angle, angle + arc, false);
            wheelCtx.lineTo(radius, radius);
            wheelCtx.fill();
            
            // Draw segment divider
            wheelCtx.strokeStyle = "rgba(255,255,255,0.2)";
            wheelCtx.lineWidth = 2;
            wheelCtx.stroke();

            // Draw segment labels
            wheelCtx.save();
            wheelCtx.fillStyle = "#fff";
            wheelCtx.shadowBlur = 6;
            wheelCtx.shadowColor = "rgba(0,0,0,0.5)";
            wheelCtx.font = "bold 13px Outfit, sans-serif";
            
            wheelCtx.translate(radius, radius);
            wheelCtx.rotate(angle + arc / 2);
            
            const text = aff.split(" ")[0]; // Just get first word / emoji or short string
            wheelCtx.fillText(aff, radius / 2.2, 5);
            wheelCtx.restore();
        });

        // Center hub glow overlay
        wheelCtx.beginPath();
        wheelCtx.arc(radius, radius, 45, 0, Math.PI * 2);
        wheelCtx.fillStyle = "rgba(10, 8, 19, 0.9)";
        wheelCtx.fill();
        wheelCtx.strokeStyle = "#ffd700";
        wheelCtx.lineWidth = 3;
        wheelCtx.stroke();
    }

    function initWheel() {
        startAngle = 0;
        toStage4Btn.disabled = true;
        toStage4Btn.textContent = "Spin the wheel to proceed! 🔒";
        wheelResult.innerHTML = `<p class="wheel-result-text">Click SPIN to reveal a beautiful thought!</p>`;
        drawWheel();
    }

    spinBtn.addEventListener("click", () => {
        initAudio();
        spinAngleStart = Math.random() * 10 + 10;
        spinTime = 0;
        spinTimeTotal = Math.random() * 3000 + 4000; // spin for 4-7 seconds
        spinBtn.disabled = true;
        
        rotateWheel();
    });

    function rotateWheel() {
        spinTime += 30;
        if(spinTime >= spinTimeTotal) {
            stopRotateWheel();
            return;
        }
        
        // Easing calculation for speed
        const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
        startAngle += (spinAngle * Math.PI / 180);
        
        // Tick chime sound on rotation index changes
        if (Math.floor(startAngle * 10) % 5 === 0) {
            playChime(440, 'triangle', 0.05); // High-pitched short note
        }
        
        drawWheel();
        spinTimeout = setTimeout(rotateWheel, 30);
    }

    function easeOut(t, b, c, d) {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (tc + -3 * ts + 3 * t);
    }

    function stopRotateWheel() {
        clearTimeout(spinTimeout);
        
        const degrees = startAngle * 180 / Math.PI + 90; // Align pointer
        const arcd = arc * 180 / Math.PI;
        const index = Math.floor((360 - degrees % 360) / arcd) % affirmations.length;
        
        // Safety check index bounds
        const normalizedIndex = (index + affirmations.length) % affirmations.length;
        
        const winningText = affirmations[normalizedIndex];
        
        // Highlight result
        wheelResult.innerHTML = `
            <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:5px;">What makes you outstanding:</p>
            <p class="wheel-result-text animate-pulse">✨ ${winningText} ✨</p>
        `;
        
        playChord([392.00, 523.25, 659.25, 783.99], 100, 'sine'); // C Major Ascending
        
        // Unlock next stage button
        spinBtn.disabled = false;
        toStage4Btn.removeAttribute("disabled");
        toStage4Btn.innerHTML = "Onto the Final Surprise! ➔";
    }

    toStage4Btn.addEventListener("click", () => {
        switchStage('stage3', 'stage4');
    });


    // ----------------------------------------------------------------------
    // 10. Stage 4: Wax Seal & Letter Opening
    // ----------------------------------------------------------------------
    const envelope = document.getElementById("envelope-element");
    const envelopeSealBtn = document.getElementById("envelope-seal-btn");
    const finalActions = document.getElementById("final-actions");
    const celebrateBtn = document.getElementById("celebrate-btn");
    const restartBtn = document.getElementById("restart-btn");

    envelopeSealBtn.addEventListener("click", () => {
        initAudio();
        
        // Mark envelope opened
        envelope.classList.add("opened");
        
        // Start particle rain
        setTimeout(() => {
            triggerConfettiBurst(150);
            
            // Show actions button
            finalActions.style.opacity = "1";
            finalActions.style.pointerEvents = "all";
        }, 1200);
    });

    celebrateBtn.addEventListener("click", () => {
        triggerConfettiBurst(120);
    });

    restartBtn.addEventListener("click", () => {
        // Reset everything
        envelope.classList.remove("opened");
        finalActions.style.opacity = "0";
        finalActions.style.pointerEvents = "none";
        
        // Re-set stages
        const activeStage = document.querySelector(".active-stage");
        activeStage.classList.add("stage-hidden");
        activeStage.classList.remove("active-stage");
        activeStage.style.opacity = "0";
        
        // Show intro screen
        const intro = stages.intro;
        intro.classList.remove("stage-hidden");
        
        // Reset box lid styling
        const lid = document.querySelector(".gift-lid");
        lid.style.transform = "none";
        lid.style.opacity = "1";

        setTimeout(() => {
            intro.classList.add("active-stage");
            intro.style.opacity = "1";
            intro.style.transform = "translateY(0)";
            currentCardIndex = 0;
            updateCarousel();
        }, 50);
    });
});
