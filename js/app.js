/* ===================== Utilidades ===================== */
function chaveDoDia(prefixo) {
    const hoje = new Date();
    const iso = hoje.toISOString().split("T")[0]; // ex: 2026-07-22
    return prefixo + "-" + iso;
}

function escapeHtml(texto) {
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function paraMinutos(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

/* ===================== Data de hoje ===================== */
const today = document.getElementById("today");
today.innerText = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
});

/* ===================== Abas ===================== */
document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById("view-" + tab.dataset.view).classList.add("active");
    });
});

/* ===================== Gerenciador genérico de tarefas ===================== */
function criarGerenciadorDeTarefas(containerEl, botaoAdicionarEl, chaveStorage, aoMudar) {
    let itens = carregar(chaveStorage, []);

    function salvarItens() {
        salvar(chaveStorage, itens);
    }

    function renderizar() {
        containerEl.innerHTML = "";
        itens.forEach((item) => {
            const div = document.createElement("div");
            div.className = "task";
            div.innerHTML = `
                <input type="checkbox" ${item.done ? "checked" : ""}>
                <input type="text" placeholder="Nova tarefa" value="${escapeHtml(item.text)}">
                <button class="task-delete" aria-label="Remover">✕</button>
            `;
            const checkbox = div.querySelector('input[type="checkbox"]');
            const textInput = div.querySelector('input[type="text"]');
            const delBtn = div.querySelector(".task-delete");

            checkbox.addEventListener("change", () => {
                item.done = checkbox.checked;
                salvarItens();
                if (aoMudar) aoMudar(itens);
            });
            textInput.addEventListener("input", () => {
                item.text = textInput.value;
                salvarItens();
            });
            delBtn.addEventListener("click", () => {
                itens = itens.filter((i) => i.id !== item.id);
                salvarItens();
                renderizar();
                if (aoMudar) aoMudar(itens);
            });

            containerEl.appendChild(div);
        });
    }

    botaoAdicionarEl.addEventListener("click", () => {
        itens.push({ id: Date.now() + Math.random(), text: "", done: false });
        salvarItens();
        renderizar();
        if (aoMudar) aoMudar(itens);
        const inputs = containerEl.querySelectorAll('input[type="text"]');
        if (inputs.length) inputs[inputs.length - 1].focus();
    });

    renderizar();
    if (aoMudar) aoMudar(itens);

    return { getItens: () => itens };
}

/* ===================== HOJE: Foco do dia ===================== */
const focusInput = document.getElementById("focus");
const focusKey = chaveDoDia("foco");
focusInput.value = carregar(focusKey, "");
focusInput.addEventListener("input", () => salvar(focusKey, focusInput.value));

/* ===================== HOJE: Progresso ===================== */
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

function atualizarProgresso(itens) {
    const total = itens.length;
    const feitas = itens.filter((i) => i.done).length;
    const pct = total === 0 ? 0 : Math.round((feitas / total) * 100);
    progressBar.style.width = pct + "%";
    progressText.textContent = pct + "%";
}

criarGerenciadorDeTarefas(
    document.getElementById("tasks"),
    document.getElementById("addTask"),
    chaveDoDia("tarefas"),
    atualizarProgresso
);

/* ===================== PROJETOS ===================== */
criarGerenciadorDeTarefas(
    document.getElementById("projectTasks"),
    document.getElementById("addProjectTask"),
    "projetos-tarefas"
);

/* ===================== ESTUDOS: rotina do dia ===================== */
const dayBlocks = [
    { start: "05:15", end: "05:30", label: "Acordar / preparar café", cat: "rotina" },
    { start: "05:30", end: "05:55", label: "Leitura de lazer", cat: "leitura" },
    { start: "05:55", end: "06:00", label: "Preparar para a academia", cat: "rotina" },
    { start: "06:00", end: "07:30", label: "Academia", cat: "rotina" },
    { start: "07:30", end: "08:30", label: "Banho / café / arrumar para o trabalho", cat: "rotina" },
    { start: "08:30", end: "09:00", label: "Trajeto — aula em áudio / podcast", cat: "estudo" },
    { start: "09:00", end: "12:15", label: "Trabalho (manhã)", cat: "trabalho" },
    { start: "12:15", end: "12:45", label: "Estudo focado (curso / idioma)", cat: "estudo" },
    { start: "12:45", end: "13:30", label: "Almoço", cat: "rotina" },
    { start: "13:30", end: "18:00", label: "Trabalho (tarde)", cat: "trabalho" },
    { start: "18:10", end: "18:50", label: "Trajeto — aula em áudio / podcast", cat: "estudo" },
    { start: "18:50", end: "20:00", label: "Chegar / jantar / descomprimir", cat: "rotina" },
    { start: "20:00", end: "20:45", label: "Estudo focado (bloco principal)", cat: "estudo" },
    { start: "20:45", end: "21:40", label: "Tempo livre", cat: "rotina" },
    { start: "21:40", end: "22:00", label: "Leitura de lazer", cat: "leitura" },
];

