export default class Task {

    list;
    title;
    description;
    dueDate;
    priority;
    completed = false;

    constructor(title, description, dueDate) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
    }

}