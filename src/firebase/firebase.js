import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Références aux collections
const roadmapCollection = collection(db, 'roadmap');
const votesCollection = collection(db, 'votes');

// Service pour interagir avec les données du roadmap
export const roadmapService = {
  // Initialiser ou récupérer les données du roadmap
  async initRoadmap(initialData) {
    const roadmapDoc = doc(roadmapCollection, 'main');
    const docSnap = await getDoc(roadmapDoc);
    
    if (!docSnap.exists()) {
      // Pas de données existantes, initialiser avec les données par défaut
      await setDoc(roadmapDoc, { data: initialData });
      return initialData;
    }
    
    // Retourner les données existantes
    return docSnap.data().data;
  },
  
  // Écouter les changements en temps réel
  subscribeToRoadmap(callback) {
    const roadmapDoc = doc(roadmapCollection, 'main');
    return onSnapshot(roadmapDoc, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().data);
      }
    });
  },
  
  // Mettre à jour les données du roadmap
  async updateRoadmap(newData) {
    const roadmapDoc = doc(roadmapCollection, 'main');
    await setDoc(roadmapDoc, { data: newData });
  },
  
  // Gérer les votes
  async addVote(userId, voteKey, sectionId, phase, week, taskId) {
    // Vérifier si l'utilisateur a déjà voté
    const userVotesDoc = doc(votesCollection, userId);
    const docSnap = await getDoc(userVotesDoc);
    
    // Si le document n'existe pas ou si l'utilisateur n'a pas voté pour cette tâche
    if (!docSnap.exists() || !docSnap.data()[voteKey]) {
      // Mettre à jour les votes de l'utilisateur
      await setDoc(userVotesDoc, { 
        ...docSnap.exists() ? docSnap.data() : {}, 
        [voteKey]: true 
      }, { merge: true });
      
      // Mettre à jour le nombre de votes pour la tâche
      const roadmapDoc = doc(roadmapCollection, 'main');
      const roadmapSnap = await getDoc(roadmapDoc);
      
      if (roadmapSnap.exists()) {
        const roadmapData = roadmapSnap.data().data;
        const section = roadmapData.sections.find(s => s.id === sectionId);
        
        if (section && section.phases[phase] && section.phases[phase][week]) {
          const taskIndex = section.phases[phase][week].tasks.findIndex(t => t.id === taskId);
          
          if (taskIndex !== -1) {
            section.phases[phase][week].tasks[taskIndex].votes += 1;
            await updateDoc(roadmapDoc, { data: roadmapData });
            return true;
          }
        }
      }
    }
    
    return false;
  },
  
  // Obtenir les votes de l'utilisateur
  async getUserVotes(userId) {
    const userVotesDoc = doc(votesCollection, userId);
    const docSnap = await getDoc(userVotesDoc);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    
    return {};
  }
};

export default db;
