import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useToast } from './use-toast';
import { useCreditApplications } from '../contexts/CreditApplicationContext';

interface Notification {
  id: string;
  userId: string;
  type: "payment_due" | "application_approved" | "application_rejected" | "account_created" | "payment_confirmed" | "new_application_received" | "application_submitted" | "application_under_review";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedId?: string;
}

export function useNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { fetchApplications } = useCreditApplications();
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  // Query para buscar notificações
  const { data: notifications = [], isLoading, refetch } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 15000, // Verificar a cada 15 segundos
    refetchIntervalInBackground: true,
  });

  // Detectar novas notificações e mostrar toast
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    const currentUnreadCount = unreadNotifications.length;

    // Se há mais notificações não lidas do que antes, mostrar toast
    if (currentUnreadCount > lastNotificationCount && lastNotificationCount > 0) {
      const newNotifications = unreadNotifications.slice(0, currentUnreadCount - lastNotificationCount);
      
      newNotifications.forEach(notification => {
        toast({
          title: notification.title,
          description: notification.message,
          duration: 5000,
        });

        // Se a notificação está relacionada a aplicações, atualizar o contexto
        if (notification.type.includes('application')) {
          fetchApplications();
        }
      });
    }

    setLastNotificationCount(currentUnreadCount);
  }, [notifications, lastNotificationCount, toast, fetchApplications]);

  // Marcar notificação como lida
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  // Marcar todas como lidas
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      return apiRequest('PATCH', '/api/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: 'Notificações marcadas como lidas',
        description: 'Todas as notificações foram marcadas como lidas.',
      });
    },
  });

  // Forçar atualização das notificações
  const refreshNotifications = useCallback(() => {
    refetch();
  }, [refetch]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    refreshNotifications,
    isMarkingAsRead: markAsRead.isPending,
    isMarkingAllAsRead: markAllAsRead.isPending,
  };
}