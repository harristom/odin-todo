import List from "./List.js";
import Task from "./Task.js";

function makeList(list) {
    // Make list element
    const clone = document.querySelector('#list-template').content.cloneNode(true);
    const listCard = clone.querySelector('.list');
    listCard.querySelector('.list__title').textContent = list.title;
    // Add event listener to edit title
    const form = listCard.querySelector('.list__title-form');
    listCard.querySelector('.list__edit-btn').addEventListener('click', () => toggleTitleInput(listCard));
    form.querySelector('.list__title-input').addEventListener('blur', () => form.requestSubmit());
    form.addEventListener('submit', submitTitle);
    // Add event listener to delete list
    listCard.querySelector('.list__delete-btn').addEventListener('click', confirmListDelete);
    // Add tasks
    for (const task of list.tasks) {
        const li = makeTask(task);
        listCard.querySelector('.list__list').append(li);
    }
    // Add event listeners for new task button
    const addBtn = listCard.querySelector('.list__add-button');
    addBtn.addEventListener('click', e => listCard.querySelector('.new-task').showModal());
    addBtn.addEventListener('dragenter', dragEnterBtn);
    // Prevent default makes the target a valid drop zone if it isn't one otherwise
    addBtn.addEventListener('dragover', e => e.preventDefault());
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

function submitTitle(e) {
    e.preventDefault();
    const form = this;
    const input = form.querySelector('.list__title-input');
    const listCard = form.closest('.list');
    const titleValEl = listCard.querySelector('.list__title');
    const list = listCard.list;
    // Update object, storage and UI
    list.title = input.value;
    localStorage.setItem('list' + list.id, JSON.stringify(list));
    titleValEl.textContent = list.title;
    toggleTitleInput(listCard);
}

function toggleTitleInput(listCard) {
    const title = listCard.querySelector('.list__title');
    const input = listCard.querySelector('.list__title-input');
    input.value = title.textContent;
    listCard.querySelector('.list__header').classList.toggle('edit');
    document.activeElement == input ? input.blur() : input.focus();
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
    const dateVal = form.querySelector('[name=duedate]').value;
    // Create task object
    const task = new Task(
        form.querySelector('[name=title]').value,
        form.querySelector('[name=description]').value,
        dateVal ? new Date(dateVal) : undefined
    );
    // Add to list object and update list in storage
    const list = listCard.list;
    list.insertTask(task);
    localStorage.setItem('list' + list.id, JSON.stringify(list));
    // Add task to local storage
    localStorage.setItem('task' + task.id, JSON.stringify(task));
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
    li.querySelector('.task__due-date-value').textContent = task.dueDate?.toLocaleString(undefined, { day: 'numeric', month: 'numeric' });
    if (task.dueDate < new Date()) li.classList.add('task--overdue');
    li.querySelector('.task__checkbox').checked = task.completed;
    li.querySelector('.task__checkbox').addEventListener('change', e => {
        task.completed = !task.completed;
        localStorage.setItem('task' + task.id, JSON.stringify(task));
    });
    // Create dialog for task details
    li.querySelector('.task__dialog-title').textContent = task.title;
    li.querySelector('.task__dialog-description').textContent = task.description;
    li.querySelector('.task__dialog-due-date').textContent = task.dueDate?.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });
    li.querySelector('.task__dialog-close').addEventListener('click', e => e.currentTarget.closest('.task__dialog').close());
    li.querySelector('.task__dialog').addEventListener('click', clickAwayDialog);
    li.querySelector('.task__dialog-delete').addEventListener('click', confirmTaskDelete);
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

function confirmTaskDelete() {
    const taskEl = this.closest('.task');
    taskEl.dataset.delete = true;
    document.querySelector('#delete-task-confirmation').showModal();
}

function deleteTask() {
    const taskEl = document.querySelector('.task[data-delete=true]');
    const task = taskEl.task;
    const listEl = taskEl.closest('.list');
    const list = listEl.list;
    localStorage.removeItem('task' + task.id);
    task.delete();
    taskEl.remove();
    localStorage.setItem('list' + list.id, JSON.stringify(list));
    document.querySelector('#delete-task-confirmation').close();
}

function cancelTaskDelete() {
    document.querySelector('.task[data-delete=true]').removeAttribute('data-delete');
    document.querySelector('#delete-task-confirmation').close();
}

function confirmListDelete() {
    const listEl = this.closest('.list');
    listEl.dataset.delete = true;
    document.querySelector('#delete-list-confirmation').showModal();
}

