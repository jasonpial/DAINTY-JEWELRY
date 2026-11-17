import { useState, useEffect, useMemo } from 'react';
import HeroSlideshow from './HeroSlideshow';
import ProductCard from './ProductCard';
import CollectionCard from './CollectionCard';
import { getProducts } from '../../db';
import { navigateTo } from '../../Router';
import {
  Award,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  Star,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function HomeView({ onAddToBag }) {
  const [allProducts, setAllProducts] = useState(() => getProducts());

  // Listen for real-time product database updates (add, edit, delete, server sync)
  useEffect(() => {
    const handleProductsChange = () => {
      setAllProducts(getProducts());
    };
    window.addEventListener('storage', handleProductsChange);
    window.addEventListener('dainty_products_changed', handleProductsChange);
    return () => {
      window.removeEventListener('storage', handleProductsChange);
      window.removeEventListener('dainty_products_changed', handleProductsChange);
    };
  }, []);

  // Sort products with most recently added creations first
  const sortedProducts = useMemo(() => {
    return [...allProducts].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [allProducts]);

  // Curated collections focusing exclusively on Dainty Studs & Chains (earrings, piercings, chain earrings)
  const featuredCollections = [
    {
      id: 'earrings_with_chains',
      title: 'Earrings With Chains',
      subtitle: 'Draped Links',
      image: '/images/iv.jpeg',
      categoryId: 'earrings'
    },
    {
      id: 'chain_draped_piercings',
      title: 'Chain Draped Piercings',
      subtitle: 'Helix & Cartilage',
      image: '/images/v.jpeg',
      categoryId: 'earrings'
    },
    {
      id: 'flatback_studs',
      title: 'Flat-Back Comfort Studs',
      subtitle: '14K Gold Sleep-In',
      image: '/images/vi.jpeg',
      categoryId: 'earrings'
    },
    {
      id: 'titanium_piercings',
      title: 'Titanium Piercing Studs',
      subtitle: 'Implant-Grade',
      image: '/images/0.jpeg',
      categoryId: 'earrings'
    },
    {
      id: 'marquise_studs',
      title: 'Marquise Cluster Studs',
      subtitle: 'Multi-Stone Brilliance',
      image: '/images/vii.jpeg',
      categoryId: 'earrings'
    },
    {
      id: 'pave_clickers',
      title: 'Pavé Huggie Clickers',
      subtitle: 'Seamless Sparkle',
      image: '/images/iii.jpeg',
      categoryId: 'earrings'
    },
    {
      id: 'eternity_piercings',
      title: 'Eternity Micro-Piercings',
      subtitle: 'Lobe & Tragus',
      image: '/images/ii.jpeg',
      categoryId: 'earrings'
    },
    {
      id: 'minimalist_rings',
      title: 'Minimalist Piercing Rings',
      subtitle: '18K Gold Plated',
      image: '/images/i.jpeg',
      categoryId: 'earrings'
    },
    
  ];

  // New arrivals: prioritizing newly created products (first 4 items for 4-column layout)
  const newArrivals = useMemo(() => {
    const arrivals = sortedProducts.filter(p => p.new_arrival);
    if (arrivals.length < 4) {
      const arrivalIds = new Set(arrivals.map(a => a.id));
      const remaining = sortedProducts.filter(p => !arrivalIds.has(p.id));
      return [...arrivals, ...remaining].slice(0, 4);
    }
    return arrivals.slice(0, 4);
  }, [sortedProducts]);

  // Best sellers: prioritizing high-demand pieces and recent creations (first 8 items)
  const bestSellers = useMemo(() => {
    const sellers = sortedProducts.filter(p => p.best_seller);
    if (sellers.length < 8) {
      const sellerIds = new Set(sellers.map(s => s.id));
      const remaining = sortedProducts.filter(p => !sellerIds.has(p.id));
      return [...sellers, ...remaining].slice(0, 8);
    }
    return sellers.slice(0, 8);
  }, [sortedProducts]);

  return (
    <div className="dainty-home-container">
      {/* 1. Full-width Hero Slideshow (Preserved exactly as requested) */}
      <HeroSlideshow />

      {/* 2. COLLECTIONS SECTION (Matching the attached photo) */}
      <section className="dainty-collection-page-section">
        <div className="dainty-section-header-centered">
          <span className="dainty-eyebrow-text">
            <Sparkles size={13} className="eyebrow-icon" />
            Curated Series
          </span>
          <h2 className="dainty-page-title">COLLECTIONS</h2>
          <div className="dainty-title-accent-line"></div>
          <p className="dainty-page-subtitle">
            Explore our signature 18K gold-plated studs, delicate ear chains, flat-back cartilage piercings, and curated ear stacks.
          </p>
        </div>

        {/* 4-column desktop, 2-column mobile collection grid matching photo */}
        <div className="dainty-responsive-grid-4">
          {featuredCollections.map((col) => (
            <CollectionCard
              key={col.id}
              title={col.title}
              subtitle={col.subtitle}
              image={col.image}
              categoryId={col.categoryId}
              collectionId={col.collectionId}
              occasion={col.occasion}
            />
          ))}
        </div>
      </section>

      {/* 3. NEW ARRIVALS SECTION */}
      <section className="dainty-product-section">
        <div className="dainty-section-header-row">
          <div>
            <span className="dainty-section-kicker">Just Landed</span>
            <h2 className="dainty-section-heading">NEW ARRIVALS</h2>
          </div>
          <button
            className="dainty-btn-view-all"
            onClick={() => navigateTo('shop', { collection: 'new_arrivals' })}
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* 4-column desktop, 2-column mobile product grid */}
        <div className="dainty-responsive-grid-4">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} onAddToBag={onAddToBag} />
          ))}
        </div>
      </section>

      {/* 4. PROMOTIONAL FEATURE BANNER */}
      <section className="dainty-feature-strip-section">
        <div className="dainty-feature-strip-inner">
          <div className="dainty-feature-strip-content">
            <span className="strip-tag">LIMITED EXCLUSIVE OFFER</span>
            <h3 className="strip-title">Pair Any Stud with a Draped Piercing Chain &amp; Save 10%</h3>
            <p className="strip-desc">
              Every piece is crafted with hypoallergenic titanium &amp; stainless steel cores, finished with 18K gold plating designed for effortless everyday wear and sensitive ears.
            </p>
            <div className="strip-actions">
              <button
                className="btn-primary"
                onClick={() => navigateTo('shop', { category: 'earrings' })}
              >
                Shop Studs &amp; Chains
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigateTo('shop', { category: 'sets' })}
                style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#ffffff' }}
              >
                Explore Ear Stacks
              </button>
            </div>
          </div>
          <div className="dainty-feature-strip-image">
            <img
              src="/images/v.jpeg"
              alt="Draped chain piercing"
              className="strip-img"
            />
          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS SECTION */}
      <section className="dainty-product-section">
        <div className="dainty-section-header-row">
          <div>
            <span className="dainty-section-kicker">Most Loved in Uganda</span>
            <h2 className="dainty-section-heading">BEST SELLERS</h2>
          </div>
          <button
            className="dainty-btn-view-all"
            onClick={() => navigateTo('shop', { collection: 'best_sellers' })}
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* 4-column desktop, 2-column mobile product grid */}
        <div className="dainty-responsive-grid-4">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} onAddToBag={onAddToBag} />
          ))}
        </div>
      </section>

      {/* 6. VALUE PROPOSITIONS STRIP */}
      <div className="dainty-value-bar">
        <div className="dainty-value-grid">
          <div className="dainty-value-item">
            <Award size={24} className="dainty-value-icon" />
            <div>
              <h4 className="dainty-value-title">QUALITY GUARANTEE</h4>
              <p className="dainty-value-text">18K gold-plated, tarnish-resistant pieces crafted to last.</p>
            </div>
          </div>

          <div className="dainty-value-item">
            <Truck size={24} className="dainty-value-icon" />
            <div>
              <h4 className="dainty-value-title">DELIVERY ACROSS UGANDA</h4>
              <p className="dainty-value-text">Prompt, secure delivery in Kampala &amp; upcountry.</p>
            </div>
          </div>

          <div className="dainty-value-item">
            <ShieldCheck size={24} className="dainty-value-icon" />
            <div>
              <h4 className="dainty-value-title">SECURE PAYMENTS</h4>
              <p className="dainty-value-text">Pay easily via MTN MoMo, Airtel Money, or Cash on Delivery.</p>
            </div>
          </div>

          <div className="dainty-value-item">
            <RefreshCw size={24} className="dainty-value-icon" />
            <div>
              <h4 className="dainty-value-title">EASY EXCHANGES</h4>
              <p className="dainty-value-text">Hassle-free 7-day exchange on standard items.</p>
            </div>
          </div>

          <div className="dainty-value-item">
            <Headphones size={24} className="dainty-value-icon" />
            <div>
              <h4 className="dainty-value-title">PERSONAL STYLING</h4>
              <p className="dainty-value-text">Chat with our Kampala team on WhatsApp anytime.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. SOCIAL & COMMUNITY SECTION (3 Columns) */}
      <div className="dainty-community-section">
        {/* Column 1: Testimonials */}
        <div className="dainty-community-box">
          <h3 className="box-title">WHAT OUR CLIENTS SAY</h3>
          <div>
            <div style={{ display: 'flex', gap: '0.2rem', color: '#c59b27', marginBottom: '0.8rem' }}>
              <Star size={16} fill="#c59b27" />
              <Star size={16} fill="#c59b27" />
              <Star size={16} fill="#c59b27" />
              <Star size={16} fill="#c59b27" />
              <Star size={16} fill="#c59b27" />
            </div>
            <p style={{ fontSize: '0.85rem', color: '#44403c', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1.2rem' }}>
              "I wear my DAINTY paperclip necklace every single day, even in the shower, and it hasn't tarnished at all. Dispatch to Kololo was within 3 hours!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--gradient-gold-metallic)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: '#000000' }}>
                PN
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1c1917', display: 'block' }}>Peace N.</span>
                <span style={{ fontSize: '0.72rem', color: '#78716c' }}>Kampala, Uganda</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Instagram Grid */}
        <div className="dainty-community-box">
          <h3 className="box-title">FOLLOW @DAINTY.JEWELRY</h3>
          <div className="dainty-ig-grid">
            <div className="dainty-ig-item">
              <img src="/images/iv.jpeg" alt="Earrings with chains" />
            </div>
            <div className="dainty-ig-item">
              <img src="/images/v.jpeg" alt="Draped chain piercing" />
            </div>
            <div className="dainty-ig-item">
              <img src="/images/vii.jpeg" alt="Marquise cluster stud" />
            </div>
            <div className="dainty-ig-item">
              <img src="/images/viii.jpeg" alt="Curated earring stack" />
            </div>
          </div>
          <button
            className="dainty-btn-ig"
            onClick={() => window.open('https://instagram.com', '_blank')}
          >
            EXPLORE ON INSTAGRAM
          </button>
        </div>

        {/* Column 3: Newsletter */}
        <div className="dainty-community-box">
          <div>
            <h3 className="box-title">JOIN THE DAINTY CIRCLE</h3>
            <p style={{ fontSize: '0.82rem', color: '#78716c', marginBottom: '1.2rem', lineHeight: 1.5 }}>
              Receive exclusive private sale access, ring sizing guides, and first notification on new chain drops.
            </p>
            <form className="dainty-newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to DAINTY!'); }}>
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="dainty-newsletter-input"
              />
              <button type="submit" className="dainty-newsletter-btn">SUBSCRIBE</button>
            </form>
          </div>
          <p style={{ fontSize: '0.7rem', color: '#a8a29e', marginTop: '1rem' }}>
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
