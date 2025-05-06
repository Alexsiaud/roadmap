const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Initialisation du serveur
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev')); // Logging des requêtes

// Chemins des fichiers de données
const DATA_DIR = path.join(__dirname, 'data');
const ROADMAP_FILE = path.join(DATA_DIR, 'roadmap.json');
const VOTES_DIR = path.join(DATA_DIR, 'votes');
const UPDATES_FILE = path.join(DATA_DIR, 'updates.json');

// S'assurer que les répertoires existent
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(VOTES_DIR)) {
  fs.mkdirSync(VOTES_DIR, { recursive: true });
}

// Variables pour suivre les mises à jour
let lastUpdateTimestamp = Date.now();
let roadmapData = null;

// Charger les données initiales si elles existent
try {
  if (fs.existsSync(ROADMAP_FILE)) {
    roadmapData = JSON.parse(fs.readFileSync(ROADMAP_FILE, 'utf8'));
    console.log('Données roadmap chargées');
  } else {
    console.log('Aucune donnée roadmap existante');
  }
  
  if (fs.existsSync(UPDATES_FILE)) {
    const updates = JSON.parse(fs.readFileSync(UPDATES_FILE, 'utf8'));
    lastUpdateTimestamp = updates.lastUpdateTimestamp || Date.now();
  } else {
    fs.writeFileSync(UPDATES_FILE, JSON.stringify({ lastUpdateTimestamp }));
  }
} catch (error) {
  console.error('Erreur lors du chargement des données:', error);
}

// ===== ROUTES API =====

// GET /api/roadmap - Récupérer toutes les données du roadmap
app.get('/api/roadmap', (req, res) => {
  if (!roadmapData) {
    return res.status(404).json({ error: 'Données non initialisées' });
  }
  
  res.json(roadmapData);
});

// PUT /api/roadmap - Mettre à jour toutes les données du roadmap
app.put('/api/roadmap', (req, res) => {
  try {
    roadmapData = req.body;
    
    // Sauvegarder dans le fichier
    fs.writeFileSync(ROADMAP_FILE, JSON.stringify(roadmapData, null, 2));
    
    // Mettre à jour le timestamp
    lastUpdateTimestamp = Date.now();
    fs.writeFileSync(UPDATES_FILE, JSON.stringify({ lastUpdateTimestamp }));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/votes - Ajouter un vote pour une tâche
app.post('/api/votes', (req, res) => {
  try {
    const { userId, voteKey, sectionId, phase, week, taskId } = req.body;
    
    if (!userId || !voteKey || !sectionId || !phase || !week || !taskId) {
      return res.status(400).json({ error: 'Données incomplètes' });
    }
    
    // Vérifier si l'utilisateur a déjà voté pour cette tâche
    const userVotesFile = path.join(VOTES_DIR, `${userId}.json`);
    let userVotes = {};
    
    if (fs.existsSync(userVotesFile)) {
      userVotes = JSON.parse(fs.readFileSync(userVotesFile, 'utf8'));
    }
    
    if (userVotes[voteKey]) {
      return res.json({ success: false, message: 'Vote déjà existant' });
    }
    
    // Ajouter le vote
    userVotes[voteKey] = true;
    fs.writeFileSync(userVotesFile, JSON.stringify(userVotes, null, 2));
    
    // Mettre à jour le roadmap
    if (roadmapData) {
      const section = roadmapData.sections.find(s => s.id === sectionId);
      if (section && section.phases[phase] && section.phases[phase][week]) {
        const taskIndex = section.phases[phase][week].tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          section.phases[phase][week].tasks[taskIndex].votes += 1;
          fs.writeFileSync(ROADMAP_FILE, JSON.stringify(roadmapData, null, 2));
          
          // Mettre à jour le timestamp
          lastUpdateTimestamp = Date.now();
          fs.writeFileSync(UPDATES_FILE, JSON.stringify({ lastUpdateTimestamp }));
        }
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du vote:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/votes/:userId - Récupérer les votes d'un utilisateur
app.get('/api/votes/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const userVotesFile = path.join(VOTES_DIR, `${userId}.json`);
    
    if (fs.existsSync(userVotesFile)) {
      const userVotes = JSON.parse(fs.readFileSync(userVotesFile, 'utf8'));
      res.json(userVotes);
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des votes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/roadmap/updates - Vérifier s'il y a des mises à jour depuis un timestamp
app.get('/api/roadmap/updates', (req, res) => {
  try {
    const since = parseInt(req.query.since || '0');
    const hasChanges = since < lastUpdateTimestamp;
    
    res.json({
      hasChanges,
      lastUpdateTimestamp
    });
  } catch (error) {
    console.error('Erreur lors de la vérification des mises à jour:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour tester que le serveur fonctionne
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
