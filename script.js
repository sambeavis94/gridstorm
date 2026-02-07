const tiles = document.querySelectorAll(".tile");
const teamsList = document.getElementById("teams");
const turnText = document.getElementById("turn");

const qBar = document.getElementById("question-bar");
const qCategory = document.getElementById("question-category");
const qText = document.getElementById("question-text");
const aText = document.getElementById("answer-text");
const revealBtn = document.getElementById("reveal-answer");

const setupScreen = document.getElementById("setup-screen");
const layout = document.getElementById("layout");
const teamCountSelect = document.getElementById("team-count");
const teamInputsDiv = document.getElementById("team-inputs");
const startBtn = document.getElementById("start-game");

/* ICONS */
const ICONS = [
  "❓","❓","❓","❓","❓","❓","❓","❓",
  "✖️2","✖️2","✖️2",
  "🏴‍☠️","🏴‍☠️","🏴‍☠️",
  "⛔","⛔",
  "🔄","🔄",
  "🧗","🧗",
  "🌪️","🌪️","🌪️","🌪️","🌪️"
];

let teams = [];
let currentTeam = 0;

/* QUESTIONS */
let questions = [];
let unusedQuestions = [];

/* LOAD QUESTIONS */
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    resetQuestions();
    console.log(`Loaded ${questions.length} questions`);
  })
  .catch(err => console.error("Failed to load questions", err));

/* HELPERS */
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function resetQuestions() {
  unusedQuestions = shuffle(questions);
}

function renderTeams() {
  teamsList.innerHTML = "";
  teams.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = `${t.name}: ${t.score}`;
    if (i === currentTeam) li.style.fontWeight = "bold";
    teamsList.appendChild(li);
  });
  turnText.textContent = `Turn: ${teams[currentTeam].name}`;
}

/* SETUP */
function renderTeamInputs() {
  teamInputsDiv.innerHTML = "";
  const count = Number(teamCountSelect.value);
  for (let i = 1; i <= count; i++) {
    const input = document.createElement("input");
    input.value = `Team ${i}`;
    teamInputsDiv.appendChild(input);
  }
}

teamCountSelect.onchange = renderTeamInputs;
renderTeamInputs();

/* START GAME */
function startGame() {
  teams = [];
  teamInputsDiv.querySelectorAll("input").forEach(input => {
    teams.push({ name: input.value, score: 0 });
  });

  const icons = shuffle(ICONS);
  tiles.forEach((tile, i) => {
    tile.textContent = "";
    tile.classList.remove("revealed");
    tile.dataset.icon = icons[i];
  });

  currentTeam = 0;
  resetQuestions();
  renderTeams();

  setupScreen.classList.add("hidden");
  layout.classList.remove("hidden");
}

startBtn.onclick = startGame;

/* TILE CLICK */
tiles.forEach(tile => {
  tile.onclick = () => {
    if (tile.classList.contains("revealed")) return;

    tile.classList.add("revealed");
    tile.textContent = tile.dataset.icon;

    if (tile.dataset.icon === "🌪️") {
      teams[currentTeam].score = 0;
      renderTeams();
      return;
    }

    if (unusedQuestions.length === 0) resetQuestions();
    const q = unusedQuestions.pop();

    qCategory.textContent = q.category;
    qText.textContent = q.question;
    aText.textContent = ` Answer: ${q.answer}`;
    aText.classList.add("hidden");
    qBar.classList.remove("hidden");
  };
});

revealBtn.onclick = () => {
  aText.classList.remove("hidden");
};

/* CONTROLS */
document.getElementById("correct").onclick = () => {
  teams[currentTeam].score += 5;
  nextTurn();
};

document.getElementById("double").onclick = () => {
  teams[currentTeam].score += 10;
  nextTurn();
};

document.getElementById("end").onclick = nextTurn;
document.getElementById("new").onclick = () => location.reload();

function nextTurn() {
  qBar.classList.add("hidden");
  currentTeam = (currentTeam + 1) % teams.length;
  renderTeams();
}
