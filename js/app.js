'use strict';

// ===== GAME CONFIGURATION =====
const CONFIG = {
    version: '2.0.0',
    storageKey: 'guessProData',
    sounds: true,
    animations: true,
    theme: 'dark',
    language: 'en'
};

// ===== GAME STATE =====
const GameState = {
    // Core game
    secretNumber: 0,
    score: 100,
    highScore: 0,
    attempts: 0,
    maxAttempts: Infinity,
    range: { min: 1, max: 100 },
    difficulty: 'classic',
    isPlaying: false,
    
    // Stats
    gamesPlayed: 0,
    gamesWon: 0,
    winStreak: 0,
    bestStreak: 0,
    totalGuesses: 0,
    
    // Timer
    timer: null,
    timeLimit: null,
    timeRemaining: 60,
    startTime: null,
    
    // Power-ups
    powerups: {
        fiftyFifty: 3,
        reveal: 2,
        extraTime: 1,
        skip: 2
    },
    
    // Daily Challenge
    dailyCompleted: false,
    dailyStreak: 0,
    lastDaily: null,
    
    // Achievements
    achievements: {},
    
    // Settings
    soundEnabled: true,
    musicEnabled: false,
    animationsEnabled: true,
    
    // User
    user: null,
    isLoggedIn: false,
    
    // History
    guessHistory: [],
    scoreHistory: []
};

// ===== ACHIEVEMENTS DATA =====
const ACHIEVEMENTS = [
    { id: 'first_win', name: 'First Victory', desc: 'Win your first game', icon: 'fa-trophy', condition: (s) => s.gamesWon >= 1 },
    { id: 'streak_3', name: 'On Fire!', desc: 'Win 3 games in a row', icon: 'fa-fire', condition: (s) => s.winStreak >= 3 },
    { id: 'streak_5', name: 'Unstoppable', desc: 'Win 5 games in a row', icon: 'fa-fire-alt', condition: (s) => s.winStreak >= 5 },
    { id: 'streak_10', name: 'Legend', desc: 'Win 10 games in a row', icon: 'fa-crown', condition: (s) => s.winStreak >= 10 },
    { id: 'games_10', name: 'Getting Started', desc: 'Play 10 games', icon: 'fa-gamepad', condition: (s) => s.gamesPlayed >= 10 },
    { id: 'games_50', name: 'Dedicated Player', desc: 'Play 50 games', icon: 'fa-medal', condition: (s) => s.gamesPlayed >= 50 },
    { id: 'games_100', name: 'Veteran', desc: 'Play 100 games', icon: 'fa-star', condition: (s) => s.gamesPlayed >= 100 },
    { id: 'perfect_3', name: 'Lucky Guess', desc: 'Win in 3 or fewer attempts', icon: 'fa-bullseye', condition: (s) => s.lastAttempts <= 3 && s.lastWin },
    { id: 'perfect_1', name: 'Mind Reader', desc: 'Win on first attempt', icon: 'fa-brain', condition: (s) => s.lastAttempts === 1 && s.lastWin },
    { id: 'score_500', name: 'High Scorer', desc: 'Reach 500 points', icon: 'fa-chart-line', condition: (s) => s.highScore >= 500 },
    { id: 'score_1000', name: 'Point Master', desc: 'Reach 1000 points', icon: 'fa-gem', condition: (s) => s.highScore >= 1000 },
    { id: 'daily_7', name: 'Weekly Warrior', desc: '7 day daily streak', icon: 'fa-calendar-check', condition: (s) => s.dailyStreak >= 7 },
    { id: 'extreme_win', name: 'Extreme Champion', desc: 'Win in Extreme mode', icon: 'fa-skull', condition: (s) => s.extremeWin },
    { id: 'speed_demon', name: 'Speed Demon', desc: 'Win in under 10 seconds', icon: 'fa-bolt', condition: (s) => s.lastTime < 10 && s.lastWin },
    { id: 'no_hints', name: 'No Help Needed', desc: 'Win without using hints', icon: 'fa-hand-paper', condition: (s) => s.noHintsWin }
];

// ===== TRANSLATIONS =====
const TRANSLATIONS = {
    en: {
        'hero-badge': 'Ultimate Gaming Experience',
        'hero-title-1': 'Challenge Your',
        'hero-title-2': 'Mind',
        'hero-desc': 'Test your intuition with our advanced number guessing game.',
        'start-playing': 'Start Playing',
        'tutorial': 'Tutorial',
        'players': 'Players',
        'games-played': 'Games Played',
        'choose-challenge': 'Choose Your Challenge',
        'game': 'Game',
        'modes': 'Modes'
    },
    hi: {
        'hero-badge': 'अल्टीमेट गेमिंग अनुभव',
        'hero-title-1': 'अपने दिमाग को',
        'hero-title-2': 'चुनौती दो',
        'hero-desc': 'हमारे एडवांस्ड नंबर गेसिंग गेम से अपनी इंट्यूशन टेस्ट करो।',
        'start-playing': 'खेलना शुरू करें',
        'tutorial': 'ट्यूटोरियल',
        'players': 'खिलाड़ी',
        'games-played': 'खेले गए गेम्स',
        'choose-challenge': 'अपनी चुनौती चुनें',
        'game': 'गेम',
        'modes': 'मोड्स'
    }
};

// ===== MODE SETTINGS =====
const modeSettings = {
    classic: {
        name: 'Classic Mode',
        range: { min: 1, max: 100 },
        maxAttempts: Infinity,
        timeLimit: null,
        scoreMultiplier: 1,
        hintsAllowed: true,
        difficulty: 'Easy',
        difficultyClass: 'easy'
    },
    timed: {
        name: 'Timed Challenge',
        range: { min: 1, max: 100 },
        maxAttempts: 10,
        timeLimit: 60,
        scoreMultiplier: 3,
        hintsAllowed: true,
        difficulty: 'Medium',
        difficultyClass: 'medium'
    },
    extreme: {
        name: 'Extreme Mode',
        range: { min: 1, max: 500 },
        maxAttempts: 5,
        timeLimit: 30,
        scoreMultiplier: 5,
        hintsAllowed: false,
        difficulty: 'Hard',
        difficultyClass: 'hard'
    },
    daily: {
        name: 'Daily Challenge',
        range: { min: 1, max: 100 },
        maxAttempts: 7,
        timeLimit: 45,
        scoreMultiplier: 4,
        hintsAllowed: true,
        difficulty: 'Special',
        difficultyClass: 'daily'
    },
    custom: {
        name: 'Custom Mode',
        range: { min: 1, max: 100 },
        maxAttempts: 10,
        timeLimit: 60,
        scoreMultiplier: 2,
        hintsAllowed: true,
        difficulty: 'Custom',
        difficultyClass: 'custom'
    }
};

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 GuessPro v' + CONFIG.version + ' Loading...');
    
    // Hide loading screen after delay
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => loadingScreen.remove(), 500);
        }
    }, 2000);
    
    init();
});

