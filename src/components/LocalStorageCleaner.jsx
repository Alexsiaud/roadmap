import React, { useState, useEffect } from 'react';
import { useRoadmap } from './RoadmapContext';

const LocalStorageCleaner = () => {
  const [storageData, setStorageData] = useState({});
  const [message, setMessage] = useState('');
  const { roadmapData, setRoadmapData } = useRoadmap();

  useEffect(() => {
    // Charger les données du localStorage
    const loadStorageData = () => {
      try {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            try {
              const value = localStorage.getItem(key);
              data[key] = value;
            } catch (err) {
              console.error(`Erreur de lecture pour la clé ${key}:`, err);
              data[key] = "Erreur de lecture";
            }
          }
        }
        setStorageData(data);
      } catch (err) {
        setMessage(`Erreur lors de la lecture du localStorage: ${err.message}`);
      }
    };

    loadStorageData();
  }, []);

  const handleResetStorage = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser le localStorage? Cette action est irréversible.")) {
      try {
        localStorage.clear();
        setMessage("Le localStorage a été effacé. Rechargez la page pour voir les changements.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setMessage(`Erreur lors de la réinitialisation du localStorage: ${err.message}`);
      }
    }
  };

  const handleRepairSections = () => {
    try {
      // Vérifier qu'il n'y a qu'une seule section valide (la première)
      if (roadmapData.sections.length > 0) {
        const validSection = roadmapData.sections[0];
        
        // Ne conserver que la section valide
        const cleanedRoadmapData = {
          ...roadmapData,
          sections: [validSection]
        };
        
        // Mettre à jour le contexte et le localStorage
        setRoadmapData(cleanedRoadmapData);
        localStorage.setItem('roadmapData', JSON.stringify(cleanedRoadmapData));
        
        setMessage("Les sections ont été réparées. Seule la section 'Module Écritures Comptables' a été conservée.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage("Aucune section valide n'a été trouvée.");
      }
    } catch (err) {
      setMessage(`Erreur lors de la réparation des sections: ${err.message}`);
    }
  };

  const renderStorageContent = () => {
    return (
      <div className="overflow-y-auto max-h-96 mt-4">
        {Object.keys(storageData).map(key => (
          <div key={key} className="mb-4 p-3 bg-gray-100 rounded-lg">
            <h3 className="font-bold text-sm text-blue-700">{key}</h3>
            <pre className="text-xs mt-2 bg-white p-2 rounded overflow-x-auto max-w-full">
              {storageData[key] && storageData[key].length > 500 
                ? `${storageData[key].substring(0, 500)}... (${storageData[key].length} caractères)`
                : storageData[key]}
            </pre>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Nettoyage du localStorage</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg">
          {message}
        </div>
      )}
      
      <div className="flex space-x-2 mb-6 justify-center">
        <button 
          onClick={handleRepairSections} 
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Réparer les sections
        </button>
        <button 
          onClick={handleResetStorage} 
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Réinitialiser complètement
        </button>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">Contenu actuel du localStorage:</h3>
      {renderStorageContent()}
    </div>
  );
};

export default LocalStorageCleaner;
