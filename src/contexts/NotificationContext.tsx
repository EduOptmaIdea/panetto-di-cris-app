import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';

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

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  const isSupported = 'Notification' in window;

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return false;
    }
  }, [isSupported]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);

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
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      } catch (error) {
        console.error('Erro ao mostrar notificação do navegador:', error);
      }
    }
  }, [permission]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;

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
            // ✅ Corrigido para mostrar o número do pedido em vez do ID
            message: `Pedido #${payload.new.number} foi criado`,
            type: 'info',
            action: {
              label: 'Ver Pedido',
              onClick: () => {
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
              // ✅ Corrigido para mostrar o número do pedido em vez do ID
              message: `Pedido #${payload.new.number}: ${statusMessages[newStatus as keyof typeof statusMessages] || newStatus}`,
              type: newStatus === 'cancelled' ? 'warning' : 'success',
            });
          }
        }
      )
      .subscribe();

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

    return () => {
      ordersSubscription.unsubscribe();
      customersSubscription.unsubscribe();
    };
  }, [user, addNotification]);

  useEffect(() => {
    if (user && isSupported && permission === 'default') {
      setTimeout(() => {
        requestPermission();
      }, 3000);
    }
  }, [user, isSupported, permission, requestPermission]);

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