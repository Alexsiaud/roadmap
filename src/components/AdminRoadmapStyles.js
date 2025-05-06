// Styles CSS pour le composant AdminRoadmap
export const styles = {
  containerStyle: "max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg",
  titleStyle: "text-2xl font-bold text-center mb-8 text-blue-800",
  tabsContainerStyle: "flex border-b mb-6",
  tabStyle: "px-4 py-2 cursor-pointer font-medium",
  activeTabStyle: "border-b-2 border-blue-500 text-blue-700",
  inactiveTabStyle: "text-gray-500 hover:text-gray-700",
  monthStyle: "mb-4 p-3 rounded-t-lg text-white font-bold flex items-center",
  weekStyle: "ml-8 mb-2 p-2 border-l-4 font-semibold flex justify-between items-center",
  taskListStyle: "ml-12 mb-4 space-y-2",
  taskStyle: "p-2 rounded flex items-center hover:bg-gray-50 group relative",
  taskCompletedStyle: "ml-2 line-through text-gray-500",
  taskTextStyle: "ml-2",
  actionButtonStyle: "p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded",
  modalBackdropStyle: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
  modalStyle: "bg-white rounded-lg p-6 max-w-lg w-full",
  inputStyle: "w-full p-2 border rounded mb-4",
  buttonStyle: "py-2 px-4 rounded",
  buttonPrimaryStyle: "bg-blue-500 text-white hover:bg-blue-600",
  buttonSecondaryStyle: "bg-gray-300 text-gray-800 hover:bg-gray-400",
  checkboxStyle: "mr-2",
  voteCountStyle: "ml-auto text-xs font-semibold text-gray-600 bg-blue-100 py-1 px-2 rounded-full flex items-center",
  adminHeaderStyle: "flex justify-between items-center mb-6 bg-gray-100 p-4 rounded",
  sortButtonStyle: "bg-gray-200 py-1 px-3 rounded text-sm hover:bg-gray-300",
  sortActiveStyle: "bg-blue-500 text-white py-1 px-3 rounded text-sm"
};

export const sectionColors = {
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
