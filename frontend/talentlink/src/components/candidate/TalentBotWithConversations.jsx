import React, { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { API_RAG_URL } from "../../constants/api";

export default function TalentBotWithConversations({ user }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjour ! Je suis TalentBot, votre assistant IA. Je peux répondre à vos questions sur TalentLink, le recrutement, et vous aider dans vos démarches. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUserConversations = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_RAG_URL}/rag/conversations/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Erreur chargement conversations:", error);
    }
  }, [user?.id]);

  // Charger les conversations de l'utilisateur au démarrage
  useEffect(() => {
    loadUserConversations();
  }, [loadUserConversations]);

  const loadConversation = async (conversationId) => {
    try {
      const response = await fetch(`${API_RAG_URL}/rag/conversations/${user.id}/${conversationId}`);
      if (response.ok) {
        const conversation = await response.json();
        setMessages(conversation.messages || []);
        setCurrentConversationId(conversationId);
        setShowConversationList(false);
        toast.success("Conversation chargée");
      }
    } catch (error) {
      console.error("Erreur chargement conversation:", error);
      toast.error("Impossible de charger la conversation");
    }
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([
      {
        role: "assistant",
        content: "Bonjour ! Je suis TalentBot. Comment puis-je vous aider aujourd'hui ?",
        timestamp: new Date().toISOString()
      }
    ]);
    setShowConversationList(false);
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    
    if (!window.confirm("Supprimer cette conversation ?")) return;

    try {
      const response = await fetch(
        `${API_RAG_URL}/rag/conversations/${user.id}/${conversationId}`,
        { method: "DELETE" }
      );
      
      if (response.ok) {
        setConversations(prev => prev.filter(c => c.conversation_id !== conversationId));
        if (currentConversationId === conversationId) {
          startNewConversation();
        }
        toast.success("Conversation supprimée");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Impossible de supprimer la conversation");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const payload = {
        question: userMessage.content,
        model_type: "openai",
        model_name: "gpt-4o-mini",
        top_k: 5
      };

      // Ajouter conversation_id seulement s'il existe
      if (currentConversationId) {
        payload.conversation_id = currentConversationId;
      }

      // Ajouter user_id seulement s'il existe
      if (user?.id) {
        payload.user_id = String(user.id);
      }

      console.log("Sending payload:", payload); // Debug

      const response = await fetch(`${API_RAG_URL}/rag/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur serveur:", response.status, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Mettre à jour l'ID de conversation si c'est une nouvelle
      if (!currentConversationId) {
        setCurrentConversationId(data.conversation_id);
        await loadUserConversations(); // Recharger la liste
      }

      const assistantMessage = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'envoi du message");
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        isError: true,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div style={{
      height: 'calc(100vh - 200px)',
      display: 'flex',
      gap: '16px'
    }}>
      {/* Sidebar - Liste des conversations */}
      <div style={{
        width: showConversationList ? '300px' : '60px',
        background: 'var(--tl-surface)',
        borderRadius: '12px',
        border: '1px solid var(--tl-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}>
        {/* Header du sidebar */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--tl-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setShowConversationList(!showConversationList)}
            style={{
              background: showConversationList ? 'rgba(37, 99, 235, 0.1)' : 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px'
            }}
            title={showConversationList ? "Masquer conversations" : "Afficher conversations"}
          >
            {showConversationList ? '«' : '»'}
          </button>
          
          {showConversationList && (
            <button
              onClick={startNewConversation}
              style={{
                background: 'var(--tl-primary-600)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              + Nouveau
            </button>
          )}
        </div>

        {/* Liste des conversations */}
        {showConversationList && (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px'
          }}>
            {conversations.length === 0 ? (
              <p style={{
                textAlign: 'center',
                color: 'var(--tl-text-secondary)',
                fontSize: '14px',
                padding: '20px'
              }}>
                Aucune conversation
              </p>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.conversation_id}
                  onClick={() => loadConversation(conv.conversation_id)}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    background: conv.conversation_id === currentConversationId 
                      ? 'rgba(37, 99, 235, 0.1)' 
                      : 'transparent',
                    border: '1px solid',
                    borderColor: conv.conversation_id === currentConversationId
                      ? 'var(--tl-primary-600)'
                      : 'transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (conv.conversation_id !== currentConversationId) {
                      e.currentTarget.style.background = 'var(--tl-surface-muted)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (conv.conversation_id !== currentConversationId) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--tl-text)',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingRight: '24px'
                  }}>
                    {conv.title}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--tl-text-secondary)'
                  }}>
                    {conv.message_count} messages · {formatDate(conv.updated_at)}
                  </div>
                  
                  <button
                    onClick={(e) => deleteConversation(conv.conversation_id, e)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      opacity: 0.5,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Zone de chat principale */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--tl-surface)',
        borderRadius: '12px',
        border: '1px solid var(--tl-border)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--tl-border)',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(99, 102, 241, 0.05))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>🤖</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--tl-text)' }}>
                TalentBot - Assistant IA
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--tl-text-secondary)' }}>
                {currentConversationId ? "Conversation en cours" : "Nouvelle conversation"}
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{
                padding: '4px 12px',
                background: 'rgba(34, 197, 94, 0.1)',
                color: 'rgb(34, 197, 94)',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600
              }}>
                ● En ligne
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: message.role === 'user' 
                  ? 'var(--tl-primary-600)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '18px'
              }}>
                {message.role === 'user' ? '👤' : '🤖'}
              </div>

              <div style={{
                maxWidth: '70%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: message.role === 'user'
                    ? 'var(--tl-primary-600)'
                    : message.isError
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'var(--tl-surface-muted)',
                  color: message.role === 'user' ? 'white' : 'var(--tl-text)',
                  fontSize: '15px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {message.content}
                </div>

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--tl-text-secondary)',
                    marginTop: '4px'
                  }}>
                    📚 {message.sources.length} source(s) utilisée(s)
                  </div>
                )}

                <div style={{
                  fontSize: '11px',
                  color: 'var(--tl-text-muted)',
                  textAlign: message.role === 'user' ? 'right' : 'left'
                }}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                🤖
              </div>
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: 'var(--tl-surface-muted)',
                display: 'flex',
                gap: '4px'
              }}>
                <span className="typing-dot" style={{ animation: 'typing 1.4s infinite' }}>●</span>
                <span className="typing-dot" style={{ animation: 'typing 1.4s infinite 0.2s' }}>●</span>
                <span className="typing-dot" style={{ animation: 'typing 1.4s infinite 0.4s' }}>●</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} style={{
          padding: '16px',
          borderTop: '1px solid var(--tl-border)',
          background: 'var(--tl-background)'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid var(--tl-border)',
                borderRadius: '24px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s',
                background: 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--tl-primary-600)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--tl-border)'}
            />
            
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                padding: '12px 24px',
                background: isLoading || !input.trim() 
                  ? 'var(--tl-border)' 
                  : 'var(--tl-primary-600)',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? '⏳' : '📤'} Envoyer
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
