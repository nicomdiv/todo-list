<?php
require_once 'db.php';

header('Content-Type: application/json');

// Получение метода запроса
$method = $_SERVER['REQUEST_METHOD'];

// Обработка запросов
switch ($method) {
    case 'GET':
        if (isset($_GET['task_id'])) {
            // Получить подпункты для задачи
            getSubtasks($_GET['task_id']);
        } else {
            // Получить все задачи
            getTasks();
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['title'])) {
            // Добавить новую задачу
            addTask($data['title']);
        } elseif (isset($data['task_id']) && isset($data['subtask_title'])) {
            // Добавить подзадачу
            addSubtask($data['task_id'], $data['subtask_title']);
        }
        break;

    case 'PUT':
        parse_str(file_get_contents('php://input'), $data);
        if (isset($data['task_id'])) {
            // Обновить статус задачи
            updateTaskStatus($data['task_id'], $data['completed']);
        } elseif (isset($data['subtask_id'])) {
            // Обновить статус подзадачи
            updateSubtaskStatus($data['subtask_id'], $data['completed']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Метод не поддерживается']);
}

// Функции для работы с базой данных
function getTasks()
{
    global $pdo;
    $stmt = $pdo->query('SELECT * FROM tasks');
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function getSubtasks($taskId)
{
    global $pdo;
    $stmt = $pdo->prepare('SELECT * FROM subtasks WHERE task_id = :task_id');
    $stmt->execute(['task_id' => $taskId]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function addTask($title)
{
    global $pdo;
    $stmt = $pdo->prepare('INSERT INTO tasks (title) VALUES (:title)');
    $stmt->execute(['title' => $title]);
    echo json_encode(['id' => $pdo->lastInsertId()]);
}

function addSubtask($taskId, $title)
{
    global $pdo;
    $stmt = $pdo->prepare('INSERT INTO subtasks (task_id, title) VALUES (:task_id, :title)');
    $stmt->execute(['task_id' => $taskId, 'title' => $title]);
    echo json_encode(['id' => $pdo->lastInsertId()]);
}

function updateTaskStatus($taskId, $completed)
{
    global $pdo;
    $stmt = $pdo->prepare('UPDATE tasks SET completed = :completed WHERE id = :id');
    $stmt->execute(['id' => $taskId, 'completed' => $completed]);
    echo json_encode(['success' => true]);
}

function updateSubtaskStatus($subtaskId, $completed)
{
    global $pdo;
    $stmt = $pdo->prepare('UPDATE subtasks SET completed = :completed WHERE id = :id');
    $stmt->execute(['id' => $subtaskId, 'completed' => $completed]);
    echo json_encode(['success' => true]);
}
?>