// ===== INITIALIZATION =====
function init() {
    loadFromStorage();
    createParticles();
    initChart();
    generateAchievements();
    generateCalendar();
    updateDailyCountdown();
    attachEventListeners();
    updateUI();
    checkFirstVisit();
    
    console.log('✅ Game Initialized!');
}

// ===== EVENT LISTENERS =====
function attachEventListeners() {
    // Play Mode Buttons
    document.getElementById('play-classic')?.addEventListener('click', () => startGame('classic'));
    document.getElementById('play-timed')?.addEventListener('click', () => startGame('timed'));
    document.getElementById('play-extreme')?.addEventListener('click', () => startGame('extreme'));
    document.getElementById('play-custom')?.addEventListener('click', () => startGame('custom'));
    document.getElementById('play-daily')?.addEventListener('click', () => startGame('daily'));
    
    // Game Controls
    document.getElementById('check-btn')?.addEventListener('click', checkGuess);
    document.getElementById('guess-input')?.addEventListener('keypress', e => e.key === 'Enter' && checkGuess());
    document.getElementById('restart-btn')?.addEventListener('click', restartGame);
    document.getElementById('hint-btn')?.addEventListener('click', useHint);
    document.getElementById('quit-btn')?.addEventListener('click', quitGame);
    
    // Power-ups
    document.getElementById('use-5050')?.addEventListener('click', () => usePowerup('fiftyFifty'));
    document.getElementById('use-reveal')?.addEventListener('click', () => usePowerup('reveal'));
    document.getElementById('use-time')?.addEventListener('click', () => usePowerup('extraTime'));
    document.getElementById('use-skip')?.addEventListener('click', () => usePowerup('skip'));
    
    // Modals
    document.getElementById('modal-play-again')?.addEventListener('click', () => { closeModal(); restartGame(); });
    document.getElementById('modal-try-again')?.addEventListener('click', () => { closeModal(); restartGame(); });
    document.getElementById('share-btn')?.addEventListener('click', shareResult);
    document.querySelectorAll('.modal-overlay').forEach(el => el.addEventListener('click', closeModal));
    document.querySelectorAll('.modal-close').forEach(el => el.addEventListener('click', closeModal));
    
    // Navigation
    document.getElementById('hero-play-btn')?.addEventListener('click', () => scrollToSection('game-modes'));
    document.getElementById('nav-play-btn')?.addEventListener('click', () => scrollToSection('game-modes'));
    
    // Theme Toggle
    document.getElementById('theme-btn')?.addEventListener('click', toggleTheme);
    document.getElementById('setting-theme')?.addEventListener('change', toggleTheme);
    
    // Sound Toggle
    document.getElementById('sound-btn')?.addEventListener('click', toggleSound);
    document.getElementById('setting-sound')?.addEventListener('change', toggleSound);
    
    // Language Toggle
    document.getElementById('lang-btn')?.addEventListener('click', toggleLanguage);
    
    // Profile
    document.getElementById('profile-btn')?.addEventListener('click', toggleProfileDropdown);
    document.getElementById('login-btn')?.addEventListener('click', () => openModal('login-modal'));
    document.getElementById('settings-btn')?.addEventListener('click', () => openModal('settings-modal'));
    document.getElementById('export-btn')?.addEventListener('click', exportStatsPDF);
    document.getElementById('export-stats-btn')?.addEventListener('click', exportStatsPDF);
    
    // Tutorial
    document.getElementById('tutorial-btn')?.addEventListener('click', () => openModal('tutorial-modal'));
    document.getElementById('tutorial-next')?.addEventListener('click', nextTutorialSlide);
    document.getElementById('tutorial-prev')?.addEventListener('click', prevTutorialSlide);
    document.getElementById('tutorial-skip')?.addEventListener('click', () => closeModal());
    
    // Auth Forms
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    
    // Custom Mode Sliders
    document.getElementById('custom-range')?.addEventListener('input', updateCustomSettings);
    document.getElementById('custom-time')?.addEventListener('input', updateCustomSettings);
    document.getElementById('custom-attempts')?.addEventListener('input', updateCustomSettings);
    
    // Reset Data
    document.getElementById('reset-data')?.addEventListener('click', resetAllData);
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Navbar Scroll
    window.addEventListener('scroll', () => {
        document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 50);
    });
    
    // Chart Filters
    document.querySelectorAll('.chart-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-filter').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateChart(this.dataset.filter);
        });
    });
    
    console.log('✅ Event Listeners Attached');
}

// ===== KEYBOARD SHORTCUTS =====
function handleKeyboardShortcuts(e) {
    // Don't trigger if typing in input
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key.toLowerCase()) {
        case 'r':
            if (GameState.isPlaying) restartGame();
            break;
        case 'h':
            if (GameState.isPlaying) useHint();
            break;
        case 'escape':
            if (GameState.isPlaying) quitGame();
            closeModal();
            break;
        case 'm':
            toggleSound();
            break;
        case 't':
            toggleTheme();
            break;
        case '?':
            toggleShortcutsHelp();
            break;
    }
}

function toggleShortcutsHelp() {
    const tooltip = document.getElementById('shortcuts-tooltip');
    if (tooltip) {
        tooltip.classList.toggle('show');
        setTimeout(() => tooltip.classList.remove('show'), 5000);
    }
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
        achievement: 'fa-trophy'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    playSound('click');
}

// ===== SOUND SYSTEM =====
function playSound(type) {
    if (!GameState.soundEnabled) return;
    
    const sound = document.getElementById(`sound-${type}`);
    if (sound) {
        sound.currentTime = 0;
        sound.volume = 0.5;
        sound.play().catch(() => {});
    }
}

function toggleSound() {
    GameState.soundEnabled = !GameState.soundEnabled;
    
    const btn = document.getElementById('sound-btn');
    const icon = btn?.querySelector('i');
    if (icon) {
        icon.className = GameState.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    }
    
    showToast(GameState.soundEnabled ? 'Sound ON' : 'Sound OFF', 'info');
    saveToStorage();
}

