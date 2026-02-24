/**
 * Aviz Academy – To-Do List App
 * Vanilla JavaScript, no dependencies.
 */

(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────────────
  const STORAGE_KEY = 'aviz_todo_tasks';
  let tasks  = loadTasks();
  let filter = 'all'; // 'all' | 'active' | 'completed'

  // ── DOM Refs ─────────────────────────────────────────────────────
  const taskInput      = document.getElementById('taskInput');
  const addBtn         = document.getElementById('addBtn');
  const taskList       = document.getElementById('taskList');
  const emptyState     = document.getElementById('emptyState');
  const taskCount      = document.getElementById('taskCount');
  const clearCompleted = document.getElementById('clearCompleted');
  const filterBtns     = document.querySelectorAll('.filter-btn');

  // ── Init ─────────────────────────────────────────────────────────
  render();
  bindEvents();

  // ── Event Binding ────────────────────────────────────────────────
  function bindEvents() {
    addBtn.addEventListener('click', handleAdd);

    taskInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleAdd();
    });

    clearCompleted.addEventListener('click', function () {
      tasks = tasks.filter(function (t) { return !t.completed; });
      saveTasks();
      render();
    });

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filter = btn.dataset.filter;
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        render();
      });
    });
  }

  // ── Handlers ─────────────────────────────────────────────────────
  function handleAdd() {
    var text = taskInput.value.trim();
    if (!text) {
      taskInput.focus();
      taskInput.classList.add('shake');
      setTimeout(function () { taskInput.classList.remove('shake'); }, 400);
      return;
    }
    tasks.push({ id: Date.now(), text: text, completed: false });
    saveTasks();
    taskInput.value = '';
    taskInput.focus();
    filter = 'all';
    filterBtns.forEach(function (b) { b.classList.remove('active'); });
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
    render();
  }

  function handleToggle(id) {
    tasks = tasks.map(function (t) {
      return t.id === id ? Object.assign({}, t, { completed: !t.completed }) : t;
    });
    saveTasks();
    render();
  }

  function handleDelete(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    saveTasks();
    render();
  }

  // ── Render ───────────────────────────────────────────────────────
  function render() {
    var visible = getVisible();

    // Task list
    taskList.innerHTML = '';
    visible.forEach(function (task) {
      taskList.appendChild(createTaskEl(task));
    });

    // Empty state
    var allVisible = getVisibleCount();
    emptyState.classList.toggle('hidden', allVisible > 0);

    // Count (based on all tasks, not filtered)
    var activeCount = tasks.filter(function (t) { return !t.completed; }).length;
    taskCount.textContent = activeCount === 1 ? '1 task left' : activeCount + ' tasks left';
  }

  function createTaskEl(task) {
    var li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    // Checkbox
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'task-checkbox';
    cb.checked = task.completed;
    cb.setAttribute('aria-label', 'Mark task as ' + (task.completed ? 'incomplete' : 'complete'));
    cb.addEventListener('change', function () { handleToggle(task.id); });

    // Text
    var span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    // Delete button
    var del = document.createElement('button');
    del.className = 'task-delete';
    del.innerHTML = '&#10005;';
    del.setAttribute('aria-label', 'Delete task');
    del.addEventListener('click', function () { handleDelete(task.id); });

    li.appendChild(cb);
    li.appendChild(span);
    li.appendChild(del);

    return li;
  }

  // ── Helpers ──────────────────────────────────────────────────────
  function getVisible() {
    if (filter === 'active')    return tasks.filter(function (t) { return !t.completed; });
    if (filter === 'completed') return tasks.filter(function (t) { return t.completed; });
    return tasks;
  }

  function getVisibleCount() {
    return getVisible().length;
  }

  function loadTasks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      // localStorage unavailable – state is still in memory for this session
    }
  }
}());
