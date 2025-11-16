import React, { useState, useEffect, useRef } from "react";
import { API_MESSAGING_URL, API_AUTH_URL } from "../../constants/api";
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
        const res = await fetch(`${API_MESSAGING_URL}/conversations/?user_id=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setConversations(Array.isArray(data) ? data : []);
          setServiceUnavailable(false);
        } else {
          setServiceUnavailable(true);
        }
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
function ConversationHeader({ conversation, otherUserId, getUserInfo }) {
  const [userInfo, setUserInfo] = useState({ name: "..." });

  useEffect(() => {
    getUserInfo(otherUserId).then(setUserInfo);
  }, [otherUserId, getUserInfo]);

  return (
    <div className="conversation-header">
      <div className="header-avatar">{userInfo.name.charAt(0).toUpperCase()}</div>
      <div>
        <div className="header-name">{userInfo.name}</div>
        <div className="header-email">{userInfo.email}</div>
      </div>
    </div>
  );
}

// Message bubble
function MessageBubble({ message, isMine }) {
  const time = new Date(message.created_at).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className={`message-bubble ${isMine ? "mine" : "theirs"}`}>
      <div className="message-content">{message.content}</div>
      <div className="message-time">{time}</div>
    </div>
  );
}
