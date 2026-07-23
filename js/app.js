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

/* ===================== HOJE: Progresso (calculado a partir dos blocos de hoje, ver seção SEMANA) ===================== */
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

criarGerenciadorDeTarefas(
    document.getElementById("tasks"),
    document.getElementById("addTask"),
    chaveDoDia("tarefas")
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

/* ===================== SEMANA: acompanhamento (por data, permite sequência) ===================== */
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const blocosRastreaveis = [
    { id: "leitura-manha", label: "Leitura de lazer", time: "05:30–05:55", duracao: 25, cat: "leitura" },
    { id: "estudo-trajeto-manha", label: "Estudo em áudio (trajeto)", time: "08:30–09:00", duracao: 30, cat: "estudo" },
    { id: "estudo-almoco", label: "Estudo focado (almoço)", time: "12:15–12:45", duracao: 30, cat: "estudo" },
    { id: "estudo-trajeto-volta", label: "Estudo em áudio (trajeto)", time: "18:10–18:50", duracao: 40, cat: "estudo" },
    { id: "estudo-noite", label: "Estudo focado (noite)", time: "20:00–20:45", duracao: 45, cat: "estudo" },
    { id: "leitura-noite", label: "Leitura de lazer", time: "21:40–22:00", duracao: 20, cat: "leitura" },
];

function dataISO(d) {
    return d.toISOString().split("T")[0];
}

function inicioDaSemana(d) {
    const copia = new Date(d);
    const offset = (copia.getDay() + 6) % 7; // 0 = segunda
    copia.setDate(copia.getDate() - offset);
    copia.setHours(0, 0, 0, 0);
    return copia;
}

const inicioSemanaAtual = inicioDaSemana(new Date());
const datasDaSemana = DIAS.map((_, i) => {
    const d = new Date(inicioSemanaAtual);
    d.setDate(d.getDate() + i);
    return dataISO(d);
});

let historico = carregar("historico-blocos", {});

// Migração: aproveita o que já tinha sido marcado no formato antigo (por dia da semana, sem data)
(function migrarDadosAntigos() {
    const antigo = carregar("semana-checklist", null);
    if (!antigo) return;
    let mudou = false;
    DIAS.forEach((dia, i) => {
        const data = datasDaSemana[i];
        if (antigo[dia] && !historico[data]) {
            historico[data] = antigo[dia];
            mudou = true;
        }
    });
    if (mudou) salvar("historico-blocos", historico);
})();

function salvarHistorico() {
    salvar("historico-blocos", historico);
}

function diaCumprido(dataStr) {
    const estado = historico[dataStr];
    if (!estado) return false;
    return Object.values(estado).some((v) => v);
}

function diaPerfeito(dataStr) {
    const estado = historico[dataStr];
    if (!estado) return false;
    return blocosRastreaveis.every((b) => estado[b.id]);
}

function atualizarProgressoDoDia() {
    const hojeISO = dataISO(new Date());
    const estado = historico[hojeISO] || {};
    const total = blocosRastreaveis.length;
    const feitos = blocosRastreaveis.filter((b) => estado[b.id]).length;
    const pct = total === 0 ? 0 : Math.round((feitos / total) * 100);
    progressBar.style.width = pct + "%";
    progressText.textContent = pct + "%";
}

function calcularSequenciaAtual() {
    let cursor = new Date();
    if (!diaCumprido(dataISO(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
    }
    let sequencia = 0;
    while (diaCumprido(dataISO(cursor))) {
        sequencia++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return sequencia;
}

function calcularRecorde() {
    const datasCumpridas = Object.keys(historico)
        .filter((d) => diaCumprido(d))
        .sort();
    let melhor = 0;
    let atual = 0;
    let dataAnterior = null;
    datasCumpridas.forEach((d) => {
        if (dataAnterior) {
            const diff = Math.round((new Date(d) - new Date(dataAnterior)) / 86400000);
            atual = diff === 1 ? atual + 1 : 1;
        } else {
            atual = 1;
        }
        melhor = Math.max(melhor, atual);
        dataAnterior = d;
    });
    return Math.max(melhor, calcularSequenciaAtual());
}

function renderizarSequencia() {
    document.getElementById("streakAtual").textContent = calcularSequenciaAtual();
    document.getElementById("streakRecorde").textContent = calcularRecorde();
}

let dataSelecionada = dataISO(new Date());

function renderizarPills() {
    const container = document.getElementById("dayPills");
    container.innerHTML = DIAS.map((label, i) => {
        const data = datasDaSemana[i];
        const diaDoMes = Number(data.split("-")[2]);
        const ativa = data === dataSelecionada;
        const perfeito = diaPerfeito(data);
        return `
            <div class="pill ${ativa ? "active" : ""}" data-date="${data}">
                ${label}
                <span class="pill-num">${diaDoMes}</span>
                ${perfeito ? '<span class="pill-flame">🔥</span>' : ""}
            </div>`;
    }).join("");
    container.querySelectorAll(".pill").forEach((pill) => {
        pill.addEventListener("click", () => {
            dataSelecionada = pill.dataset.date;
            renderizarPills();
            renderizarChecklist();
        });
    });
}

function renderizarChecklist() {
    const container = document.getElementById("weekChecklist");
    const estadoDoDia = historico[dataSelecionada] || {};

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
            if (!historico[dataSelecionada]) historico[dataSelecionada] = {};
            historico[dataSelecionada][cb.dataset.id] = cb.checked;
            salvarHistorico();
            renderizarPills();
            renderizarResumoSemana();
            renderizarSequencia();
            atualizarMensagemDiaPerfeito();
            atualizarProgressoDoDia();
        });
    });

    atualizarMensagemDiaPerfeito();
}

