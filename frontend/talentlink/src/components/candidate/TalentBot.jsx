import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { API_RAG_URL } from "../../constants/api";

export default function TalentBotCandidate({ user }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjour ! Je suis TalentBot, votre assistant intelligent. Je peux vous aider à trouver des informations sur les offres d'emploi, les candidats, les rendez-vous et bien plus. Posez-moi vos questions !",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger les informations sur les modèles disponibles
  useEffect(() => {
    fetch(`${API_RAG_URL}/rag/`)
      .then(res => res.json())
      .then(data => setModelInfo(data))
      .catch(err => console.error("Erreur lors du chargement des infos:", err));
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_RAG_URL}/rag/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: userMessage.content,
          model_type: "openai",
          model_name: "gpt-4o-mini",
          top_k: 5
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const assistantMessage = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        model: data.model_used,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast.error(`Erreur: ${error.message}`);
      
      const errorMessage = {
        role: "assistant",
        content: "Désolé, une erreur s'est produite. Assurez-vous que le serveur RAG est démarré sur le port 8008.",
        isError: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      height: 'calc(100vh - 200px)',
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
              {modelInfo ? `Propulsé par ${modelInfo.default_model}` : 'Chargement...'}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
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
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeIn 0.3s ease-in'
            }}
          >
            <div style={{
              maxWidth: '70%',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {/* Message bubble */}
              <div style={{
                padding: '12px 16px',
                borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: message.role === 'user' 
                  ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                  : message.isError 
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'var(--tl-background)',
                color: message.role === 'user' ? 'white' : 'var(--tl-text)',
                border: message.role === 'assistant' ? '1px solid var(--tl-border)' : 'none',
                boxShadow: message.role === 'user' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {message.content}
              </div>

              {/* Sources (si présentes) */}
              {message.sources && message.sources.length > 0 && (
                <div style={{
                  fontSize: '12px',
                  color: 'var(--tl-text-secondary)',
                  padding: '8px 12px',
                  background: 'rgba(99, 102, 241, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(99, 102, 241, 0.1)'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    📚 Sources ({message.sources.length}) :
                  </div>
                  {message.sources.slice(0, 3).map((source, idx) => (
                    <div key={idx} style={{ marginTop: '4px', paddingLeft: '8px' }}>
                      • {source.document_name}
                    </div>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div style={{
                fontSize: '11px',
                color: 'var(--tl-text-muted)',
                textAlign: message.role === 'user' ? 'right' : 'left',
                paddingLeft: message.role === 'user' ? 0 : '16px',
                paddingRight: message.role === 'assistant' ? 0 : '16px'
              }}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--tl-text-secondary)',
            fontSize: '14px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--tl-background)',
              border: '1px solid var(--tl-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🤖
            </div>
            <div style={{
              padding: '12px 16px',
              background: 'var(--tl-background)',
              border: '1px solid var(--tl-border)',
              borderRadius: '16px 16px 16px 4px',
              display: 'flex',
              gap: '4px'
            }}>
              <span className="typing-dot" style={{ animationDelay: '0s' }}>●</span>
              <span className="typing-dot" style={{ animationDelay: '0.2s' }}>●</span>
              <span className="typing-dot" style={{ animationDelay: '0.4s' }}>●</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{
        padding: '20px',
        borderTop: '1px solid var(--tl-border)',
        background: 'var(--tl-background)'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
            placeholder="Posez votre question... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--tl-border)',
              background: 'var(--tl-surface)',
              color: 'var(--tl-text)',
              fontSize: '14px',
              resize: 'none',
              minHeight: '48px',
              maxHeight: '120px',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--tl-primary-500)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--tl-border)'}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: input.trim() && !isLoading 
                ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                : 'var(--tl-border)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '48px'
            }}
          >
            {isLoading ? '⏳' : '📤'} Envoyer
          </button>
        </div>
        <div style={{
          marginTop: '8px',
          fontSize: '11px',
          color: 'var(--tl-text-muted)',
          textAlign: 'center'
        }}>
          TalentBot peut faire des erreurs. Vérifiez les informations importantes.
        </div>
      </form>

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typing {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        .typing-dot {
          display: inline-block;
          animation: typing 1.4s infinite;
        }

        textarea::-webkit-scrollbar {
          width: 6px;
        }

        textarea::-webkit-scrollbar-track {
          background: transparent;
        }

        textarea::-webkit-scrollbar-thumb {
          background: var(--tl-border);
          border-radius: 3px;
        }

        textarea::-webkit-scrollbar-thumb:hover {
          background: var(--tl-text-muted);
        }
      `}</style>
    </div>
  );
}