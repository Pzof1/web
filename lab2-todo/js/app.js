const tasks = [];

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
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

const addButton = createElement('button', 'button', 'Добавить');
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
    const empty = createElement('li', 'task__empty', 'Пока задач нет. Добавьте первую выше.');
    list.append(empty);
    return;
  }

  tasks.forEach((task) => {
    const item = createElement('li', 'task');
    const details = createElement('div');
    details.append(createElement('p', 'task__title', task.title));
    details.append(createElement('p', 'task__date', new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date(`${task.date}T00:00:00`))));
    item.append(details);
    list.append(item);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const taskTitle = titleInput.value.trim();
  if (!taskTitle || !dateInput.value) {
    feedback.textContent = 'Укажите название и дату задачи.';
    return;
  }

  tasks.push({ title: taskTitle, date: dateInput.value });
  tasks.sort((first, second) => first.date.localeCompare(second.date));
  feedback.textContent = '';
  form.reset();
  titleInput.focus();
  renderTasks();
});

panel.append(form, feedback, listHeading, list);
page.append(eyebrow, title, intro, panel);
document.body.append(page);
renderTasks();
