import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastNotification: React.FC = () => {
  const { notifications } = useNotifications();
  const [visibleToasts, setVisibleToasts] = useState<string[]>([]);

  // Mostrar apenas as 3 notificações mais recentes como toast
  const recentNotifications = notifications.slice(0, 3);

  useEffect(() => {
    // Adicionar novas notificações aos toasts visíveis
    const newToasts = recentNotifications
      .filter(n => !visibleToasts.includes(n.id))
      .map(n => n.id);

    if (newToasts.length > 0) {
      setVisibleToasts(prev => [...newToasts, ...prev].slice(0, 3));

      // Auto-remover após 5 segundos
      newToasts.forEach(toastId => {
        setTimeout(() => {
          setVisibleToasts(prev => prev.filter(id => id !== toastId));
        }, 5000);
      });
    }
  }, [recentNotifications]);

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getToastBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const removeToast = (toastId: string) => {
    setVisibleToasts(prev => prev.filter(id => id !== toastId));
  };

  const visibleNotifications = recentNotifications.filter(n => 
    visibleToasts.includes(n.id)
  );

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full ${getToastBg(notification.type)} border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out animate-slide-in-right`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getToastIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              
              {notification.action && (
                <button
                  onClick={() => {
                    notification.action!.onClick();
                    removeToast(notification.id);
                  }}
                  className="mt-2 text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50 transition-colors"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            
            <button
              onClick={() => removeToast(notification.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;