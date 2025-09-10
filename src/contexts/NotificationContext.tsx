import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  requestPermission: () => Promise<boolean>;
  isSupported: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Verificar se o navegador suporta notificações
  const isSupported = 'Notification' in window;

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  // Solicitar permissão para notificações
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return false;
    }
  };

  // Adicionar nova notificação
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Mostrar notificação do navegador se permitido
    if (permission === 'granted' && document.hidden) {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: newNotification.id,
        });

        browserNotification.onclick = () => {
          window.focus();
          if (notification.action?.onClick) {
            notification.action.onClick();
          }
          browserNotification.close();
        };

        // Auto-fechar após 5 segundos
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      } catch (error) {
        console.error('Erro ao mostrar notificação do navegador:', error);
      }
    }
  };

  // Marcar como lida
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Remover notificação
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Limpar todas
  const clearAll = () => {
    setNotifications([]);
  };

  // Contar não lidas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Escutar mudanças em tempo real no Supabase
  useEffect(() => {
    if (!user) return;

    // Escutar novos pedidos
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          addNotification({
            title: '🛒 Novo Pedido!',
            message: `Pedido #${payload.new.id} foi criado`,
            type: 'info',
            action: {
              label: 'Ver Pedido',
              onClick: () => {
                // Navegar para a tela de pedidos
                window.location.hash = '#orders';
              }
            }
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const oldStatus = payload.old.status;
          const newStatus = payload.new.status;
          
          if (oldStatus !== newStatus) {
            const statusMessages = {
              confirmed: '✅ Pedido confirmado',
              preparing: '👨‍🍳 Pedido em preparo',
              ready: '🎉 Pedido pronto para entrega',
              delivered: '📦 Pedido entregue',
              cancelled: '❌ Pedido cancelado'
            };

            addNotification({
              title: 'Status Atualizado',
              message: `Pedido #${payload.new.id}: ${statusMessages[newStatus as keyof typeof statusMessages] || newStatus}`,
              type: newStatus === 'cancelled' ? 'warning' : 'success',
            });
          }
        }
      )
      .subscribe();

    // Escutar novos clientes
    const customersSubscription = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customers',
        },
        (payload) => {
          addNotification({
            title: '👤 Novo Cliente!',
            message: `${payload.new.name} foi cadastrado`,
            type: 'success',
          });
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      ordersSubscription.unsubscribe();
      customersSubscription.unsubscribe();
    };
  }, [user]);

  // Solicitar permissão automaticamente quando o usuário fizer login
  useEffect(() => {
    if (user && isSupported && permission === 'default') {
      // Aguardar um pouco antes de solicitar para não ser intrusivo
      setTimeout(() => {
        requestPermission();
      }, 3000);
    }
  }, [user, isSupported, permission]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        requestPermission,
        isSupported,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};