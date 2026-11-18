import { Phone, Mail, MapPin, Clock, MessageCircle, MessageSquare } from 'lucide-react';

export default function ContactView() {
  const handleOpenChat = () => {
    // Look for chat bubble button and click it to open chat widget
    const bubbleBtn = document.querySelector('.chat-bubble-btn');
    if (bubbleBtn) {
      bubbleBtn.click();
    }
  };

  const handleOpenWhatsApp = () => {
    window.open('https://wa.me/256788227027', '_blank');
  };

  return (
    <div className="contact-page-section">
      <div className="contact-container">
        <div className="luxury-header-text contact-header">
          <h1>Contact Us</h1>
          <p>
            We'd love to hear from you. Reach out for order customisation, product inquiries, or general support.
          </p>
        </div>

        <div className="contact-main-grid">
          {/* Contact Details Card */}
          <div className="contact-card">
            <h2 className="contact-card-title">Store Information</h2>

            <div className="contact-info-grid">
              <div className="contact-info-item">
                <MapPin size={19} style={{ color: 'var(--color-gold-dark)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4>Location</h4>
                  <p>Goodwill zone, Kampala, Uganda</p>
                </div>
              </div>

              <div className="contact-info-item">
                <Phone size={19} style={{ color: 'var(--color-gold-dark)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4>Phone</h4>
                  <a href="tel:+256788227027">+256 788 227027</a>
                </div>
              </div>

              <div className="contact-info-item">
                <Mail size={19} style={{ color: 'var(--color-gold-dark)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4>Email</h4>
                  <a href="mailto:daintystudsandchains@gmail.com">daintystudsandchains@gmail.com</a>
                </div>
              </div>

              <div className="contact-info-item">
                <Clock size={19} style={{ color: 'var(--color-gold-dark)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4>Store Hours</h4>
                  <p>Mon - Sun: 24 hrs</p>
                  <p className="contact-sub-note">Sunday: open (Online Orders Active)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Channels Grid & Official Social Media */}
          <div className="contact-channels-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="contact-card">
              <h2 className="contact-card-title">Instant Messenger</h2>
              <p className="contact-channel-desc">
                Chat with us directly in your browser. Our support team is online to answer questions immediately.
              </p>
              <button
                onClick={handleOpenChat}
                className="btn-primary contact-channel-btn"
              >
                <MessageSquare size={15} /> Open In-App Chat
              </button>
            </div>

            <div className="contact-card">
              <h2 className="contact-card-title">Direct WhatsApp &amp; Hotline</h2>
              <p className="contact-channel-desc">
                For faster catalog browsing, quick size checks, and instant ordering, reach out to our WhatsApp hotline.
              </p>
              <button
                onClick={handleOpenWhatsApp}
                className="btn-whatsapp contact-channel-btn"
              >
                <MessageCircle size={15} /> Chat via WhatsApp (+256 788 227027)
              </button>
            </div>

            <div className="contact-card">
              <h2 className="contact-card-title">Official Social Media</h2>
              <p className="contact-channel-desc">
                Follow our official social pages for daily styling videos, piercing inspiration, and exclusive offers.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a
                  href="https://www.instagram.com/dainty_studs_and_chains?exln=MXc3cnI2ZDh1NGpzdw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    background: '#faf6f0',
                    borderColor: '#b38728',
                    color: '#1c1917',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    padding: '0.6rem 0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  Follow @dainty_studs_and_chains on Instagram
                </a>

                <a
                  href="https://www.tiktok.com/@daintystuds?_r=1&_t=ZS-9BChgZF8WY9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    background: '#faf6f0',
                    borderColor: '#b38728',
                    color: '#1c1917',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    padding: '0.6rem 0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                  Watch @daintystuds on TikTok
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Location Card */}
        <div className="contact-map-box">
          <img
            src="/images/0.jpeg"
            alt="Kampala Location"
            className="contact-map-img"
          />
          <div className="contact-map-overlay">
            <MapPin size={32} style={{ color: 'var(--color-gold-primary)', marginBottom: '0.65rem' }} />
            <h3>DAINTY Flagship Location</h3>
            <p>Goodwill zone, Kampala, Uganda</p>
            <p style={{ color: '#f3ece6', fontSize: '0.82rem', marginTop: '0.3rem' }}>Fast Courier Delivery Across Kampala &amp; Nationwide</p>
          </div>
        </div>
      </div>
    </div>
  );
}
