import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [personalities, setPersonalities] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Configuration API
  const API_BASE_URL = process.env.REACT_APP_CHATBOT_API_URL || 'http://localhost:8007/api/chatbot';
  const USER_ID = 1; // Récupérer depuis le contexte d'authentification

  // Effet pour scroller automatiquement vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger les personnalités au montage
  useEffect(() => {
    fetchPersonalities();
    initializeChat();
  }, []);

  const fetchPersonalities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/personalities?public_only=true&limit=10`);
      const data = await response.json();
      if (data.success) {
        setPersonalities(data.data);
        // Sélectionner la première personnalité par défaut
        if (data.data.length > 0) {
          setSelectedPersonality(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des personnalités:', error);
    }
  };

  const initializeChat = () => {
    setMessages([
      {
        id: 1,
        content: "👋 Bonjour ! Je suis votre assistant TalentLink. Comment puis-je vous aider aujourd'hui ?",
        sender: 'bot',
        timestamp: new Date(),
        personality: 'Assistant Général'
      }
    ]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const chatQuery = {
        user_id: USER_ID,
        message: inputMessage,
        conversation_id: currentConversationId,
        personality_id: selectedPersonality?.id || null,
        model_params: {
          temperature: 0.7,
          max_tokens: 1000
        }
      };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatQuery)
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: messages.length + 2,
          content: data.data.response.content,
          sender: 'bot',
          timestamp: new Date(),
          personality: selectedPersonality?.name || 'Assistant',
          model_used: data.data.response.model_used,
          tokens_used: data.data.response.tokens_used,
          response_time: data.data.response.response_time
        };

        setMessages(prev => [...prev, botMessage]);
        
        // Sauvegarder l'ID de conversation pour les messages suivants
        if (data.data.conversation.id && !currentConversationId) {
          setCurrentConversationId(data.data.conversation.id);
        }
      } else {
        throw new Error(data.message || 'Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = {
        id: messages.length + 2,
        content: "😕 Désolé, une erreur s'est produite. Veuillez réessayer.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setCurrentConversationId(null);
    initializeChat();
  };

  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : 'closed'}`}>
      {/* Bouton flottant pour ouvrir/fermer */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'opened' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat"}
      >
        <span className="toggle-icon">
          {isOpen ? '✕' : '💬'}
        </span>
      </button>

      {/* Interface du chatbot */}
      {isOpen && (
        <div className="chatbot-window">
          {/* En-tête */}
          <div className="chatbot-header">
            <div className="header-info">
              <span className="chatbot-title">🤖 TalentLink Assistant</span>
              {selectedPersonality && (
                <span className="current-personality">
                  {selectedPersonality.name}
                </span>
              )}
            </div>
            <div className="header-actions">
              <button 
                className="clear-chat-btn"
                onClick={clearChat}
                title="Nouvelle conversation"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Sélecteur de personnalité */}
          <div className="personality-selector">
            <select 
              value={selectedPersonality?.id || ''} 
              onChange={(e) => {
                const personality = personalities.find(p => p.id === parseInt(e.target.value));
                setSelectedPersonality(personality);
              }}
              className="personality-select"
            >
              {personalities.map(personality => (
                <option key={personality.id} value={personality.id}>
                  {personality.name}
                </option>
              ))}
            </select>
          </div>

          {/* Zone des messages */}
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <p>{message.content}</p>
                  {message.model_used && (
                    <div className="message-metadata">
                      <small>
                        {message.personality} • {message.model_used} • 
                        {message.tokens_used} tokens • {message.response_time}ms
                      </small>
                    </div>
                  )}
                </div>
                <span className="message-time">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            ))}
            
            {/* Indicateur de frappe */}
            {isTyping && (
              <div className="message bot typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="message-input"
                rows="1"
                disabled={isTyping}
              />
              <button 
                onClick={sendMessage}
                className="send-button"
                disabled={!inputMessage.trim() || isTyping}
              >
                <span className="send-icon">📤</span>
              </button>
            </div>
            <div className="input-help">
              <small>
                💡 Demandez-moi des infos sur les candidats, offres, statistiques...
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;