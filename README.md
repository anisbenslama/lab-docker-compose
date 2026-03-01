# 🐳 Lab Docker Compose

Bienvenue dans le projet **lab-docker-compose** 👋  
Ce dépôt contient une application web **3-tiers** (frontend, backend et base de données) packagée avec **Docker Compose**.

L’objectif est de fournir une stack complète pour apprendre et tester Docker Compose avec une application fonctionnelle.  

---

## 🔍 Présentation

Ce projet met en place une application **frontend**, **backend** et **base de données** connectés via Docker Compose, avec :

- **Frontend :** interface utilisateur (ex: React/HTML/CSS/JS)  
- **Backend :** API (ex: Node.js/Express)  
- **Database :** MySQL  
- **Reverse Proxy :** Nginx  

L’objectif est de pratiquer :  
✅ Création de services Docker  
✅ Configuration de volumes et réseaux  
✅ Utilisation de variables d’environnement  
✅ Mise en place d’un workflow Docker Compose complet :contentReference[oaicite:1]{index=1}

---

## 📂 Contenu du projet
Voici les principaux fichiers et dossiers : 
/
├── backend/                 # API backend
├── frontend/                # Interface utilisateur
├── database/init/           # Scripts d’initialisation MySQL
├── docker-compose.yml       # Définition des services
├── .env.example             # Exemple de variables d’environnement
└── README.md                # Documentation du projet

## 🧪 Utilisation
🛫 Lancer tous les services : 
docker compose up -d

## 🛠️ Commandes utiles

✅ Afficher les logs :
docker compose logs -f
✅ Arrêter tous les services :
docker compose down
✅ Redémarrer un service (ex : backend) :
docker compose restart backend

