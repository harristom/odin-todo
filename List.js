import Task from "./Task.js";

export default class List {

    title;
    #tasks = [];

    constructor(title) {
        this.title = title;
    }

    addTasks(...tasks) {
        for (const task of tasks) {
            task.list = this;
            if (!this.#tasks.includes(task)) this.#tasks.push(task);
        }
    }

    removeTask(task) {
        task.list = null;
        this.#tasks.splice(this.#tasks.indexOf(task), 1);
    }

    get tasks() {
        return this.#tasks;
    }

}