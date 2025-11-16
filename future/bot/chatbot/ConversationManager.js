import React, { useState, useEffect, useCallback } from 'react';
import './ConversationManager.css';

const ConversationManager = ({ onConversationSelect, currentConversationId, userId = 1 }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_CHATBOT_API_URL || 'http://localhost:8007/api/chatbot';

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/user/${userId}?limit=20&active_only=true`);
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, userId]);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, fetchConversations]);

  const createNewConversation = () => {
    onConversationSelect(null); // Null signifie nouvelle conversation
    setIsOpen(false);
  };

  const selectConversation = (conversation) => {
    onConversationSelect(conversation);
    setIsOpen(false);
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation(); // Empêcher la sélection de la conversation
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}?user_id=${userId}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        // Si la conversation supprimée était sélectionnée, démarrer une nouvelle conversation
        if (currentConversationId === conversationId) {
          onConversationSelect(null);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Aujourd'hui";
    } else if (diffDays === 2) {
      return "Hier";
    } else if (diffDays <= 7) {
      return `Il y a ${diffDays - 1} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit' 
      });
    }
  };

  const truncateTitle = (title, maxLength = 25) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <div className="conversation-manager">
      {/* Bouton pour ouvrir le gestionnaire */}
      <button 
        className="conversations-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Gérer les conversations"
      >
        <span className="toggle-icon">📚</span>
        <span className="conversations-count">
          {conversations.length}
        </span>
      </button>

      {/* Panel des conversations */}
      {isOpen && (
        <div className="conversations-panel">
          <div className="panel-header">
            <h3>Conversations</h3>
            <button 
              className="close-panel"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="conversations-actions">
            <button 
              className="new-conversation-btn"
              onClick={createNewConversation}
            >
              <span>➕</span>
              Nouvelle conversation
            </button>
          </div>

          <div className="conversations-list">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Chargement...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <p>Aucune conversation</p>
                <small>Démarrez une nouvelle conversation pour commencer</small>
              </div>
            ) : (
              conversations.map(conversation => (
                <div 
                  key={conversation.id}
                  className={`conversation-item ${
                    currentConversationId === conversation.id ? 'active' : ''
                  }`}
                  onClick={() => selectConversation(conversation)}
                >
                  <div className="conversation-info">
                    <div className="conversation-title">
                      {truncateTitle(conversation.title || 'Conversation sans titre')}
                    </div>
                    <div className="conversation-meta">
                      <span className="message-count">
                        {conversation.message_count || 0} messages
                      </span>
                      <span className="conversation-date">
                        {formatDate(conversation.last_message_at || conversation.created_at)}
                      </span>
                    </div>
                    {conversation.context && (
                      <div className="conversation-context">
                        {truncateTitle(conversation.context, 30)}
                      </div>
                    )}
                  </div>
                  <button 
                    className="delete-conversation"
                    onClick={(e) => deleteConversation(conversation.id, e)}
                    title="Supprimer la conversation"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationManager;