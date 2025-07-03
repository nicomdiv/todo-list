document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const addTaskBtn = document.getElementById('add-task-btn');

    // Загрузка задач при загрузке страницы
    loadTasks();

    // Обработчик кнопки "Добавить задачу"
    addTaskBtn.addEventListener('click', async () => {
        const taskTitle = document.getElementById('task-title').value.trim();
        if (!taskTitle) return; // проверка на пустое поле при добавлении задачи

        await addTask(taskTitle);
        document.getElementById('task-title').value = '';
        loadTasks();
    });

    // Загрузка задач из базы данных
    async function loadTasks() {
        const response = await fetch('api.php');
        const tasks = await response.json();
        renderTasks(tasks);
    }

    // Отображение задач
    function renderTasks(tasks) {
        taskList.innerHTML = '';
        tasks.forEach((task) => {
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';

            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <label>
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="${task.completed ? 'completed' : ''}">${task.title}</span>
                </label>
                <button class="add-subtask">+Подзадача</button>
            `;
            taskCard.appendChild(taskItem);
            taskList.appendChild(taskCard);

            // Обработка отметки задачи как выполненной
            const checkbox = taskItem.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', async () => {
                const newStatus = checkbox.checked;
                await updateTaskStatus(task.id, newStatus);

                const taskText = taskItem.querySelector('span');
                taskText.classList.toggle('completed', newStatus);
            });

            // Обработчик кнопки добавления подзадачи
            const addSubtaskButton = taskItem.querySelector('.add-subtask');
            addSubtaskButton.addEventListener('click', () => {
                showSubtaskForm(task.id, taskCard);
            });

            // Загрузка подзадач
            loadSubtasks(task.id, taskCard);
        });
    }

    // Показать форму для добавления подзадачи
    function showSubtaskForm(taskId, taskCard) {
        // Проверяем, есть ли уже активная форма для добавления подзадачи, чтобы не добавлялась еще одна
        const existingForm = taskCard.querySelector('.subtasks form');
        if (existingForm) {
            return; 
        }

        let subtasksContainer = taskCard.querySelector('.subtasks');
        if (!subtasksContainer) {
            subtasksContainer = document.createElement('ul');
            subtasksContainer.className = 'subtasks';
            taskCard.appendChild(subtasksContainer);
        }

        const form = document.createElement('form');
        form.innerHTML = `
            <input type="text" placeholder="Текст подзадачи..." required>
            <button type="submit">Добавить</button>
        `;
        subtasksContainer.appendChild(form);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const subtaskTitle = form.querySelector('input').value.trim();
            if (!subtaskTitle) return; // Проверка заполнения подзадачи

            await addSubtask(taskId, subtaskTitle);
            form.remove();
            loadTasks();
        });
    }

    // Загрузка подпунктов для задачи
    async function loadSubtasks(taskId, taskCard) {
        const response = await fetch(`api.php?task_id=${taskId}`);
        const subtasks = await response.json();

        if (subtasks.length > 0 || taskCard.querySelector('.subtasks')) {
            // Если подзадачи есть или уже есть контейнер .subtasks, добавляем их
            let subtasksContainer = taskCard.querySelector('.subtasks');
            if (!subtasksContainer) {
                subtasksContainer = document.createElement('ul');
                subtasksContainer.className = 'subtasks';
                taskCard.appendChild(subtasksContainer);
            }

            subtasksContainer.innerHTML = '';
            subtasks.forEach((subtask) => {
                const subtaskItem = document.createElement('li');
                subtaskItem.innerHTML = `
                <label>
                    <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
                    <span class="${subtask.completed ? 'completed' : ''}">${subtask.title}</span>
                </label>
            `;
                subtasksContainer.appendChild(subtaskItem);

                // Обработчик отметки подпункта как выполненного
                const checkbox = subtaskItem.querySelector('input[type="checkbox"]');
                checkbox.addEventListener('change', async () => {
                    const newStatus = checkbox.checked;
                    await updateSubtaskStatus(subtask.id, newStatus);

                    // Обновляем только текст подпункта
                    const subtaskText = subtaskItem.querySelector('span');
                    subtaskText.classList.toggle('completed', newStatus);
                });
            });
        }
    }

    // Добавление задачи
    async function addTask(title) {
        await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        });
    }

    // Добавление подзадачи
    async function addSubtask(taskId, title) {
        await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id: taskId, subtask_title: title }),
        });
    }

    // Обновление статуса задачи
    async function updateTaskStatus(taskId, completed) {
        await fetch('api.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `task_id=${taskId}&completed=${Number(completed)}`,
        });
    }

    // Обновление статуса подпункта
    async function updateSubtaskStatus(subtaskId, completed) {
        await fetch('api.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `subtask_id=${subtaskId}&completed=${Number(completed)}`,
        });
    }
});