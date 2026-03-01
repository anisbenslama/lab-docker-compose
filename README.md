Résumé du projet
Ce dépôt contient une application web trois-tiers (frontend, backend, base de données) packagée avec Docker Compose. L’objectif du laboratoire est d’implémenter la stack, d’appliquer des bonnes pratiques DevOps (multi-stage builds, healthchecks, limites de ressources, réseaux isolés, volumes persistants) et de documenter les Tests de Validation demandés dans le sujet.
Stack utilisée (mentionnée une seule fois)
Frontend : Html , CSS3 , JavaScript .
Backend : Express (Node.js).
Base de données : MySQL.
Serveur statique / reverse proxy : Nginx.
Gestion des conteneurs : Docker/Docker Compose.

Cette application permet de :
- ✅ Afficher la liste des tâches
- ✅ Ajouter une nouvelle tâche
- ✅ Modifier une tâche existante
- ✅ Supprimer une tâche
- ✅ Marquer une tâche comme terminée

- ┌─────────────┐
│ Browser │
│ Port 8080 │
└──────┬──────┘
│
┌──────▼──────┐
│ Frontend │
│ Nginx │
│ (React) │
└──────┬──────┘
│ HTTP
┌──────▼──────┐
│ Backend │
│ Node.js │
│ Express │
└──────┬──────┘
│ SQL
┌──────▼──────┐
│ Database │
│ MySQL │
│ 8.0 │
└─────────────┘

2. Configuration des variables d'environnement
   Créez un fichier .env à la racine :
   # Base de données MySQL
MYSQL_DATABASE=todo_db
MYSQL_USER=todo_user
MYSQL_PASSWORD=todo_password
MYSQL_ROOT_PASSWORD=root_password

# Backend
BACKEND_PORT=3000
DB_PORT=3306

# Frontend
FRONTEND_PORT=8080

3. Lancer l'application : 
# Démarrer tous les services
docker compose up -d

# Voir les logs
docker compose logs -f

4. Accéder à l'application
Frontend : http://localhost:8080

Backend API : http://localhost:3000/api/tasks

Health check : http://localhost:3000/health

🛠️ Commandes utiles
Gestion des services : 
# Démarrer les services
docker compose up -d

# Arrêter les services
docker compose down

# Redémarrer un service
docker compose restart backend

# Voir les logs
docker compose logs -f frontend

👨‍💻 Auteur
Anis Benslama

GitHub : @anisbenslama

Email : [anisbenslama34@gmail.com]



