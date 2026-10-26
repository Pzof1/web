const STORAGE_KEY = 'webprog-labs-todo-tasks';

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(savedTasks)) return [];

    const usedIds = new Set();
    return savedTasks
      .filter((task) => {
        if (!task || typeof task.id !== 'string' || usedIds.has(task.id)
          || typeof task.title !== 'string' || !task.title.trim()
          || !isValidDate(task.date)) return false;
        usedIds.add(task.id);
        return true;
      })
      .map((task) => ({
        id: task.id,
        title: task.title.trim().slice(0, 120),
        date: task.date,
        completed: task.completed === true,
      }));
  } catch {
    return [];
  }
}

const tasks = loadTasks();

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

const page = createElement('main', 'page');
const homeLink = createElement('a', 'home-link', '← На главную');
homeLink.href = '../';
const eyebrow = createElement('p', 'page__eyebrow', 'Личный планер');
const title = createElement('h1', 'page__title', 'Список задач');
const intro = createElement('p', 'page__intro', 'Запишите важное и задайте дату, чтобы держать планы под рукой.');
const panel = createElement('section', 'panel');
panel.setAttribute('aria-labelledby', 'list-title');

const form = createElement('form', 'task-form');
const titleLabel = createElement('label', 'field');
titleLabel.append(createElement('span', '', 'Название задачи'));
const titleInput = createElement('input');
titleInput.type = 'text';
titleInput.name = 'title';
titleInput.placeholder = 'Например, подготовить отчёт';
titleInput.required = true;
titleInput.maxLength = 120;
titleLabel.append(titleInput);

const dateLabel = createElement('label', 'field');
dateLabel.append(createElement('span', '', 'Дата'));
const dateInput = createElement('input');
dateInput.type = 'date';
dateInput.name = 'date';
dateInput.required = true;
dateLabel.append(dateInput);

const addButton = createElement('button', 'button', 'Добавить задачу');
addButton.type = 'submit';
form.append(titleLabel, dateLabel, addButton);

const feedback = createElement('p', 'feedback');
feedback.setAttribute('role', 'status');
feedback.setAttribute('aria-live', 'polite');

const controls = createElement('div', 'task-controls');
const searchLabel = createElement('label', 'control-field');
searchLabel.append(createElement('span', '', 'Поиск по названию или дате'));
const searchInput = createElement('input');
searchInput.type = 'search';
searchInput.name = 'search';
searchInput.placeholder = 'Найти задачу';
searchInput.setAttribute('aria-label', 'Поиск задач по названию или дате');
searchLabel.append(searchInput);

const statusLabel = createElement('label', 'control-field');
statusLabel.append(createElement('span', '', 'Статус'));
const statusFilter = createElement('select');
statusFilter.setAttribute('aria-label', 'Фильтр задач по статусу');
[
  ['all', 'Все задачи'],
  ['active', 'Невыполненные'],
  ['completed', 'Выполненные'],
].forEach(([value, text]) => {
  const option = createElement('option', '', text);
  option.value = value;
  statusFilter.append(option);
});
statusLabel.append(statusFilter);

const sortLabel = createElement('label', 'control-field');
sortLabel.append(createElement('span', '', 'Порядок'));
const sortMode = createElement('select');
sortMode.setAttribute('aria-label', 'Сортировка задач');
[
  ['manual', 'Вручную'],
  ['date-asc', 'По дате: сначала ранние'],
  ['date-desc', 'По дате: сначала поздние'],
].forEach(([value, text]) => {
  const option = createElement('option', '', text);
  option.value = value;
  sortMode.append(option);
});
sortLabel.append(sortMode);
controls.append(searchLabel, statusLabel, sortLabel);

const listHeading = createElement('div', 'list-heading');
const listTitle = createElement('h2', '', 'Ваши задачи');
listTitle.id = 'list-title';
const count = createElement('p', 'task-count');
listHeading.append(listTitle, count);
const dragHint = createElement('p', 'drag-hint', 'В режиме «Вручную» перетаскивайте строки задач. Чтобы изменить общий порядок, очистите поиск и выберите «Все задачи».');
const list = createElement('ul', 'task-list');
list.setAttribute('aria-labelledby', 'list-title');

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    feedback.textContent = '';
    return true;
  } catch {
    feedback.textContent = 'Не удалось сохранить задачи в этом браузере.';
    return false;
  }
}

function formatDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function getVisibleTasks() {
  const query = searchInput.value.trim().toLocaleLowerCase('ru');
  const visibleTasks = tasks.filter((task) => {
    const searchableDate = `${task.date} ${formatDate(task.date)}`.toLocaleLowerCase('ru');
    const matchesSearch = task.title.toLocaleLowerCase('ru').includes(query)
      || searchableDate.includes(query);
    const matchesStatus = statusFilter.value === 'all'
      || (statusFilter.value === 'completed' && task.completed)
      || (statusFilter.value === 'active' && !task.completed);
    return matchesSearch && matchesStatus;
  });

  if (sortMode.value === 'date-asc') {
    return visibleTasks.sort((first, second) => first.date.localeCompare(second.date));
  }
  if (sortMode.value === 'date-desc') {
    return visibleTasks.sort((first, second) => second.date.localeCompare(first.date));
  }
  return visibleTasks;
}

function canReorder() {
  return sortMode.value === 'manual'
    && statusFilter.value === 'all'
    && searchInput.value.trim() === '';
}

function renderTasks() {
  list.replaceChildren();
  const visibleTasks = getVisibleTasks();
  count.textContent = `Показано: ${visibleTasks.length} из ${tasks.length}`;
  dragHint.hidden = !canReorder() || tasks.length < 2;

  if (visibleTasks.length === 0) {
    const message = tasks.length === 0
      ? 'Пока задач нет. Добавьте первую выше.'
      : 'Нет задач по выбранным условиям.';
    list.append(createElement('li', 'task__empty', message));
    return;
  }

  const reorderAllowed = canReorder() && tasks.length > 1;
  visibleTasks.forEach((task) => {
    const item = createElement('li', task.completed ? 'task task--completed' : 'task');
    item.dataset.taskId = task.id;
    item.draggable = reorderAllowed;

    const details = createElement('div', 'task__details');
    const taskName = createElement('p', 'task__title', task.title);
    if (task.completed) taskName.classList.add('task__title--completed');
    details.append(taskName, createElement('p', 'task__date', formatDate(task.date)));

    const actions = createElement('div', 'task__actions');
    const completeLabel = createElement('label', 'task__complete');
    const completeInput = createElement('input');
    completeInput.type = 'checkbox';
    completeInput.checked = task.completed;
    completeInput.setAttribute('aria-label', `Отметить «${task.title}» выполненной`);
    completeInput.addEventListener('change', () => {
      task.completed = completeInput.checked;
      saveTasks();
      renderTasks();
    });
    completeLabel.append(completeInput, createElement('span', '', 'Выполнено'));

    const editButton = createElement('button', 'button button--secondary', 'Изменить');
    editButton.type = 'button';
    editButton.setAttribute('aria-label', `Изменить задачу «${task.title}»`);
    editButton.addEventListener('click', () => startEditing(task));
    const deleteButton = createElement('button', 'button button--danger', 'Удалить');
    deleteButton.type = 'button';
    deleteButton.setAttribute('aria-label', `Удалить задачу «${task.title}»`);
    deleteButton.addEventListener('click', () => {
      const taskIndex = tasks.findIndex((entry) => entry.id === task.id);
      if (taskIndex !== -1) tasks.splice(taskIndex, 1);
      saveTasks();
      renderTasks();
    });

    const dragHandle = createElement('span', 'task__drag-handle', reorderAllowed ? '↕ Перетащить' : 'Порядок');
    dragHandle.setAttribute('aria-hidden', 'true');
    actions.append(completeLabel, editButton, deleteButton);
    if (reorderAllowed) actions.prepend(dragHandle);
    item.append(details, actions);

    if (reorderAllowed) {
      item.addEventListener('dragstart', (event) => {
        item.classList.add('task--dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', task.id);
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('task--dragging');
        item.classList.remove('task--drop-before', 'task--drop-after');
        if (draggedTaskId) {
          draggedTaskId = '';
          renderTasks();
        }
      });
      item.addEventListener('dragover', (event) => {
        if (!draggedTaskId || draggedTaskId === task.id || !canReorder()) return;
        event.preventDefault();
        const rect = item.getBoundingClientRect();
        const dropAfter = event.clientY > rect.top + rect.height / 2;
        item.classList.toggle('task--drop-before', !dropAfter);
        item.classList.toggle('task--drop-after', dropAfter);
      });
      item.addEventListener('dragleave', () => {
        item.classList.remove('task--drop-before', 'task--drop-after');
      });
      item.addEventListener('drop', (event) => {
        if (!draggedTaskId || draggedTaskId === task.id || !canReorder()) return;
        event.preventDefault();
        const rect = item.getBoundingClientRect();
        const dropAfter = event.clientY > rect.top + rect.height / 2;
        const draggedItem = list.querySelector(`[data-task-id="${CSS.escape(draggedTaskId)}"]`);
        if (!draggedItem) return;
        if (dropAfter) item.after(draggedItem);
        else item.before(draggedItem);
        commitVisibleOrder();
      });
    }

    list.append(item);
  });
}

