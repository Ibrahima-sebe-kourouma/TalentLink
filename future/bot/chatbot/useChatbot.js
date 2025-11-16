import { useState, useEffect, useCallback, useMemo } from 'react';

export const useChatbot = (userId = 1) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [personalities, setPersonalities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_CHATBOT_API_URL || 'http://localhost:8007/api/chatbot';

  // Message de bienvenue
  const welcomeMessage = useMemo(() => ({
    id: 'welcome',
    content: "👋 Bonjour ! Je suis votre assistant TalentLink. Comment puis-je vous aider aujourd'hui ?",
    sender: 'bot',
    timestamp: new Date(),
    personality: 'Assistant Général'
  }), []);

  // Initialiser le chat
  const initializeChat = useCallback(() => {
    setMessages([welcomeMessage]);
    setCurrentConversationId(null);
    setError(null);
  }, [welcomeMessage]);

  // Charger les personnalités
  const fetchPersonalities = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/personalities?public_only=true&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setPersonalities(data.data);
        if (data.data.length > 0 && !selectedPersonality) {
          setSelectedPersonality(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des personnalités:', error);
      setError('Impossible de charger les personnalités');
    }
  }, [API_BASE_URL, selectedPersonality]);

  // Charger une conversation existante
  const loadConversation = useCallback(async (conversationId) => {
    if (!conversationId) {
      initializeChat();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}?user_id=${userId}&limit=50`
      );
      const data = await response.json();

      if (data.success) {
        const conversationMessages = data.data.messages;

        setCurrentConversationId(conversationId);
        
        // Convertir les messages pour l'affichage
        const formattedMessages = conversationMessages.map((msg, index) => ({
          id: msg.id || index,
          content: msg.content,
          sender: msg.role === 'user' ? 'user' : 'bot',
          timestamp: new Date(msg.created_at),
          personality: msg.personality_used || selectedPersonality?.name || 'Assistant',
          model_used: msg.model_used,
          tokens_used: msg.tokens_used,
          response_time: msg.response_time,
          is_favorite: msg.is_favorite
        }));

        setMessages(formattedMessages);
        setError(null);
      } else {
        throw new Error(data.message || 'Erreur lors du chargement de la conversation');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la conversation:', error);
      setError('Impossible de charger la conversation');
      initializeChat();
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, userId, selectedPersonality, initializeChat]);

  // Envoyer un message
  const sendMessage = useCallback(async (messageContent, options = {}) => {
    if (!messageContent.trim()) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      const chatQuery = {
        user_id: userId,
        message: messageContent,
        conversation_id: currentConversationId,
        personality_id: selectedPersonality?.id || null,
        llm_params: {
          temperature: 0.7,
          max_tokens: 1000,
          ...options.modelParams
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
          id: `bot_${Date.now()}`,
          content: data.data.response,
          sender: 'bot',
          timestamp: new Date(),
          personality: selectedPersonality?.name || 'Assistant',
          model_used: data.data.llm_model,
          tokens_used: data.data.tokens_used,
          response_time: data.data.response_time
        };

        setMessages(prev => [...prev, botMessage]);

        // Mettre à jour l'ID de conversation si nouvelle conversation
        if (data.data.conversation_id && !currentConversationId) {
          setCurrentConversationId(data.data.conversation_id);
        }

        return data.data;
      } else {
        throw new Error(data.message || 'Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setError(error.message);
      
      const errorMessage = {
        id: `error_${Date.now()}`,
        content: "😕 Désolé, une erreur s'est produite. Veuillez réessayer.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      throw error;
    } finally {
      setIsTyping(false);
    }
  }, [API_BASE_URL, userId, currentConversationId, selectedPersonality]);

  // Marquer/démarquer un message comme favori
  const toggleMessageFavorite = useCallback(async (messageId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/messages/${messageId}/favorite?user_id=${userId}`,
        { method: 'PATCH' }
      );

      if (response.ok) {
        const data = await response.json();
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, is_favorite: data.is_favorite }
            : msg
        ));

        return data.is_favorite;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du favori:', error);
    }
  }, [API_BASE_URL, userId]);

  // Changer de personnalité
  const changePersonality = useCallback((personality) => {
    setSelectedPersonality(personality);
  }, []);

  // Nettoyer le chat
  const clearChat = useCallback(() => {
    initializeChat();
  }, [initializeChat]);

  // Retenter l'envoi du dernier message en cas d'erreur
  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.sender === 'user');
    if (lastUserMessage) {
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  // Initialisation
  useEffect(() => {
    fetchPersonalities();
    initializeChat();
  }, [fetchPersonalities, initializeChat]);

  return {
    // État
    messages,
    isTyping,
    isLoading,
    error,
    currentConversationId,
    selectedPersonality,
    personalities,

    // Actions
    sendMessage,
    loadConversation,
    clearChat,
    changePersonality,
    toggleMessageFavorite,
    retryLastMessage,
    initializeChat,

    // Utilitaires
    setCurrentConversationId,
    setError
  };
};

export default useChatbot;