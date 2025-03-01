class TodoList {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentId = parseInt(localStorage.getItem('currentId')) || 1;
        this.editingId = null;
        this.currentFilter = 'all';

        // DOM Elements
        this.form = document.getElementById('todo-form');
        this.input = document.getElementById('todo-input');
        this.list = document.getElementById('todo-list');
        this.emptyState = document.getElementById('empty-state');
        this.editModal = new bootstrap.Modal(document.getElementById('editModal'));
        this.editInput = document.getElementById('edit-input');
        this.saveEditBtn = document.getElementById('save-edit');
        this.prioritySelect = document.getElementById('priority-select');
        this.editPrioritySelect = document.getElementById('edit-priority-select');
        this.dueDateInput = document.getElementById('due-date-input');
        this.editDueDateInput = document.getElementById('edit-due-date');

        // Stats Elements
        this.totalTasksEl = document.getElementById('total-tasks');
        this.completedTasksEl = document.getElementById('completed-tasks');
        this.pendingTasksEl = document.getElementById('pending-tasks');
        this.completionPercentageEl = document.getElementById('completion-percentage');

        this.initialize();
    }

    initialize() {
        // Event Listeners
        this.form.addEventListener('submit', (e) => this.addTodo(e));
        this.saveEditBtn.addEventListener('click', () => this.saveEdit());

        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTodos();
            });
        });

        // Initial render
        this.renderTodos();
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const pending = total - completed;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
        this.pendingTasksEl.textContent = pending;
        this.completionPercentageEl.textContent = `${percentage}%`;

        // Update progress ring
        const ring = document.querySelector('.progress-ring-circle');
        ring.style.setProperty('--progress', `${percentage * 3.6}deg`);

        // Toggle empty state
        this.emptyState.classList.toggle('d-none', total > 0);
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        localStorage.setItem('currentId', this.currentId.toString());
        this.updateStats();
    }

    addTodo(e) {
        e.preventDefault();
        const text = this.input.value.trim();
        const priority = this.prioritySelect.value;
        const dueDate = this.dueDateInput.value ? new Date(this.dueDateInput.value) : null;

        if (!text) {
            this.input.classList.add('shake');
            setTimeout(() => this.input.classList.remove('shake'), 500);
            return;
        }

        const todo = {
            id: this.currentId++,
            text,
            priority,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            dueDate
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.renderTodos();

        // Clear input with animation
        this.input.value = '';
        this.prioritySelect.value = 'medium';
        this.dueDateInput.value = '';
        this.input.classList.add('fade-out');
        setTimeout(() => this.input.classList.remove('fade-out'), 300);

        // Show success feedback
        const newItem = document.querySelector('.todo-item');
        if (newItem) {
            newItem.classList.add('highlight');
            setTimeout(() => newItem.classList.remove('highlight'), 1000);
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            todo.updatedAt = new Date();
            this.saveTodos();
            this.renderTodos();
        }
    }

    deleteTodo(id) {
        const todoEl = document.querySelector(`[data-id="${id}"]`);
        if (todoEl) {
            todoEl.classList.add('fade-out');
            setTimeout(() => {
                this.todos = this.todos.filter(todo => todo.id !== id);
                this.saveTodos();
                this.renderTodos();
            }, 300);
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.editingId = id;
            this.editInput.value = todo.text;
            this.editPrioritySelect.value = todo.priority || 'medium';
            if (todo.dueDate) {
                const dueDate = new Date(todo.dueDate);
                this.editDueDateInput.value = dueDate.toISOString().slice(0, 16);
            } else {
                this.editDueDateInput.value = '';
            }
            this.editModal.show();
            setTimeout(() => this.editInput.focus(), 400);
        }
    }

    saveEdit() {
        const text = this.editInput.value.trim();
        const priority = this.editPrioritySelect.value;
        const dueDate = this.editDueDateInput.value ? new Date(this.editDueDateInput.value) : null;

        if (!text) return;

        const todo = this.todos.find(t => t.id === this.editingId);
        if (todo) {
            todo.text = text;
            todo.priority = priority;
            todo.dueDate = dueDate;
            todo.updatedAt = new Date();
            this.saveTodos();
            this.renderTodos();
        }

        this.editModal.hide();
    }

    getDueDateStatus(dueDate) {
        if (!dueDate) return '';

        const now = new Date();
        const due = new Date(dueDate);
        const diffHours = (due - now) / (1000 * 60 * 60);

        if (diffHours < 0) {
            return '<span class="badge bg-danger">Overdue</span>';
        } else if (diffHours < 24) {
            return '<span class="badge bg-warning">Due Today</span>';
        } else if (diffHours < 48) {
            return '<span class="badge bg-info">Due Tomorrow</span>';
        }
        return `<span class="badge bg-secondary">Due ${due.toLocaleDateString()}</span>`;
    }

    filterTodos() {
        return this.todos.filter(todo => {
            switch (this.currentFilter) {
                case 'active': return !todo.completed;
                case 'completed': return todo.completed;
                default: return true;
            }
        }).sort((a, b) => {
            // Sort by priority first
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

            if (priorityDiff !== 0) return priorityDiff;

            // Then sort by due date if both have due dates
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            // Put tasks with due dates before those without
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            return 0;
        });
    }

    getPriorityBadge(priority) {
        const badges = {
            high: '<span class="badge bg-danger">High</span>',
            medium: '<span class="badge bg-warning">Medium</span>',
            low: '<span class="badge bg-info">Low</span>'
        };
        return badges[priority] || badges.medium;
    }

    createTodoElement(todo) {
        const li = document.createElement('div');
        li.className = `todo-item d-flex align-items-center p-3 ${todo.completed ? 'completed' : ''} fade-in priority-${todo.priority || 'medium'}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
            <div class="todo-checkbox">
                <input type="checkbox" class="form-check-input" ${todo.completed ? 'checked' : ''}>
            </div>
            <div class="todo-content">
                <span class="todo-text">${todo.text}</span>
                <div class="todo-meta">
                    ${this.getPriorityBadge(todo.priority || 'medium')}
                    ${todo.dueDate ? this.getDueDateStatus(todo.dueDate) : ''}
                </div>
            </div>
            <div class="todo-actions">
                <button class="btn btn-sm btn-outline-primary action-btn edit-btn" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger action-btn delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Event Listeners
        li.querySelector('input[type="checkbox"]').addEventListener('change', 
            () => this.toggleTodo(todo.id));
        li.querySelector('.edit-btn').addEventListener('click', 
            () => this.editTodo(todo.id));
        li.querySelector('.delete-btn').addEventListener('click', 
            () => this.deleteTodo(todo.id));

        return li;
    }

    renderTodos() {
        this.list.innerHTML = '';
        const filteredTodos = this.filterTodos();
        filteredTodos.forEach(todo => {
            this.list.appendChild(this.createTodoElement(todo));
        });
        this.updateStats();
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new TodoList();
});