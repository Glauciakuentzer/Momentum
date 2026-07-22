const today = document.getElementById("today");

today.innerText =
new Date().toLocaleDateString("pt-BR",
{
weekday:"long",
day:"numeric",
month:"long"
});

const tasks = document.getElementById("tasks");

document
.getElementById("addTask")
.onclick=()=>{

const div=document.createElement("div");

div.className="task";

div.innerHTML=`
<input type="checkbox">
<input type="text"
placeholder="Nova tarefa">
`;

tasks.appendChild(div);

};