let draggedTaskId = '';

function commitVisibleOrder() {
  const reorderedIds = Array.from(list.querySelectorAll('[data-task-id]'))
    .map((item) => item.dataset.taskId);
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const reorderedTasks = reorderedIds.map((id) => byId.get(id)).filter(Boolean);
  tasks.length = 0;
  reorderedTasks.forEach((task) => tasks.push(task));
  draggedTaskId = '';
  const saved = saveTasks();
  renderTasks();
  if (saved) feedback.textContent = 'Новый порядок сохранён.';
}

function startEditing(task) {
  const item = list.querySelector(`[data-task-id="${CSS.escape(task.id)}"]`);
  if (!item) return;

  const editForm = createElement('form', 'task-edit-form');
  const editTitle = createElement('input');
  editTitle.type = 'text';
  editTitle.name = 'title';
  editTitle.value = task.title;
  editTitle.maxLength = 120;
  editTitle.required = true;
  editTitle.setAttribute('aria-label', 'Название задачи');
  const editDate = createElement('input');
  editDate.type = 'date';
  editDate.name = 'date';
  editDate.value = task.date;
  editDate.required = true;
  editDate.setAttribute('aria-label', 'Дата задачи');
  const saveButton = createElement('button', 'button', 'Сохранить');
  saveButton.type = 'submit';
  const cancelButton = createElement('button', 'button button--secondary', 'Отмена');
  cancelButton.type = 'button';
  cancelButton.addEventListener('click', renderTasks);

  editForm.append(editTitle, editDate, saveButton, cancelButton);
  editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const nextTitle = editTitle.value.trim();
    if (!nextTitle || !isValidDate(editDate.value)) {
      feedback.textContent = 'Укажите название и корректную дату задачи.';
      return;
    }
    task.title = nextTitle;
    task.date = editDate.value;
    saveTasks();
    renderTasks();
  });
  item.replaceChildren(editForm);
  editTitle.focus();
  editTitle.select();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const taskTitle = titleInput.value.trim();
  if (!taskTitle || !isValidDate(dateInput.value)) {
    feedback.textContent = 'Укажите название и корректную дату задачи.';
    return;
  }

  tasks.push({
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: taskTitle.slice(0, 120),
    date: dateInput.value,
    completed: false,
  });
  saveTasks();
  form.reset();
  titleInput.focus();
  renderTasks();
});

searchInput.addEventListener('input', renderTasks);
statusFilter.addEventListener('change', renderTasks);
sortMode.addEventListener('change', renderTasks);

list.addEventListener('dragstart', (event) => {
  const item = event.target.closest('[data-task-id]');
  if (item && canReorder()) draggedTaskId = item.dataset.taskId;
});
list.addEventListener('dragover', (event) => {
  if (draggedTaskId && canReorder() && event.target === list) event.preventDefault();
});
list.addEventListener('drop', (event) => {
  if (!draggedTaskId || !canReorder() || event.target !== list) return;
  event.preventDefault();
  const draggedItem = list.querySelector(`[data-task-id="${CSS.escape(draggedTaskId)}"]`);
  if (!draggedItem) return;
  list.append(draggedItem);
  commitVisibleOrder();
});

panel.append(form, feedback, controls, listHeading, dragHint, list);
page.append(homeLink, eyebrow, title, intro, panel);
document.body.append(page);
renderTasks();
