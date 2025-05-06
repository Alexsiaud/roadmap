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
      // Vérifier qu'il y a au moins une section valide
      if (roadmapData.sections && roadmapData.sections.length > 0) {
        // Ne conserver que la section Module Écritures Comptables ou la première si celle-ci n'existe pas
        const ecrituresSection = roadmapData.sections.find(section => section.id === 'ecritures-comptables');
        const sectionToKeep = ecrituresSection || roadmapData.sections[0];
        
        if (!sectionToKeep) {
          setMessage("Aucune section valide n'a été trouvée.");
          return;
        }
        
        // S'assurer que la section conservée est bien formée
        const validSection = {
          ...sectionToKeep,
          id: 'ecritures-comptables',
          title: 'Module Écritures Comptables',
          active: true,
          color: 'blue'
        };

        // Ne conserver que la section valide
        const cleanedRoadmapData = {
          sections: [validSection]
        };
        
        // Mettre à jour le contexte et le localStorage
        setRoadmapData(cleanedRoadmapData);
        localStorage.setItem('roadmapData', JSON.stringify(cleanedRoadmapData));
        
        // Supprimer également les votes pour éviter tout problème avec des votes orphelins
        localStorage.setItem('userVotes', JSON.stringify({}));
        
        setMessage("Les sections ont été réparées. Seule la section 'Module Écritures Comptables' a été conservée. Les votes ont également été réinitialisés.");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage("Aucune section valide n'a été trouvée dans les données.");
      }
    } catch (err) {
      setMessage(`Erreur lors de la réparation des sections: ${err.message}`);
    }
  };

  // Inspection directe des sections
  const sectionsCount = roadmapData?.sections?.length || 0;
  
  const renderSectionInfo = () => {
    if (!roadmapData || !roadmapData.sections) return <p>Aucune donnée de section trouvée</p>;
    
    return (
      <div className="mt-4 bg-green-50 p-3 rounded-lg border border-green-200">
        <h3 className="font-bold text-green-800">Information sur les sections ({sectionsCount} sections)</h3>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {roadmapData.sections.map((section, index) => (
            <div key={index} className="bg-white p-2 rounded border border-gray-200">
              <p><span className="font-semibold">ID:</span> {section.id || 'Non défini'}</p>
              <p><span className="font-semibold">Titre:</span> {section.title || 'Sans titre'}</p>
              <p><span className="font-semibold">Couleur:</span> {section.color || 'Non définie'}</p>
              <p><span className="font-semibold">Actif:</span> {section.active ? 'Oui' : 'Non'}</p>
              <p><span className="font-semibold">Phases:</span> {section.phases ? Object.keys(section.phases).length : 0}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStorageContent = () => {
    return (
      <div className="overflow-y-auto max-h-96 mt-4">
        {Object.keys(storageData).map(key => (
          <div key={key} className="mb-4 p-3 bg-gray-100 rounded-lg">
            <h3 className="font-bold text-sm text-blue-700">{key}</h3>
            <details>
              <summary className="cursor-pointer text-xs text-gray-600">Voir le contenu ({storageData[key]?.length || 0} caractères)</summary>
              <pre className="text-xs mt-2 bg-white p-2 rounded overflow-x-auto max-w-full">
                {storageData[key] && storageData[key].length > 500 
                  ? `${storageData[key].substring(0, 500)}... (${storageData[key].length} caractères)`
                  : storageData[key]}
              </pre>
            </details>
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

      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Diagnostic des sections</h3>
        <p className="text-sm mb-4">
          {sectionsCount === 0 && "Aucune section n'a été trouvée dans les données."}
          {sectionsCount === 1 && "Une seule section est présente, tout semble normal."}
          {sectionsCount > 1 && `${sectionsCount} sections détectées - la section fantôme est probablement parmi celles-ci.`}
        </p>
        {renderSectionInfo()}
      </div>
      
      <h3 className="text-lg font-semibold mb-2">Contenu actuel du localStorage:</h3>
      {renderStorageContent()}
    </div>
  );
};

export default LocalStorageCleaner;
