// ===============================
// Momentum - app.js
// v0.3.1
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
// Atualiza a barra de progresso
// -------------------------------
function atualizarProgresso() {

    const checks = document.querySelectorAll(".task input[type='checkbox']");

    if (checks.length === 0) {
        progressBar.style.width = "0%";
        progressText.textContent = "0%";
        return;
    }

    const concluidas = [...checks].filter(c => c.checked).length;

    const percentual = Math.round((concluidas / checks.length) * 100);

    progressBar.style.width = percentual + "%";
    progressText.textContent = percentual + "%";
}

// -------------------------------
// Cria uma tarefa
// -------------------------------
function criarTarefa(descricao) {

    const linha = document.createElement("div");
    linha.className = "task";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    checkbox.addEventListener("change", atualizarProgresso);

    const texto = document.createElement("span");
    texto.textContent = descricao;
    texto.style.flex = "1";
    texto.style.padding = "6px 0";

    linha.appendChild(checkbox);
    linha.appendChild(texto);

    tasks.appendChild(linha);

    atualizarProgresso();
}

// -------------------------------
// Botão Nova tarefa
// -------------------------------
addTask.addEventListener("click", () => {

    const descricao = prompt("Digite a nova tarefa:");

    if (!descricao) return;

    if (descricao.trim() === "") return;

    criarTarefa(descricao.trim());

});

// -------------------------------
// Inicialização
// -------------------------------
atualizarProgresso();
