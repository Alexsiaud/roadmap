import React, { useState } from 'react';
import { Calendar, CheckCircle, Code, Database, FileText, Settings, Users, BarChart, ThumbsUp } from 'lucide-react';
import { useRoadmap } from './RoadmapContext';

const PublicRoadmap = () => {
  const { roadmapData, voteForTask, userVotes } = useRoadmap();
  const [activeSection, setActiveSection] = useState(
    roadmapData.sections.find(s => s.active)?.id || roadmapData.sections[0]?.id
  );
  const [voteMessage, setVoteMessage] = useState({ show: false, success: false, text: '' });

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
      
      {/* Onglets de navigation */}
      <div className={tabsContainerStyle}>
        {roadmapData.sections.map(section => (
          <div
            key={section.id}
            className={`${tabStyle} ${section.id === activeSection ? activeTabStyle : inactiveTabStyle}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.title}
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
              <div className={`${monthStyle} ${sectionColors[sectionData.color].tab} flex justify-between`}>
                <span className="flex items-center">
                  <Calendar className="mr-2" size={20} /> 
                  {sectionData.phases[phase].title}
                </span>
              </div>
              
              {/* Affichage des semaines et tâches */}
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
                        <li key={task.id} className={taskStyle}>
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            readOnly 
                            disabled
                            className="cursor-not-allowed"
                          />
                          {renderIcon(task.icon, task.completed)}
                          <span className={task.completed ? taskCompletedStyle : taskTextStyle}>
                            {task.text}
                          </span>
                          
                          {/* Bouton de vote et compteur */}
                          <div className="flex items-center ml-auto">
                            <span className={voteCountStyle}>{task.votes || 0}</span>
                            <button 
                              className={hasVoted ? voteAlreadyStyle : voteButtonStyle}
                              onClick={() => !hasVoted && handleVote(sectionData.id, phase, week, task.id)}
                              title={hasVoted ? "Vous avez déjà voté" : "Voter pour cette tâche"}
                              disabled={hasVoted}
                            >
                              <ThumbsUp size={16} />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      
      {/* Vue d'ensemble */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold text-lg mb-4">Vue d'ensemble du projet</h3>
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