// ===== THEME SYSTEM =====
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    CONFIG.theme = newTheme;
    
    const btn = document.getElementById('theme-btn');
    const icon = btn?.querySelector('i');
    if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} Theme`, 'info');
    saveToStorage();
}

// ===== LANGUAGE SYSTEM =====
function toggleLanguage() {
    CONFIG.language = CONFIG.language === 'en' ? 'hi' : 'en';
    
    const btn = document.getElementById('lang-btn');
    if (btn) {
        btn.querySelector('span').textContent = CONFIG.language.toUpperCase();
    }
    
    applyTranslations();
    showToast(CONFIG.language === 'en' ? 'English' : 'हिंदी', 'info');
    saveToStorage();
}

function applyTranslations() {
    const trans = TRANSLATIONS[CONFIG.language];
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (trans[key]) {
            el.textContent = trans[key];
        }
    });
}

// ===== POWER-UPS SYSTEM =====
function usePowerup(type) {
    if (!GameState.isPlaying) {
        showToast('Start a game first!', 'warning');
        return;
    }
    
    if (GameState.powerups[type] <= 0) {
        showToast('No power-ups left!', 'error');
        return;
    }
    
    GameState.powerups[type]--;
    updatePowerupDisplay();
    playSound('click');
    
    switch(type) {
        case 'fiftyFifty':
            useFiftyFifty();
            break;
        case 'reveal':
            useReveal();
            break;
        case 'extraTime':
            useExtraTime();
            break;
        case 'skip':
            useSkip();
            break;
    }
    
    saveToStorage();
}

function useFiftyFifty() {
    const current = GameState.range;
    const secret = GameState.secretNumber;
    const mid = Math.floor((current.min + current.max) / 2);
    
    if (secret <= mid) {
        GameState.range.max = mid;
    } else {
        GameState.range.min = mid + 1;
    }
    
    updateElement('range-min', GameState.range.min);
    updateElement('range-max', GameState.range.max);
    
    showToast(`Range narrowed to ${GameState.range.min}-${GameState.range.max}`, 'success');
}

function useReveal() {
    const numStr = GameState.secretNumber.toString();
    const randomIndex = Math.floor(Math.random() * numStr.length);
    const digit = numStr[randomIndex];
    const position = randomIndex === 0 ? 'first' : randomIndex === numStr.length - 1 ? 'last' : `position ${randomIndex + 1}`;
    
    showToast(`Hint: The ${position} digit is ${digit}`, 'success');
}

function useExtraTime() {
    if (!GameState.timeLimit) {
        showToast('Not a timed game!', 'warning');
        GameState.powerups.extraTime++;
        return;
    }
    
    GameState.timeRemaining += 30;
    updateElement('timer-display', GameState.timeRemaining);
    showToast('+30 seconds added!', 'success');
}

function useSkip() {
    showToast('Game skipped! No penalty.', 'info');
    startGame(GameState.difficulty);
}

function updatePowerupDisplay() {
    updateElement('powerup-5050', GameState.powerups.fiftyFifty);
    updateElement('powerup-reveal', GameState.powerups.reveal);
    updateElement('powerup-time', GameState.powerups.extraTime);
    updateElement('powerup-skip', GameState.powerups.skip);
    
    updateElement('game-5050', GameState.powerups.fiftyFifty);
    updateElement('game-reveal', GameState.powerups.reveal);
    updateElement('game-time', GameState.powerups.extraTime);
    updateElement('game-skip', GameState.powerups.skip);
}

// ===== ACHIEVEMENTS SYSTEM =====
function generateAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    ACHIEVEMENTS.forEach(ach => {
        const unlocked = GameState.achievements[ach.id];
        const card = document.createElement('div');
        card.className = `achievement-card ${unlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <div class="achievement-icon">
                <i class="fas ${ach.icon}"></i>
            </div>
            <div class="achievement-info">
                <h4>${ach.name}</h4>
                <p>${ach.desc}</p>
            </div>
            ${unlocked ? '<div class="achievement-check"><i class="fas fa-check"></i></div>' : ''}
        `;
        grid.appendChild(card);
    });
    
    updateAchievementProgress();
}

function checkAchievements() {
    let newUnlock = null;
    
    ACHIEVEMENTS.forEach(ach => {
        if (!GameState.achievements[ach.id] && ach.condition(GameState)) {
            GameState.achievements[ach.id] = true;
            newUnlock = ach;
        }
    });
    
    if (newUnlock) {
        showToast(`🏆 Achievement: ${newUnlock.name}`, 'achievement', 5000);
        playSound('achievement');
        
        // Show in win modal
        const modalAch = document.getElementById('modal-achievement');
        const achName = document.getElementById('achievement-name');
        if (modalAch && achName) {
            achName.textContent = newUnlock.name;
            modalAch.style.display = 'flex';
        }
        
        generateAchievements();
    }
    
    saveToStorage();
}

function updateAchievementProgress() {
    const total = ACHIEVEMENTS.length;
    const unlocked = Object.keys(GameState.achievements).length;
    const percent = Math.round((unlocked / total) * 100);
    
    updateElement('unlocked-count', unlocked);
    updateElement('total-achievements', total);
    updateElement('achievement-percent', percent + '%');
    
    const progress = document.getElementById('achievement-progress');
    if (progress) progress.style.width = percent + '%';
    
    updateElement('hero-badges', unlocked);
}

// ===== DAILY CHALLENGE =====
function generateCalendar() {
    const container = document.getElementById('calendar-days');
    if (!container) return;
    
    container.innerHTML = '';
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    
    days.forEach((day, index) => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        // Mark completed days (simplified)
        if (index < GameState.dailyStreak % 7) {
            dayEl.classList.add('completed');
        }
        if (index === (today === 0 ? 6 : today - 1)) {
            dayEl.classList.add('today');
        }
        
        dayEl.innerHTML = `
            <span class="day-name">${day}</span>
            <span class="day-status"><i class="fas ${dayEl.classList.contains('completed') ? 'fa-check' : 'fa-circle'}"></i></span>
        `;
        container.appendChild(dayEl);
    });
}

function updateDailyCountdown() {
    const countdownEl = document.getElementById('daily-countdown');
    if (!countdownEl) return;
    
    function update() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diff = tomorrow - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        countdownEl.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    update();
    setInterval(update, 1000);
}

// ===== CUSTOM MODE =====
function updateCustomSettings() {
    const range = document.getElementById('custom-range')?.value || 100;
    const time = document.getElementById('custom-time')?.value || 60;
    const attempts = document.getElementById('custom-attempts')?.value || 10;
    
    updateElement('range-value', `1-${range}`);
    updateElement('time-value', time == 0 ? '∞' : time);
    updateElement('attempts-value', attempts);
    
    modeSettings.custom.range.max = parseInt(range);
    modeSettings.custom.timeLimit = parseInt(time) || null;
    modeSettings.custom.maxAttempts = parseInt(attempts);
}

// ===== EXPORT STATS =====
function exportStatsPDF() {
    const element = document.getElementById('dashboard-content');
    if (!element) {
        showToast('Nothing to export!', 'error');
        return;
    }
    
    showToast('Generating PDF...', 'info');
    
    const opt = {
        margin: 10,
        filename: 'GuessPro_Stats.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
        showToast('PDF Downloaded!', 'success');
    });
}

// ===== SHARE RESULT =====
function shareResult() {
    const text = `🎮 GuessPro Score!\n\n🔢 Number: ${GameState.secretNumber}\n🎯 Attempts: ${GameState.attempts}\n⭐ Score: ${GameState.score}\n🔥 Streak: x${GameState.winStreak}\n\nCan you beat my score? Play now!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'GuessPro Score',
            text: text,
            url: window.location.href
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Result copied to clipboard!', 'success');
        });
    }
}

