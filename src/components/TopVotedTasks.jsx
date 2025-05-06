import React from 'react';
import { ThumbsUp } from 'lucide-react';
import { renderIcon } from './AdminRoadmapUtils';

const TopVotedTasks = ({ topVotedTasks }) => {
  // Ne garde que les tâches avec au moins 1 vote
  const tasksWithVotes = topVotedTasks?.filter(item => item.task.votes && item.task.votes > 0) || [];

  if (!tasksWithVotes.length) {
    return (
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-bold text-lg mb-2">Tâches les plus votées (non validées)</h3>
        <p className="text-gray-500">Aucune tâche non validée n'a encore reçu de vote.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h3 className="font-bold text-lg mb-4">Tâches les plus votées (non validées)</h3>
      <div className="space-y-3">
        {tasksWithVotes.map((item, index) => (
          <div key={item.task.id} className="flex items-center p-2 border-b last:border-b-0">
            <span className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center mr-3">
              {index + 1}
            </span>
            <div className="flex-1">
              <div className="flex items-center">
                {renderIcon(item.task.icon, item.task.completed)}
                <span className={`ml-2 ${item.task.completed ? 'line-through text-gray-500' : 'font-medium'}`}>
                  {item.task.text}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {item.sectionTitle} ・ {item.phaseTitle} ・ {item.weekTitle}
              </div>
            </div>
            <div className="flex items-center bg-blue-100 px-2 py-1 rounded-full">
              <ThumbsUp size={14} className="text-blue-500 mr-1" />
              <span className="font-bold text-blue-700">{item.task.votes || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopVotedTasks;
