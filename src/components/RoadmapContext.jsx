import React, { createContext, useState, useContext, useEffect } from 'react';

// Structure initiale des données
const initialRoadmapData = {
  sections: [
    {
      id: 'ecritures-comptables',
      title: 'Module Écritures Comptables',
      active: true,
      color: 'blue',
      phases: {
        mai: {
          title: 'MAI - Phase de Développement des Écritures Comptables',
          order: 1,
          semaine1: {
            title: 'Semaine 1',
            order: 1,
            badge: 'Complétée',
            tasks: [
              { id: 'ec-m1t1', text: 'Établissement de l\'API et tests d\'écritures simples', icon: 'Code', completed: true, votes: 0 },
              { id: 'ec-m1t2', text: 'Validation des connexions et retours', icon: 'CheckCircle', completed: true, votes: 0 },
              { id: 'ec-m1t3', text: 'Détection des types de documents (factures achat/vente)', icon: 'FileText', completed: true, votes: 0 },
              { id: 'ec-m1t4', text: 'Identification des fournisseurs', icon: 'Users', completed: true, votes: 0 },
              { id: 'ec-m1t5', text: 'Génération d\'écritures comptables basiques', icon: 'CheckCircle', completed: true, votes: 0 }
            ]
          },
          semaine2: {
            title: 'Semaine 2 - Approfondissement du Plan Comptable',
            order: 2,
            tasks: [
              { id: 'ec-m2t1', text: 'Création automatique de fournisseurs/clients', icon: 'Users', completed: false, votes: 0 },
              { id: 'ec-m2t2', text: 'Détection intelligente des codes TVA applicables', icon: 'Settings', completed: false, votes: 0 },
              { id: 'ec-m2t3', text: 'Traitement des avoirs', icon: 'FileText', completed: false, votes: 0 },
              { id: 'ec-m2t4', text: 'Reconnaissance des modes de règlement', icon: 'Settings', completed: false, votes: 0 },
              { id: 'ec-m2t5', text: 'Détection de la périodicité', icon: 'Calendar', completed: false, votes: 0 }
            ]
          },
          // Autres semaines...
        },
        // Autres phases...
      }
    },
    // Autres sections...
  ]
};

// Créer le contexte
const RoadmapContext = createContext();

// Provider component
export const RoadmapProvider = ({ children }) => {
  const [roadmapData, setRoadmapData] = useState(() => {
    // Essayer de récupérer les données du localStorage
    const savedData = localStorage.getItem('roadmapData');
    return savedData ? JSON.parse(savedData) : initialRoadmapData;
  });
  
  const [userVotes, setUserVotes] = useState(() => {
    const savedVotes = localStorage.getItem('userVotes');
    return savedVotes ? JSON.parse(savedVotes) : {};
  });
  
  // Admin est déterminé par la route actuelle, pas besoin de state

  // Sauvegarder les données dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('roadmapData', JSON.stringify(roadmapData));
  }, [roadmapData]);

  // Sauvegarder les votes utilisateur
  useEffect(() => {
    localStorage.setItem('userVotes', JSON.stringify(userVotes));
  }, [userVotes]);

  // Fonction pour ajouter un vote
  const voteForTask = (sectionId, phase, week, taskId) => {
    // Vérifier si l'utilisateur a déjà voté pour cette tâche
    const voteKey = `${sectionId}-${phase}-${week}-${taskId}`;
    
    if (userVotes[voteKey]) {
      // L'utilisateur a déjà voté pour cette tâche
      return false;
    }
    
    // Ajouter le vote
    setRoadmapData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const section = newData.sections.find(s => s.id === sectionId);
      if (section && section.phases[phase] && section.phases[phase][week]) {
        const taskIndex = section.phases[phase][week].tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          section.phases[phase][week].tasks[taskIndex].votes += 1;
        }
      }
      return newData;
    });
    
    // Enregistrer que l'utilisateur a voté
    setUserVotes(prev => ({
      ...prev,
      [voteKey]: true
    }));
    
    return true;
  };

  // Méthode pour vérifier si une action admin est autorisée
  // Dans un système réel, ceci serait remplacé par une vraie authentification
  const checkAdminAccess = (adminSecret) => {
    // Vous pourriez vérifier un code secret passé dans l'URL ou utiliser un cookie/localStorage
    // C'est une implémentation simpliste pour la démonstration
    const correctSecret = 'admin123';
    return adminSecret === correctSecret;
  };

  return (
    <RoadmapContext.Provider value={{
      roadmapData,
      setRoadmapData,
      voteForTask,
      checkAdminAccess,
      userVotes
    }}>
      {children}
    </RoadmapContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
};