// ===== TUTORIAL SYSTEM =====
let tutorialCurrentSlide = 1;
const tutorialTotalSlides = 6;

function initTutorial() {
    const dots = document.getElementById('tutorial-dots');
    if (!dots) return;
    
    // Clear and regenerate dots
    dots.innerHTML = '';
    for (let i = 1; i <= tutorialTotalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = `dot ${i === 1 ? 'active' : ''}`;
        dot.dataset.slide = i;
        dot.addEventListener('click', () => goToSlide(i));
        dots.appendChild(dot);
    }
    
    updateTutorialUI();
}

function goToSlide(slideNum) {
    if (slideNum < 1 || slideNum > tutorialTotalSlides) return;
    
    tutorialCurrentSlide = slideNum;
    updateTutorialUI();
    playSound('click');
}

function nextSlide() {
    if (tutorialCurrentSlide < tutorialTotalSlides) {
        tutorialCurrentSlide++;
        updateTutorialUI();
        playSound('click');
    }
}

function prevSlide() {
    if (tutorialCurrentSlide > 1) {
        tutorialCurrentSlide--;
        updateTutorialUI();
        playSound('click');
    }
}

function updateTutorialUI() {
    // Update slides position
    const slidesContainer = document.getElementById('tutorial-slides');
    if (slidesContainer) {
        const offset = (tutorialCurrentSlide - 1) * -100;
        slidesContainer.style.transform = `translateX(${offset}%)`;
    }
    
    // Update active slide
    document.querySelectorAll('.tutorial-slide').forEach((slide, index) => {
        slide.classList.toggle('active', index + 1 === tutorialCurrentSlide);
    });
    
    // Update dots
    document.querySelectorAll('.tutorial-dots .dot').forEach((dot, index) => {
        dot.classList.toggle('active', index + 1 === tutorialCurrentSlide);
        dot.classList.toggle('completed', index + 1 < tutorialCurrentSlide);
    });
    
    // Update progress
    const progressFill = document.getElementById('tutorial-progress-fill');
    if (progressFill) {
        const progress = (tutorialCurrentSlide / tutorialTotalSlides) * 100;
        progressFill.style.width = `${progress}%`;
    }
    
    // Update step counter
    document.getElementById('current-step').textContent = tutorialCurrentSlide;
    document.getElementById('total-steps').textContent = tutorialTotalSlides;
    
    // Update navigation buttons
    const prevBtn = document.getElementById('tutorial-prev');
    const nextBtn = document.getElementById('tutorial-next');
    
    if (prevBtn) {
        prevBtn.disabled = tutorialCurrentSlide === 1;
    }
    
    if (nextBtn) {
        if (tutorialCurrentSlide === tutorialTotalSlides) {
            nextBtn.innerHTML = '<span>Finish</span><i class="fas fa-check"></i>';
            nextBtn.onclick = closeTutorial;
        } else {
            nextBtn.innerHTML = '<span>Next</span><i class="fas fa-chevron-right"></i>';
            nextBtn.onclick = nextSlide;
        }
    }
}

function openTutorial() {
    const modal = document.getElementById('tutorial-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        tutorialCurrentSlide = 1;
        initTutorial();
    }
}

function closeTutorial() {
    const modal = document.getElementById('tutorial-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Open tutorial button
    document.getElementById('tutorial-btn')?.addEventListener('click', openTutorial);
    
    // Close button
    document.getElementById('close-tutorial')?.addEventListener('click', closeTutorial);
    
    // Overlay click
    document.querySelector('.tutorial-overlay')?.addEventListener('click', closeTutorial);
    
    // Navigation
    document.getElementById('tutorial-prev')?.addEventListener('click', prevSlide);
    document.getElementById('tutorial-next')?.addEventListener('click', nextSlide);
    
    // Skip
    document.getElementById('tutorial-skip')?.addEventListener('click', closeTutorial);
    
    // Start Playing button
    document.getElementById('start-playing-btn')?.addEventListener('click', function() {
        closeTutorial();
        scrollToSection('game-modes');
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('tutorial-modal');
        if (!modal?.classList.contains('show')) return;
        
        switch(e.key) {
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                break;
            case 'Escape':
                closeTutorial();
                break;
        }
    });
    
    // Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    const slidesWrapper = document.querySelector('.tutorial-slides-wrapper');
    if (slidesWrapper) {
        slidesWrapper.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        slidesWrapper.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
    }
    
    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide(); // Swipe left = next
            } else {
                prevSlide(); // Swipe right = prev
            }
        }
    }
    
    // Auto-show tutorial for first-time visitors
    if (!localStorage.getItem('tutorialCompleted')) {
        setTimeout(openTutorial, 2000);
    }
});

// Mark tutorial as completed
function completeTutorial() {
    localStorage.setItem('tutorialCompleted', 'true');
    closeTutorial();
    showToast('Tutorial completed! Ready to play! 🎮', 'success');
}

// Global functions
window.openTutorial = openTutorial;
window.closeTutorial = closeTutorial;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;

// ===== AUTH SYSTEM =====
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.getElementById('login-form')?.classList.toggle('hidden', tab !== 'login');
    document.getElementById('register-form')?.classList.toggle('hidden', tab !== 'register');
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username')?.value;
    const password = document.getElementById('login-password')?.value;
    
    if (username && password) {
        GameState.user = { username, email: username + '@guest.com' };
        GameState.isLoggedIn = true;
        updateProfileUI();
        closeModal();
        showToast(`Welcome back, ${username}!`, 'success');
        saveToStorage();
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username')?.value;
    const email = document.getElementById('register-email')?.value;
    const password = document.getElementById('register-password')?.value;
    
    if (username && email && password) {
        GameState.user = { username, email };
        GameState.isLoggedIn = true;
        updateProfileUI();
        closeModal();
        showToast(`Welcome, ${username}!`, 'success');
        saveToStorage();
    }
}

function handleLogout() {
    GameState.user = null;
    GameState.isLoggedIn = false;
    updateProfileUI();
    toggleProfileDropdown();
    showToast('Logged out successfully', 'info');
    saveToStorage();
}

function updateProfileUI() {
    const name = GameState.user?.username || 'Guest';
    const email = GameState.user?.email || 'Click to login';
    const avatar = `https://ui-avatars.com/api/?name=${name}&background=667eea&color=fff`;
    
    updateElement('profile-name', name);
    updateElement('dropdown-name', name);
    updateElement('dropdown-email', email);
    
    document.getElementById('profile-avatar')?.setAttribute('src', avatar);
    document.getElementById('dropdown-avatar')?.setAttribute('src', avatar);
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.style.display = GameState.isLoggedIn ? 'flex' : 'none';
    }
}

function toggleProfileDropdown() {
    document.getElementById('profile-dropdown')?.classList.toggle('show');
}

