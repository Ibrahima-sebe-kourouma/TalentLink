import React, { useState, useEffect, useRef } from "react";
import { API_MESSAGING_URL, API_AUTH_URL, API_REPORT_URL } from "../../constants/api";
import { apiGet } from "../../utils/apiHandler";
import "../../styles/messaging.css";

export default function Messaging({ user }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userCache, setUserCache] = useState({});
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const messagesEndRef = useRef(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState(""); // "message" ou "profile"
  const [reportTargetId, setReportTargetId] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportStatus, setReportStatus] = useState({ ok: null, msg: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!user?.id) return;
      try {
        const data = await apiGet(`${API_MESSAGING_URL}/conversations/?user_id=${user.id}`);
        setConversations(Array.isArray(data) ? data : []);
        setServiceUnavailable(false);
      } catch (e) {
        console.error("Service de messagerie non accessible:", e);
        setServiceUnavailable(true);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
    // Polling toutes les 5 secondes pour refresh (seulement si le service est disponible)
    const interval = setInterval(() => {
      if (!serviceUnavailable) {
        loadConversations();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user?.id, serviceUnavailable]);

  // Load messages when conversation is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConv || !user?.id) return;
      try {
        const res = await fetch(
          `${API_MESSAGING_URL}/messages/conversation/${selectedConv.id}?user_id=${user.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(Array.isArray(data) ? data : []);
          
          // Mark messages as read
          await fetch(
            `${API_MESSAGING_URL}/messages/conversation/${selectedConv.id}/mark-read?user_id=${user.id}`,
            { method: "PATCH" }
          );
        }
      } catch (e) {
        console.error("Erreur chargement messages:", e);
      }
    };
    loadMessages();
    // Polling toutes les 3 secondes pour nouveaux messages
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedConv, user?.id]);

  // Fetch user info for display
  const getUserInfo = async (userId) => {
    if (userCache[userId]) return userCache[userId];
    try {
      const res = await fetch(`${API_AUTH_URL}/auth/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const info = {
          name: `${data.prenom || ""} ${data.name || ""}`.trim() || data.email || "Utilisateur",
          email: data.email
        };
        setUserCache(prev => ({ ...prev, [userId]: info }));
        return info;
      }
    } catch {}
    return { name: "Utilisateur", email: "" };
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || sending) return;

    setSending(true);
    try {
      const res = await fetch(`${API_MESSAGING_URL}/messages/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: selectedConv.id,
          sender_user_id: user.id,
          content: newMessage.trim()
        })
      });

      if (res.ok) {
        const sent = await res.json();
        setMessages(prev => [...prev, sent]);
        setNewMessage("");
        scrollToBottom();
      } else {
        alert("Erreur lors de l'envoi du message");
      }
    } catch (e) {
      console.error("Erreur envoi message:", e);
      alert("Erreur de connexion");
    } finally {
      setSending(false);
    }
  };

  // Get other participant ID
  const getOtherUserId = (conv) => {
    return conv.candidate_user_id === user.id ? conv.recruiter_user_id : conv.candidate_user_id;
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert("Veuillez sélectionner une raison");
      return;
    }
    setReportStatus({ ok: null, msg: "" });
    try {
      const res = await fetch(`${API_REPORT_URL}/reports/?user_id=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reported_type: reportType,
          reported_id: String(reportTargetId),
          reason: reportReason,
          description: reportDescription.trim() || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReportStatus({ ok: true, msg: "Signalement envoyé avec succès" });
        setTimeout(() => {
          setShowReportModal(false);
          setReportReason("");
          setReportDescription("");
          setReportStatus({ ok: null, msg: "" });
        }, 2000);
      } else {
        const errorMessage = typeof data.detail === 'string' 
          ? data.detail 
          : Array.isArray(data.detail) 
            ? data.detail.map(e => e.msg || JSON.stringify(e)).join(', ')
            : JSON.stringify(data.detail || data);
        setReportStatus({ ok: false, msg: errorMessage });
      }
    } catch (e) {
      setReportStatus({ ok: false, msg: "Erreur de connexion" });
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;
    
    try {
      const res = await fetch(
        `${API_MESSAGING_URL}/conversations/${conversationToDelete.id}?user_id=${user.id}`,
        { method: "DELETE" }
      );
      
      if (res.ok) {
        // Retirer la conversation de la liste
        setConversations(prev => prev.filter(c => c.id !== conversationToDelete.id));
        
        // Si c'était la conversation sélectionnée, la désélectionner
        if (selectedConv?.id === conversationToDelete.id) {
          setSelectedConv(null);
          setMessages([]);
        }
        
        setShowDeleteModal(false);
        setConversationToDelete(null);
      } else {
        alert("Erreur lors de la suppression de la conversation");
      }
    } catch (e) {
      console.error("Erreur suppression conversation:", e);
      alert("Erreur de connexion");
    }
  };

  if (loading) {
    return <div className="messaging-container"><p>Chargement de la messagerie...</p></div>;
  }

  if (serviceUnavailable) {
    return (
      <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Messagerie</h3>
        <div style={{ padding: 12, borderRadius: 8, background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', maxWidth: 800 }}>
          Le service de messagerie n'est pas encore prêt. Cette interface sera disponible prochainement.
        </div>
        <p style={{ color: '#6b7280', marginTop: 10 }}>
          En attendant, vous pouvez continuer à consulter les offres et suivre vos candidatures.
        </p>
      </section>
    );
  }

  return (
    <div className="messaging-container">
      <div className="messaging-layout">
        {/* Sidebar: conversation list */}
        <aside className="conversations-sidebar">
          <h3>Conversations</h3>
          {conversations.length === 0 && (
            <div className="empty-state">Aucune conversation</div>
          )}
          <div className="conversations-list">
            {conversations.map((conv) => {
              const otherUserId = getOtherUserId(conv);
              const isActive = selectedConv?.id === conv.id;
              return (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  otherUserId={otherUserId}
                  isActive={isActive}
                  onClick={() => setSelectedConv(conv)}
                  getUserInfo={getUserInfo}
                />
              );
            })}
          </div>
        </aside>

        {/* Main: messages */}
        <main className="messages-main">
          {!selectedConv ? (
            <div className="empty-state-main">
              <p>Sélectionnez une conversation pour commencer</p>
            </div>
          ) : (
            <>
              <div className="messages-header">
                <ConversationHeader
                  conversation={selectedConv}
                  otherUserId={getOtherUserId(selectedConv)}
                  getUserInfo={getUserInfo}
                  onReport={(userId) => {
                    setReportType("profile");
                    setReportTargetId(userId);
                    setShowReportModal(true);
                  }}
                  onDelete={() => {
                    setConversationToDelete(selectedConv);
                    setShowDeleteModal(true);
                  }}
                />
              </div>
              <div className="messages-body">
                {messages.length === 0 && (
                  <div className="empty-state">Aucun message pour le moment</div>
                )}
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMine={msg.sender_user_id === user.id}
                    onReport={(msgId) => {
                      setReportType("message");
                      setReportTargetId(msgId);
                      setShowReportModal(true);
                    }}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className="messages-footer" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !newMessage.trim()}>
                  {sending ? "..." : "Envoyer"}
                </button>
              </form>
            </>
          )}
        </main>
      </div>

      {/* Modal de signalement */}
      {showReportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>🚩 Signaler {reportType === "message" ? "ce message" : "ce profil"}</h3>
              <button onClick={() => { setShowReportModal(false); setReportStatus({ ok: null, msg: "" }); }} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Raison du signalement *</label>
              <select 
                value={reportReason} 
                onChange={(e) => setReportReason(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                <option value="">-- Sélectionnez une raison --</option>
                {reportType === "message" ? (
                  <>
                    <option value="Harcèlement">Harcèlement</option>
                    <option value="Spam">Spam</option>
                    <option value="Contenu inapproprié">Contenu inapproprié</option>
                    <option value="Arnaque">Arnaque</option>
                    <option value="Autre">Autre</option>
                  </>
                ) : (
                  <>
                    <option value="Faux profil">Faux profil</option>
                    <option value="Comportement suspect">Comportement suspect</option>
                    <option value="Usurpation d'identité">Usurpation d'identité</option>
                    <option value="Autre">Autre</option>
                  </>
                )}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description (optionnel)</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Donnez plus de détails sur votre signalement..."
                rows={4}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>
            {reportStatus.msg && (
              <div style={{ padding: '12px', borderRadius: '6px', marginBottom: '16px', background: reportStatus.ok ? '#d1fae5' : '#fee2e2', color: reportStatus.ok ? '#065f46' : '#7f1d1d' }}>
                {reportStatus.msg}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setShowReportModal(false); setReportStatus({ ok: null, msg: "" }); }}
                style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button 
                onClick={handleReport}
                disabled={!reportReason.trim()}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#ef4444', color: 'white', cursor: reportReason.trim() ? 'pointer' : 'not-allowed', opacity: reportReason.trim() ? 1 : 0.5 }}
              >
                Envoyer le signalement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>🗑️ Supprimer la conversation</h3>
              <button onClick={() => { setShowDeleteModal(false); setConversationToDelete(null); }} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ marginBottom: '20px', color: '#6b7280' }}>
              Êtes-vous sûr de vouloir supprimer cette conversation ? Tous les messages seront définitivement effacés et cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setShowDeleteModal(false); setConversationToDelete(null); }}
                style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button 
                onClick={handleDeleteConversation}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#ef4444', color: 'white', cursor: 'pointer' }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Conversation item component
function ConversationItem({ conversation, otherUserId, isActive, onClick, getUserInfo }) {
  const [userInfo, setUserInfo] = useState({ name: "..." });

  useEffect(() => {
    getUserInfo(otherUserId).then(setUserInfo);
  }, [otherUserId, getUserInfo]);

  const lastDate = new Date(conversation.last_message_at).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className={`conversation-item ${isActive ? "active" : ""}`} onClick={onClick}>
      <div className="conv-avatar">{userInfo.name.charAt(0).toUpperCase()}</div>
      <div className="conv-info">
        <div className="conv-name">{userInfo.name}</div>
        <div className="conv-date">{lastDate}</div>
      </div>
      {conversation.unread_count > 0 && (
        <div className="conv-badge">{conversation.unread_count}</div>
      )}
    </div>
  );
}

// Conversation header
function ConversationHeader({ conversation, otherUserId, getUserInfo, onReport, onDelete }) {
  const [userInfo, setUserInfo] = useState({ name: "..." });

  useEffect(() => {
    getUserInfo(otherUserId).then(setUserInfo);
  }, [otherUserId, getUserInfo]);

  return (
    <div className="conversation-header">
      <div className="header-avatar">{userInfo.name.charAt(0).toUpperCase()}</div>
      <div style={{ flex: 1 }}>
        <div className="header-name">{userInfo.name}</div>
        <div className="header-email">{userInfo.email}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => onReport(otherUserId)}
          style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
          title="Signaler ce profil"
        >
          🚩 Signaler
        </button>
        <button 
          onClick={onDelete}
          style={{ padding: '6px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
          title="Supprimer cette conversation"
        >
          🗑️ Supprimer
        </button>
      </div>
    </div>
  );
}

// Message bubble
function MessageBubble({ message, isMine, onReport }) {
  const time = new Date(message.created_at).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className={`message-bubble ${isMine ? "mine" : "theirs"}`}>
      <div className="message-content">{message.content}</div>
      <div className="message-time">
        {time}
        {!isMine && (
          <button 
            onClick={() => onReport(message.id)}
            style={{ marginLeft: '8px', padding: '2px 6px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
            title="Signaler ce message"
          >
            🚩
          </button>
        )}
      </div>
    </div>
  );
}
