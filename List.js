import Task from "./Task.js";

export default class List {

    static #id = 0;
    id;
    title;
    tasks = [];

    constructor(title) {
        this.title = title;
        this.id = ++List.#id;
    }

    addTasks(...tasks) {
        for (const task of tasks) this.insertTask(task);
    }

    insertTask(task, pos = this.tasks.length) {
        this.tasks.splice(pos, 0, task);
        task.list = this;
    }

    removeTask(task) {
        task.list = null;
        this.tasks.splice(this.tasks.indexOf(task), 1);
    }

    toJSON() {
        return {
            ...this,
            tasks: this.tasks.map(task => task.id)
        }
    }

    static fromJSON(key, value) {
        // A reviver for use with JSON.parse
        if (value === this['']) {
            // We are at the root of the object
            // Convert back to an instance of List
            const list = Object.assign(Object.create(List.prototype), value);
            list.tasks = list.tasks.map(task => {
                // Swap the task IDs for a reference to the task itself
                // (we could have done this while reviving the task array itself,
                // but since we can't add the list to the task until reviving the list
                // it makes sense to do both in one loop)
                task = JSON.parse(localStorage.getItem('task' + task), Task.fromJSON);
                task.list = list;
                return task;
            });
            // Keep the original ID while making sure any new IDs are higher
            List.#id = Math.max(list.id, List.#id);
            return list;
        }
        return value;
    }

}