export default class Task {

    static #id = 0;
    id;
    title;
    description;
    dueDate;
    completed = false;
    list;

    constructor(title, description, dueDate) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.id = ++Task.#id;
    }

    moveToList(list, priority) {
        const oldList = this.list;
        const newList = list;
        oldList.removeTask(this);
        newList.insertTask(this, priority);
    }

    delete() {
        this.list.removeTask(this);
    }

    static fromJSON(key, value) {
        if (value === this['']) {
            // We are at the top level of the object
            const task = Object.assign(Object.create(Task.prototype), value);
            // Keep the original ID while making sure any new IDs are higher
            Task.#id = Math.max(task.id, Task.#id);
            return task;
        }
        if (key == 'dueDate') return new Date(value);
        // Fallback to returning the value unaltered
        return value;
    }

}