function atualizarMensagemDiaPerfeito() {
    const msg = document.getElementById("perfectDayMsg");
    msg.textContent = diaPerfeito(dataSelecionada) ? "🎉 Dia perfeito — todos os blocos cumpridos!" : "";
}

function renderizarResumoSemana() {
    const barsContainer = document.getElementById("weekBars");
    let totalMinutosSemana = 0;
    const maxBlocos = blocosRastreaveis.length;

    const barrasHtml = DIAS.map((label, i) => {
        const data = datasDaSemana[i];
        const estadoDoDia = historico[data] || {};
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
                <div class="bar-label">${label}</div>
            </div>`;
    }).join("");

    barsContainer.innerHTML = barrasHtml;
    document.getElementById("weekTotal").textContent = totalMinutosSemana + " min cumpridos";
}

renderizarPills();
renderizarChecklist();
renderizarResumoSemana();
renderizarSequencia();
atualizarProgressoDoDia();

/* ===================== HISTÓRICO DO MÊS (mapa de calor) ===================== */
let mesExibido = new Date();
mesExibido.setDate(1);

function nomeMes(d) {
    return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function renderizarHeatmap() {
    document.getElementById("mesLabel").textContent = nomeMes(mesExibido);

    const ano = mesExibido.getFullYear();
    const mes = mesExibido.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const totalDias = ultimoDia.getDate();
    const offsetInicio = (primeiroDia.getDay() + 6) % 7; // 0 = segunda

    let html = "";
    for (let i = 0; i < offsetInicio; i++) {
        html += '<div class="heatmap-day empty"></div>';
    }
    for (let dia = 1; dia <= totalDias; dia++) {
        const dataObj = new Date(ano, mes, dia);
        const iso = dataISO(dataObj);
        const estado = historico[iso] || {};
        const concluidos = blocosRastreaveis.filter((b) => estado[b.id]).length;

        let nivel = "level-0";
        if (concluidos >= blocosRastreaveis.length) nivel = "perfect";
        else if (concluidos >= 5) nivel = "level-3";
        else if (concluidos >= 3) nivel = "level-2";
        else if (concluidos >= 1) nivel = "level-1";

        html += `<div class="heatmap-day ${nivel}" data-date="${iso}" data-count="${concluidos}"></div>`;
    }

    const container = document.getElementById("heatmap");
    container.innerHTML = html;

    container.querySelectorAll(".heatmap-day:not(.empty)").forEach((celula) => {
        celula.addEventListener("click", () => {
            const [, m, d] = celula.dataset.date.split("-");
            const count = celula.dataset.count;
            document.getElementById("heatmapInfo").textContent =
                `${d}/${m}: ${count} de ${blocosRastreaveis.length} blocos cumpridos`;
        });
    });
}

document.getElementById("mesAnterior").addEventListener("click", () => {
    mesExibido.setMonth(mesExibido.getMonth() - 1);
    renderizarHeatmap();
});

document.getElementById("mesProximo").addEventListener("click", () => {
    const proximo = new Date(mesExibido);
    proximo.setMonth(proximo.getMonth() + 1);
    const agora = new Date();
    const alemDoAtual =
        proximo.getFullYear() > agora.getFullYear() ||
        (proximo.getFullYear() === agora.getFullYear() && proximo.getMonth() > agora.getMonth());
    if (alemDoAtual) return;
    mesExibido = proximo;
    renderizarHeatmap();
});

renderizarHeatmap();
