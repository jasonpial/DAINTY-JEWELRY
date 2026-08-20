import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Menu } from 'lucide-react';
import { navigateTo } from '../../Router';
import { categories } from '../../db';

const slidesConfig = {
  home: [
    {
      image: '/images/hero_home_luxury.png',
      subtitle: 'Black Friday This Week',
      title: 'Work Desk Surface Studio 2019',
      description: 'Starting at £1599.00'
    },
    {
      image: '/images/hero_necklaces.png',
      subtitle: 'WEDDING COLLECTION',
      title: 'CELEBRATE YOUR LOVE WITH ELEGANCE',
      description: 'Gold plated chains, bracelets, and bridal accessories check-marked for absolute excellence.'
    },
    {
      image: '/images/hero_home_earrings.png',
      subtitle: 'EXQUISITE JEWELRY',
      title: 'UNMATCHED QUALITY & SHINE',
      description: 'Upgrade your ear stack with premium cubic zirconia, drop earrings, and minimal cuffs.'
    }
  ],
  rings: [
    {
      image: '/images/hero_rings.png',
      subtitle: '💍 CLASSIC BANDS & SOLITAIRES',
      title: 'Rings of Devotion & Promises',
      description: 'From wedding bands to engagement and promise rings.'
    }
  ],
  necklaces: [
    {
      image: '/images/hero_necklaces.png',
      subtitle: '📿 PENDANTS & CHOKERS',
      title: 'Adorn Your Neckline With Gold',
      description: 'Chic initial chains, layered lockets, and chokers.'
    }
  ],
  earrings: [
    {
      image: '/images/hero_home_earrings.png',
      subtitle: '✨ EARRING STACKS',
      title: 'Studs, Huggies, & Ear Cuffs',
      description: 'Mix and match hoops, drop earrings, and cartilage cuffs.'
    }
  ],
  bracelets: [
    {
      image: '/images/hero_bracelets.png',
      subtitle: '⛓️ CUFFS & CHAINS',
      title: 'Bangles & Friendship Links',
      description: 'Complete your look with gold-plated bangles.'
    }
  ],
  watches: [
    {
      image: '/images/hero_watches.png',
      subtitle: '⌚ CLASSIC HOROLOGY',
      title: 'Timepieces of Distinction',
      description: 'Luxury quartz watches and chronographs.'
    }
  ],
  collections: [
    {
      image: '/images/hero_home_luxury.png',
      subtitle: '💎 DAINTY SPECIAL COLLECTIONS',
      title: 'Curated Trends & Premium Drops',
      description: 'Find the perfect gift or treat yourself.'
    }
  ],
  accessories: [
    {
      image: '/images/hero_accessories.png',
      subtitle: '🎁 ACCESSORIES & CARE',
      title: 'Store & Maintain Your Gems',
      description: 'Luxury velvet boxes and travel organizers.'
    }
  ]
};

