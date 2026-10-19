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

    return savedTasks
      .filter((task) => task && typeof task.id === 'string'
        && typeof task.title === 'string' && task.title.trim()
        && isValidDate(task.date))
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

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    feedback.textContent = '';
  } catch {
    feedback.textContent = 'Не удалось сохранить задачи в этом браузере.';
  }
}

function sortTasks() {
  tasks.sort((first, second) => first.date.localeCompare(second.date));
}

function formatDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

const page = createElement('main', 'page');
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
const listHeading = createElement('div', 'list-heading');
const listTitle = createElement('h2', '', 'Ваши задачи');
listTitle.id = 'list-title';
const count = createElement('p', 'task-count');
listHeading.append(listTitle, count);
const list = createElement('ul', 'task-list');
list.setAttribute('aria-labelledby', 'list-title');

function renderTasks() {
  list.replaceChildren();
  count.textContent = `Всего: ${tasks.length}`;

  if (tasks.length === 0) {
    list.append(createElement('li', 'task__empty', 'Пока задач нет. Добавьте первую выше.'));
    return;
  }

  tasks.forEach((task) => {
    const item = createElement('li', task.completed ? 'task task--completed' : 'task');
    item.dataset.taskId = task.id;
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

    actions.append(completeLabel, editButton, deleteButton);
    item.append(details, actions);
    list.append(item);
  });
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
    if (!nextTitle || !editDate.value) {
      feedback.textContent = 'Укажите название и дату задачи.';
      return;
    }
    task.title = nextTitle;
    task.date = editDate.value;
    sortTasks();
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
  if (!taskTitle || !dateInput.value) {
    feedback.textContent = 'Укажите название и дату задачи.';
    return;
  }

  tasks.push({
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: taskTitle,
    date: dateInput.value,
    completed: false,
  });
  sortTasks();
  saveTasks();
  form.reset();
  titleInput.focus();
  renderTasks();
});

panel.append(form, feedback, listHeading, list);
page.append(eyebrow, title, intro, panel);
document.body.append(page);
sortTasks();
renderTasks();
