const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'database',
    port: process.env.DB_PORT || 3306,
    user: process.env.MYSQL_USER || 'todo_user',
    password: process.env.MYSQL_PASSWORD || 'todo_password',
    database: process.env.MYSQL_DATABASE || 'todo_db'
};

let pool;

// Initialisation de la connexion MySQL
async function initDB() {
    try {
        pool = mysql.createPool(dbConfig);
        
        // Tester la connexion
        const connection = await pool.getConnection();
        console.log('✅ Connecté à MySQL');
        connection.release();
    } catch (error) {
        console.error('❌ Erreur MySQL:', error);
        process.exit(1);
    }
}

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// GET toutes les tâches
app.get('/api/tasks', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Erreur GET /api/tasks:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST nouvelle tâche
app.post('/api/tasks', async (req, res) => {
    const { title, description, status = 'todo' } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Le titre est requis' });
    }
    
    try {
        const [result] = await pool.execute(
            'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
            [title, description, status]
        );
        
        const [newTask] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        res.status(201).json(newTask[0]);
    } catch (error) {
        console.error('Erreur POST /api/tasks:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE une tâche
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Tâche non trouvée' });
        } else {
            res.status(204).send();
        }
    } catch (error) {
        console.error('Erreur DELETE /api/tasks/:id:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Démarrage du serveur
async function startServer() {
    await initDB();
    
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Backend démarré sur http://0.0.0.0:${PORT}`);
        console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
        console.log(`📝 API: http://0.0.0.0:${PORT}/api/tasks`);
    });
}

startServer();
