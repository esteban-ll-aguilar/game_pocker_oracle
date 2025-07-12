import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Componente individual de notificación
const Notification = ({ notification, onRemove }) => {
  const { id, type, title, message, duration, icon } = notification;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-500 border-red-400';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400';
      case 'achievement':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 border-gray-400';
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'achievement': return '🏆';
      default: return '📢';
    }
  };

  return (
    <div className={`
      ${getTypeStyles()}
      border-2 rounded-lg shadow-2xl p-4 mb-3 min-w-80 max-w-md
      transform transition-all duration-300 ease-in-out
      animate-slide-in-right backdrop-blur-sm
    `}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl flex-shrink-0">
          {icon || getDefaultIcon()}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-white font-bold text-sm mb-1 truncate">
              {title}
            </h4>
          )}
          <p className="text-white/90 text-sm leading-relaxed">
            {message}
          </p>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="text-white/70 hover:text-white transition-colors duration-200 flex-shrink-0"
        >
          ✕
        </button>
      </div>
      
      {/* Barra de progreso para notificaciones con duración */}
      {duration > 0 && (
        <div className="mt-2 w-full bg-white/20 rounded-full h-1">
          <div 
            className="bg-white h-1 rounded-full animate-progress"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
};

// Sistema de notificaciones
export const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      duration: 5000, // 5 segundos por defecto
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Limitar a máximo 5 notificaciones
    setNotifications(prev => prev.slice(-5));
    
    return id;
  }, []);

  // Exponer funciones globalmente
  useEffect(() => {
    window.showNotification = addNotification;
    return () => {
      delete window.showNotification;
    };
  }, [addNotification]);

  if (notifications.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>,
    document.body
  );
};

// Hook para usar notificaciones
export const useNotifications = () => {
  const showNotification = useCallback((notification) => {
    if (window.showNotification) {
      return window.showNotification(notification);
    }
    console.warn('Sistema de notificaciones no disponible');
  }, []);

  const showSuccess = useCallback((message, title = 'Éxito') => {
    return showNotification({
      type: 'success',
      title,
      message,
      duration: 4000
    });
  }, [showNotification]);

  const showError = useCallback((message, title = 'Error') => {
    return showNotification({
      type: 'error',
      title,
      message,
      duration: 6000
    });
  }, [showNotification]);

  const showWarning = useCallback((message, title = 'Advertencia') => {
    return showNotification({
      type: 'warning',
      title,
      message,
      duration: 5000
    });
  }, [showNotification]);

  const showInfo = useCallback((message, title = 'Información') => {
    return showNotification({
      type: 'info',
      title,
      message,
      duration: 4000
    });
  }, [showNotification]);

  const showAchievement = useCallback((achievement) => {
    return showNotification({
      type: 'achievement',
      title: '¡Logro Desbloqueado!',
      message: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
      duration: 7000,
      icon: achievement.icon
    });
  }, [showNotification]);

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAchievement
  };
};

export default NotificationSystem;
