import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Shield, Sparkles } from 'lucide-react';
import { getMessages, saveMessage } from '../../db';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState(() => {
    return sessionStorage.getItem('dainty_chat_name') || '';
  });
  const [nameInput, setNameInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chatId, setChatId] = useState(() => {
    let id = sessionStorage.getItem('dainty_chat_id');
    if (!id) {
      id = 'chat_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('dainty_chat_id', id);
    }
    return id;
  });

  const chatEndRef = useRef(null);

  // Reload messages from DB
  const reloadMessages = () => {
    const allMsgs = getMessages();
    // Filter messages for this specific customer chat
    const filtered = allMsgs.filter(m => m.chatId === chatId);
    setMessages(filtered);
  };

  // Load messages on mount and listen for storage changes (for cross-tab admin chat!)
  useEffect(() => {
    reloadMessages();

    const handleStorageChange = () => {
      reloadMessages();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [chatId]);

  // Scroll to bottom when messages change or panel opens
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleStartChat = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      const name = nameInput.trim();
      setCustomerName(name);
      sessionStorage.setItem('dainty_chat_name', name);
      
      // Save initial customer greeting or system message
      saveMessage(chatId, 'admin', `Hello ${name}! Welcome to DAINTY STUDS AND CHAINS. Tell us what you are looking for!`);
      reloadMessages();
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const content = inputText.trim();
    saveMessage(chatId, 'customer', content);
    setInputText('');
    reloadMessages();

    // Auto-reply simulation for demo purposes if no admin is active
    setTimeout(() => {
      const msgs = getMessages().filter(m => m.chatId === chatId);
      const lastMsg = msgs[msgs.length - 1];
      
      // Only reply if the last message is still the customer's (i.e. admin hasn't replied yet)
      if (lastMsg && lastMsg.sender === 'customer') {
        let reply = "Thank you for messaging DAINTY! Our administrators have been notified. You can also contact us instantly via WhatsApp at +256 700 000000 or complete your order via Checkout.";
        if (content.toLowerCase().includes('price') || content.toLowerCase().includes('how much')) {
          reply = "Most of our rings are between UGX 85,000 and UGX 180,000. You can check prices directly under each product or click 'Buy Now' to see delivery pricing!";
        } else if (content.toLowerCase().includes('gold') || content.toLowerCase().includes('material')) {
          reply = "Our jewelry is crafted using premium 18K Gold Plated Stainless Steel and Sterling Silver, ensuring water resistance and tarnish-free durability.";
        }
        
        saveMessage(chatId, 'admin', reply);
        reloadMessages();
      }
    }, 3000);
  };

  return (
    <div className="chat-widget">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="chat-window glass-panel animate-fade-in">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-title">
              <Sparkles size={16} style={{ color: 'var(--color-gold-light)' }} />
              <div className="chat-title-info">
                <h4>DAINTY Assistant</h4>
                <span>Online | Responds instantly</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="chat-body">
            {!customerName ? (
              /* Onboarding view to get name */
              <div className="chat-onboard">
                <MessageCircle size={36} style={{ color: 'var(--color-gold-primary)', marginBottom: '0.8rem' }} />
                <h4>Let's Chat!</h4>
                <p>Please enter your name to start a live conversation with our jewelry consultants.</p>
                <form onSubmit={handleStartChat}>
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                    className="chat-onboard-input"
                  />
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.6rem' }}>
                    Start Chat
                  </button>
                </form>
              </div>
            ) : (
              /* Message list */
              <>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '0.5rem' }}>
                  Chat ID: {chatId.toUpperCase()} • Chatting as {customerName}
                </div>
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`chat-msg-row ${msg.sender}`}
                  >
                    <div className="chat-bubble">
                      {msg.content}
                      <span className="chat-msg-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Footer Input */}
          {customerName && (
            <form onSubmit={handleSendMessage} className="chat-input-area">
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="chat-input"
              />
              <button type="submit" className="chat-send-btn">
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        className="chat-bubble-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