function catLabel(cat) {
    return { estudo: "Estudo", leitura: "Leitura", trabalho: "Trabalho", rotina: "Rotina" }[cat];
}

function renderizarTimeline() {
    const container = document.getElementById("timeline");
    const agora = new Date();
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    container.innerHTML = dayBlocks
        .map((b) => {
            const isNow = minutosAgora >= paraMinutos(b.start) && minutosAgora < paraMinutos(b.end);
            return `
                <div class="timeline-item cat-${b.cat} ${isNow ? "current" : ""}">
                    ${isNow ? '<span class="now-badge">AGORA</span>' : ""}
                    <div class="check-time">${b.start} – ${b.end}</div>
                    <div class="check-label">${b.label}</div>
                    <span class="tag ${b.cat}">${catLabel(b.cat)}</span>
                </div>`;
        })
        .join("");
}

renderizarTimeline();
setInterval(renderizarTimeline, 60000); // atualiza o destaque "AGORA" a cada minuto

/* ===================== SEMANA: acompanhamento ===================== */
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const blocosRastreaveis = [
    { id: "leitura-manha", label: "Leitura de lazer", time: "05:30–05:55", duracao: 25, cat: "leitura" },
    { id: "estudo-trajeto-manha", label: "Estudo em áudio (trajeto)", time: "08:30–09:00", duracao: 30, cat: "estudo" },
    { id: "estudo-almoco", label: "Estudo focado (almoço)", time: "12:15–12:45", duracao: 30, cat: "estudo" },
    { id: "estudo-trajeto-volta", label: "Estudo em áudio (trajeto)", time: "18:10–18:50", duracao: 40, cat: "estudo" },
    { id: "estudo-noite", label: "Estudo focado (noite)", time: "20:00–20:45", duracao: 45, cat: "estudo" },
    { id: "leitura-noite", label: "Leitura de lazer", time: "21:40–22:00", duracao: 20, cat: "leitura" },
];

let semanaState = carregar("semana-checklist", {});
let diaAtual = DIAS[(new Date().getDay() + 6) % 7];

function salvarSemana() {
    salvar("semana-checklist", semanaState);
}

function renderizarPills() {
    const container = document.getElementById("dayPills");
    container.innerHTML = DIAS.map(
        (d) => `<div class="pill ${d === diaAtual ? "active" : ""}" data-day="${d}">${d}</div>`
    ).join("");
    container.querySelectorAll(".pill").forEach((pill) => {
        pill.addEventListener("click", () => {
            diaAtual = pill.dataset.day;
            renderizarPills();
            renderizarChecklist();
        });
    });
}

function renderizarChecklist() {
    const container = document.getElementById("weekChecklist");
    const estadoDoDia = semanaState[diaAtual] || {};

    container.innerHTML = blocosRastreaveis
        .map(
            (b) => `
            <div class="check-item">
                <input type="checkbox" data-id="${b.id}" ${estadoDoDia[b.id] ? "checked" : ""}>
                <div class="check-body">
                    <div class="check-time">${b.time} · ${b.duracao} min</div>
                    <div class="check-label">${b.label}</div>
                    <span class="tag ${b.cat}">${catLabel(b.cat)}</span>
                </div>
            </div>`
        )
        .join("");

    container.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.addEventListener("change", () => {
            if (!semanaState[diaAtual]) semanaState[diaAtual] = {};
            semanaState[diaAtual][cb.dataset.id] = cb.checked;
            salvarSemana();
            renderizarResumoSemana();
        });
    });
}

function renderizarResumoSemana() {
    const barsContainer = document.getElementById("weekBars");
    let totalMinutosSemana = 0;
    const maxBlocos = blocosRastreaveis.length;

    const barrasHtml = DIAS.map((d) => {
        const estadoDoDia = semanaState[d] || {};
        let concluidos = 0;
        let minutos = 0;
        blocosRastreaveis.forEach((b) => {
            if (estadoDoDia[b.id]) {
                concluidos++;
                minutos += b.duracao;
            }
        });
        totalMinutosSemana += minutos;
        const alturaPct = maxBlocos ? (concluidos / maxBlocos) * 100 : 0;
        return `
            <div class="bar-col">
                <div class="bar ${concluidos > 0 ? "has-progress" : ""}" style="height:${Math.max(alturaPct, 4)}%"></div>
                <div class="bar-label">${d}</div>
            </div>`;
    }).join("");

    barsContainer.innerHTML = barrasHtml;
    document.getElementById("weekTotal").textContent = totalMinutosSemana + " min cumpridos";
}

renderizarPills();
renderizarChecklist();
renderizarResumoSemana();
