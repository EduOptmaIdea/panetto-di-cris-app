import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppProvider } from './contexts/AppProvider';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import CustomersList from './components/Customers/CustomersList';
import OrdersList from './components/Orders/OrdersList.tsx';
import ProductsList from './components/Products/ProductsList';
import CategoriesList from './components/Categories/CategoriesList';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import DigitalMenu from './components/Menu/DigitalMenu';
import DigitalMenuCard from './components/Menu/DigitalMenuCard'; // ✅ Importando o componente
import PlaceholderView from './components/Placeholder/PlaceholderView';
import NotificationCenter from './components/Notifications/NotificationCenter';
import ToastNotification from './components/Notifications/ToastNotification';
import LoadingSpinner from './components/Layout/LoadingSpinner';
import { useState } from 'react';
import { MessageSquare, Settings } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return (
      <NotificationProvider>
        <AppProvider>
          <div className="flex min-h-screen bg-gray-100">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col">
              <Header
                onToggleSidebar={() => setSidebarOpen(true)}
                onNotificationsClick={() => setNotificationCenterOpen(true)}
              />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/orders" element={<OrdersList />} />
                  <Route path="/products" element={<ProductsList />} />
                  <Route path="/categories" element={<CategoriesList />} />
                  <Route path="/customers" element={<CustomersList />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />

                  {/* Rotas do Menu Digital */}
                  <Route path="/menu" element={<DigitalMenu />} />
                  <Route path="/menu/:productId" element={<DigitalMenuCard />} />

                  <Route path="/whatsapp" element={<PlaceholderView title="Integração com WhatsApp" description="Em breve, um módulo para automatizar atendimento e pedidos." icon={MessageSquare} />} />
                  <Route path="/settings" element={<PlaceholderView title="Configurações" description="Configure as preferências do sistema e dados da empresa." icon={Settings} />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
              <NotificationCenter isOpen={notificationCenterOpen} onClose={() => setNotificationCenterOpen(false)} />
              <ToastNotification />
            </div>
          </div>
        </AppProvider>
      </NotificationProvider>
    );
  }

  return (
    <Routes>
      <Route path="*" element={<LoginForm />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;