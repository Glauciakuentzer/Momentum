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
