import React, { useState, useRef, useEffect } from 'react';
import useChatbot from './useChatbot';
import ConversationManager from './ConversationManager';
import './ChatBotEnhanced.css';

const ChatBotEnhanced = ({ userId = 1, initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const {
    messages,
    isTyping,
    isLoading,
    error,
    currentConversationId,
    selectedPersonality,
    personalities,
    sendMessage,
    loadConversation,
    clearChat,
    changePersonality,
    toggleMessageFavorite,
    retryLastMessage,
    setError
  } = useChatbot(userId);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const message = inputMessage;
    setInputMessage('');
    
    try {
      await sendMessage(message);
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConversationSelect = (conversation) => {
    if (conversation === null) {
      clearChat();
    } else {
      loadConversation(conversation.id);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  const dismissError = () => {
    setError(null);
  };

  const getPersonalityIcon = (personalityName) => {
    const icons = {
      'Assistant Général': '👔',
      'Expert Recrutement': '🎯',
      'Coach Candidat': '💪',
      'Analyste RH': '📊',
      'Support Technique': '🛠️'
    };
    return icons[personalityName] || '🤖';
  };

  return (
    <div className={`chatbot-enhanced-container ${isOpen ? 'open' : 'closed'}`}>
      {/* Gestionnaire de conversations */}
      {isOpen && (
        <ConversationManager
          onConversationSelect={handleConversationSelect}
          currentConversationId={currentConversationId}
          userId={userId}
        />
      )}

      {/* Bouton toggle principal */}
      <button 
        className={`chatbot-enhanced-toggle ${isOpen ? 'opened' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fermer le chatbot" : "Ouvrir le chatbot"}
      >
        <span className="toggle-icon">
          {isOpen ? '✕' : '💬'}
        </span>
        {!isOpen && (
          <span className="toggle-badge">
            Assistant IA
          </span>
        )}
      </button>

      {/* Fenêtre du chatbot */}
      {isOpen && (
        <div className="chatbot-enhanced-window">
          {/* En-tête avec statut */}
          <div className="chatbot-enhanced-header">
            <div className="header-main">
              <div className="chatbot-info">
                <span className="chatbot-title">
                  {getPersonalityIcon(selectedPersonality?.name)} TalentLink Assistant
                </span>
                {selectedPersonality && (
                  <span className="current-personality">
                    {selectedPersonality.name}
                  </span>
                )}
              </div>
              <div className="chatbot-status">
                <span className={`status-indicator ${error ? 'error' : 'online'}`}></span>
                <span className="status-text">
                  {error ? 'Erreur' : 'En ligne'}
                </span>
              </div>
            </div>
            
            <div className="header-actions">
              <button 
                className="action-btn"
                onClick={clearChat}
                title="Nouvelle conversation"
                disabled={isLoading}
              >
                ➕
              </button>
              <button 
                className="action-btn"
                onClick={() => setIsOpen(false)}
                title="Réduire"
              >
                ➖
              </button>
            </div>
          </div>

          {/* Alerte d'erreur */}
          {error && (
            <div className="error-banner">
              <span className="error-message">⚠️ {error}</span>
              <button className="error-dismiss" onClick={dismissError}>✕</button>
              <button className="error-retry" onClick={retryLastMessage}>
                🔄 Réessayer
              </button>
            </div>
          )}

          {/* Sélecteur de personnalité */}
          <div className="personality-selector-enhanced">
            <select 
              value={selectedPersonality?.id || ''} 
              onChange={(e) => {
                const personality = personalities.find(p => p.id === parseInt(e.target.value));
                changePersonality(personality);
              }}
              className="personality-select-enhanced"
              disabled={isLoading}
            >
              {personalities.map(personality => (
                <option key={personality.id} value={personality.id}>
                  {getPersonalityIcon(personality.name)} {personality.name}
                </option>
              ))}
            </select>
            {selectedPersonality?.description && (
              <div className="personality-description">
                {selectedPersonality.description}
              </div>
            )}
          </div>

          {/* Zone des messages */}
          <div className="messages-container-enhanced">
            {isLoading && messages.length === 1 && (
              <div className="loading-conversation">
                <div className="loading-spinner-enhanced"></div>
                <span>Chargement de la conversation...</span>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`message-enhanced ${message.sender} ${message.isError ? 'error' : ''}`}>
                <div className="message-wrapper">
                  <div className="message-content-enhanced">
                    <div className="message-text">
                      {message.content}
                    </div>
                    
                    {/* Métadonnées du message bot */}
                    {message.sender === 'bot' && message.model_used && (
                      <div className="message-metadata-enhanced">
                        <div className="metadata-row">
                          <span className="metadata-item">
                            🤖 {message.personality}
                          </span>
                          <span className="metadata-item">
                            ⚡ {message.model_used}
                          </span>
                        </div>
                        <div className="metadata-row">
                          <span className="metadata-item">
                            🔢 {message.tokens_used} tokens
                          </span>
                          <span className="metadata-item">
                            ⏱️ {message.response_time}ms
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions du message */}
                  <div className="message-actions">
                    <span className="message-time-enhanced">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.sender === 'bot' && message.id !== 'welcome' && (
                      <button
                        className={`favorite-btn ${message.is_favorite ? 'active' : ''}`}
                        onClick={() => toggleMessageFavorite(message.id)}
                        title={message.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        {message.is_favorite ? '⭐' : '☆'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Indicateur de frappe amélioré */}
            {isTyping && (
              <div className="message-enhanced bot typing">
                <div className="message-wrapper">
                  <div className="message-content-enhanced">
                    <div className="typing-indicator-enhanced">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="typing-text">
                        {selectedPersonality?.name || 'Assistant'} réfléchit...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie améliorée */}
          <div className="input-container-enhanced">
            <div className="input-wrapper-enhanced">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Parlez avec ${selectedPersonality?.name || 'votre assistant'}...`}
                className="message-input-enhanced"
                rows="1"
                disabled={isTyping || isLoading}
                maxLength={2000}
              />
              <div className="input-controls">
                <span className="char-counter">
                  {inputMessage.length}/2000
                </span>
                <button 
                  onClick={handleSendMessage}
                  className="send-button-enhanced"
                  disabled={!inputMessage.trim() || isTyping || isLoading}
                  title="Envoyer le message"
                >
                  {isTyping ? '⏳' : '📤'}
                </button>
              </div>
            </div>
            
            <div className="input-suggestions">
              <div className="suggestions-title">💡 Suggestions :</div>
              <div className="suggestion-chips">
                <button 
                  className="suggestion-chip"
                  onClick={() => setInputMessage("Quelles sont les offres d'emploi disponibles ?")}
                  disabled={isTyping}
                >
                  💼 Offres d'emploi
                </button>
                <button 
                  className="suggestion-chip"
                  onClick={() => setInputMessage("Montre-moi les statistiques de candidatures")}
                  disabled={isTyping}
                >
                  📊 Statistiques
                </button>
                <button 
                  className="suggestion-chip"
                  onClick={() => setInputMessage("Aide-moi à améliorer mon profil")}
                  disabled={isTyping}
                >
                  ⭐ Conseils
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotEnhanced;