// URL de base de l'API pointant vers notre serveur local
const API_BASE_URL = 'http://localhost:3001/api';

// Service pour interagir avec l'API REST
export const apiService = {
  // Récupérer les données du roadmap
  async fetchRoadmap() {
    try {
      const response = await fetch(`${API_BASE_URL}/roadmap`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw error;
    }
  },
  
  // Mettre à jour les données du roadmap
  async updateRoadmap(roadmapData) {
    try {
      const response = await fetch(`${API_BASE_URL}/roadmap`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roadmapData),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données:', error);
      throw error;
    }
  },
  
  // Ajouter un vote
  async addVote(userId, voteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...voteData
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du vote:', error);
      throw error;
    }
  },
  
  // Récupérer les votes d'un utilisateur
  async getUserVotes(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/votes/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des votes:', error);
      throw error;
    }
  },
  
  // Vérifier les mises à jour depuis le dernier chargement
  async checkForUpdates(lastUpdateTimestamp) {
    try {
      const response = await fetch(`${API_BASE_URL}/roadmap/updates?since=${lastUpdateTimestamp}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la vérification des mises à jour:', error);
      throw error;
    }
  }
};
