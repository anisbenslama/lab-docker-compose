-- Créer la base de données (si elle n'existe pas)
CREATE DATABASE IF NOT EXISTS todo_db;
USE todo_db;

-- Créer la table des tâches
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insérer des données de test
INSERT INTO tasks (title, description, status) VALUES
    ('Apprendre Docker', 'Comprendre les bases de Docker et Docker Compose', 'in_progress'),
    ('Créer une application full-stack', 'Développer une app avec frontend, backend et base de données', 'todo'),
    ('Documenter le projet', 'Rédiger le README et prendre des captures d\'écran', 'todo'),
    ('Présenter le laboratoire', 'Préparer une démonstration du projet fonctionnel', 'done');

-- Vérifier les données
SELECT 'Données de test insérées avec succès !' as 'Message';
SELECT COUNT(*) as 'Nombre de tâches' FROM tasks;
