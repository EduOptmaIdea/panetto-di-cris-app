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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <LoginForm />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleNotifications={() => setNotificationCenterOpen(!notificationCenterOpen)}
        />
        <div className="flex">
          <Sidebar 
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="flex-1 lg:ml-64 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<OrdersList />} />
              <Route path="/products" element={<ProductsList />} />
              <Route path="/customers" element={<CustomersList />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/menu" element={<DigitalMenu />} />
              <Route path="/whatsapp" element={
                <PlaceholderView 
                  title="WhatsApp Integration" 
                  description="Integração com WhatsApp para automatizar atendimento e pedidos"
                  icon={MessageSquare}
                />
              } />
              <Route path="/settings" element={
                <PlaceholderView 
                  title="Configurações" 
                  description="Configure as preferências do sistema e dados da empresa"
                  icon={Settings}
                />
              } />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
        <NotificationCenter 
          isOpen={notificationCenterOpen}
          onClose={() => setNotificationCenterOpen(false)}
        />
        <ToastNotification />
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;