// ===== RESET DATA =====
function resetAllData() {
    if (confirm('Are you sure? This will delete all your progress!')) {
        localStorage.removeItem(CONFIG.storageKey);
        localStorage.removeItem('guessProVisited');
        location.reload();
    }
}

// ===== CORE GAME FUNCTIONS =====
// (Include all the previous game functions: startGame, checkGuess, handleWin, handleLose, etc.)
// ... Copy from previous code ...

function startGame(mode) {
    console.log('🚀 Starting:', mode);
    
    const settings = modeSettings[mode];
    if (!settings) return;
    
    // Clear timer
    if (GameState.timer) clearInterval(GameState.timer);
    
    // Set state
    GameState.difficulty = mode;
    GameState.range = { ...settings.range };
    GameState.maxAttempts = settings.maxAttempts;
    GameState.timeLimit = settings.timeLimit;
    GameState.timeRemaining = settings.timeLimit || 999;
    GameState.score = 100 * settings.scoreMultiplier;
    GameState.attempts = 0;
    GameState.guessHistory = [];
    GameState.isPlaying = true;
    GameState.startTime = Date.now();
    GameState.hintsUsed = false;
    
    // Generate number
    GameState.secretNumber = Math.floor(Math.random() * (settings.range.max - settings.range.min + 1)) + settings.range.min;
    console.log('🔢 Secret:', GameState.secretNumber);
    
    // Update UI
    updateElement('current-mode', settings.name);
    document.getElementById('difficulty-badge').innerHTML = `<span class="${settings.difficultyClass}">${settings.difficulty}</span>`;
    updateElement('secret-number', '?');
    updateElement('range-min', GameState.range.min);
    updateElement('range-max', GameState.range.max);
    updateElement('score-display', GameState.score);
    updateElement('attempts-display', '0');
    updateElement('max-attempts', GameState.maxAttempts === Infinity ? '∞' : GameState.maxAttempts);
    updateElement('streak-display', 'x' + GameState.winStreak);
    updateElement('message-text', 'Start guessing!');
    updateElement('timer-display', settings.timeLimit || '∞');
    
    // Reset classes
    document.getElementById('number-circle')?.classList.remove('win', 'lose');
    document.getElementById('message-display').className = 'message-display';
    document.getElementById('hint-arrow').className = 'hint-arrow';
    document.getElementById('history-list').innerHTML = '<p class="history-empty">No guesses yet</p>';
    document.getElementById('attempts-fill').style.width = '0%';
    
    // Enable inputs
    const input = document.getElementById('guess-input');
    const btn = document.getElementById('check-btn');
    if (input) { input.disabled = false; input.value = ''; }
    if (btn) btn.disabled = false;
    
    // Hint button
    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
        hintBtn.disabled = !settings.hintsAllowed;
        hintBtn.style.opacity = settings.hintsAllowed ? '1' : '0.5';
    }
    
    // Timer
    if (settings.timeLimit) startTimer();
    
    // Scroll & focus
    scrollToSection('game-panel');
    setTimeout(() => input?.focus(), 500);
    
    playSound('click');
}

function checkGuess() {
    if (!GameState.isPlaying) return;
    
    const input = document.getElementById('guess-input');
    const guess = parseInt(input?.value);
    
    if (isNaN(guess) || guess < GameState.range.min || guess > GameState.range.max) {
        showMessage(`Enter ${GameState.range.min}-${GameState.range.max}`, 'warning');
        shakeElement(input);
        playSound('wrong');
        return;
    }
    
    GameState.attempts++;
    GameState.totalGuesses++;
    updateElement('attempts-display', GameState.attempts);
    
    // Progress bar
    if (GameState.maxAttempts !== Infinity) {
        const pct = (GameState.attempts / GameState.maxAttempts) * 100;
        const fill = document.getElementById('attempts-fill');
        if (fill) {
            fill.style.width = pct + '%';
            fill.style.background = pct > 70 ? 'linear-gradient(135deg,#fc8181,#f56565)' : pct > 50 ? 'linear-gradient(135deg,#f6ad55,#ed8936)' : '';
        }
    }
    
    if (guess === GameState.secretNumber) {
        handleWin();
    } else if (guess > GameState.secretNumber) {
        handleWrong(guess, 'high');
    } else {
        handleWrong(guess, 'low');
    }
    
    input.value = '';
    input.focus();
}

function handleWin() {
    GameState.isPlaying = false;
    GameState.gamesPlayed++;
    GameState.gamesWon++;
    GameState.winStreak++;
    GameState.lastWin = true;
    GameState.lastAttempts = GameState.attempts;
    GameState.lastTime = Math.floor((Date.now() - GameState.startTime) / 1000);
    GameState.noHintsWin = !GameState.hintsUsed;
    if (GameState.difficulty === 'extreme') GameState.extremeWin = true;
    
    if (GameState.winStreak > GameState.bestStreak) GameState.bestStreak = GameState.winStreak;
    if (GameState.timeLimit) GameState.score += Math.floor(GameState.timeRemaining * 2);
    if (GameState.score > GameState.highScore) GameState.highScore = GameState.score;
    
    GameState.scoreHistory.push(GameState.score);
    if (GameState.timer) clearInterval(GameState.timer);
    
    updateElement('secret-number', GameState.secretNumber);
    document.getElementById('number-circle')?.classList.add('win');
    showMessage('🎉 Correct!', 'correct');
    addHistory(GameState.secretNumber, 'correct');
    
    document.getElementById('guess-input').disabled = true;
    document.getElementById('check-btn').disabled = true;
    
    playSound('win');
    checkAchievements();
    saveToStorage();
    updateDashboard();
    
    setTimeout(() => showWinModal(), 600);
}

function handleWrong(guess, type) {
    GameState.score -= 5;
    GameState.lastWin = false;
    updateElement('score-display', GameState.score);
    
    showMessage(type === 'high' ? '📈 Too High!' : '📉 Too Low!', type === 'high' ? 'too-high' : 'too-low');
    updateHint(type === 'high' ? 'down' : 'up');
    addHistory(guess, type);
    playSound('wrong');
    
    if (GameState.score <= 0 || GameState.attempts >= GameState.maxAttempts) {
        handleLose();
    }
}

function handleLose() {
    GameState.isPlaying = false;
    GameState.gamesPlayed++;
    GameState.winStreak = 0;
    GameState.lastWin = false;
    
    if (GameState.timer) clearInterval(GameState.timer);
    
    updateElement('secret-number', GameState.secretNumber);
    document.getElementById('number-circle')?.classList.add('lose');
    showMessage('💔 Game Over!', 'too-high');
    
    document.getElementById('guess-input').disabled = true;
    document.getElementById('check-btn').disabled = true;
    
    playSound('lose');
    saveToStorage();
    updateDashboard();
    
    setTimeout(() => showLoseModal(), 600);
}

