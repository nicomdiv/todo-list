<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Список дел</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <div class="container">
        <h1>Список дел</h1>

        <!-- Форма добавления задачи -->
        <form class="task-form">
            <input type="text" id="task-title" placeholder="Добавьте новую задачу..." required>
            <button type="submit" id="add-task-btn">Добавить</button>
        </form>

        <!-- Список задач -->
        <div id="task-list"></div>
    </div>

    <script src="assets/js/app.js"></script>
</body>
</html>