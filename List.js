import Task from "./Task.js";

export default class List {

    title;
    #tasks = [];

    constructor(title) {
        this.title = title;
    }

    addTasks(...tasks) {
        for (const task of tasks) this.insertTask(task);
    }

    insertTask(task, pos = this.#tasks.length) {
        this.#tasks.splice(pos, 0, task);
        task.list = this;
    }

    removeTask(task) {
        task.list = null;
        this.#tasks.splice(this.#tasks.indexOf(task), 1);
    }

    get tasks() {
        return this.#tasks;
    }

}