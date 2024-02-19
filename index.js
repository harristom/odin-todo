import List from "./List.js";
import Task from "./Task.js";

function makeList(list) {
    // Make list element
    const clone = document.querySelector('#list-template').content.cloneNode(true);
    const listCard = clone.querySelector('.list');
    listCard.querySelector('.list__title').textContent = list.title;
    // Add tasks
    for (const task of list.tasks) {
        const li = makeTask(task);
        listCard.querySelector('.list__list').append(li);
    }
    // Add event listeners for new task button
    const addBtn = listCard.querySelector('.list__add-button');
    addBtn.addEventListener('click', e => listCard.querySelector('.new-task').showModal());
    addBtn.addEventListener('dragenter', dragEnterBtn);
    // Add event listeners for new task form
    listCard.querySelector('.new-task__form').addEventListener('submit', submitNewTask);
    listCard.querySelector('.new-task__cancel').addEventListener('click', e => e.currentTarget.closest('.new-task').close());
    listCard.querySelector('.new-task').addEventListener('click', clickAwayDialog);
    listCard.querySelector('.new-task').addEventListener('close', () => listCard.querySelector('.new-task__form').reset());
    // Restrict due date to be in future
    listCard.querySelector('.new-task__form [name="duedate"]').setAttribute('min', new Date().toLocaleString('sv').replace(' ', 'T').slice(0, -3));
    // Store list object ref with element
    listCard.list = list;
    return listCard;
}

function clickAwayDialog(e) {
    // Closes a dialog when there is a click outside the dialog
    if (e.target != e.currentTarget) return;
    const { top, left, bottom, right } = e.currentTarget.getBoundingClientRect();
    if (e.y > bottom || e.y < top || e.x < left || e.x > right) e.currentTarget.close();
}

function submitNewTask(e) {
    // Handle new task form submission
    e.preventDefault();
    const form = e.currentTarget;
    const listCard = form.closest('.list');
    // Create task object
    const task = new Task(
        form.querySelector('[name=title]').value,
        form.querySelector('[name=description]').value,
        new Date(form.querySelector('[name=duedate]').value)
    );
    // Add to list object
    const list = listCard.list;
    list.insertTask(task);
    // Add to list in UI
    const li = makeTask(task);
    listCard.querySelector('.list__list').append(li);
    // Close form
    form.reset();
    form.closest('.new-task').close();
}

function makeTask(task) {
    // Create task element
    const clone = document.querySelector('#task-template').content.cloneNode(true);
    const li = clone.querySelector('.task');
    li.querySelector('.task__title').textContent = task.title;
    // Create dialog for task details
    li.querySelector('.task__dialog-title').textContent = task.title;
    li.querySelector('.task__dialog-description').textContent = task.description;
    li.querySelector('.task__dialog-close').addEventListener('click', e => e.currentTarget.closest('.task__dialog').close());
    li.querySelector('.task__dialog').addEventListener('click', clickAwayDialog);
    // Open dialog when task clicked
    li.querySelector('.task__title').addEventListener('click', e => {
        e.preventDefault();
        e.currentTarget.closest('.task').querySelector('.task__dialog').showModal();
    });
    // Add event listeners for drag and drop
    const handle = li.querySelector('.task__handle');
    handle.addEventListener('pointerdown', () => li.setAttribute('draggable', 'true'));
    handle.addEventListener('pointerup', () => li.removeAttribute('draggable'));
    li.addEventListener('dragstart', dragStart);
    li.addEventListener('dragover', dragOverTask);
    li.addEventListener('dragend', dragEnd);
    li.addEventListener('drop', e => e.preventDefault());
    // Store task object ref with element
    li.task = task;
    return li;
}

function dragStart(e) {
    console.log('dragstart');
    // Delay making any change to drag item appearance until after the browser has taken a picture of the element
    requestAnimationFrame(() => {
        this.id = 'dragged';
    });
}

function dragOverTask(e) {
    // Handle dragover of a task element
    console.log('dragover');
    const dragged = document.getElementById('dragged');
    if (dragged == this) return;
    // Don't move anything down until the mouse will still be positioned over the dropzone after swapping
    // (otherwise we will be entering this dropzone again and keep swapping the elements infinitely)
    if (this.getBoundingClientRect().height - dragged.getBoundingClientRect().height > e.offsetY) {
        return;
    }
    const movingUp = this.getBoundingClientRect().top < dragged.getBoundingClientRect().top;
    if (movingUp) {
        this.before(dragged);
    } else {
        this.after(dragged);
    }
}

function dragEnterBtn(e) {
    // Handle dragenter of the new task button
    console.log('dragenter btn');
    const dragged = document.getElementById('dragged');
    const listEl = this.closest('.list').querySelector('.list__list');
    if (listEl.lastElementChild != dragged) listEl.append(dragged);
}

function dragEnd(e) {
    console.log('dragend');
    const dragged = document.getElementById('dragged');
    const position = [...this.parentElement.children].indexOf(this);
    dragged.task.moveToList(this.closest('.list').list, position);
    document.querySelectorAll('.list__list').forEach(ol => {
        const list = ol.closest('.list');
        if (!list) return;
        console.log(list.list);
    });
    dragged.removeAttribute('id');
    dragged.removeAttribute('draggable');
}

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
    document.querySelector('#new-list').before(listEl);
    form.reset();
});

// Create some sample tasks
const list = new List("List 1");
list.addTasks(
    new Task('Wash the car', 'scrub scrub'),
    new Task('Mend the bike'),
    // new Task('Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis autem esse distinctio dicta officiis, nulla possimus dolores consequuntur repudiandae officia?'),
    new Task('Destroy the world')
);

// const list2 = new List("List 2");
// list2.addTasks(
//     new Task('Buy stamps'),
//     new Task('Call John'),
//     new Task('Walk the dog'),
//     new Task('Prepare for the apocalypse')
// );

// Add the example list to the page
document.querySelector('#new-list').before(makeList(list));
// document.querySelector('#new-list').before(makeList(list2));

// TODO: Allow deleting items