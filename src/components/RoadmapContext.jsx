import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { v4 as uuidv4 } from 'uuid';

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
  const [roadmapData, setRoadmapData] = useState(initialRoadmapData);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(() => {
    // Récupérer ou générer un ID utilisateur unique
    const savedUserId = localStorage.getItem('userId');
    const newUserId = savedUserId || uuidv4();
    if (!savedUserId) {
      localStorage.setItem('userId', newUserId);
    }
    return newUserId;
  });
  
  // Initialisation des données depuis l'API REST
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        // Récupérer les données du roadmap
        const data = await apiService.fetchRoadmap();
        setRoadmapData(data || initialRoadmapData);
        
        // Récupérer les votes de l'utilisateur
        const votes = await apiService.getUserVotes(userId);
        setUserVotes(votes || {});
        
        // Sauvegarder la date de dernière mise à jour
        localStorage.setItem('lastUpdateTimestamp', Date.now().toString());
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des données:', error);
        // Fallback au localStorage en cas d'erreur
        const savedData = localStorage.getItem('roadmapData');
        if (savedData) setRoadmapData(JSON.parse(savedData));
        
        const savedVotes = localStorage.getItem('userVotes');
        if (savedVotes) setUserVotes(JSON.parse(savedVotes));
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [userId]);
  
  // Vérifier périodiquement les mises à jour
  useEffect(() => {
    // Fonction pour vérifier les mises à jour
    const checkForUpdates = async () => {
      if (loading) return; // Ne pas vérifier pendant le chargement initial
      
      try {
        const lastUpdateTimestamp = localStorage.getItem('lastUpdateTimestamp') || '0';
        const updates = await apiService.checkForUpdates(lastUpdateTimestamp);
        
        if (updates && updates.hasChanges) {
          // Récupérer les données mises à jour
          const data = await apiService.fetchRoadmap();
          setRoadmapData(data);
          
          // Mettre à jour la date de dernière mise à jour
          localStorage.setItem('lastUpdateTimestamp', Date.now().toString());
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des mises à jour:', error);
      }
    };
    
    // Vérifier les mises à jour toutes les 30 secondes
    const intervalId = setInterval(checkForUpdates, 30000);
    
    // Nettoyer l'intervalle lorsque le composant est démonté
    return () => clearInterval(intervalId);
  }, [loading]);
  
  // Maintien du localStorage comme fallback
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('roadmapData', JSON.stringify(roadmapData));
    }
  }, [roadmapData, loading]);
  
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('userVotes', JSON.stringify(userVotes));
    }
  }, [userVotes, loading]);
  
  // Fonction pour ajouter un vote (avec API REST)
  const voteForTask = async (sectionId, phase, week, taskId) => {
    // Vérifier si l'utilisateur a déjà voté pour cette tâche
    const voteKey = `${sectionId}-${phase}-${week}-${taskId}`;
    
    if (userVotes[voteKey]) {
      // L'utilisateur a déjà voté pour cette tâche
      return false;
    }
    
    try {
      // Préparer les données du vote
      const voteData = {
        voteKey,
        sectionId,
        phase,
        week,
        taskId
      };
      
      // Appeler l'API pour ajouter le vote
      const response = await apiService.addVote(userId, voteData);
      
      if (response.success) {
        // Mettre à jour l'état local des votes
        setUserVotes(prev => ({
          ...prev,
          [voteKey]: true
        }));
        
        // Mettre à jour le roadmapData localement pour refléter le vote
        setRoadmapData(prev => {
          const newData = JSON.parse(JSON.stringify(prev));
          const section = newData.sections.find(s => s.id === sectionId);
          if (section && section.phases[phase] && section.phases[phase][week]) {
            const taskIndex = section.phases[phase][week].tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
              section.phases[phase][week].tasks[taskIndex].votes += 1;
            }
          }
          return newData;
        });
        
        // Mettre à jour le timestamp de dernière mise à jour
        localStorage.setItem('lastUpdateTimestamp', Date.now().toString());
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du vote:', error);
      return false;
    }
  };

  // Méthode pour vérifier si une action admin est autorisée
  // Dans un système réel, ceci serait remplacé par une vraie authentification
  const checkAdminAccess = (adminSecret) => {
    // Vous pourriez vérifier un code secret passé dans l'URL ou utiliser un cookie/localStorage
    // C'est une implémentation simpliste pour la démonstration
    const correctSecret = 'admin123';
    return adminSecret === correctSecret;
  };
  
  // Fonction pour réordonner les sections
  const reorderSections = async (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return; // Rien à faire si même position
    
    try {
      // Mettre à jour localement
      const newData = JSON.parse(JSON.stringify(roadmapData));
      const [movedSection] = newData.sections.splice(fromIndex, 1);
      newData.sections.splice(toIndex, 0, movedSection);
      
      // Mettre à jour l'état local
      setRoadmapData(newData);
      
      // Synchroniser avec l'API
      await apiService.updateRoadmap(newData);
      
      // Mettre à jour le timestamp de dernière mise à jour
      localStorage.setItem('lastUpdateTimestamp', Date.now().toString());
      
      return true;
    } catch (error) {
      console.error('Erreur lors du réordonnement des sections:', error);
      return false;
    }
  };

  // Fonction pour mettre à jour les données du roadmap
  const updateRoadmapData = async (newData) => {
    try {
      // Mettre à jour l'état local
      setRoadmapData(newData);
      
      // Synchroniser avec l'API
      await apiService.updateRoadmap(newData);
      
      // Mettre à jour le timestamp de dernière mise à jour
      localStorage.setItem('lastUpdateTimestamp', Date.now().toString());
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données:', error);
      return false;
    }
  };

  return (
    <RoadmapContext.Provider value={{
      roadmapData,
      setRoadmapData: updateRoadmapData,
      voteForTask,
      checkAdminAccess,
      userVotes,
      reorderSections,
      loading
    }}>
      {loading ? <div className="p-4 text-center">Chargement des données...</div> : children}
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
