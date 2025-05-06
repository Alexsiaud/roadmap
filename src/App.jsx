import React from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { RoadmapProvider, useRoadmap } from './components/RoadmapContext';
import PublicRoadmap from './components/PublicRoadmap';
import LocalStorageCleaner from './components/LocalStorageCleaner';

// AdminRoadmap est importé de manière dynamique
const AdminRoadmap = React.lazy(() => import('./components/AdminRoadmap'));

// Composant qui vérifie si l'accès admin est autorisé
// Utilise un paramètre de requête pour une vérification simple
const AdminRoute = () => {
  const location = useLocation();
  const { checkAdminAccess } = useRoadmap();
  
  // Récupérer le code secret depuis les paramètres d'URL
  const params = new URLSearchParams(location.search);
  const secret = params.get('secret');
  
  // Vérifier si l'accès admin est autorisé
  if (!secret || !checkAdminAccess(secret)) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-red-600">Accès non autorisé</h2>
        <p className="mb-4 text-center">
          Vous devez fournir un code secret valide pour accéder à cette page.
        </p>
        <div className="flex justify-center">
          <a 
            href="/" 
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Retour à la page publique
          </a>
        </div>
      </div>
    );
  }
  
  // Si l'accès est autorisé, afficher la page admin
  return (
    <React.Suspense fallback={<div className="p-10 text-center">Chargement de l'interface administrateur...</div>}>
      <AdminRoadmap adminSecret={secret} />
    </React.Suspense>
  );
};

// Les routes de l'application
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicRoadmap />} />
      <Route path="/admin" element={<AdminRoute />} />
      <Route path="/cleaner" element={<LocalStorageCleaner />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Composant principal de l'application
const App = () => {
  return (
    <HashRouter>
      <RoadmapProvider>
        <AppRoutes />
      </RoadmapProvider>
    </HashRouter>
  );
};

export default App;
