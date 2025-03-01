// Task management functionality
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.form = document.getElementById('task-form');
        this.input = document.getElementById('task-input');
        this.categorySelect = document.getElementById('category-select');
        this.prioritySelect = document.getElementById('priority-select');
        this.container = document.getElementById('tasks-container');
        this.statusFilters = document.querySelectorAll('[data-status]');
        this.categoryFilters = document.querySelectorAll('[data-category]');

        this.currentStatusFilter = 'all';
        this.currentCategoryFilter = 'all';

        this.setupEventListeners();
        this.renderTasks();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        this.statusFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setStatusFilter(btn.dataset.status);
            });
        });

        this.categoryFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setCategoryFilter(btn.dataset.category);
            });
        });
    }

    setStatusFilter(status) {
        this.currentStatusFilter = status;
        this.updateFilterButtons();
        this.renderTasks();
    }

    setCategoryFilter(category) {
        this.currentCategoryFilter = category;
        this.updateFilterButtons();
        this.renderTasks();
    }

    updateFilterButtons() {
        this.statusFilters.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.status === this.currentStatusFilter);
        });
        this.categoryFilters.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.currentCategoryFilter);
        });
    }

    addTask() {
        const title = this.input.value.trim();
        if (!title) return;

        const task = {
            id: Date.now(),
            title,
            completed: false,
            category: this.categorySelect.value,
            priority: this.prioritySelect.value,
            dueDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.input.value = '';
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const newTitle = prompt('Edit task:', task.title);
        if (newTitle && newTitle.trim()) {
            task.title = newTitle.trim();
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    filterTasks() {
        return this.tasks.filter(task => {
            const matchesStatus =
                this.currentStatusFilter === 'all' ? true :
                    this.currentStatusFilter === 'completed' ? task.completed :
                        !task.completed;

            const matchesCategory =
                this.currentCategoryFilter === 'all' ? true :
                    task.category === this.currentCategoryFilter;

            return matchesStatus && matchesCategory;
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    renderTask(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task ${task.completed ? 'completed' : ''}`;
        taskElement.innerHTML = `
            <button class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="taskManager.toggleTask(${task.id})">
                ${task.completed ? `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                ` : ''}
            </button>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span class="tag category-${task.category.toLowerCase()}">${task.category}</span>
                    <span class="tag priority-${task.priority}">${task.priority}</span>
                    <span class="task-date">${this.formatDate(task.dueDate)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn edit" onclick="taskManager.editTask(${task.id})" title="Edit task">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="action-btn delete" onclick="taskManager.deleteTask(${task.id})" title="Delete task">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        this.container.appendChild(taskElement);
    }

    renderTasks() {
        this.container.innerHTML = '';
        const filteredTasks = this.filterTasks();
        filteredTasks.forEach(task => this.renderTask(task));
    }
}

// Initialize the task manager
const taskManager = new TaskManager();