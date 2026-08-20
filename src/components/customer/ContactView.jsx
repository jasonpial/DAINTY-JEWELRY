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
    window.open('https://wa.me/256700000000', '_blank');
  };

  return (
    <div style={{ background: 'transparent', padding: '4rem 0' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
        <div className="luxury-header-text">
          <h1 style={{ fontSize: '2.5rem', color: '#1c1917' }}>Contact Us</h1>
          <p style={{ color: '#44403c', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            We'd love to hear from you. Reach out for order customisation, product inquiries, or general support.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', marginTop: '3rem' }}>
          {/* Contact Details Card */}
          <div style={{ background: '#ffffff', border: '1px solid #eae6e1', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#1c1917', marginBottom: '1.8rem', borderBottom: '1px solid #eae6e1', paddingBottom: '0.5rem' }}>Store Information</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <MapPin size={22} style={{ color: 'var(--color-gold-dark)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gold-dark)', fontWeight: 800 }}>Location</h4>
                  <p style={{ fontSize: '0.95rem', color: '#1c1917', fontWeight: 600 }}>Plot 45, Acacia Avenue, Kampala, Uganda</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Phone size={22} style={{ color: 'var(--color-gold-dark)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gold-dark)', fontWeight: 800 }}>Phone</h4>
                  <a href="tel:+256700000000" style={{ fontSize: '0.95rem', color: '#1c1917', fontWeight: 600 }}>+256 700 000000</a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Mail size={22} style={{ color: 'var(--color-gold-dark)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gold-dark)', fontWeight: 800 }}>Email</h4>
                  <a href="mailto:info@daintystuds.com" style={{ fontSize: '0.95rem', color: '#1c1917', fontWeight: 600 }}>info@daintystuds.com</a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Clock size={22} style={{ color: 'var(--color-gold-dark)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gold-dark)', fontWeight: 800 }}>Store Hours</h4>
                  <p style={{ fontSize: '0.95rem', color: '#1c1917', fontWeight: 600 }}>Mon - Sat: 9:00 AM - 7:00 PM</p>
                  <p style={{ fontSize: '0.85rem', color: '#44403c' }}>Sunday: Closed (Online Orders Active)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Channels Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #eae6e1', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#1c1917', marginBottom: '1rem' }}>Instant Messenger</h2>
              <p style={{ fontSize: '0.85rem', color: '#44403c', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Chat with us directly in your browser. Our support team is online to answer questions immediately.
              </p>
              <button 
                onClick={handleOpenChat}
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <MessageSquare size={16} /> Open In-App Chat
              </button>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #eae6e1', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#1c1917', marginBottom: '1rem' }}>Direct WhatsApp</h2>
              <p style={{ fontSize: '0.85rem', color: '#44403c', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                For faster catalog browsing, quick size checks, and instant ordering, reach out to our WhatsApp hotline.
              </p>
              <button 
                onClick={handleOpenWhatsApp}
                className="btn-whatsapp" 
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <MessageCircle size={16} /> Chat via WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div style={{ width: '100%', height: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eae6e1', marginTop: '4rem', position: 'relative' }}>
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&auto=format&fit=crop&q=80" 
            alt="Kampala Map" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65) sepia(0.25) contrast(1.1)' }}
          />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(28, 25, 23, 0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem', textAlign: 'center' }}>
            <MapPin size={36} style={{ color: 'var(--color-gold-primary)', marginBottom: '1rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '0.5rem' }}>DAINTY Flagship Showroom</h3>
            <p style={{ color: 'var(--color-gold-light)', fontSize: '0.9rem' }}>Acacia Mall Precinct, Kampala • Valet Parking Available</p>
          </div>
        </div>
      </div>
    </div>
  );
}