function showMessage(text, type) {
    const display = document.getElementById('message-display');
    const textEl = document.getElementById('message-text');
    const icon = display?.querySelector('.message-icon i');
    
    if (textEl) textEl.textContent = text;
    if (display) display.className = 'message-display ' + type;
    if (icon) {
        icon.className = type === 'too-high' ? 'fas fa-arrow-up' : type === 'too-low' ? 'fas fa-arrow-down' : type === 'correct' ? 'fas fa-check-circle' : 'fas fa-lightbulb';
    }
}

function updateHint(dir) {
    const arrow = document.getElementById('hint-arrow');
    const text = document.getElementById('hint-text');
    if (arrow) {
        arrow.className = 'hint-arrow ' + dir;
        arrow.innerHTML = `<i class="fas fa-arrow-${dir === 'up' ? 'up' : 'down'}"></i>`;
    }
    if (text) text.textContent = dir === 'up' ? 'Go Higher!' : 'Go Lower!';
}

function addHistory(num, type) {
    const list = document.getElementById('history-list');
    if (!list) return;
    list.querySelector('.history-empty')?.remove();
    
    const item = document.createElement('div');
    item.className = `history-item ${type}`;
    item.innerHTML = `<i class="fas fa-${type === 'high' ? 'arrow-up' : type === 'low' ? 'arrow-down' : 'check'}"></i><span>${num}</span>`;
    list.appendChild(item);
    list.scrollLeft = list.scrollWidth;
}

function startTimer() {
    const display = document.getElementById('timer-display');
    const progress = document.getElementById('timer-progress');
    const total = GameState.timeLimit;
    const circ = 2 * Math.PI * 45;
    
    if (progress) {
        progress.style.strokeDasharray = circ;
        progress.style.strokeDashoffset = 0;
        progress.classList.remove('warning', 'danger');
    }
    
    GameState.timer = setInterval(() => {
        if (!GameState.isPlaying) { clearInterval(GameState.timer); return; }
        GameState.timeRemaining--;
        if (display) display.textContent = GameState.timeRemaining;
        if (progress) {
            progress.style.strokeDashoffset = circ - (GameState.timeRemaining / total) * circ;
            if (GameState.timeRemaining <= 10) progress.classList.add('danger');
            else if (GameState.timeRemaining <= 20) progress.classList.add('warning');
        }
        if (GameState.timeRemaining <= 0) { clearInterval(GameState.timer); handleLose(); }
    }, 1000);
}

function useHint() {
    if (!GameState.isPlaying) return;
    if (!modeSettings[GameState.difficulty]?.hintsAllowed) { showToast('No hints in this mode!', 'warning'); return; }
    if (GameState.score <= 10) { showToast('Not enough score!', 'warning'); return; }
    
    GameState.score -= 10;
    GameState.hintsUsed = true;
    updateElement('score-display', GameState.score);
    
    const hint = GameState.secretNumber % 2 === 0 ? 'Number is EVEN' : 'Number is ODD';
    showMessage('💡 ' + hint, '');
    playSound('click');
}

function restartGame() { closeModal(); startGame(GameState.difficulty || 'classic'); }
function quitGame() { GameState.isPlaying = false; if (GameState.timer) clearInterval(GameState.timer); scrollToSection('game-modes'); }

function showWinModal() {
    updateElement('modal-number', GameState.secretNumber);
    updateElement('modal-attempts', GameState.attempts);
    updateElement('modal-score', GameState.score);
    updateElement('modal-time', GameState.lastTime + 's');
    document.getElementById('modal-achievement').style.display = 'none';
    openModal('win-modal');
    createConfetti();
}

function showLoseModal() {
    updateElement('reveal-number', GameState.secretNumber);
    openModal('lose-modal');
}

