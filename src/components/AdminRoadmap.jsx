import React, { useState } from 'react';
import { Calendar, Edit, Trash2, Plus, ChevronUp, ChevronDown, ThumbsUp } from 'lucide-react';
import { useRoadmap } from './RoadmapContext';
import { sectionColors, styles } from './AdminRoadmapStyles';
import { renderIcon, calculateStats, generateId, sortTasksByVotes, createEmptyTask } from './AdminRoadmapUtils';
import { TaskEditForm, WeekEditForm, PhaseEditForm, SectionEditForm } from './AdminForms';
import TopVotedTasks from './TopVotedTasks';

const AdminRoadmap = ({ adminSecret }) => {
  const { roadmapData, setRoadmapData } = useRoadmap();
  const [activeSection, setActiveSection] = useState(
    roadmapData.sections.find(s => s.active)?.id || roadmapData.sections[0]?.id
  );
  
  const [editMode, setEditMode] = useState({
    type: null, // 'section', 'phase', 'week', 'task'
    sectionId: null,
    phase: null,
    week: null,
    taskId: null,
    data: null
  });
  
  const [draggedItem, setDraggedItem] = useState(null);
  const [destinationTarget, setDestinationTarget] = useState(null);
  const [sortByVotes, setSortByVotes] = useState(false);
  
  // Obtenir la section active
  const sectionData = roadmapData.sections.find(s => s.id === activeSection);
  
  // Calculer les statistiques
  const stats = calculateStats(roadmapData);
  
  // Navigation entre les sections
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    
    // Mettre à jour la propriété active des sections
    setRoadmapData(prevData => {
      const updatedSections = prevData.sections.map(section => ({
        ...section,
        active: section.id === sectionId
      }));
      
      return {
        ...prevData,
        sections: updatedSections
      };
    });
  };
  
  // Gestion des formulaires d'édition
  const startEdit = (type, sectionId, phase, week, taskId) => {
    let data;
    const section = roadmapData.sections.find(s => s.id === sectionId);
    
    if (type === 'section' && section) {
      data = { ...section };
    } else if (type === 'phase' && section && section.phases[phase]) {
      data = {
        ...section.phases[phase],
        id: phase // Ajouter l'ID de la phase pour l'édition
      };
    } else if (type === 'week' && section && section.phases[phase] && section.phases[phase][week]) {
      data = {
        ...section.phases[phase][week],
        id: week // Ajouter l'ID de la semaine pour l'édition
      };
    } else if (type === 'task' && section && section.phases[phase] && section.phases[phase][week]) {
      data = section.phases[phase][week].tasks.find(t => t.id === taskId);
    }
    
    if (data) {
      setEditMode({ type, sectionId, phase, week, taskId, data });
    } else {
      console.error('Impossible de trouver les données pour l\'édition');
    }
  };
  
  const cancelEdit = () => {
    setEditMode({ type: null, sectionId: null, phase: null, week: null, taskId: null, data: null });
  };
  
  const saveEdit = () => {
    const updatedRoadmapData = {...roadmapData};
    const { type, sectionId, phase, week, taskId, data } = editMode;
    
    if (type === 'section') {
      const sectionIndex = updatedRoadmapData.sections.findIndex(s => s.id === sectionId);
      updatedRoadmapData.sections[sectionIndex] = data;
      
      // Mettre à jour activeSection si l'ID a changé
      if (data.id !== sectionId) {
        setActiveSection(data.id);
      }
    } 
    else if (type === 'phase') {
      const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
      section.phases[phase] = data;
    } 
    else if (type === 'week') {
      const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
      section.phases[phase][week] = data;
    } 
    else if (type === 'task') {
      const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
      const taskIndex = section.phases[phase][week].tasks.findIndex(t => t.id === taskId);
      section.phases[phase][week].tasks[taskIndex] = data;
    }
    
    setRoadmapData(updatedRoadmapData);
    cancelEdit();
  };
  
  // Fonctions pour ajouter/supprimer des éléments
  const addSection = () => {
    const newSection = {
      id: generateId('section'),
      title: 'Nouvelle Section',
      active: false,
      color: 'blue',
      phases: {
        phase1: {
          title: 'Nouvelle Phase',
          order: 1,
          semaine1: {
            title: 'Semaine 1',
            order: 1,
            tasks: []
          }
        }
      }
    };
    
    setRoadmapData({
      ...roadmapData,
      sections: [...roadmapData.sections, newSection]
    });
  };
  
  const deleteSection = (sectionId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette section ?")) return;
    
    const updatedSections = roadmapData.sections.filter(s => s.id !== sectionId);
    
    setRoadmapData({
      ...roadmapData,
      sections: updatedSections
    });
    
    // Si la section supprimée est active, sélectionner la première section restante
    if (sectionId === activeSection && updatedSections.length > 0) {
      setActiveSection(updatedSections[0].id);
    }
  };
  
  const addPhase = (sectionId) => {
    const updatedRoadmapData = {...roadmapData};
    const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
    
    if (section) {
      const phaseId = `phase${Object.keys(section.phases).length + 1}`;
      section.phases[phaseId] = {
        title: 'Nouvelle Phase',
        order: Object.keys(section.phases).length + 1,
        semaine1: {
          title: 'Semaine 1',
          order: 1,
          tasks: []
        }
      };
      
      setRoadmapData(updatedRoadmapData);
    }
  };
  
  const deletePhase = (sectionId, phase) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette phase ?")) return;
    
    const updatedRoadmapData = {...roadmapData};
    const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
    
    if (section) {
      const { [phase]: removedPhase, ...restPhases } = section.phases;
      section.phases = restPhases;
      
      setRoadmapData(updatedRoadmapData);
    }
  };
  
  const addWeek = (sectionId, phase) => {
    const updatedRoadmapData = {...roadmapData};
    const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
    
    if (section && section.phases[phase]) {
      // Filtrer les clés qui ne sont pas 'title' ou 'order'
      const weekKeys = Object.keys(section.phases[phase]).filter(key => key !== 'title' && key !== 'order');
      const weekId = `semaine${weekKeys.length + 1}`;
      
      section.phases[phase][weekId] = {
        title: `Semaine ${weekKeys.length + 1}`,
        order: weekKeys.length + 1,
        tasks: []
      };
      
      setRoadmapData(updatedRoadmapData);
    }
  };
  
  const deleteWeek = (sectionId, phase, week) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette semaine ?")) return;
    
    const updatedRoadmapData = {...roadmapData};
    const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
    
    if (section && section.phases[phase]) {
      const { [week]: removedWeek, ...restWeeks } = section.phases[phase];
      
      // Conserver les propriétés 'title' et 'order'
      const { title, order } = section.phases[phase];
      section.phases[phase] = { title, order, ...restWeeks };
      
      setRoadmapData(updatedRoadmapData);
    }
  };
  
  const addTask = (sectionId, phase, week) => {
    const updatedRoadmapData = {...roadmapData};
    const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
    
    if (section && section.phases[phase] && section.phases[phase][week]) {
      const newTask = createEmptyTask(sectionId, phase, week);
      section.phases[phase][week].tasks.push(newTask);
      
      setRoadmapData(updatedRoadmapData);
      
      // Immédiatement éditer la nouvelle tâche
      startEdit('task', sectionId, phase, week, newTask.id);
    }
  };
  
  const deleteTask = (sectionId, phase, week, taskId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;
    
    const updatedRoadmapData = {...roadmapData};
    const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
    
    if (section && section.phases[phase] && section.phases[phase][week]) {
      section.phases[phase][week].tasks = section.phases[phase][week].tasks.filter(t => t.id !== taskId);
      
      setRoadmapData(updatedRoadmapData);
    }
  };
  
  // Gestion des checkboxes des tâches
  const handleTaskToggle = (sectionId, phase, week, taskId) => {
    const updatedRoadmapData = {...roadmapData};
    const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
    
    if (section && section.phases[phase] && section.phases[phase][week]) {
      const taskIndex = section.phases[phase][week].tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex !== -1) {
        section.phases[phase][week].tasks[taskIndex].completed = !section.phases[phase][week].tasks[taskIndex].completed;
        
        setRoadmapData(updatedRoadmapData);
      }
    }
  };
  
  // Déplacement des tâches
  const moveTask = (sectionId, phase, week, taskId, direction) => {
    const updatedRoadmapData = {...roadmapData};
    const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
    const tasks = section.phases[phase][week].tasks;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (direction === "up" && taskIndex > 0) {
      // Échanger avec l'élément précédent
      [tasks[taskIndex], tasks[taskIndex - 1]] = [tasks[taskIndex - 1], tasks[taskIndex]];
    } else if (direction === "down" && taskIndex < tasks.length - 1) {
      // Échanger avec l'élément suivant
      [tasks[taskIndex], tasks[taskIndex + 1]] = [tasks[taskIndex + 1], tasks[taskIndex]];
    }
    
    setRoadmapData(updatedRoadmapData);
  };
  
  // Gestion du drag and drop
  const handleDragStart = (sectionId, phase, week, task) => {
    setDraggedItem({ sectionId, phase, week, task });
  };
  
  const handleDragEnter = (sectionId, phase, week) => {
    if (!draggedItem) return;
    
    setDestinationTarget({ sectionId, phase, week });
  };
  
  const handleDragOver = (e) => {
    // Empêcher le comportement par défaut pour permettre le drop
    e.preventDefault();
  };
  
  const handleDragEnd = () => {
    if (!draggedItem || !destinationTarget) {
      setDraggedItem(null);
      setDestinationTarget(null);
      return;
    }
    
    const { sectionId: fromSectionId, phase: fromPhase, week: fromWeek, task } = draggedItem;
    const { sectionId: toSectionId, phase: toPhase, week: toWeek } = destinationTarget;
    
    // Si destination = origine, ne rien faire
    if (fromSectionId === toSectionId && fromPhase === toPhase && fromWeek === toWeek) {
      setDraggedItem(null);
      setDestinationTarget(null);
      return;
    }
    
    const updatedRoadmapData = {...roadmapData};
    
    // Supprimer la tâche de son emplacement d'origine
    const fromSection = updatedRoadmapData.sections.find(s => s.id === fromSectionId);
    fromSection.phases[fromPhase][fromWeek].tasks = fromSection.phases[fromPhase][fromWeek].tasks.filter(t => t.id !== task.id);
    
    // Ajouter la tâche à sa destination
    const toSection = updatedRoadmapData.sections.find(s => s.id === toSectionId);
    toSection.phases[toPhase][toWeek].tasks.push(task);
    
    setRoadmapData(updatedRoadmapData);
    setDraggedItem(null);
    setDestinationTarget(null);
  };
  
  // Fonction pour générer le lien public
  const getPublicLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/roadmap/#/`;
  };
  
  // Rendu des formulaires d'édition
  const renderEditForms = () => {
    if (!editMode.type || !editMode.data) return null;
    
    switch (editMode.type) {
      case 'task':
        return (
          <TaskEditForm 
            data={editMode.data} 
            onSave={(data) => {
              setEditMode({ ...editMode, data });
              saveEdit();
            }}
            onCancel={cancelEdit}
          />
        );
      case 'week':
        return (
          <WeekEditForm 
            data={editMode.data} 
            onSave={(data) => {
              setEditMode({ ...editMode, data });
              saveEdit();
            }}
            onCancel={cancelEdit}
          />
        );
      case 'phase':
        return (
          <PhaseEditForm 
            data={editMode.data} 
            onSave={(data) => {
              setEditMode({ ...editMode, data });
              saveEdit();
            }}
            onCancel={cancelEdit}
          />
        );
      case 'section':
        return (
          <SectionEditForm 
            data={editMode.data} 
            onSave={(data) => {
              setEditMode({ ...editMode, data });
              saveEdit();
            }}
            onCancel={cancelEdit}
          />
        );
      default:
        return null;
    }
  };
  
  // Définir les styles réutilisables
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
  const actionButtonStyle = "p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded";
  const checkboxStyle = "mr-2";
  const voteCountStyle = "ml-auto text-xs font-semibold text-gray-600 bg-blue-100 py-1 px-2 rounded-full flex items-center";
  const adminHeaderStyle = "flex justify-between items-center mb-6 bg-gray-100 p-4 rounded";
  const sortButtonStyle = "bg-gray-200 py-1 px-3 rounded text-sm hover:bg-gray-300";
  const sortActiveStyle = "bg-blue-500 text-white py-1 px-3 rounded text-sm";
  const modalBackdropStyle = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
  
  return (
    <div className={containerStyle}>
      <div className={adminHeaderStyle}>
        <h1 className="text-2xl font-bold">Administration de la Roadmap</h1>
        <div>
          <a 
            href={getPublicLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mr-2"
          >
            Voir la version publique
          </a>
        </div>
      </div>
      
      <h2 className={titleStyle}>Roadmap d'Implémentation IA - Application de Pré-saisie Comptable</h2>
      
      {/* Résumé des votes */}
      <TopVotedTasks topVotedTasks={stats.topVotedTasks} />
      
      {/* Onglets de navigation */}
      <div className="flex justify-between items-center mb-4">
        <div className={tabsContainerStyle}>
          {roadmapData.sections.map(section => (
            <div
              key={section.id}
              className={`${tabStyle} ${section.id === activeSection ? activeTabStyle : inactiveTabStyle}`}
              onClick={() => handleSectionChange(section.id)}
            >
              {section.title}
            </div>
          ))}
        </div>
        <button 
          onClick={addSection}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
        >
          <Plus size={16} className="mr-1" /> Nouvelle section
        </button>
      </div>
      
      {sectionData && (
        <div className="section-content">
          {/* Contrôles de la section */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{sectionData.title}</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => startEdit('section', sectionData.id)}
                className="p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-100 rounded"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => deleteSection(sectionData.id)}
                className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-100 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          
          {/* Contrôle du tri des tâches */}
          <div className="mb-4">
            <button 
              onClick={() => setSortByVotes(!sortByVotes)}
              className={sortByVotes ? "px-3 py-1 bg-blue-500 text-white rounded text-sm" : "px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"}
            >
              <ThumbsUp size={14} className="inline mr-1" /> 
              {sortByVotes ? "Trier par ordre normal" : "Trier par votes"}
            </button>
          </div>
          
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
                <div className="flex space-x-2">
                  <button 
                    onClick={() => startEdit('phase', sectionData.id, phase)}
                    className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => deletePhase(sectionData.id, phase)}
                    className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    onClick={() => addWeek(sectionData.id, phase)}
                    className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              {/* Affichage des semaines et tâches */}
              {Object.keys(sectionData.phases[phase])
                .filter(key => key !== 'title' && key !== 'order')
                .sort((a, b) => sectionData.phases[phase][a].order - sectionData.phases[phase][b].order)
                .map(week => (
                <div key={week}>
                  <div 
                    className={`${weekStyle} ${sectionColors[sectionData.color].week}`}
                    onDragEnter={() => handleDragEnter(sectionData.id, phase, week)}
                    onDragOver={handleDragOver}
                  >
                    <span>{sectionData.phases[phase][week].title}</span>
                    <div className="flex space-x-2">
                      {sectionData.phases[phase][week].badge && (
                        <span className="text-xs bg-green-100 text-green-800 font-medium py-1 px-2 rounded-full">
                          {sectionData.phases[phase][week].badge}
                        </span>
                      )}
                      <button 
                        onClick={() => startEdit('week', sectionData.id, phase, week)}
                        className={styles.actionButtonStyle}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => deleteWeek(sectionData.id, phase, week)}
                        className={styles.actionButtonStyle}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => addTask(sectionData.id, phase, week)}
                        className={styles.actionButtonStyle}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <ul className={taskListStyle}>
                    {(sortByVotes 
                      ? sortTasksByVotes(sectionData.phases[phase][week].tasks)
                      : sectionData.phases[phase][week].tasks
                    ).map((task, index) => (
                      <li 
                        key={task.id} 
                        className={`${taskStyle} ${
                          destinationTarget && 
                          destinationTarget.sectionId === sectionData.id && 
                          destinationTarget.phase === phase && 
                          destinationTarget.week === week ? 
                            draggedItem && draggedItem.task.id === task.id ? 'bg-gray-200' : 'pl-2 border-l-2 border-blue-500' : ''
                        }`}
                        draggable="true"
                        onDragStart={() => handleDragStart(sectionData.id, phase, week, task)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                      >
                        <input 
                          type="checkbox" 
                          checked={task.completed} 
                          onChange={() => handleTaskToggle(sectionData.id, phase, week, task.id)} 
                          className={checkboxStyle}
                        />
                        {renderIcon(task.icon, task.completed)}
                        <span className={task.completed ? taskCompletedStyle : taskTextStyle}>
                          {task.text}
                        </span>
                        
                        {/* Affichage des votes */}
                        {task.votes > 0 && (
                          <div className="ml-auto flex items-center text-blue-600 bg-blue-100 px-2 py-0.5 rounded text-sm">
                            <ThumbsUp size={14} className="mr-1" /> 
                            {task.votes}
                          </div>
                        )}
                        
                        <div className="flex space-x-1 ml-2">
                          <button 
                            className={styles.actionButtonStyle}
                            onClick={() => moveTask(sectionData.id, phase, week, task.id, "up")}
                            disabled={index === 0}
                          >
                            <ChevronUp size={16} className={index === 0 ? "text-gray-300" : ""} />
                          </button>
                          <button 
                            className={styles.actionButtonStyle}
                            onClick={() => moveTask(sectionData.id, phase, week, task.id, "down")}
                            disabled={index === (sortByVotes 
                              ? sortTasksByVotes(sectionData.phases[phase][week].tasks)
                              : sectionData.phases[phase][week].tasks).length - 1}
                          >
                            <ChevronDown size={16} className={index === (sortByVotes 
                              ? sortTasksByVotes(sectionData.phases[phase][week].tasks)
                              : sectionData.phases[phase][week].tasks).length - 1 ? "text-gray-300" : ""} />
                          </button>
                          <button 
                            className={styles.actionButtonStyle}
                            onClick={() => startEdit('task', sectionData.id, phase, week, task.id)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className={styles.actionButtonStyle}
                            onClick={() => deleteTask(sectionData.id, phase, week, task.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              {/* Bouton pour ajouter une semaine */}
              <div className="ml-8 mb-4">
                <button 
                  onClick={() => addWeek(sectionData.id, phase)}
                  className="flex items-center text-gray-500 hover:text-blue-500"
                >
                  <Plus size={16} className="mr-1" /> Ajouter une semaine
                </button>
              </div>
            </div>
          ))}
          
          {/* Bouton pour ajouter une phase */}
          <div className="mb-8">
            <button 
              onClick={() => addPhase(sectionData.id)}
              className="flex items-center text-gray-500 hover:text-blue-500"
            >
              <Plus size={18} className="mr-1" /> Ajouter une phase
            </button>
          </div>
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
      
      {/* Rendu des formulaires d'édition */}
      {renderEditForms()}
    </div>
  );
};

export default AdminRoadmap;
