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
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', padding: '3.5rem 2rem', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ShieldCheck size={28} style={{ color: 'var(--color-gold-light)', marginBottom: '0.8rem' }} />
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem', color: '#ffffff' }}>Tarnish Resistant</h4>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Crafted with 18K plating & surgical steel</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Heart size={28} style={{ color: 'var(--color-gold-light)', marginBottom: '0.8rem' }} />
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem', color: '#ffffff' }}>Hypoallergenic</h4>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>100% nickel-free & gentle on sensitive skin</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Truck size={28} style={{ color: 'var(--color-gold-light)', marginBottom: '0.8rem' }} />
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem', color: '#ffffff' }}>UG Delivery</h4>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Fast delivery across Kampala & countrywide</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Award size={28} style={{ color: 'var(--color-gold-light)', marginBottom: '0.8rem' }} />
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem', color: '#ffffff' }}>Premium Quality</h4>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Handpicked designs, checked for absolute excellence</p>
        </div>
      </section>

      {/* Main Categories Section */}
      <section style={{ maxWidth: '1200px', margin: '5rem auto', padding: '0 2rem' }}>
        <div className="luxury-header-text">
          <h2 style={{ fontSize: '2.2rem', color: '#ffffff' }}>Shop By Category</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Select your favorite jewelry style to begin searching.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginTop: '2.5rem' }}>
          {categoriesShort.map(cat => (
            <div 
              key={cat.id}
              onClick={() => navigateTo('shop', { category: cat.id })}
              style={{
                position: 'relative',
                height: '300px',
                borderRadius: 'var(--border-radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <img 
                src={cat.img} 
                alt={cat.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: '2rem 1.5rem',
                background: 'linear-gradient(to top, rgba(18, 16, 15, 0.9) 30%, transparent)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{cat.name}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-gold-light)' }}>Explore {cat.name}</span>
                </div>
                <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '5rem auto', padding: '0 2rem' }}>
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

      {/* Shop By Segment Section */}
      <section style={{ padding: '5rem 2rem', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="luxury-header-text">
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff' }}>Shop Your Way</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Navigate catalog selections curated for your exact needs.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '3rem', marginTop: '3rem' }}>
            {/* By Gender */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(10px)', borderRadius: 'var(--border-radius-md)', padding: '2.2rem' }}>
              <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '0.8rem', marginBottom: '1.2rem', color: '#ffffff', fontWeight: 700 }}>Shop By Gender</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <li><a href="#/shop?gender=Women" onClick={(e) => { e.preventDefault(); navigateTo('shop', { gender: 'Women' }); }} style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>✨ Women's Jewelry</a></li>
                <li><a href="#/shop?gender=Men" onClick={(e) => { e.preventDefault(); navigateTo('shop', { gender: 'Men' }); }} style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>⛓️ Men's Chains & Rings</a></li>
                <li><a href="#/shop?gender=Unisex" onClick={(e) => { e.preventDefault(); navigateTo('shop', { gender: 'Unisex' }); }} style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>🧿 Unisex Collections</a></li>
              </ul>
            </div>

            {/* By Occasion */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(10px)', borderRadius: 'var(--border-radius-md)', padding: '2.2rem' }}>
              <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '0.8rem', marginBottom: '1.2rem', color: '#ffffff', fontWeight: 700 }}>Shop By Occasion</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('shop', { occasion: 'Wedding' }); }} style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>💍 Bridal & Wedding</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('shop', { occasion: 'Engagement' }); }} style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>🥂 Engagement Bands</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('shop', { occasion: 'Birthday' }); }} style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>🎂 Birthday Surprises</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('shop', { occasion: 'Gift' }); }} style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>🎁 Gifts & Sets</a></li>
              </ul>
            </div>

            {/* By Material */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(10px)', borderRadius: 'var(--border-radius-md)', padding: '2.2rem' }}>
              <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '0.8rem', marginBottom: '1.2rem', color: '#ffffff', fontWeight: 700 }}>Shop By Material</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('shop', { material: 'Gold-Plated' }); }} style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>🟡 18K Gold Plated</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('shop', { material: 'Sterling Silver' }); }} style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>⚪ 925 Sterling Silver</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('shop', { material: 'Stainless Steel' }); }} style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>⚓ Durable Stainless Steel</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('shop', { material: 'Titanium' }); }} style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>💎 Strong Titanium Bands</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '5rem auto', padding: '0 2rem' }}>
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
        <section style={{ maxWidth: '1200px', margin: '5rem auto', padding: '0 2rem' }}>
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
      <section style={{ background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: 'white', padding: '5rem 2rem', textAlign: 'center' }}>
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