function openModal(id) { document.getElementById(id)?.classList.add('show'); }
function closeModal() { document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show')); }

// ===== UTILITY FUNCTIONS =====
function updateElement(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function scrollToSection(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
function shakeElement(el) { if (!el) return; el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 500); }

function createConfetti() {
    const c = document.getElementById('confetti');
    if (!c) return;
    c.innerHTML = '';
    const colors = ['#667eea', '#f093fb', '#4fd1c7', '#f6ad55', '#48bb78', '#ffd700'];
    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-piece';
        p.style.cssText = `left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};animation-delay:${Math.random()*2}s;`;
        c.appendChild(p);
    }
}

function createParticles() {
    const c = document.getElementById('particles');
    if (!c) return;
    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*3}s;`;
        c.appendChild(p);
    }
}

// ===== DASHBOARD & CHART =====
function updateDashboard() {
    const rate = GameState.gamesPlayed > 0 ? Math.round((GameState.gamesWon / GameState.gamesPlayed) * 100) : 0;
    
    updateElement('accuracy-percent', rate);
    updateElement('total-guesses', GameState.gamesPlayed);
    updateElement('correct-guesses', GameState.gamesWon);
    updateElement('current-streak', 'x' + GameState.winStreak);
    updateElement('best-streak', 'x' + GameState.bestStreak);
    updateElement('total-games', GameState.gamesPlayed);
    updateElement('games-won', GameState.gamesWon);
    updateElement('high-score-display', GameState.highScore);
    updateElement('win-rate', rate + '%');
    updateElement('hero-highscore', GameState.highScore);
    updateElement('hero-streak', 'x' + GameState.winStreak);
    updateElement('daily-streak', GameState.dailyStreak);
    
    const prog = document.getElementById('accuracy-progress');
    if (prog) {
        const circ = 2 * Math.PI * 80;
        prog.style.strokeDasharray = circ;
        prog.style.strokeDashoffset = circ - (rate / 100) * circ;
    }
    
    updateChartData();
    updatePowerupDisplay();
    updateProfileUI();
}

let scoreChart = null;
function initChart() {
    const ctx = document.getElementById('scoreChart');
    if (!ctx) return;
    const grad = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0, 'rgba(102,126,234,0.5)');
    grad.addColorStop(1, 'rgba(102,126,234,0)');
    scoreChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Score', data: [], borderColor: '#667eea', backgroundColor: grad, borderWidth: 3, fill: true, tension: 0.4, pointRadius: 5 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#718096' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#718096' }, beginAtZero: true } } }
    });
    updateChartData();
}

function updateChartData() {
    if (!scoreChart) return;
    const h = GameState.scoreHistory.slice(-10);
    scoreChart.data.labels = h.map((_, i) => `G${i + 1}`);
    scoreChart.data.datasets[0].data = h;
    scoreChart.update();
}

function updateChart(filter) {
    if (!scoreChart) return;
    const d = filter === 'week' ? GameState.scoreHistory.slice(-7) : filter === 'month' ? GameState.scoreHistory.slice(-30) : GameState.scoreHistory;
    scoreChart.data.labels = d.map((_, i) => `G${i + 1}`);
    scoreChart.data.datasets[0].data = d;
    scoreChart.update();
}

// ===== STORAGE =====
function loadFromStorage() {
    try {
        const d = JSON.parse(localStorage.getItem(CONFIG.storageKey));
        if (d) {
            Object.assign(GameState, d);
            CONFIG.theme = d.theme || 'dark';
            CONFIG.language = d.language || 'en';
            document.documentElement.setAttribute('data-theme', CONFIG.theme);
            applyTranslations();
        }
    } catch (e) {}
}

function saveToStorage() {
    const d = {
        highScore: GameState.highScore,
        gamesPlayed: GameState.gamesPlayed,
        gamesWon: GameState.gamesWon,
        winStreak: GameState.winStreak,
        bestStreak: GameState.bestStreak,
        totalGuesses: GameState.totalGuesses,
        dailyStreak: GameState.dailyStreak,
        powerups: GameState.powerups,
        achievements: GameState.achievements,
        scoreHistory: GameState.scoreHistory.slice(-50),
        user: GameState.user,
        isLoggedIn: GameState.isLoggedIn,
        soundEnabled: GameState.soundEnabled,
        theme: CONFIG.theme,
        language: CONFIG.language
    };
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(d));
}

function updateUI() {
    updateDashboard();
    updatePowerupDisplay();
    generateAchievements();
    updateProfileUI();
    
    document.getElementById('theme-btn').querySelector('i').className = CONFIG.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    document.getElementById('sound-btn').querySelector('i').className = GameState.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    document.getElementById('lang-btn').querySelector('span').textContent = CONFIG.language.toUpperCase();
}

function animateHeroStats() {
    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        let current = 0;
        const step = target / 100;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.floor(current).toLocaleString();
        }, 20);
    });
}

// Make global
window.startGame = startGame;
window.restartGame = restartGame;
window.closeModal = closeModal;

console.log('📜 GuessPro App Loaded');
// ===== AUTH SYSTEM =====
function initAuth() {
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });
    
    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
    
    // Password strength checker
    const registerPassword = document.getElementById('register-password');
    if (registerPassword) {
        registerPassword.addEventListener('input', checkPasswordStrength);
    }
    
    // Confirm password
    const confirmPassword = document.getElementById('register-confirm');
    if (confirmPassword) {
        confirmPassword.addEventListener('input', checkPasswordMatch);
    }
    
    // Form submissions
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('forgot-form')?.addEventListener('submit', handleForgotPassword);
    
    // Guest login
    document.getElementById('guest-login')?.addEventListener('click', handleGuestLogin);
    
    // Forgot password link
    document.querySelector('.forgot-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showForgotForm();
    });
    
    // Back to login
    document.getElementById('back-to-login')?.addEventListener('click', showLoginForm);
    
    // Open/Close
    document.getElementById('login-btn')?.addEventListener('click', openAuthModal);
    document.getElementById('auth-close')?.addEventListener('click', closeAuthModal);
    document.querySelector('.auth-overlay')?.addEventListener('click', closeAuthModal);
}

function switchAuthTab(tab) {
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    
    // Update forms
    document.getElementById('login-form')?.classList.toggle('hidden', tab !== 'login');
    document.getElementById('register-form')?.classList.toggle('hidden', tab !== 'register');
    document.getElementById('forgot-form')?.classList.add('hidden');
    
    // Move indicator
    const indicator = document.querySelector('.tab-indicator');
    if (indicator) {
        indicator.style.left = tab === 'login' ? '5px' : 'calc(50%)';
    }
}

function checkPasswordStrength() {
    const password = document.getElementById('register-password').value;
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    
    let strength = 0;
    const requirements = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
    
    // Update requirement indicators
    document.getElementById('req-length')?.classList.toggle('met', requirements.length);
    document.getElementById('req-upper')?.classList.toggle('met', requirements.upper);
    document.getElementById('req-number')?.classList.toggle('met', requirements.number);
    document.getElementById('req-special')?.classList.toggle('met', requirements.special);
    
    // Calculate strength
    strength = Object.values(requirements).filter(Boolean).length;
    
    // Update UI
    strengthFill.className = 'strength-fill';
    if (strength === 1) {
        strengthFill.classList.add('weak');
        strengthText.textContent = 'Weak';
    } else if (strength === 2) {
        strengthFill.classList.add('fair');
        strengthText.textContent = 'Fair';
    } else if (strength === 3) {
        strengthFill.classList.add('good');
        strengthText.textContent = 'Good';
    } else if (strength === 4) {
        strengthFill.classList.add('strong');
        strengthText.textContent = 'Strong';
    } else {
        strengthText.textContent = 'Password strength';
    }
}

function checkPasswordMatch() {
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const status = document.querySelector('#register-confirm').nextElementSibling;
    const error = document.getElementById('register-confirm-error');
    
    if (confirm.length > 0) {
        if (password === confirm) {
            status?.classList.add('valid');
            status?.classList.remove('invalid');
            if (error) error.textContent = '';
        } else {
            status?.classList.add('invalid');
            status?.classList.remove('valid');
            if (error) error.textContent = 'Passwords do not match';
        }
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Show loading
    const btn = e.target.querySelector('.btn-auth-submit');
    btn.classList.add('loading');
    
    // Simulate API call
    setTimeout(() => {
        btn.classList.remove('loading');
        
        // Save user
        GameState.user = { email, name: email.split('@')[0] };
        GameState.isLoggedIn = true;
        saveToStorage();
        updateProfileUI();
        
        closeAuthModal();
        showToast(`Welcome back, ${GameState.user.name}!`, 'success');
    }, 1500);
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    const btn = e.target.querySelector('.btn-auth-submit');
    btn.classList.add('loading');
    
    setTimeout(() => {
        btn.classList.remove('loading');
        
        GameState.user = { name: username, email };
        GameState.isLoggedIn = true;
        saveToStorage();
        updateProfileUI();
        
        closeAuthModal();
        showToast(`Welcome, ${username}! Account created.`, 'success');
    }, 1500);
}

function handleGuestLogin() {
    GameState.user = { name: 'Guest', email: 'guest@guesspro.com' };
    GameState.isLoggedIn = false;
    updateProfileUI();
    closeAuthModal();
    showToast('Playing as Guest', 'info');
}

function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    showToast(`Reset link sent to ${email}`, 'success');
    showLoginForm();
}

function showForgotForm() {
    document.getElementById('login-form')?.classList.add('hidden');
    document.getElementById('register-form')?.classList.add('hidden');
    document.getElementById('forgot-form')?.classList.remove('hidden');
}

function showLoginForm() {
    switchAuthTab('login');
}

function openAuthModal() {
    document.getElementById('auth-modal')?.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    document.getElementById('auth-modal')?.classList.remove('show');
    document.body.style.overflow = '';
}


// ===== SETTINGS SYSTEM =====
function initSettings() {
    // Navigation
    document.querySelectorAll('.settings-nav .nav-item').forEach(item => {
        item.addEventListener('click', () => switchSettingsSection(item.dataset.section));
    });
    
    // Close
    document.getElementById('settings-close')?.addEventListener('click', closeSettingsModal);
    document.getElementById('cancel-settings')?.addEventListener('click', closeSettingsModal);
    document.querySelector('.settings-overlay')?.addEventListener('click', closeSettingsModal);
    
    // Save
    document.getElementById('save-settings')?.addEventListener('click', saveSettings);
    document.getElementById('reset-settings')?.addEventListener('click', resetSettings);
    
    // Theme options
    document.querySelectorAll('input[name="theme"]').forEach(input => {
        input.addEventListener('change', () => changeTheme(input.value));
    });
    
    // Accent color
    document.querySelectorAll('input[name="accent"]').forEach(input => {
        input.addEventListener('change', () => changeAccentColor(input.value));
    });
    
    // Custom color
    document.getElementById('custom-color')?.addEventListener('input', (e) => {
        changeAccentColor(e.target.value);
    });
    
    // Sliders
    document.getElementById('font-size')?.addEventListener('input', (e) => {
        document.getElementById('font-size-value').textContent = e.target.value + 'px';
    });
    
    document.getElementById('master-volume')?.addEventListener('input', (e) => {
        e.target.nextElementSibling.textContent = e.target.value + '%';
    });
    
    document.getElementById('sfx-volume')?.addEventListener('input', (e) => {
        e.target.nextElementSibling.textContent = e.target.value + '%';
    });
    
    // Test sound
    document.getElementById('test-sound')?.addEventListener('click', () => {
        playSound('click');
        showToast('Sound test!', 'info');
    });
    
    // Avatar
    document.getElementById('change-avatar')?.addEventListener('click', () => {
        document.getElementById('avatar-input')?.click();
    });
    
    document.getElementById('avatar-input')?.addEventListener('change', handleAvatarChange);
    
    // Bio counter
    document.getElementById('settings-bio')?.addEventListener('input', (e) => {
        document.getElementById('bio-count').textContent = e.target.value.length;
    });
    
    // Expand/Collapse
    document.querySelectorAll('.btn-expand').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = document.getElementById(this.dataset.expand);
            if (target) {
                target.classList.toggle('expanded');
                this.classList.toggle('expanded');
            }
        });
    });
    
    // Import area
    const importArea = document.getElementById('import-area');
    if (importArea) {
        importArea.addEventListener('click', () => document.getElementById('import-input')?.click());
        importArea.addEventListener('dragover', (e) => { e.preventDefault(); importArea.classList.add('dragover'); });
        importArea.addEventListener('dragleave', () => importArea.classList.remove('dragover'));
        importArea.addEventListener('drop', handleFileDrop);
    }
    
    // Export buttons
    document.getElementById('export-json')?.addEventListener('click', exportJSON);
    document.getElementById('export-pdf')?.addEventListener('click', exportStatsPDF);
    
    // Clear data buttons
    document.getElementById('clear-history')?.addEventListener('click', () => {
        if (confirm('Clear game history?')) {
            GameState.scoreHistory = [];
            saveToStorage();
            showToast('History cleared', 'success');
        }
    });
    
    document.getElementById('clear-achievements')?.addEventListener('click', () => {
        if (confirm('Reset all achievements?')) {
            GameState.achievements = {};
            saveToStorage();
            generateAchievements();
            showToast('Achievements reset', 'success');
        }
    });
    
    document.getElementById('clear-all')?.addEventListener('click', () => {
        if (confirm('DELETE ALL DATA? This cannot be undone!')) {
            localStorage.removeItem('guessProData');
            location.reload();
        }
    });
    
    // Delete account
    document.getElementById('delete-account')?.addEventListener('click', () => {
        if (confirm('DELETE YOUR ACCOUNT? All data will be lost forever!')) {
            localStorage.clear();
            location.reload();
        }
    });
}

function switchSettingsSection(section) {
    // Update nav
    document.querySelectorAll('.settings-nav .nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });
    
    // Update sections
    document.querySelectorAll('.settings-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === `section-${section}`);
    });
}

function openSettingsModal() {
    document.getElementById('settings-modal')?.classList.add('show');
    document.body.style.overflow = 'hidden';
    loadSettingsValues();
}

function closeSettingsModal() {
    document.getElementById('settings-modal')?.classList.remove('show');
    document.body.style.overflow = '';
}

function loadSettingsValues() {
    // Load saved values into form
    const name = GameState.user?.name || 'Player';
    document.getElementById('settings-name').value = name;
    document.getElementById('settings-avatar').src = `https://ui-avatars.com/api/?name=${name}&background=667eea&color=fff&size=150`;
}

