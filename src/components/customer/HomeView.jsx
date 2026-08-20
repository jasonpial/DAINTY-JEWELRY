import HeroSlideshow from './HeroSlideshow';
import ProductCard from './ProductCard';
import { getProducts } from '../../db';
import { navigateTo } from '../../Router';
import { Sparkles, Heart, Award, ShieldCheck, Truck } from 'lucide-react';

export default function HomeView({ onAddToBag }) {
  const allProducts = getProducts();
  
  // Collections filtered from database
  const bestSellers = allProducts.filter(p => p.best_seller).slice(0, 4);
  const newArrivals = allProducts.filter(p => p.new_arrival).slice(0, 4);
  const under100k = allProducts.filter(p => (p.sale_price || p.price) <= 100000).slice(0, 4);

  const categoriesShort = [
    { name: 'Rings', id: 'rings', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&auto=format&fit=crop&q=80', icon: '💍' },
    { name: 'Necklaces', id: 'necklaces', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&auto=format&fit=crop&q=80', icon: '📿' },
    { name: 'Earrings', id: 'earrings', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&auto=format&fit=crop&q=80', icon: '✨' },
    { name: 'Bracelets', id: 'bracelets', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&auto=format&fit=crop&q=80', icon: '⛓️' }
  ];

  return (
    <div className="home-view">
      {/* Hero Slideshow */}
      <HeroSlideshow />

      {/* Selling Points Bar */}
      <section className="home-features-bar">
        <div className="feature-item">
          <ShieldCheck className="feature-icon" size={28} />
          <h4>Tarnish Resistant</h4>
          <p>Crafted with 18K plating & surgical steel</p>
        </div>
        <div className="feature-item">
          <Heart className="feature-icon" size={28} />
          <h4>Hypoallergenic</h4>
          <p>100% nickel-free & gentle on sensitive skin</p>
        </div>
        <div className="feature-item">
          <Truck className="feature-icon" size={28} />
          <h4>UG Delivery</h4>
          <p>Fast delivery across Kampala & countrywide</p>
        </div>
        <div className="feature-item">
          <Award className="feature-icon" size={28} />
          <h4>Premium Quality</h4>
          <p>Handpicked designs, checked for absolute excellence</p>
        </div>
      </section>




      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '2.2rem auto', padding: '0 2rem' }}>
          <div className="luxury-header-text">
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
              <Sparkles size={24} style={{ color: 'var(--color-gold-light)' }} /> Best Sellers
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Our most coveted and highly-loved signature creations.</p>
          </div>
          <div className="product-grid">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} onAddToBag={onAddToBag} />
            ))}
          </div>
        </section>
      )}



      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '2.2rem auto', padding: '0 2rem' }}>
          <div className="luxury-header-text">
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff' }}>New Arrivals</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Freshly minted additions to our gold and silver collections.</p>
          </div>
          <div className="product-grid">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} onAddToBag={onAddToBag} />
            ))}
          </div>
        </section>
      )}

      {/* Budget Friendly collection: Gifts under 100K */}
      {under100k.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '2.2rem auto', padding: '0 2rem' }}>
          <div className="luxury-header-text">
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff' }}>Gifts Under UGX 100K</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Elegant jewelry that fits perfectly within your budget.</p>
          </div>
          <div className="product-grid">
            {under100k.map(product => (
              <ProductCard key={product.id} product={product} onAddToBag={onAddToBag} />
            ))}
          </div>
        </section>
      )}

      {/* Footer Branding Banner */}
      <section style={{ background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: 'white', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem' }}>DAINTY</h2>
          <span style={{ color: 'var(--color-gold-primary)', textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '0.8rem', display: 'block', marginBottom: '2rem' }}>STUDS & CHAINS</span>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            We specialize in providing high-quality, water-friendly, and tarnish-resistant jewelry. Discover rings, chains, studs, and custom accessory products designed to match every look.
          </p>
          <button className="btn-gold" onClick={() => navigateTo('shop')}>
            Browse Full Shop
          </button>
        </div>
      </section>
    </div>
  );
}