function deleteList() {
    const listEl = document.querySelector('.list[data-delete=true]');
    const list = listEl.list;
    // Delete list's tasks from local storage
    for (const task of list.tasks) {
        localStorage.removeItem('task' + task.id);
        task.delete();
    }
    // Delete list from local storage
    localStorage.removeItem('list' + list.id);
    const lists = JSON.parse(localStorage.getItem('lists'));
    lists.splice(lists.indexOf(list.id), 1);
    localStorage.setItem('lists', JSON.stringify(lists));
    // Update UI
    listEl.remove();
    document.querySelector('#delete-list-confirmation').close();
}

function cancelListDelete() {
    document.querySelector('.list[data-delete=true]').removeAttribute('data-delete');
    document.querySelector('#delete-list-confirmation').close();
}

function dragStart(e) {
    console.log('dragstart');
    // Required in some browsers (e.g. Epiphany)
    e.dataTransfer.setData('text/plain', '');
    // Delay making any change to drag item appearance until after the browser has taken a picture of the element
    requestAnimationFrame(() => {
        this.id = 'dragged';
    });
}

function dragOverTask(e) {
    // Handle dragover of a task element
    console.log('dragover');
    // Prevent default makes the target a valid drop zone if it isn't one otherwise
    e.preventDefault();
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
    const task = dragged.task;
    const oldList = task.list;
    const newList = this.closest('.list').list;
    // Update objects
    dragged.task.moveToList(newList, position);
    // Update in storage
    if (oldList != newList) localStorage.setItem('list' + oldList.id, JSON.stringify(oldList));
    localStorage.setItem('list' + newList.id, JSON.stringify(newList));
    // Update UI
    dragged.removeAttribute('id');
    dragged.removeAttribute('draggable');
}

function submitNewList(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.querySelector('[name=title]').value) return;
    // Create list object
    const list = new List(form.querySelector('[name=title]').value);
    // Add to storage
    localStorage.setItem('list' + list.id, JSON.stringify(list));
    const lists = JSON.parse(localStorage.getItem('lists'));
    lists.push(list.id);
    localStorage.setItem('lists', JSON.stringify(lists));
    // Create list element
    const listEl = makeList(list);
    // Draw list
    document.querySelector('#new-list').before(listEl);
    form.reset();
}

function makeSamples() {
    // Create a sample list with task
    const list = new List("My very first list");
    list.addTasks(
        new Task('Wash the car', 'scrub scrub'),
        new Task('Mend the bike'),
        new Task('Write a very long task to show how a task card looks when the title is quite long and wraps over several lines', undefined, new Date('2030-01-01 12:00')),
        new Task('Cook the turkey', '3 hours at 180 °C', new Date('2030-12-25 15:00')),
        new Task('Destroy the world', undefined, new Date('2012-12-21 15:00'))
    );
    // Add to storage
    for (const task of list.tasks) {
        localStorage.setItem('task' + task.id, JSON.stringify(task));
    }
    localStorage.setItem('list' + list.id, JSON.stringify(list));
    localStorage.setItem('lists', JSON.stringify([list.id]));

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
}

function restoreFromStorage() {
    const lists = JSON.parse(localStorage.getItem('lists'));
    lists.forEach(listId => {
        // Loop through lists only (when reviving the list we will also create its tasks)
        const list = JSON.parse(localStorage.getItem('list' + listId), List.fromJSON);
        document.querySelector('#new-list').before(makeList(list));
    });
}

// Restore from storage or create samples
if (localStorage.getItem('lists')) {
    restoreFromStorage();
} else {
    makeSamples();
}

// Add event listener for new list form
document.querySelector('#new-list-form').addEventListener('submit', submitNewList);

// Add event listeners for delete confirmation dialogs
document.querySelector('#delete-task-confirmation .delete-confirmation__yes').addEventListener('click', deleteTask);
document.querySelector('#delete-task-confirmation .delete-confirmation__no').addEventListener('click', cancelTaskDelete);
document.querySelector('#delete-list-confirmation .delete-confirmation__yes').addEventListener('click', deleteList);
document.querySelector('#delete-list-confirmation .delete-confirmation__no').addEventListener('click', cancelListDelete);

// Add event lister to reset button
document.getElementById('reset').addEventListener('click', e => {
    localStorage.clear();
    location.reload();
})

// TODO: Edit task
// TODO: Move list
// TODO: Local storage - respond to changes made in another tab/window
