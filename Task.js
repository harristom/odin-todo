export default class Task {

    list;
    title;
    description;
    dueDate;
    completed = false;

    constructor(title, description, dueDate) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
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

}