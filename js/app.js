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

function dataISO(d) {
    return d.toISOString().split("T")[0];
}

function catLabel(cat) {
    return { estudo: "Estudo", leitura: "Leitura", trabalho: "Trabalho", rotina: "Rotina" }[cat];
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

/* ===================== HOJE: Progresso (calculado a partir dos blocos de hoje) ===================== */
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

/* ===================== ROTINA DO DIA (fonte única — editável em Ajustes) ===================== */
const ROTINA_PADRAO = [
    { id: "acordar-cafe", start: "05:15", end: "05:30", label: "Acordar / preparar café", cat: "rotina", rastreavel: false },
    { id: "leitura-manha", start: "05:30", end: "05:55", label: "Leitura de lazer", cat: "leitura", rastreavel: true },
    { id: "preparar-academia", start: "05:55", end: "06:00", label: "Preparar para a academia", cat: "rotina", rastreavel: false },
    { id: "academia", start: "06:00", end: "07:30", label: "Academia", cat: "rotina", rastreavel: false },
    { id: "banho-arrumar", start: "07:30", end: "08:30", label: "Banho / café / arrumar para o trabalho", cat: "rotina", rastreavel: false },
    { id: "estudo-trajeto-manha", start: "08:30", end: "09:00", label: "Trajeto — aula em áudio / podcast", cat: "estudo", rastreavel: true },
    { id: "trabalho-manha", start: "09:00", end: "12:15", label: "Trabalho (manhã)", cat: "trabalho", rastreavel: false },
    { id: "estudo-almoco", start: "12:15", end: "12:45", label: "Estudo focado (curso / idioma)", cat: "estudo", rastreavel: true },
    { id: "almoco", start: "12:45", end: "13:30", label: "Almoço", cat: "rotina", rastreavel: false },
    { id: "trabalho-tarde", start: "13:30", end: "18:00", label: "Trabalho (tarde)", cat: "trabalho", rastreavel: false },
    { id: "estudo-trajeto-volta", start: "18:10", end: "18:50", label: "Trajeto — aula em áudio / podcast", cat: "estudo", rastreavel: true },
    { id: "chegar-jantar", start: "18:50", end: "20:00", label: "Chegar / jantar / descomprimir", cat: "rotina", rastreavel: false },
    { id: "estudo-noite", start: "20:00", end: "20:45", label: "Estudo focado (bloco principal)", cat: "estudo", rastreavel: true },
    { id: "tempo-livre", start: "20:45", end: "21:40", label: "Tempo livre", cat: "rotina", rastreavel: false },
    { id: "leitura-noite", start: "21:40", end: "22:00", label: "Leitura de lazer", cat: "leitura", rastreavel: true },
];

let rotina = carregar("rotina-blocos", null);
if (!rotina) {
    rotina = JSON.parse(JSON.stringify(ROTINA_PADRAO));
    salvar("rotina-blocos", rotina);
}

function salvarRotina() {
    salvar("rotina-blocos", rotina);
}

function blocosOrdenados() {
    return [...rotina].sort((a, b) => paraMinutos(a.start) - paraMinutos(b.start));
}

function blocosAtivos() {
    return blocosOrdenados().filter((b) => b.rastreavel);
}

/* ===================== ESTUDOS: rotina do dia ===================== */
function renderizarTimeline() {
    const container = document.getElementById("timeline");
    const agora = new Date();
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    container.innerHTML = blocosOrdenados()
        .map((b) => {
            const isNow = minutosAgora >= paraMinutos(b.start) && minutosAgora < paraMinutos(b.end);
            return `
                <div class="timeline-item cat-${b.cat} ${isNow ? "current" : ""}">
                    ${isNow ? '<span class="now-badge">AGORA</span>' : ""}
                    <div class="check-time">${b.start} – ${b.end}</div>
                    <div class="check-label">${escapeHtml(b.label)}</div>
                    <span class="tag ${b.cat}">${catLabel(b.cat)}</span>
                </div>`;
        })
        .join("");
}

renderizarTimeline();
setInterval(renderizarTimeline, 60000); // atualiza o destaque "AGORA" a cada minuto

/* ===================== SEMANA: acompanhamento (por data, permite sequência) ===================== */
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

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
    const ativos = blocosAtivos();
    if (ativos.length === 0) return false;
    return ativos.every((b) => estado[b.id]);
}