function saveSettings() {
    // Collect all settings
    const settings = {
        name: document.getElementById('settings-name')?.value,
        username: document.getElementById('settings-username')?.value,
        email: document.getElementById('settings-email')?.value,
        bio: document.getElementById('settings-bio')?.value,
        theme: document.querySelector('input[name="theme"]:checked')?.value,
        animations: document.getElementById('toggle-animations')?.checked,
        sounds: document.getElementById('toggle-sound')?.checked || GameState.soundEnabled,
        masterVolume: document.getElementById('master-volume')?.value,
        language: document.getElementById('language-select')?.value
    };
    
    // Update state
    if (settings.name) {
        GameState.user = { ...GameState.user, name: settings.name };
    }
    
    saveToStorage();
    updateProfileUI();
    closeSettingsModal();
    showToast('Settings saved!', 'success');
}

function resetSettings() {
    if (confirm('Reset all settings to default?')) {
        // Reset form values
        document.getElementById('settings-name').value = 'Player';
        document.querySelector('input[name="theme"][value="dark"]').checked = true;
        document.getElementById('toggle-animations').checked = true;
        document.getElementById('master-volume').value = 80;
        
        showToast('Settings reset to default', 'info');
    }
}

function changeTheme(theme) {
    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    showToast(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied`, 'info');
}

function changeAccentColor(color) {
    document.documentElement.style.setProperty('--primary', color);
    showToast('Accent color changed', 'info');
}

function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('settings-avatar').src = e.target.result;
            showToast('Avatar updated', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function handleFileDrop(e) {
    e.preventDefault();
    const importArea = document.getElementById('import-area');
    importArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
        importData(file);
    } else {
        showToast('Please drop a JSON file', 'error');
    }
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            Object.assign(GameState, data);
            saveToStorage();
            showToast('Data imported successfully!', 'success');
            updateDashboard();
        } catch (err) {
            showToast('Invalid file format', 'error');
        }
    };
    reader.readAsText(file);
}

function exportJSON() {
    const data = JSON.stringify(GameState, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guesspro_data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported!', 'success');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initSettings();
    
    // Open settings button
    document.getElementById('settings-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeProfileDropdown();
        openSettingsModal();
    });
});

// Global functions
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
