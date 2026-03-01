const API_URL = document.querySelector('meta[name="api-url"]')?.content || 
                document.body.dataset.apiUrl || 
                'http://localhost:3000';


// Afficher l'URL de l'API dans le footer
document.getElementById('apiUrl').textContent = API_URL;

// Fonction pour gérer les erreurs de fetch
async function handleFetchResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Erreur HTTP: ${response.status}`);
    }
    return response.json();
}

// Charger les tâches au démarrage
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    testApiConnection();
});

// Gérer la soumission du formulaire
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const task = {
        title: formData.get('title'),
        description: formData.get('description') || null,
        status: formData.get('status')
    };

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task)
        });

        const result = await handleFetchResponse(response);
        console.log('Tâche créée:', result);
        
        // Réinitialiser le formulaire
        e.target.reset();
        
        // Recharger la liste des tâches
        await loadTasks();
        
        // Afficher un message de succès
        showNotification('Tâche ajoutée avec succès!', 'success');
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de l\'ajout de la tâche', 'error');
    }
});

// Fonction pour charger les tâches
async function loadTasks() {
    const tasksContainer = document.getElementById('tasks');
    
    try {
        tasksContainer.innerHTML = '<div class="loading">Chargement...</div>';
        
        const response = await fetch(`${API_URL}/tasks`);
        const tasks = await handleFetchResponse(response);
        
        if (tasks.length === 0) {
            tasksContainer.innerHTML = '<div class="empty-state">Aucune tâche pour le moment</div>';
            return;
        }
        
        displayTasks(tasks);
        
    } catch (error) {
        console.error('Erreur chargement:', error);
        tasksContainer.innerHTML = `<div class="error">Erreur de chargement: ${error.message}</div>`;
    }
}

// Afficher les tâches
function displayTasks(tasks) {
    const tasksContainer = document.getElementById('tasks');
    tasksContainer.innerHTML = '';
    
    tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card status-${task.status}`;
        taskCard.innerHTML = `
            <h3>${escapeHtml(task.title)}</h3>
            ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ''}
            <div class="task-meta">
                <span class="status-badge status-${task.status}">
                    ${getStatusLabel(task.status)}
                </span>
                <small>Créée: ${formatDate(task.created_at)}</small>
            </div>
            <div class="task-actions">
                <select class="status-select" data-id="${task.id}">
                    <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>À faire</option>
                    <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>En cours</option>
                    <option value="done" ${task.status === 'done' ? 'selected' : ''}>Terminé</option>
                </select>
                <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️ Supprimer</button>
            </div>
        `;
        tasksContainer.appendChild(taskCard);
    });

    // Ajouter les écouteurs pour les changements de statut
    document.querySelectorAll('.status-select').forEach(select => {
        select.removeEventListener('change', updateTaskStatus);
        select.addEventListener('change', updateTaskStatus);
    });
}

// Mettre à jour le statut d'une tâche
async function updateTaskStatus(e) {
    const taskId = e.target.dataset.id;
    const newStatus = e.target.value;
    
    try {
        // Récupérer d'abord la tâche pour avoir les données actuelles
        const response = await fetch(`${API_URL}/tasks/${taskId}`);
        const task = await handleFetchResponse(response);
        
        // Mettre à jour avec le nouveau statut
        const updateResponse = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: task.title,
                description: task.description,
                status: newStatus
            })
        });
        
        await handleFetchResponse(updateResponse);
        showNotification('Statut mis à jour!', 'success');
        
    } catch (error) {
        console.error('Erreur mise à jour:', error);
        showNotification('Erreur lors de la mise à jour', 'error');
        // Recharger pour annuler le changement
        await loadTasks();
    }
}

// Supprimer une tâche
window.deleteTask = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE'
        });
        
        await handleFetchResponse(response);
        await loadTasks();
        showNotification('Tâche supprimée!', 'success');
        
    } catch (error) {
        console.error('Erreur suppression:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
};

// Fonctions utilitaires
function getStatusLabel(status) {
    const labels = {
        'todo': 'À faire',
        'in_progress': 'En cours',
        'done': 'Terminé'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showNotification(message, type) {
    // Supprimer l'ancienne notification si elle existe
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // Créer une nouvelle notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Test de connexion à l'API au chargement
async function testApiConnection() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            console.log('✅ Connecté à l\'API backend');
            document.body.classList.add('api-connected');
        } else {
            console.warn('⚠️ Problème de connexion à l\'API');
        }
    } catch (error) {
        console.error('❌ Impossible de se connecter à l\'API:', error.message);
        showNotification('Impossible de contacter le backend', 'error');
    }
}
