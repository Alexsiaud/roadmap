# Backend API REST pour Roadmap

Ce serveur fournit une API REST pour la synchronisation des données entre les utilisateurs de l'application Roadmap.

## Installation

Pour installer les dépendances nécessaires:

```bash
cd backend
npm install
```

## Démarrage du serveur

Pour démarrer le serveur en mode développement:

```bash
npm run dev
```

Pour démarrer le serveur en mode production:

```bash
npm start
```

Le serveur sera disponible à l'adresse: http://localhost:3001

## Structure des données

Le serveur stocke les données dans un dossier `data` qui est créé automatiquement:
- `roadmap.json`: contient toutes les données du roadmap
- `votes/*.json`: fichiers individuels contenant les votes de chaque utilisateur
- `updates.json`: suit les timestamps de mise à jour

## Points d'API

- `GET /api/roadmap`: Récupérer toutes les données du roadmap
- `PUT /api/roadmap`: Mettre à jour toutes les données du roadmap
- `POST /api/votes`: Ajouter un vote pour une tâche
- `GET /api/votes/:userId`: Récupérer les votes d'un utilisateur
- `GET /api/roadmap/updates`: Vérifier s'il y a des mises à jour depuis un timestamp
- `GET /api/status`: Vérifier que le serveur fonctionne correctement
