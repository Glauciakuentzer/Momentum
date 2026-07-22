// ===============================
// Momentum - app.js
// ===============================

// Elementos da página
const today = document.getElementById("today");
const focus = document.getElementById("focus");
const tasks = document.getElementById("tasks");
const addTask = document.getElementById("addTask");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

// -------------------------------
// Data de hoje
// -------------------------------
const dataAtual = new Date();

today.textContent = dataAtual.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});

// -------------------------------
// Foco do dia
// -------------------------------
focus.value = carregar("focus", "");

focus.addEventListener("input", () => {
    salvar("focus", focus.value);
});

// -------------------------------
// Barra de progresso
// -------------------------------
function atualizarProgresso() {

    const checks = document.querySelectorAll(".task input[type='checkbox']");

    if (checks.length === 0) {
        progressBar.style.width = "0%";
        progressText.textContent = "0%";
        return;
    }

    const concluidas = [...checks].filter(c => c.checked).length;

    const percentual = Math.round(
        concluidas / checks.length * 100
    );

    progressBar.style.width = percentual + "%";
    progressText.textContent = percentual + "%";
}

// -------------------------------
// Adicionar tarefa
// -------------------------------
addTask.addEventListener("click", () => {

    const linha = document.createElement("div");
    linha.className = "task";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const texto = document.createElement("input");
    texto.type = "text";
    texto.placeholder = "Nova tarefa";

    checkbox.addEventListener("change", atualizarProgresso);

    linha.appendChild(checkbox);
    linha.appendChild(texto);

    tasks.appendChild(linha);

    atualizarProgresso();

});

// Estado inicial
atualizarProgresso();
