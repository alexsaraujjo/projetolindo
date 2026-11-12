
import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Configuração do Supabase
const SUPABASE_URL = "https://hoyeqsekaomjqtwitjjj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_CpZr73F6tuhQdnUs15hYMQ_aJrYMKZk";

// Inicializa o cliente
const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// Elementos da página
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const statusMessage = document.getElementById("status-message");
const submitButton = document.getElementById("submit-button");

// Exibe mensagens para o usuário
function showMessage(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = "status-message";

    if (type) {
        statusMessage.classList.add(type);
    }
}

// Controla o estado do botão
function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading
        ? "Salvando..."
        : "Adicionar";
}

// Renderiza uma tarefa na tela
function renderTask(task) {
    const listItem = document.createElement("li");

    listItem.className = "task-item";
    listItem.textContent = task.text;

    taskList.appendChild(listItem);
}

// Busca as tarefas no Supabase
async function loadTasks() {
    showMessage("Carregando tarefas...");

    taskList.replaceChildren();

    try {
        const { data, error } = await supabase
            .from("tasks")
            .select("id, text, created_at")
            .order("created_at", { ascending: true });

        if (error) {
            throw error;
        }

        if (data.length === 0) {
            taskList.innerHTML = `
                <li class="empty-message">
                    Nenhuma tarefa cadastrada.
                </li>
            `;
        } else {
            data.forEach(renderTask);
        }

        showMessage("Tarefas carregadas com sucesso.", "success");

    } catch (error) {
        console.error("Erro ao carregar tarefas:", error);

        showMessage(
            "Não foi possível carregar as tarefas. Verifique sua conexão e tente novamente.",
            "error"
        );
    }
}

// Adiciona uma tarefa no Supabase
async function addTask(event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    // Impede o envio de tarefas vazias
    if (!taskText) {
        showMessage("Digite uma tarefa antes de enviar.", "error");
        taskInput.focus();
        return;
    }

    setLoading(true);
    showMessage("Salvando tarefa...");

    try {
        const { data, error } = await supabase
            .from("tasks")
            .insert([
                { text: taskText }
            ])
            .select("id, text, created_at")
            .single();

        if (error) {
            throw error;
        }

        // Remove a mensagem de lista vazia, se existir
        const emptyMessage = taskList.querySelector(".empty-message");

        if (emptyMessage) {
            emptyMessage.remove();
        }

        // Atualiza a lista sem recarregar a página
        renderTask(data);

        taskInput.value = "";
        taskInput.focus();

        showMessage("Tarefa adicionada com sucesso.", "success");

    } catch (error) {
        console.error("Erro ao adicionar tarefa:", error);

        showMessage(
            "Não foi possível salvar a tarefa. Tente novamente.",
            "error"
        );

    } finally {
        setLoading(false);
    }
}

// Evento de envio do formulário
taskForm.addEventListener("submit", addTask);

// Carrega as tarefas ao abrir a aplicação
loadTasks();
