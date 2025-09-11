import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Menu as MenuIcon,
  Settings,
  BarChart3,
  MessageSquare,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/orders', label: 'Pedidos', icon: ShoppingCart },
    { path: '/customers', label: 'Clientes', icon: Users },
    { path: '/products', label: 'Produtos', icon: Package },
    { path: '/menu', label: 'Menu Digital', icon: MenuIcon },
    { path: '/analytics', label: 'Relatórios', icon: BarChart3 },
    { path: '/whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0 lg:shadow-none`}
      >
        <div className="flex items-center justify-between p-6">
          <h1 className="text-xl font-bold text-orange-600">Panetto di Cris</h1>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path === '/dashboard' && location.pathname === '/');

            return (
              <button
                key={item.path}
                onClick={() => {
                  handleNavigation(item.path);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                  ${isActive
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-orange-400 to-amber-500 rounded-lg p-4 text-white text-center">
            <p className="text-sm font-medium">Sistema de Gestão</p>
            <p className="text-xs opacity-90">Versão 1.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;