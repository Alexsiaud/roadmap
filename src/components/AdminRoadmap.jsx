import React, { useState } from 'react';
import { Calendar, CheckCircle, Code, Database, FileText, Settings, Users, BarChart, Edit, Trash2, Plus, ChevronUp, ChevronDown, ThumbsUp } from 'lucide-react';
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
  const [voteMessage, setVoteMessage] = useState({ show: false, success: false, text: '' });
  
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
  
  const saveEdit = (data) => {
    console.log('Sauvegarde des données:', data, 'Mode d\'édition:', editMode);
    
    const { type, sectionId, phase, week, taskId } = editMode;
    const updatedRoadmapData = JSON.parse(JSON.stringify(roadmapData)); // Copie profonde pour éviter les références
    
    if (type === 'section') {
      const sectionIndex = updatedRoadmapData.sections.findIndex(s => s.id === sectionId);
      if (sectionIndex !== -1) {
        // Conserver les phases de la section
        const { phases } = updatedRoadmapData.sections[sectionIndex];
        const updatedSection = { ...data };
        
        // S'assurer que les phases sont préservées
        if (!updatedSection.phases && phases) {
          updatedSection.phases = phases;
        }
        
        updatedRoadmapData.sections[sectionIndex] = updatedSection;
        
        // Mettre à jour la section active si nécessaire
        if (sectionId === activeSection) {
          setActiveSection(updatedSection.id);
        }
      }
    } else if (type === 'phase') {
      const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
      if (section && section.phases && section.phases[phase]) {
        // Préserver toutes les semaines et leur contenu
        const existingPhase = { ...section.phases[phase] };
        
        // Ne mettre à jour que le titre et l'ordre
        existingPhase.title = data.title;
        existingPhase.order = data.order;
        
        // S'assurer que la phase existe toujours
        section.phases[phase] = existingPhase;
      }
    } else if (type === 'week') {
      const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
      if (section && section.phases && section.phases[phase]) {
        // Conserver les tâches existantes
        const existingWeek = section.phases[phase][week] || {};
        const tasks = existingWeek.tasks || [];
        
        // Mettre à jour uniquement le titre, l'ordre et le badge
        section.phases[phase][week] = {
          ...existingWeek,
          title: data.title,
          order: data.order,
          badge: data.badge,
          tasks: tasks
        };
      }
    } else if (type === 'task') {
      const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
      if (section && section.phases[phase] && section.phases[phase][week]) {
        const tasks = section.phases[phase][week].tasks || [];
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
          // Mettre à jour la tâche existante
          tasks[taskIndex] = { ...data };
        } else {
          // Ajouter une nouvelle tâche
          tasks.push({ ...data });
        }
        
        // S'assurer que le tableau de tâches est mis à jour
        section.phases[phase][week].tasks = tasks;
      }
    }
    
    console.log('Données mises à jour:', updatedRoadmapData);
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
    // Copie profonde pour éviter les problèmes de référence
    const updatedRoadmapData = JSON.parse(JSON.stringify(roadmapData));
    const section = updatedRoadmapData.sections.find(s => s.id === sectionId);
    
    if (section && section.phases[phase] && section.phases[phase][week]) {
      // S'assurer que la propriété tasks existe
      if (!section.phases[phase][week].tasks) {
        section.phases[phase][week].tasks = [];
      }
      
      // Créer une nouvelle tâche avec un ID unique
      const newTask = {
        id: generateId('task'), 
        text: 'Nouvelle tâche',
        icon: 'Task',
        completed: false,
        votes: 0
      };
      
      console.log('Nouvelle tâche créée:', newTask);
      
      section.phases[phase][week].tasks.push(newTask);
      
      setRoadmapData(updatedRoadmapData);
      
      // Immédiatement éditer la nouvelle tâche
      startEdit('task', sectionId, phase, week, newTask.id);
    } else {
      console.error('Impossible d\'ajouter une tâche: la structure n\'est pas valide', 
                   {sectionId, phase, week, section: !!section});
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
    console.log('Début du drag:', {sectionId, phase, week, task});
    // Ajouter les informations de position à l'objet task pour faciliter le déplacement
    const taskWithPosition = {
      ...task,
      fromSection: sectionId,
      fromPhase: phase,
      fromWeek: week
    };
    setDraggedItem({ sectionId, phase, week, task: taskWithPosition });
  };
  
  const handleDragEnter = (sectionId, phase, week) => {
    // Seulement changer la destination si un élément est en cours de déplacement
    if (!draggedItem) return;
    
    // Indiquer visuellement la zone cible
    console.log('Entrée dans la zone:', {sectionId, phase, week});
    setDestinationTarget({ sectionId, phase, week });
  };
  
  const handleDragOver = (e) => {
    // Empêcher le comportement par défaut pour permettre le drop
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e, sectionId, phase, week) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Vérifier si un élément est en cours de déplacement
    if (!draggedItem) {
      console.log('Aucun élément en cours de déplacement');
      return;
    }
    
    console.log('Dépôt dans la zone:', {sectionId, phase, week});
    console.log('Élément déplacé:', draggedItem);
    
    // Mettre à jour la destination et finaliser le déplacement
    setDestinationTarget({ sectionId, phase, week });
    
    // Copie profonde pour éviter les problèmes de référence
    const updatedRoadmapData = JSON.parse(JSON.stringify(roadmapData));
    
    const { sectionId: fromSectionId, phase: fromPhase, week: fromWeek, task } = draggedItem;
    
    // Si destination = origine, ne rien faire
    if (fromSectionId === sectionId && fromPhase === phase && fromWeek === week) {
      console.log('Même position, aucun changement nécessaire');
      setDraggedItem(null);
      setDestinationTarget(null);
      return;
    }
    
    try {
      // Supprimer la tâche de son emplacement d'origine
      const fromSection = updatedRoadmapData.sections.find(s => s.id === fromSectionId);
      if (fromSection && fromSection.phases[fromPhase] && fromSection.phases[fromPhase][fromWeek]) {
        fromSection.phases[fromPhase][fromWeek].tasks = fromSection.phases[fromPhase][fromWeek].tasks.filter(t => t.id !== task.id);
      }
      
      // Ajouter la tâche à sa destination
      const toSection = updatedRoadmapData.sections.find(s => s.id === sectionId);
      if (toSection && toSection.phases[phase] && toSection.phases[phase][week]) {
        // S'assurer que le tableau tasks existe
        if (!toSection.phases[phase][week].tasks) {
          toSection.phases[phase][week].tasks = [];
        }
        
        // Copie de la tâche sans les informations de position
        const { fromSection, fromPhase, fromWeek, ...taskWithoutPosition } = task;
        toSection.phases[phase][week].tasks.push(taskWithoutPosition);
        
        console.log('Déplacement réussi');
      }
      
      // Mettre à jour les données
      setRoadmapData(updatedRoadmapData);
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
    }
    
    // Réinitialiser l'état
    setDraggedItem(null);
    setDestinationTarget(null);
  };
  
  const handleDragEnd = () => {
    console.log('Fin du drag');
    // Réinitialiser les états si le dépôt n'a pas fonctionné
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
    if (!editMode.type || !editMode.data) {
      console.error('Mode d\'édition ou données manquantes:', editMode);
      return null;
    }
    
    console.log('Mode d\'édition actuel:', editMode);

    switch (editMode.type) {
      case 'task':
        return (
          <TaskEditForm 
            data={editMode.data} 
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
        );
      case 'week':
        return (
          <WeekEditForm 
            data={editMode.data} 
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
        );
      case 'phase':
        return (
          <PhaseEditForm 
            data={editMode.data} 
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
        );
      case 'section':
        return (
          <SectionEditForm 
            data={editMode.data} 
            onSave={saveEdit}
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
      {/* Notification de vote */}
      {voteMessage.show && (
        <div className={`fixed top-4 right-4 p-3 rounded shadow-lg ${voteMessage.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {voteMessage.text}
        </div>
      )}
      
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
                    className={`${weekStyle} ${sectionColors[sectionData.color].week} ${destinationTarget && destinationTarget.sectionId === sectionData.id && destinationTarget.phase === phase && destinationTarget.week === week ? 'bg-blue-50 border-blue-500' : ''}`}
                    onDragEnter={() => handleDragEnter(sectionData.id, phase, week)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, sectionData.id, phase, week)}
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
                        className={`${taskStyle} ${task.completed ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'} transition-all duration-200 shadow-sm rounded-lg mb-2 hover:shadow group ${
                          destinationTarget && 
                          destinationTarget.sectionId === sectionData.id && 
                          destinationTarget.phase === phase && 
                          destinationTarget.week === week ? 
                            draggedItem && draggedItem.task.id === task.id ? 'bg-gray-200' : 'border-l-4 border-blue-500' : ''
                        }`}
                        draggable="true"
                        onDragStart={() => handleDragStart(sectionData.id, phase, week, task)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                      >
                        <div className="flex items-center w-full p-3">
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => handleTaskToggle(sectionData.id, phase, week, task.id)} 
                            className={checkboxStyle}
                          />
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
                          <div className="flex items-center bg-gray-50 rounded-full px-3 py-1 ml-2">
                            <span className="font-semibold text-gray-700 mr-1">{task.votes || 0}</span>
                            <span className="text-gray-500">
                              <ThumbsUp size={16} />
                            </span>
                          </div>
                          
                          {/* Boutons d'administration */}
                          <div className="ml-2 space-x-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => moveTask(sectionData.id, phase, week, task.id, "up")}
                              className={actionButtonStyle}
                              title="Déplacer vers le haut"
                              disabled={index === 0}
                            >
                              <ChevronUp size={16} className={index === 0 ? "text-gray-300" : ""} />
                            </button>
                            <button
                              onClick={() => moveTask(sectionData.id, phase, week, task.id, "down")}
                              className={actionButtonStyle}
                              title="Déplacer vers le bas"
                              disabled={index === (sortByVotes 
                                ? sortTasksByVotes(sectionData.phases[phase][week].tasks)
                                : sectionData.phases[phase][week].tasks).length - 1}
                            >
                              <ChevronDown size={16} className={index === (sortByVotes 
                                ? sortTasksByVotes(sectionData.phases[phase][week].tasks)
                                : sectionData.phases[phase][week].tasks).length - 1 ? "text-gray-300" : ""} />
                            </button>
                            <button 
                              onClick={() => startEdit('task', sectionData.id, phase, week, task.id)}
                              className={actionButtonStyle}
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => deleteTask(sectionData.id, phase, week, task.id)}
                              className={actionButtonStyle}
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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
