import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Code, Database, FileText, Settings, Users, BarChart, ThumbsUp, ChevronDown, ChevronRight, Lock, Unlock } from 'lucide-react';
import { useRoadmap } from './RoadmapContext';

const PublicRoadmap = () => {
  const { roadmapData, voteForTask, userVotes, reorderSections } = useRoadmap();
  const [activeSection, setActiveSection] = useState(
    roadmapData.sections.find(s => s.active)?.id || roadmapData.sections[0]?.id
  );
  const [voteMessage, setVoteMessage] = useState({ show: false, success: false, text: '' });
  // État pour suivre les phases réduites (collapsées)
  const [collapsedPhases, setCollapsedPhases] = useState({});
  // État pour le verrouillage des phases (empêche le développement manuel des phases complétées)
  const [phaseLockState, setPhaseLockState] = useState(true);
  // États pour le drag & drop
  const [draggedSectionIndex, setDraggedSectionIndex] = useState(null);
  const [dragOverSectionIndex, setDragOverSectionIndex] = useState(null);

  // Les styles sont maintenant définis dans index.css comme classes réutilisables
  const containerStyle = "container-main";
  const titleStyle = "title-main";
  const tabsContainerStyle = "section-tabs";
  const tabStyle = "tab-item";
  const activeTabStyle = "tab-active";
  const inactiveTabStyle = "tab-inactive";
  const monthStyle = "phase-header";
  const weekStyle = "week-header border-l-4";
  const taskListStyle = "task-list";
  const taskStyle = "task-item";
  const taskCompletedStyle = "ml-2 line-through text-gray-500";
  const taskTextStyle = "ml-2";
  const voteButtonStyle = "ml-auto p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded";
  const voteAlreadyStyle = "ml-auto p-1 text-blue-500 bg-blue-100 rounded cursor-not-allowed";
  const voteCountStyle = "ml-1 text-xs font-semibold text-gray-600";
  
  // Couleurs selon les sections
  const sectionColors = {
    'blue': {
      tab: 'bg-blue-600',
      progress: 'bg-blue-500',
      week: 'border-blue-500',
    },
    'green': {
      tab: 'bg-green-600',
      progress: 'bg-green-500',
      week: 'border-green-500',
    },
    'purple': {
      tab: 'bg-purple-600',
      progress: 'bg-purple-500',
      week: 'border-purple-500',
    },
    'red': {
      tab: 'bg-red-600',
      progress: 'bg-red-500',
      week: 'border-red-500',
    },
    'orange': {
      tab: 'bg-orange-600',
      progress: 'bg-orange-500',
      week: 'border-orange-500',
    }
  };

  // Fonction pour gérer les votes
  const handleVote = (sectionId, phase, week, taskId) => {
    const success = voteForTask(sectionId, phase, week, taskId);
    
    if (success) {
      setVoteMessage({ 
        show: true, 
        success: true, 
        text: 'Votre vote a été enregistré avec succès!' 
      });
    } else {
      setVoteMessage({ 
        show: true, 
        success: false, 
        text: 'Vous avez déjà voté pour cette tâche.' 
      });
    }
    
    // Cacher le message après 3 secondes
    setTimeout(() => {
      setVoteMessage({ show: false, success: false, text: '' });
    }, 3000);
  };

  // Obtenir la section active
  const sectionData = roadmapData.sections.find(s => s.id === activeSection);

  // Rendu des icônes
  const icons = {
    'Code': Code,
    'CheckCircle': CheckCircle,
    'FileText': FileText,
    'Settings': Settings,
    'Users': Users,
    'Calendar': Calendar,
    'Database': Database,
    'BarChart': BarChart
  };

  const renderIcon = (iconName, completed) => {
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent size={16} className={completed ? "text-gray-400" : ""} /> : null;
  };

  // Fonction pour vérifier si toutes les tâches d'une phase sont complétées
  const areAllTasksCompleted = (section, phase) => {
    let allCompleted = true;
    let totalTasks = 0;
    
    Object.keys(section.phases[phase]).forEach(key => {
      if (key !== 'title' && key !== 'order' && section.phases[phase][key].tasks) {
        section.phases[phase][key].tasks.forEach(task => {
          totalTasks++;
          if (!task.completed) allCompleted = false;
        });
      }
    });
    
    // Retourne false si aucune tâche dans cette phase
    return totalTasks > 0 ? allCompleted : false;
  };
  
  // Obtenir le pourcentage de complétion d'une phase
  const getPhaseCompletionPercentage = (section, phase) => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    Object.keys(section.phases[phase]).forEach(key => {
      if (key !== 'title' && key !== 'order' && section.phases[phase][key].tasks) {
        section.phases[phase][key].tasks.forEach(task => {
          totalTasks++;
          if (task.completed) completedTasks++;
        });
      }
    });
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };
  
  // Gérer le clic sur une phase pour la développer/réduire
  const togglePhase = (sectionId, phase) => {
    const key = `${sectionId}-${phase}`;
    const isCompleted = activeSection && areAllTasksCompleted(sectionData, phase);
    
    // Si la phase est complétée et que le verrouillage est activé, ne rien faire
    if (isCompleted && phaseLockState && !collapsedPhases[key]) {
      return;
    }
    
    setCollapsedPhases(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Basculer l'état de verrouillage des phases
  const toggleLockState = () => {
    setPhaseLockState(!phaseLockState);
  };
  
  // Effet pour réduire automatiquement les phases dont toutes les tâches sont complétées
  useEffect(() => {
    const newCollapsedPhases = {...collapsedPhases};
    let changes = false;
    
    roadmapData.sections.forEach(section => {
      Object.keys(section.phases).forEach(phase => {
        const key = `${section.id}-${phase}`;
        if (areAllTasksCompleted(section, phase) && !newCollapsedPhases[key] && phaseLockState) {
          newCollapsedPhases[key] = true;
          changes = true;
        }
      });
    });
    
    if (changes) {
      setCollapsedPhases(newCollapsedPhases);
    }
  }, [roadmapData, collapsedPhases, phaseLockState]);
  
  // Calcul des statistiques pour la vue d'ensemble
  const calculateStats = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    let totalVotes = 0;
    
    roadmapData.sections.forEach(section => {
      Object.keys(section.phases).forEach(phase => {
        Object.keys(section.phases[phase]).forEach(key => {
          if (key !== 'title' && key !== 'order' && section.phases[phase][key].tasks) {
            section.phases[phase][key].tasks.forEach(task => {
              totalTasks++;
              if (task.completed) completedTasks++;
              totalVotes += task.votes || 0;
            });
          }
        });
      });
    });
    
    return {
      totalTasks,
      completedTasks,
      completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalVotes
    };
  };

  const stats = calculateStats();

  return (
    <div className={containerStyle}>
      <h1 className={titleStyle}>Roadmap d'Implémentation IA - Application de Pré-saisie Comptable</h1>
      
      {/* Notification de vote */}
      {voteMessage.show && (
        <div className={`fixed top-4 right-4 p-3 rounded shadow-lg ${voteMessage.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {voteMessage.text}
        </div>
      )}
      
      {/* Onglets de navigation avec fonctionnalité de réordonnement */}
      <div className={tabsContainerStyle}>
        {roadmapData.sections.map((section, index) => (
          <div
            key={section.id}
            className={`${tabStyle} ${section.id === activeSection ? activeTabStyle : inactiveTabStyle} 
              ${draggedSectionIndex === index ? 'opacity-50' : ''} 
              ${dragOverSectionIndex === index ? 'border-2 border-dashed border-blue-400' : ''}`}
            onClick={() => setActiveSection(section.id)}
            draggable="true"
            onDragStart={(e) => {
              setDraggedSectionIndex(index);
              // Ajouter des données de transfert pour compatibilité Firefox
              e.dataTransfer.setData('text/plain', index);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverSectionIndex(index);
            }}
            onDragLeave={() => {
              if (dragOverSectionIndex === index) {
                setDragOverSectionIndex(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedSectionIndex !== null) {
                reorderSections(draggedSectionIndex, index);
                setDraggedSectionIndex(null);
                setDragOverSectionIndex(null);
              }
            }}
            onDragEnd={() => {
              setDraggedSectionIndex(null);
              setDragOverSectionIndex(null);
            }}
            style={{ cursor: 'grab' }}
          >
            <span className="flex items-center">
              <span className="mr-2 text-gray-400">☰</span> {/* Indicateur visuel pour le glisser-déposer */}
              {section.title}
            </span>
          </div>
        ))}
      </div>
      
      {sectionData && (
        <div className="section-content">
          {/* Titre de la section */}
          <h2 className="text-xl font-bold mb-4">{sectionData.title}</h2>
          
          {/* Affichage des phases */}
          {Object.keys(sectionData.phases)
            .sort((a, b) => sectionData.phases[a].order - sectionData.phases[b].order)
            .map(phase => (
            <div key={phase} className="mb-8">
              <div 
                className={`${monthStyle} ${sectionColors[sectionData.color].tab} flex justify-between cursor-pointer transition-all duration-300 hover:shadow-md`}
                onClick={() => togglePhase(sectionData.id, phase)}
              >
                <span className="flex items-center">
                  {collapsedPhases[`${sectionData.id}-${phase}`] ? 
                    <ChevronRight className="mr-2 transition-transform duration-300" size={20} /> : 
                    <ChevronDown className="mr-2 transition-transform duration-300" size={20} />
                  }
                  <Calendar className="mr-2" size={20} /> 
                  <span className="font-medium">{sectionData.phases[phase].title}</span>
                </span>
                <div className="flex items-center space-x-2">
                  {/* Indicateur de progression */}
                  <div className="w-24 bg-gray-200 rounded-full h-3 hidden md:block">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${getPhaseCompletionPercentage(sectionData, phase)}%` }}
                    ></div>
                  </div>
                  
                  {/* Badge de complétion */}
                  {areAllTasksCompleted(sectionData, phase) && (
                    <span className="text-xs bg-green-100 text-green-800 font-medium py-1 px-2 rounded-full flex items-center">
                      <CheckCircle className="mr-1" size={12} />
                      Complétée
                    </span>
                  )}
                  
                  {/* Indicateur de verrouillage si la phase est complétée */}
                  {areAllTasksCompleted(sectionData, phase) && phaseLockState && (
                    <Lock size={16} className="text-gray-500" title="Cette phase est verrouillée car complétée" />
                  )}
                </div>
              </div>
              
              {/* Affichage des semaines et tâches */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${collapsedPhases[`${sectionData.id}-${phase}`] ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'}`}
              >
                {Object.keys(sectionData.phases[phase])
                .filter(key => key !== 'title' && key !== 'order')
                .sort((a, b) => sectionData.phases[phase][a].order - sectionData.phases[phase][b].order)
                .map(week => (
                <div key={week}>
                  <div className={`${weekStyle} ${sectionColors[sectionData.color].week}`}>
                    <span>{sectionData.phases[phase][week].title}</span>
                    {sectionData.phases[phase][week].badge && (
                      <span className="text-xs bg-green-100 text-green-800 font-medium py-1 px-2 rounded-full">
                        {sectionData.phases[phase][week].badge}
                      </span>
                    )}
                  </div>
                  
                  <ul className={taskListStyle}>
                    {sectionData.phases[phase][week].tasks.map((task) => {
                      const voteKey = `${sectionData.id}-${phase}-${week}-${task.id}`;
                      const hasVoted = userVotes[voteKey];
                      
                      return (
                        <li 
                          key={task.id} 
                          className={`${taskStyle} ${task.completed ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'} transition-all duration-200 shadow-sm rounded-lg mb-2 hover:shadow ${!hasVoted && !task.completed ? 'cursor-pointer hover:border-blue-300 hover:bg-blue-50' : ''} relative`}
                          onClick={() => !hasVoted && !task.completed && handleVote(sectionData.id, phase, week, task.id)}
                          title={hasVoted ? "Vous avez déjà voté" : task.completed ? "Tâche déjà complétée" : "Cliquez pour voter"}
                        >
                          {/* Indicateur visuel pour montrer qu'on peut cliquer (placé en premier pour être sous les éléments) */}
                          {!hasVoted && !task.completed && (
                            <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                          )}
                          
                          <div className="flex items-center w-full p-3 relative z-10">
                            {/* Indicateur de statut sans case à cocher */}
                            <div className="flex-shrink-0 mr-3">
                              {task.completed ? (
                                <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-500 rounded-full">
                                  <CheckCircle size={16} />
                                </span>
                              ) : renderIcon(task.icon, task.completed)}
                            </div>
                            
                            <span className={`flex-grow ${task.completed ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                              {task.text}
                            </span>
                            
                            {/* Badge de vote avec compteur */}
                            <div className={`flex items-center ${hasVoted ? 'bg-blue-100' : 'bg-gray-50'} rounded-full px-3 py-1 ml-2`}>
                              <span className="font-semibold text-gray-700 mr-1">{task.votes || 0}</span>
                              <span className={hasVoted ? 'text-blue-500' : 'text-gray-500'}>
                                <ThumbsUp size={16} />
                              </span>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Vue d'ensemble */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Vue d'ensemble du projet</h3>
        
        {/* Contrôle de verrouillage des phases complétées */}
        <div className="flex items-center mb-4 bg-white p-2 rounded cursor-pointer" onClick={toggleLockState}>
          {phaseLockState ? (
            <>
              <Lock size={18} className="text-green-600 mr-2" />
              <span className="text-sm text-gray-700">Les phases complétées sont automatiquement réduites</span>
            </>
          ) : (
            <>
              <Unlock size={18} className="text-blue-600 mr-2" />
              <span className="text-sm text-gray-700">Les phases complétées peuvent être développées</span>
            </>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded shadow">
            <p className="text-gray-600">Progression</p>
            <div className="flex items-center mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-500 h-4 rounded-full" 
                  style={{ width: `${stats.completionPercentage}%` }}
                ></div>
              </div>
              <span className="ml-2 font-bold">{stats.completionPercentage}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.completedTasks} sur {stats.totalTasks} tâches complétées
            </p>
          </div>
          
          <div className="bg-white p-3 rounded shadow">
            <p className="text-gray-600">Total des votes</p>
            <p className="text-2xl font-bold flex items-center">
              <ThumbsUp size={20} className="text-blue-500 mr-2" /> 
              {stats.totalVotes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicRoadmap;
