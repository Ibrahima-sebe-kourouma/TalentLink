import React, { useState, useEffect } from "react";
import "../../styles/notifications.css";
import { API_OFFERS_URL } from "../../constants/api";

export default function NotificationCenter({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Polling pour les notifications en temps réel
  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_OFFERS_URL}/notifications?recruiter_user_id=${user.id}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Erreur chargement notifications:", e);
    }
  }, [user.id]);

  const fetchUnreadCount = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_OFFERS_URL}/notifications/unread-count?recruiter_user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count);
      }
    } catch (e) {
      console.error("Erreur comptage non lues:", e);
    }
  }, [user.id]);

  // Marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(
        `${API_OFFERS_URL}/notifications/${notificationId}/read?recruiter_user_id=${user.id}`,
        { method: "PATCH" }
      );
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error("Erreur marquage lu:", e);
    }
  };

  // Marquer toutes comme lues
  const markAllAsRead = async () => {
    try {
      const res = await fetch(
        `${API_OFFERS_URL}/notifications/mark-all-read?recruiter_user_id=${user.id}`,
        { method: "PATCH" }
      );
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error("Erreur marquage toutes lues:", e);
    }
  };

  // Polling toutes les 10 secondes
  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount, fetchNotifications, isOpen]);

  // Charger les notifications quand on ouvre le panneau
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    }
  }, [isOpen, fetchNotifications]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_application': return '📄';
      case 'offer_full': return '✅';
      case 'application_withdrawn': return '↩️';
      default: return '🔔';
    }
  };

  return (
    <div className="notification-center">
      <button 
        className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="btn-mark-all">
                  Tout marquer comme lu
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="btn-close">✕</button>
            </div>
          </div>

          <div className="notification-list">
            {loading && (
              <div className="notification-loading">Chargement...</div>
            )}
            
            {!loading && notifications.length === 0 && (
              <div className="notification-empty">
                <span className="notification-empty-icon">🔔</span>
                <p>Aucune notification pour le moment</p>
              </div>
            )}

            {!loading && notifications.map(notification => (
              <div 
                key={notification.id}
                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{formatTime(notification.created_at)}</div>
                </div>
                {!notification.is_read && <div className="notification-dot"></div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}