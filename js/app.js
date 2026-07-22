// Exibe a data atual
const today = document.getElementById("today");

const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
};

today.textContent =
new Date().toLocaleDateString("pt-BR", options);

// Elementos da tela
const tasks = document.getElementById("tasks");
const addTaskButton = document.getElementById("addTask");

// Adiciona uma nova tarefa
addTaskButton.addEventListener("click", () => {

    const task = document.createElement("div");
    task.className = "task";

    task.innerHTML = `
        <input type="checkbox">
        <input
            type="text"
            placeholder="Digite uma tarefa">
    `;

    tasks.appendChild(task);

});
function atualizarProgresso(){

const checks =
document.querySelectorAll(
'.task input[type="checkbox"]'
);

if(checks.length===0){

progressBar.style.width="0%";
progressText.textContent="0%";

return;

}

const marcados =
[...checks]
.filter(c=>c.checked)
.length;

const percentual =
Math.round(
marcados/checks.length*100
);

progressBar.style.width=
percentual+"%";

progressText.textContent=
percentual+"%";

}

document
.addEventListener(
"change",
atualizarProgresso
);

const progressBar =
document.getElementById("progressBar");

const progressText =
document.getElementById("progressText");
