import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  Bell,
  User,
  LogOut,
  Menu
} from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onNotificationsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onNotificationsClick }) => {
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            <button
              onClick={onNotificationsClick}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-600">Administrador</p>
              </div>

              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;