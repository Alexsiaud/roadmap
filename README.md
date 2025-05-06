# Roadmap avec Système de Vote

Application de roadmap interactive permettant de visualiser et voter pour les tâches prioritaires d'un projet de développement.

## Fonctionnalités

### Version Publique (mode lecture seule)
- Visualisation des roadmaps par sections, phases et semaines
- Système de vote pour les tâches prioritaires
- Vue d'ensemble avec statistiques de progression et votes

### Version Administration 
- Accessible via URL dédiée (/admin?secret=admin123)
- Édition complète de la roadmap (sections, phases, semaines, tâches)
- Tri des tâches par nombre de votes
- Affichage des tâches les plus votées
- Drag & Drop pour réorganiser les tâches

## Installation

1. Clonez ce dépôt
2. Installez les dépendances avec `npm install`
3. Lancez l'application en mode développement avec `npm start`

## Accès

- **Version publique**: http://localhost:3000/
- **Version administration**: http://localhost:3000/admin?secret=admin123

## Structure du Projet

```
/src
  /components        - Composants React
    AdminRoadmap.jsx - Interface d'administration
    PublicRoadmap.jsx - Interface publique avec système de vote
    RoadmapContext.jsx - Gestion d'état global
    ...
  /pages             - Pages principales
  App.jsx            - Composant principal avec routage
  index.js           - Point d'entrée
```

## Technologie

- React
- React Router
- Lucide Icons
- TailwindCSS
- LocalStorage pour la persistance des données

## Personnalisation

Pour modifier le mot de passe administrateur, éditez la valeur `correctSecret` dans le fichier `RoadmapContext.jsx`.

## Utilisation en Production

Pour un déploiement en production :

1. Remplacez le stockage LocalStorage par une base de données (Firebase, MongoDB, etc.)
2. Implémentez une authentification sécurisée
3. Créez un backend pour gérer les votes et empêcher les votes multiples
