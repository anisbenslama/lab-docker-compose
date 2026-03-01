// URL fixe du backend
const API_URL = 'http://backend:3000';

console.log('🌐 API URL utilisée:', API_URL);
document.getElementById('apiUrl').textContent = API_URL;

// Charger les tâches au démarrage
document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
});

// Gérer la soumission du formulaire
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const task = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        status: document.getElementById('status').value
    };
    
    try {
        const response = await fetch(`${API_URL}/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        
        if (response.ok) {
            // Réinitialiser le formulaire
            document.getElementById('taskForm').reset();
            
            // Recharger immédiatement la liste des tâches
            await fetchTasks();
            
            // Afficher un message de succès temporaire
            showMessage('✅ Tâche ajoutée avec succès!', 'success');
        } else {
            showMessage('❌ Erreur lors de l\'ajout de la tâche', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('❌ Erreur de connexion au serveur', 'error');
    }
});

// Fonction pour afficher des messages temporaires
function showMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#4caf50';
    } else {
        messageDiv.style.backgroundColor = '#f44336';
    }
    
    document.body.appendChild(messageDiv);
    
    // Disparaître après 3 secondes
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Fonction pour charger les tâches
async function fetchTasks() {
    const tasksContainer = document.getElementById('tasks');
    tasksContainer.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const response = await fetch(`${API_URL}/api/tasks`);
        
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Erreur:', error);
        tasksContainer.innerHTML = '<div class="loading">Erreur de chargement des tâches</div>';
    }
}

// Afficher les tâches
function displayTasks(tasks) {
    const tasksContainer = document.getElementById('tasks');
    
    if (!tasks || tasks.length === 0) {
        tasksContainer.innerHTML = '<div class="loading">Aucune tâche pour le moment</div>';
        return;
    }
    
    tasksContainer.innerHTML = tasks.map(task => `
        <div class="task-card" data-id="${task.id}">
            <h3>${escapeHtml(task.title)}</h3>
            <p>${escapeHtml(task.description || 'Pas de description')}</p>
            <span class="status ${task.status}">${getStatusLabel(task.status)}</span>
            <div class="task-actions">
                <button class="delete-btn" onclick="deleteTask(${task.id})">Supprimer</button>
                <button class="edit-btn" onclick="editTask(${task.id})">Modifier</button>
            </div>
        </div>
    `).join('');
}

// Supprimer une tâche
async function deleteTask(id) {
    if (!confirm('Supprimer cette tâche ?')) return;
    
    try {
        const response = await fetch(`${API_URL}/api/tasks/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await fetchTasks(); // Recharger la liste
            showMessage('✅ Tâche supprimée!', 'success');
        } else {
            showMessage('❌ Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('❌ Erreur de connexion', 'error');
    }
}

// Modifier une tâche
async function editTask(id) {
    const newTitle = prompt('Nouveau titre:');
    if (!newTitle) return;
    
    try {
        const response = await fetch(`${API_URL}/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: newTitle })
        });
        
        if (response.ok) {
            await fetchTasks(); // Recharger la liste
            showMessage('✅ Tâche modifiée!', 'success');
        } else {
            showMessage('❌ Erreur lors de la modification', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('❌ Erreur de connexion', 'error');
    }
}

// Helpers
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function getStatusLabel(status) {
    const labels = {
        'todo': 'À faire',
        'in_progress': 'En cours',
        'done': 'Terminé'
    };
    return labels[status] || status;
}
