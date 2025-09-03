import React, { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import LoadingSpinner from './components/Layout/LoadingSpinner';
import ErrorMessage from './components/Layout/ErrorMessage';
import Dashboard from './components/Dashboard/Dashboard';
import OrdersList from './components/Orders/OrdersList';
import CustomersList from './components/Customers/CustomersList';
import ProductsList from './components/Products/ProductsList';
import DigitalMenu from './components/Menu/DigitalMenu';
import PlaceholderView from './components/Placeholder/PlaceholderView';
import { useApp } from './contexts/AppContext';
import { BarChart3, MessageSquare, Settings } from 'lucide-react';

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentView, loading, error, refetch } = useApp();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <OrdersList />;
      case 'customers':
        return <CustomersList />;
      case 'products':
        return <ProductsList />;
      case 'menu':
        return <DigitalMenu />;
      case 'analytics':
        return (
          <PlaceholderView 
            title="Relatórios e Análises"
            description="Visualize métricas de vendas, produtos mais vendidos e performance da sua paneteria"
            icon={BarChart3}
          />
        );
      case 'whatsapp':
        return (
          <PlaceholderView 
            title="Integração WhatsApp"
            description="Gerencie mensagens, envie pedidos e promoções diretamente pelo WhatsApp"
            icon={MessageSquare}
          />
        );
      case 'settings':
        return (
          <PlaceholderView 
            title="Configurações"
            description="Configure suas preferências, taxas de entrega, métodos de pagamento e mais"
            icon={Settings}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-4 lg:p-8">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;