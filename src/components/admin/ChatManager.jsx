import { useState, useEffect, useRef } from 'react';
import { getChats, saveMessage } from '../../db';
import { MessageSquare, Send, RefreshCw, User, Calendar } from 'lucide-react';

export default function ChatManager() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  
  const chatEndRef = useRef(null);

  const reloadChats = () => {
    const activeChats = getChats();
    setChats(activeChats);
  };

  useEffect(() => {
    reloadChats();

    // Cross-tab real-time sync for customer messages!
    const handleStorageChange = () => {
      reloadChats();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Scroll to bottom of chat panel when messages update
  const activeChat = chats.find(c => c.chatId === activeChatId);
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    saveMessage(activeChatId, 'admin', inputText.trim());
    setInputText('');
    reloadChats();
  };

  // Find customer name from first customer message or generic fallback
  const getCustomerName = (chat) => {
    const welcomeIndex = chat.messages.findIndex(m => m.id === 'msg_welcome');
    // If it's the admin welcome, it might mention their name. Let's look for customer messages
    const custMsg = chat.messages.find(m => m.sender === 'customer');
    if (chat.chatId === 'admin_demo_chat') return 'Demo Customer';
    
    // Check if the chat welcome message contains "Hello [Name]!"
    const firstAdmin = chat.messages.find(m => m.sender === 'admin' && m.content.startsWith('Hello'));
    if (firstAdmin) {
      const match = firstAdmin.content.match(/Hello\s+([^!]+)!/);
      if (match && match[1]) return match[1].trim();
    }
    
    return 'Customer ' + chat.chatId.replace('chat_', '').substr(0, 4).toUpperCase();
  };

  return (
    <div className="admin-chat-workspace animate-fade-in">
      
      {/* Threads Sidebar */}
      <div className="admin-chat-threads">
        <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MessageSquare size={16} /> Chats
          </h3>
          <button 
            onClick={reloadChats}
            style={{ background: 'none', border: 'none', color: 'var(--color-gold-dark)', cursor: 'pointer' }}
            title="Refresh threads"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {chats.length > 0 ? (
          chats.map(chat => {
            const name = getCustomerName(chat);
            const isActive = chat.chatId === activeChatId;
            return (
              <div 
                key={chat.chatId}
                className={`admin-chat-thread-card ${isActive ? 'active' : ''}`}
                onClick={() => setActiveChatId(chat.chatId)}
              >
                <div className="admin-chat-thread-meta">
                  <span className="admin-chat-thread-name">{name}</span>
                  <span className="admin-chat-thread-time">
                    {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="admin-chat-thread-last">
                  {chat.lastMessage.sender === 'admin' ? 'You: ' : ''}{chat.lastMessage.content}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            No customer inquiries found.
          </div>
        )}
      </div>

      {/* Message Pane */}
      <div className="admin-chat-panel">
        {activeChat ? (
          <>
            <div className="admin-chat-panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-gold-accent)', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--color-brown-primary)' }}>
                  <User size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{getCustomerName(activeChat)}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>ID: {activeChat.chatId.toUpperCase()}</div>
                </div>
              </div>
            </div>

            <div className="admin-chat-panel-body">
              {activeChat.messages.map(msg => (
                <div 
                  key={msg.id}
                  style={{ 
                    display: 'flex', 
                    width: '100%',
                    justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div 
                    className="chat-bubble"
                    style={{
                      background: msg.sender === 'admin' ? 'var(--gradient-gold-metallic)' : 'white',
                      color: msg.sender === 'admin' ? '#000000' : 'var(--color-text-primary)',
                      border: msg.sender === 'admin' ? '1px solid var(--color-gold-light)' : '1px solid var(--color-border-light)',
                      borderBottomRightRadius: msg.sender === 'admin' ? '1px' : 'var(--border-radius-md)',
                      borderBottomLeftRadius: msg.sender === 'admin' ? 'var(--border-radius-md)' : '1px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                    }}
                  >
                    {msg.content}
                    <span 
                      className="chat-msg-time"
                      style={{ color: msg.sender === 'admin' ? 'rgba(0,0,0,0.6)' : 'var(--color-text-muted)' }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-area" style={{ padding: '1rem 1.5rem' }}>
              <input 
                type="text" 
                placeholder="Type your official admin reply..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="chat-input"
              />
              <button type="submit" className="chat-send-btn">
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', background: 'var(--color-bg-secondary)', padding: '2rem' }}>
            <MessageSquare size={48} style={{ strokeWidth: 1.2, marginBottom: '1rem', color: 'var(--color-gold-primary)' }} />
            <h3>Select a Conversation</h3>
            <p style={{ fontSize: '0.85rem' }}>Click on a customer thread in the sidebar to review logs and send replies.</p>
          </div>
        )}
      </div>

    </div>
  );
}
