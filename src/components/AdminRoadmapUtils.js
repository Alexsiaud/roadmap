import { Calendar, CheckCircle, Code, Database, FileText, Settings, Users, BarChart } from 'lucide-react';

// Mapping des noms d'icônes vers les composants Lucide
export const icons = {
  'Code': Code,
  'CheckCircle': CheckCircle,
  'FileText': FileText,
  'Settings': Settings,
  'Users': Users,
  'Calendar': Calendar,
  'Database': Database,
  'BarChart': BarChart
};

// Rendu des icônes
export const renderIcon = (iconName, completed) => {
  const IconComponent = icons[iconName];
  return IconComponent ? <IconComponent size={16} className={completed ? "text-gray-400" : ""} /> : null;
};

// Calcul des statistiques pour la vue d'ensemble
export const calculateStats = (roadmapData) => {
  let totalTasks = 0;
  let completedTasks = 0;
  let totalVotes = 0;
  let topVotedTasks = [];
  
  roadmapData.sections.forEach(section => {
    Object.keys(section.phases).forEach(phase => {
      Object.keys(section.phases[phase]).forEach(key => {
        if (key !== 'title' && key !== 'order' && section.phases[phase][key].tasks) {
          section.phases[phase][key].tasks.forEach(task => {
            totalTasks++;
            if (task.completed) completedTasks++;
            totalVotes += task.votes || 0;
            
            // Collecter uniquement les tâches non complétées avec leurs votes pour le tri
            if (!task.completed) {
              topVotedTasks.push({
                sectionId: section.id,
                sectionTitle: section.title,
                phase,
                phaseTitle: section.phases[phase].title,
                week: key,
                weekTitle: section.phases[phase][key].title,
                task
              });
            }
          });
        }
      });
    });
  });
  
  // Trier les tâches par nombre de votes (descendant)
  topVotedTasks.sort((a, b) => (b.task.votes || 0) - (a.task.votes || 0));
  
  // Prendre les 5 premières tâches
  topVotedTasks = topVotedTasks.slice(0, 5);
  
  return {
    totalTasks,
    completedTasks,
    completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    totalVotes,
    topVotedTasks
  };
};

// Fonction pour générer un ID unique
export const generateId = (prefix) => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Fonction pour trier les tâches par votes
export const sortTasksByVotes = (tasks) => {
  return [...tasks].sort((a, b) => (b.votes || 0) - (a.votes || 0));
};

// Fonction pour créer une tâche vide avec un ID unique
export const createEmptyTask = (sectionId, phase, week) => {
  return {
    id: generateId('task'),
    text: 'Nouvelle tâche',
    icon: 'Task',
    completed: false,
    votes: 0,
    // Ajout des références pour faciliter le déplacement
    sectionId: sectionId,
    phase: phase,
    week: week
  };
};
