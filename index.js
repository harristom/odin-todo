import List from "./List.js";
import Task from "./Task.js";

function makeList(list) {
    // Make list element
    const article = document.querySelector('#list-template').content.cloneNode(true).firstElementChild;
    article.querySelector('.list__title').textContent = list.title;
    // Add tasks
    for (const task of list.tasks) {
        const li = makeTask(task);
        article.querySelector('.list__list').append(li);
    }
    // Add event listeners for new task
    article.querySelector('.list__add-button').addEventListener('click', e => {
        const dialog = document.querySelector('.new-task');
        dialog.article = article;
        dialog.showModal()
    });
    // Store list object ref with element
    article.list = list;
    return article;
}

function submitNewTask(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const article = form.closest('dialog').article;
    // Create task object
    const task = new Task(
        form.querySelector('[name=title]').value,
        form.querySelector('[name=description]').value,
        new Date(form.querySelector('[name=duedate]').value)
    );
    // Add to list object
    const list = article.list;
    list.addTasks(task);
    // Add to list in UI
    const li = makeTask(task);
    li.classList.add('animate__animated', 'animate__fadeInUp', 'animate__fast');
    article.querySelector('.list__list').append(li);
    // Close form
    form.reset();
    form.closest('dialog').close();
}

function makeTask(task) {
    // Create task element
    const li = document.querySelector('#task-template').content.cloneNode(true).firstElementChild;
    li.querySelector('.task__title').textContent = task.title;
    // Create dialog for task details
    li.querySelector('.task__dialog-title').textContent = task.title;
    li.querySelector('.task__dialog-description').textContent = task.description ?? '...';
    li.querySelector('.task__dialog-close').addEventListener('click', e => e.currentTarget.closest('dialog').close());
    // Open dialog when task clicked
    li.querySelector('.task__title').addEventListener('click', e => {
        e.preventDefault();
        e.currentTarget.closest('.task').querySelector('.task__dialog').showModal();
    });
    // Store task object ref with element
    li.task = task;
    return li;
}

// Create some sample tasks
const list = new List("List 1");
list.addTasks(
    new Task('Wash the car', 'scrub scrub'),
    new Task('Mend the bike'),
    new Task('Destroy the world')
)

// Add event listener for new list form
document.querySelector('#new-list-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.querySelector('[name=title]').value) return;
    // Create list object
    const list = new List(form.querySelector('[name=title]').value);
    // Create list element
    const listEl = makeList(list);
    // Draw list
    listEl.classList.add('animate__animated', 'animate__fadeInUp');
    document.querySelector('#new-list').before(listEl);
    form.reset();
});

// Add event listeners for new task form
document.querySelector('.new-task__form').addEventListener('submit', submitNewTask);
document.querySelector('.new-task__cancel').addEventListener('click', e => e.currentTarget.closest('dialog').close());

// Add the example list to the page
const listEl = makeList(list);
document.querySelector('#new-list').before(listEl);