function atualizarProgressoDoDia() {
    const hojeISO = dataISO(new Date());
    const estado = historico[hojeISO] || {};
    const ativos = blocosAtivos();
    const total = ativos.length;
    const feitos = ativos.filter((b) => estado[b.id]).length;
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
    const ativos = blocosAtivos();

    if (ativos.length === 0) {
        container.innerHTML = '<p class="heatmap-info">Nenhum bloco está marcado como "Contar na Semana" ainda. Ajuste isso na aba ⚙️.</p>';
        atualizarMensagemDiaPerfeito();
        return;
    }

    container.innerHTML = ativos
        .map(
            (b) => `
            <div class="check-item">
                <input type="checkbox" data-id="${b.id}" ${estadoDoDia[b.id] ? "checked" : ""}>
                <div class="check-body">
                    <div class="check-time">${b.start}–${b.end} · ${paraMinutos(b.end) - paraMinutos(b.start)} min</div>
                    <div class="check-label">${escapeHtml(b.label)}</div>
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
            if (typeof renderizarHeatmap === "function") renderizarHeatmap();
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
    const ativos = blocosAtivos();
    let totalMinutosSemana = 0;
    const maxBlocos = ativos.length;

    const barrasHtml = DIAS.map((label, i) => {
        const data = datasDaSemana[i];
        const estadoDoDia = historico[data] || {};
        let concluidos = 0;
        let minutos = 0;
        ativos.forEach((b) => {
            if (estadoDoDia[b.id]) {
                concluidos++;
                minutos += paraMinutos(b.end) - paraMinutos(b.start);
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
    const ativos = blocosAtivos();

    let html = "";
    for (let i = 0; i < offsetInicio; i++) {
        html += '<div class="heatmap-day empty"></div>';
    }
    for (let dia = 1; dia <= totalDias; dia++) {
        const dataObj = new Date(ano, mes, dia);
        const iso = dataISO(dataObj);
        const estado = historico[iso] || {};
        const concluidos = ativos.filter((b) => estado[b.id]).length;

        let nivel = "level-0";
        if (ativos.length > 0 && concluidos >= ativos.length) nivel = "perfect";
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
                `${d}/${m}: ${count} de ${blocosAtivos().length} blocos cumpridos`;
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

/* ===================== AJUSTES: editor da rotina ===================== */
function aposEditarRotina({ reordenarLista = false } = {}) {
    salvarRotina();
    renderizarTimeline();
    renderizarPills();
    renderizarChecklist();
    renderizarResumoSemana();
    renderizarSequencia();
    atualizarProgressoDoDia();
    renderizarHeatmap();
    if (reordenarLista) renderizarAjustes();
}

function renderizarAjustes() {
    const container = document.getElementById("rotinaEditor");
    container.innerHTML = rotina
        .map(
            (b) => `
            <div class="edit-block" data-id="${b.id}">
                <div class="edit-row">
                    <input type="time" class="edit-start" value="${b.start}">
                    <span>–</span>
                    <input type="time" class="edit-end" value="${b.end}">
                </div>
                <input type="text" class="edit-label" value="${escapeHtml(b.label)}" placeholder="Nome do bloco">
                <div class="edit-row">
                    <select class="edit-cat">
                        <option value="estudo" ${b.cat === "estudo" ? "selected" : ""}>Estudo</option>
                        <option value="leitura" ${b.cat === "leitura" ? "selected" : ""}>Leitura</option>
                        <option value="trabalho" ${b.cat === "trabalho" ? "selected" : ""}>Trabalho</option>
                        <option value="rotina" ${b.cat === "rotina" ? "selected" : ""}>Rotina</option>
                    </select>
                    <label class="edit-check">
                        <input type="checkbox" class="edit-rastreavel" ${b.rastreavel ? "checked" : ""}>
                        Contar na Semana
                    </label>
                    <button class="edit-delete" type="button" aria-label="Remover bloco">✕</button>
                </div>
            </div>`
        )
        .join("");

    container.querySelectorAll(".edit-block").forEach((el) => {
        const id = el.dataset.id;
        const bloco = rotina.find((b) => b.id === id);
        if (!bloco) return;

        el.querySelector(".edit-start").addEventListener("change", (e) => {
            bloco.start = e.target.value;
            aposEditarRotina();
        });
        el.querySelector(".edit-end").addEventListener("change", (e) => {
            bloco.end = e.target.value;
            aposEditarRotina();
        });
        el.querySelector(".edit-label").addEventListener("input", (e) => {
            bloco.label = e.target.value;
            aposEditarRotina();
        });
        el.querySelector(".edit-cat").addEventListener("change", (e) => {
            bloco.cat = e.target.value;
            aposEditarRotina();
        });
        el.querySelector(".edit-rastreavel").addEventListener("change", (e) => {
            bloco.rastreavel = e.target.checked;
            aposEditarRotina();
        });
        el.querySelector(".edit-delete").addEventListener("click", () => {
            rotina = rotina.filter((b) => b.id !== id);
            aposEditarRotina({ reordenarLista: true });
        });
    });
}

document.getElementById("addBloco").addEventListener("click", () => {
    rotina.push({
        id: "bloco-" + Date.now(),
        start: "12:00",
        end: "12:30",
        label: "",
        cat: "rotina",
        rastreavel: false,
    });
    aposEditarRotina({ reordenarLista: true });
    const blocos = document.querySelectorAll(".edit-label");
    if (blocos.length) blocos[blocos.length - 1].focus();
});

document.getElementById("restaurarPadrao").addEventListener("click", () => {
    const confirmado = confirm("Isso substitui todos os blocos pela rotina padrão. Seu histórico de dias marcados não é apagado. Continuar?");
    if (!confirmado) return;
    rotina = JSON.parse(JSON.stringify(ROTINA_PADRAO));
    aposEditarRotina({ reordenarLista: true });
});

renderizarAjustes();
