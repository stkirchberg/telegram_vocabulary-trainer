let sets = JSON.parse(localStorage.getItem('vocabSets')) || {};
let activeSetKey = "";
let currentSessionCards = [];
let currentIndex = 0;
let mistakes = [];

const screens = ['selection-screen', 'editor-screen', 'quiz-screen', 'results-screen'];

function showScreen(screenId) {
    screens.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
}

// SET MANAGEMENT 
function renderSets() {
    const list = document.getElementById('set-list');
    if (!list) return;
    
    list.innerHTML = "";
    Object.keys(sets).forEach(title => {
        const div = document.createElement('div');
        div.className = 'set-item';
        div.innerHTML = `
            <span>${title} (${sets[title].length} Karten)</span>
            <div style="display:flex; gap:10px;">
                <button onclick="editSet('${title}')" style="padding:8px">Bearbeiten</button>
                <button onclick="startQuiz('${title}')" class="btn-primary" style="padding:8px">Starten</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function createNewSet() {
    const input = document.getElementById('set-title-input');
    const title = input.value.trim();
    if (title && !sets[title]) {
        sets[title] = [];
        save();
        input.value = "";
        editSet(title);
    } else if (sets[title]) {
        alert("Dieses Set existiert bereits!");
    }
}

// EDITOR
function editSet(title) {
    activeSetKey = title;
    const titleDisplay = document.getElementById('editing-set-title');
    if (titleDisplay) titleDisplay.innerText = title;
    renderVocabPreview();
    showScreen('editor-screen');
}

function addVocabToSet() {
    const q = document.getElementById('word-q');
    const a = document.getElementById('word-a');
    if (q.value && a.value) {
        sets[activeSetKey].push({ q: q.value.trim(), a: a.value.trim() });
        save();
        q.value = ""; 
        a.value = "";
        renderVocabPreview();
        q.focus();
    }
}

function renderVocabPreview() {
    const list = document.getElementById('vocab-preview-list');
    const btn = document.getElementById('start-game-btn');
    const vocabs = sets[activeSetKey] || [];

    list.innerHTML = vocabs.map(v => `
        <div class="set-item" style="font-size:14px; border-bottom:1px solid #eee; padding:5px;">
            <strong>${v.q}</strong>: ${v.a}
        </div>
    `).join('');
    
    if (btn) {
        btn.className = vocabs.length > 0 ? "btn-primary" : "hidden";
        btn.onclick = () => startQuiz(activeSetKey);
    }
}

// QUIZ LOGIC
function startQuiz(title, retryMistakes = false) {
    activeSetKey = title;
    currentSessionCards = retryMistakes ? [...mistakes] : [...sets[title]];
    
    if (currentSessionCards.length === 0) {
        alert("Keine Karten zum Lernen vorhanden!");
        return;
    }
    
    mistakes = []; 
    currentIndex = 0;
    showScreen('quiz-screen');
    loadCard();
}

function loadCard() {
    const card = currentSessionCards[currentIndex];
    document.getElementById('display-q').innerText = card.q;
    document.getElementById('answer-input').value = "";
    document.getElementById('feedback').innerText = "";
    document.getElementById('submit-btn').classList.remove('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    updateProgress();
}

function updateProgress() {
    const percent = (currentIndex / currentSessionCards.length) * 100;
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = percent + "%";
}

document.getElementById('submit-btn').onclick = () => {
    const input = document.getElementById('answer-input').value.trim().toLowerCase();
    const currentCard = currentSessionCards[currentIndex];
    const correct = currentCard.a.toLowerCase();
    const fb = document.getElementById('feedback');

    if (input === correct) {
        fb.innerText = "Richtig!";
        fb.style.color = "green";
    } else {
        fb.innerText = `Falsch! Lösung: ${currentCard.a}`;
        fb.style.color = "red";
        mistakes.push(currentCard);
    }
    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
};

document.getElementById('next-btn').onclick = () => {
    currentIndex++;
    if (currentIndex < currentSessionCards.length) {
        loadCard();
    } else {
        finishGame();
    }
};

function finishGame() {
    showScreen('results-screen');
    document.getElementById('result-stats').innerText = 
        `Fertig! Fehler: ${mistakes.length} von ${currentSessionCards.length}`;
    
    const retryBtn = document.getElementById('retry-mistakes-btn');
    if (mistakes.length > 0) {
        retryBtn.classList.remove('hidden');
        retryBtn.innerText = `Nur Fehler wiederholen (${mistakes.length})`;
    } else {
        retryBtn.classList.add('hidden');
    }
}

document.getElementById('retry-mistakes-btn').onclick = () => {
    startQuiz(activeSetKey, true);
};

function save() { 
    localStorage.setItem('vocabSets', JSON.stringify(sets)); 
    renderSets(); 
}

window.onload = () => {
    renderSets();
};