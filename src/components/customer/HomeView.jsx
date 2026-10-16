import { useRef } from 'react';
import HeroSlideshow from './HeroSlideshow';
import ProductCard from './ProductCard';
import { getProducts } from '../../db';
import { navigateTo } from '../../Router';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones
} from 'lucide-react';

export default function HomeView({ onAddToBag }) {
  const allProducts = getProducts();

  // Show a shuffled mix of all products for new arrivals (up to 3)
  const newArrivals = allProducts
    .filter(p => p.new_arrival)
    .slice(0, 3);

  // Best sellers — up to 6, from any category
  const bestSellers = allProducts
    .filter(p => p.best_seller)
    .slice(0, 6);

  return (
    <div className="dainty-home-container">
      {/* 1. Full-width Hero Slideshow */}
      <HeroSlideshow />

      {/* 2. NEW ARRIVALS SECTION */}
      <div className="dainty-section-header-row">
        <div className="dainty-section-title-wrap" style={{ margin: 0 }}>
          <div className="title-line"></div>
          <h2 className="title-text">NEW ARRIVALS</h2>
          <div className="title-line"></div>
        </div>

        <button
          className="dainty-btn-view-all"
          onClick={() => navigateTo('shop', { collection: 'new_arrivals' })}
        >
          VIEW ALL
        </button>
      </div>

      <div className="dainty-home-grid-4">
        {/* New Arrival Product Cards */}
        {newArrivals.map(product => (
          <ProductCard key={product.id} product={product} onAddToBag={onAddToBag} />
        ))}

        {/* 4th Column: SPECIAL OFFER Promo Card */}
        <div className="dainty-promo-card">
          <div>
            <span className="promo-tag">SPECIAL OFFER</span>
            <h3 className="promo-heading">COMPLETE<br />THE LOOK</h3>
            <p className="promo-desc">
              Buy any chain + bracelet and get 10% OFF
            </p>
          </div>

          <button
            className="promo-btn"
            onClick={() => navigateTo('shop', { collection: 'sale' })}
          >
            SHOP THE SET
          </button>

          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&auto=format&fit=crop&q=80"
            alt="Gold Chain Set"
            className="dainty-promo-bg-img"
          />
        </div>
      </div>

      {/* 3. BEST SELLERS SECTION */}
      <div className="dainty-section-title-wrap">
        <button className="dainty-nav-arrow" style={{ width: 28, height: 28 }}>
          <ChevronLeft size={16} />
        </button>
        <div className="title-line" style={{ maxWidth: 80 }}></div>
        <h2 className="title-text">BEST SELLERS</h2>
        <div className="title-line" style={{ maxWidth: 80 }}></div>
        <button className="dainty-nav-arrow" style={{ width: 28, height: 28 }}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="dainty-home-grid-6">
        {bestSellers.map(product => (
          <ProductCard key={product.id} product={product} onAddToBag={onAddToBag} />
        ))}
      </div>

      {/* 4. VALUE PROPOSITIONS STRIP */}
      <div className="dainty-value-bar">
        <div className="dainty-value-grid">
          <div className="dainty-value-item">
            <Award size={24} className="dainty-value-icon" />
            <div>
              <h4 className="dainty-value-title">QUALITY GUARANTEE</h4>
              <p className="dainty-value-text">We ensure premium quality in every piece.</p>
            </div>
          </div>

          <div className="dainty-value-item">
            <Truck size={24} className="dainty-value-icon" />
            <div>
              <h4 className="dainty-value-title">DELIVERY ACROSS UGANDA</h4>
              <p className="dainty-value-text">Fast &amp; reliable delivery to your doorstep.</p>
            </div>
          </div>

          <div className="dainty-value-item">
            <ShieldCheck size={24} className="dainty-value-icon" />
            <div>
              <h4 className="dainty-value-title">SECURE PAYMENTS</h4>
              <p className="dainty-value-text">Pay safely with MTN, Airtel Money or Card.</p>
            </div>
          </div>

          <div className="dainty-value-item">
            <RefreshCw size={24} className="dainty-value-icon" />
            <div>
              <h4 className="dainty-value-title">EASY RETURNS</h4>
              <p className="dainty-value-text">Not satisfied? Return within 7 days.</p>
            </div>
          </div>

          <div className="dainty-value-item">
            <Headphones size={24} className="dainty-value-icon" />
            <div>
              <h4 className="dainty-value-title">DEDICATED SUPPORT</h4>
              <p className="dainty-value-text">We're here to help you choose the perfect piece.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SOCIAL & COMMUNITY SECTION (3 Columns) */}
      <div className="dainty-community-section">
        {/* Column 1: Testimonials */}
        <div className="dainty-community-box">
          <h3 className="box-title">WHAT OUR CUSTOMERS SAY</h3>
          <div>
            <div style={{ display: 'flex', gap: '0.2rem', color: '#c59b27', marginBottom: '0.8rem' }}>
              <Star size={16} fill="#c59b27" />
              <Star size={16} fill="#c59b27" />
              <Star size={16} fill="#c59b27" />
              <Star size={16} fill="#c59b27" />
              <Star size={16} fill="#c59b27" />
            </div>
            <p style={{ fontSize: '0.82rem', color: '#44403c', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '1rem' }}>
              "The quality is amazing and delivery was so fast. I will definitely shop again!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Peace"
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1c1917' }}>— Peace, Kampala</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.2rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#b8860b' }}></span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ded7ce' }}></span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ded7ce' }}></span>
          </div>
        </div>

        {/* Column 2: Instagram Grid */}
        <div className="dainty-community-box">
          <h3 className="box-title">FOLLOW US @DAINTY.JEWELRY</h3>
          <div className="dainty-ig-grid">
            <div className="dainty-ig-item">
              <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&auto=format&fit=crop&q=80" alt="Instagram 1" />
            </div>
            <div className="dainty-ig-item">
              <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&auto=format&fit=crop&q=80" alt="Instagram 2" />
            </div>
            <div className="dainty-ig-item">
              <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&auto=format&fit=crop&q=80" alt="Instagram 3" />
            </div>
            <div className="dainty-ig-item">
              <img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&auto=format&fit=crop&q=80" alt="Instagram 4" />
            </div>
          </div>
          <button
            className="dainty-btn-ig"
            onClick={() => window.open('https://instagram.com', '_blank')}
          >
            FOLLOW US ON INSTAGRAM
          </button>
        </div>

        {/* Column 3: Newsletter */}
        <div className="dainty-community-box">
          <div>
            <h3 className="box-title">JOIN THE DAINTY FAMILY</h3>
            <p style={{ fontSize: '0.8rem', color: '#78716c', marginBottom: '1.2rem', lineHeight: 1.4 }}>
              Subscribe for updates, new arrivals and exclusive offers.
            </p>
            <form className="dainty-newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="dainty-newsletter-input"
              />
              <button type="submit" className="dainty-newsletter-btn">SUBSCRIBE</button>
            </form>
          </div>
          <p style={{ fontSize: '0.68rem', color: '#a8a29e', marginTop: '1rem' }}>
            We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
