import React, { useState } from 'react';
import { X } from 'lucide-react';
// Les styles sont définis directement
import { icons } from './AdminRoadmapUtils';

// Formulaire d'édition de tâche
export const TaskEditForm = ({ data, onSave, onCancel }) => {
  const [taskData, setTaskData] = useState(data);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTaskData({
      ...taskData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className={styles.modalBackdropStyle}>
      <div className={styles.modalStyle}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Éditer la tâche</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <label className="block mb-2">Texte de la tâche</label>
        <input
          type="text"
          name="text"
          value={taskData.text}
          onChange={handleChange}
          className={styles.inputStyle}
        />
        
        <label className="block mb-2">Icône</label>
        <select
          name="icon"
          value={taskData.icon}
          onChange={handleChange}
          className={styles.inputStyle}
        >
          {Object.keys(icons).map(icon => (
            <option key={icon} value={icon}>{icon}</option>
          ))}
        </select>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="completed"
              checked={taskData.completed}
              onChange={handleChange}
              className={styles.checkboxStyle}
            />
            Terminée
          </label>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600">Votes: </span>
            <span className="font-semibold">{taskData.votes || 0}</span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={onCancel} 
              className="py-2 px-4 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
            >
              Annuler
            </button>
            <button 
              onClick={() => onSave(taskData)} 
              className="py-2 px-4 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Formulaire d'édition de semaine
export const WeekEditForm = ({ data, onSave, onCancel }) => {
  const [weekData, setWeekData] = useState(data);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWeekData({
      ...weekData,
      [name]: value
    });
  };

  return (
    <div className={styles.modalBackdropStyle}>
      <div className={styles.modalStyle}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Éditer la semaine</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <label className="block mb-2">Titre</label>
        <input
          type="text"
          name="title"
          value={weekData.title}
          onChange={handleChange}
          className={styles.inputStyle}
        />
        
        <label className="block mb-2">Ordre</label>
        <input
          type="number"
          name="order"
          value={weekData.order}
          onChange={handleChange}
          className={styles.inputStyle}
        />
        
        <label className="block mb-2">Badge (optionnel)</label>
        <input
          type="text"
          name="badge"
          value={weekData.badge || ''}
          onChange={handleChange}
          className={styles.inputStyle}
        />
        
        <div className="flex justify-end space-x-2 mt-4">
          <button 
            onClick={onCancel} 
            className={`${styles.buttonStyle} ${styles.buttonSecondaryStyle}`}
          >
            Annuler
          </button>
          <button 
            onClick={() => onSave(weekData)} 
            className={`${styles.buttonStyle} ${styles.buttonPrimaryStyle}`}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

// Formulaire d'édition de phase
export const PhaseEditForm = ({ data, onSave, onCancel }) => {
  const [phaseData, setPhaseData] = useState(data);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPhaseData({
      ...phaseData,
      [name]: value
    });
  };

  return (
    <div className={styles.modalBackdropStyle}>
      <div className={styles.modalStyle}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Éditer la phase</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <label className="block mb-2">Titre</label>
        <input
          type="text"
          name="title"
          value={phaseData.title}
          onChange={handleChange}
          className={styles.inputStyle}
        />
        
        <label className="block mb-2">Ordre</label>
        <input
          type="number"
          name="order"
          value={phaseData.order}
          onChange={handleChange}
          className={styles.inputStyle}
        />
        
        <div className="flex justify-end space-x-2 mt-4">
          <button 
            onClick={onCancel} 
            className={`${styles.buttonStyle} ${styles.buttonSecondaryStyle}`}
          >
            Annuler
          </button>
          <button 
            onClick={() => onSave(phaseData)} 
            className={`${styles.buttonStyle} ${styles.buttonPrimaryStyle}`}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

// Formulaire d'édition de section
export const SectionEditForm = ({ data, onSave, onCancel }) => {
  const [sectionData, setSectionData] = useState(data);
  const colorOptions = ['blue', 'green', 'purple', 'red', 'orange'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSectionData({
      ...sectionData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className={styles.modalBackdropStyle}>
      <div className={styles.modalStyle}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Éditer la section</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <label className="block mb-2">Titre</label>
        <input
          type="text"
          name="title"
          value={sectionData.title}
          onChange={handleChange}
          className={styles.inputStyle}
        />
        
        <label className="block mb-2">ID</label>
        <input
          type="text"
          name="id"
          value={sectionData.id}
          onChange={handleChange}
          className={styles.inputStyle}
        />
        
        <label className="block mb-2">Couleur</label>
        <select
          name="color"
          value={sectionData.color}
          onChange={handleChange}
          className={styles.inputStyle}
        >
          {colorOptions.map(color => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={sectionData.active}
              onChange={handleChange}
              className={styles.checkboxStyle}
            />
            Active
          </label>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <button 
            onClick={onCancel} 
            className={`${styles.buttonStyle} ${styles.buttonSecondaryStyle}`}
          >
            Annuler
          </button>
          <button 
            onClick={() => onSave(sectionData)} 
            className={`${styles.buttonStyle} ${styles.buttonPrimaryStyle}`}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