export default function HeroSlideshow({ category, collection }) {
  // Determine which slide deck to use
  let slides = slidesConfig.home;
  let activeKey = 'home';
  
  if (category && slidesConfig[category]) {
    slides = slidesConfig[category];
    activeKey = category;
  } else if (collection) {
    slides = slidesConfig.collections;
    activeKey = 'collections';
  } else if (category === 'sets' || category === 'body') {
    slides = slidesConfig.home;
  } else if (category === 'accessories') {
    slides = slidesConfig.accessories;
    activeKey = 'accessories';
  }

  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);

  // Preload all slideshow images on mount
  useEffect(() => {
    Object.values(slidesConfig).forEach((slideGroup) => {
      slideGroup.forEach((slide) => {
        const img = new Image();
        img.src = slide.image;
      });
    });
  }, []);

  // Reset slide index if deck changes
  useEffect(() => {
    setActiveSlide(0);
    setPrevSlide(null);
  }, [activeKey]);

  const changeSlide = (newIndex) => {
    setPrevSlide(activeSlide);
    setActiveSlide(newIndex);
  };

  // Autoplay slide show
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      const nextIndex = (activeSlide + 1) % slides.length;
      changeSlide(nextIndex);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlide, slides.length]);

  const handlePrev = () => {
    const prevIndex = (activeSlide - 1 + slides.length) % slides.length;
    changeSlide(prevIndex);
  };

  const handleNext = () => {
    const nextIndex = (activeSlide + 1) % slides.length;
    changeSlide(nextIndex);
  };

  return (
    <section className="hero-layout-outer">
      {/* 3-Column Grid Layout */}
      <div className="hero-grid-container">
        
        {/* Column 1: Vertical Categories Sidebar */}
        <div className="hero-categories-sidebar">
          <div className="categories-sidebar-header">
            <Menu size={16} /> SHOP BY CATEGORIES
          </div>
          <div className="categories-sidebar-list">
            {categories.map(cat => (
              <a 
                key={cat.id} 
                href={`#/shop?category=${cat.id}`} 
                className="sidebar-category-item"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('shop', { category: cat.id });
                }}
              >
                <span>{cat.icon} {cat.name}</span>
                <span className="arrow-icon">▸</span>
              </a>
            ))}
            <a 
              href="#/shop" 
              className="sidebar-category-item"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('shop');
              }}
            >
              <span>✨ Full Collection</span>
              <span className="arrow-icon">▸</span>
            </a>
          </div>
        </div>

        {/* Column 2: Main Slideshow */}
        <div className="hero-main-slideshow">
          <div className="hero-slider" style={{ height: '100%' }}>
            {slides.map((slide, index) => (
              <div 
                key={index} 
                className={`hero-slide ${index === activeSlide ? 'active' : ''} ${index === prevSlide ? 'prev-active' : ''}`}
              >
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="hero-bg-image"
                />
                <div className="hero-overlay"></div>
                <div className="hero-content animate-fade-in">
                  <span className="hero-subtitle">{slide.subtitle}</span>
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-description">{slide.description}</p>
                  <button 
                    className="hero-btn-discover"
                    onClick={() => navigateTo('shop', category ? { category } : (collection ? { collection } : {}))}
                  >
                    SHOPPING NOW
                  </button>
                </div>
              </div>
            ))}

            {slides.length > 1 && (
              <>
                <button className="hero-arrow-edge-left" onClick={handlePrev} aria-label="Previous Slide">
                  <ArrowLeft size={18} />
                </button>
                <button className="hero-arrow-edge-right" onClick={handleNext} aria-label="Next Slide">
                  <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Column 3: Featured Best Product Panel */}
        <div className="hero-featured-promo">
          <div className="promo-tag-top">Best Product</div>
          <h3 className="promo-title-right">Off The Month</h3>
          <div className="promo-mannequin-image-wrapper">
            <img 
              src="/images/hero_necklaces.png" 
              alt="Mannequin Featured Necklace" 
              className="promo-mannequin-img" 
            />
          </div>
          <button 
            className="promo-shop-now-btn"
            onClick={() => navigateTo('shop', { collection: 'premium' })}
          >
            Shop Now
          </button>
        </div>

      </div>

      {/* Bottom Promo Triple Banners Row */}
      <div className="hero-bottom-promo-row">
        
        {/* Card 1 */}
        <div 
          className="bottom-promo-card" 
          onClick={() => navigateTo('shop', { category: 'rings' })}
        >
          <div className="bottom-promo-info">
            <span className="promo-off-badge">15% off for All</span>
            <h4>Diamond Rings</h4>
            <span className="promo-shop-now-link">SHOP NOW</span>
          </div>
          <img 
            src="/images/hero_rings.png" 
            alt="Rings Off" 
            className="bottom-promo-img" 
          />
        </div>

        {/* Card 2 */}
        <div 
          className="bottom-promo-card" 
          onClick={() => navigateTo('shop', { category: 'necklaces' })}
        >
          <div className="bottom-promo-info">
            <span className="promo-off-badge">20% off for All</span>
            <h4>Diamond Locket</h4>
            <span className="promo-shop-now-link">SHOP NOW</span>
          </div>
          <img 
            src="/images/hero_home_luxury.png" 
            alt="Locket Off" 
            className="bottom-promo-img" 
          />
        </div>

        {/* Card 3 */}
        <div 
          className="bottom-promo-card" 
          onClick={() => navigateTo('shop', { category: 'earrings' })}
        >
          <div className="bottom-promo-info">
            <span className="promo-off-badge">10% off for All</span>
            <h4>Diamond Ear Rings</h4>
            <span className="promo-shop-now-link">SHOP NOW</span>
          </div>
          <img 
            src="/images/hero_home_earrings.png" 
            alt="Ear Rings Off" 
            className="bottom-promo-img" 
          />
        </div>

      </div>
    </section>
  );
}
