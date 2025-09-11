import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppProvider } from './contexts/AppContext';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import OrdersList from './components/Orders/OrdersList';
import ProductsList from './components/Products/ProductsList';
import CustomersList from './components/Customers/CustomersList';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import DigitalMenu from './components/Menu/DigitalMenu';
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

  // Exibe o spinner de carregamento enquanto a autenticação é verificada
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Renderiza a interface principal se o usuário estiver logado
  if (user) {
    return (
      <NotificationProvider>
        <AppProvider>
          <div className="flex min-h-screen bg-gray-100 font-sans">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col">
              <Header onMenuClick={() => setSidebarOpen(true)} onNotificationsClick={() => setNotificationCenterOpen(true)} />
              <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/orders" element={<OrdersList />} />
                  <Route path="/products" element={<ProductsList />} />
                  <Route path="/customers" element={<CustomersList />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/menu" element={<DigitalMenu />} />
                  <Route path="/whatsapp" element={
                    <PlaceholderView
                      title="Integração com WhatsApp"
                      description="Em breve, um módulo para automatizar atendimento e pedidos."
                      icon={MessageSquare}
                    />
                  } />
                  <Route path="/settings" element={
                    <PlaceholderView
                      title="Configurações"
                      description="Configure as preferências do sistema e dados da empresa."
                      icon={Settings}
                    />
                  } />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
              <NotificationCenter
                isOpen={notificationCenterOpen}
                onClose={() => setNotificationCenterOpen(false)}
              />
              <ToastNotification />
            </div>
          </div>
        </AppProvider>
      </NotificationProvider>
    );
  }

  // Redireciona para o login se não houver usuário logado
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