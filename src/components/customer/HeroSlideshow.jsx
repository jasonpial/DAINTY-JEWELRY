import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { navigateTo } from '../../Router';

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
      {/* Full-width hero slideshow — no sidebar, no category list */}
      <div className="hero-slider hero-slider-fullwidth" style={{ height: '480px', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-premium)' }}>
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

      {/* Bottom Promo Triple Banners Row */}
      <div className="hero-bottom-promo-row">

        {/* Card 1 */}
        <div
          className="bottom-promo-card"
          onClick={() => navigateTo('shop', { material: 'Stainless Steel' })}
        >
          <div className="bottom-promo-info">
            <span className="promo-off-badge">⚙️ Collection</span>
            <h4>Stainless Steel</h4>
            <span className="promo-shop-now-link">SHOP NOW</span>
          </div>
          <img
            src="/images/hero_rings.png"
            alt="Stainless Steel Collection"
            className="bottom-promo-img"
          />
        </div>

        {/* Card 2 */}
        <div
          className="bottom-promo-card"
          onClick={() => navigateTo('shop', { material: 'Titanium' })}
        >
          <div className="bottom-promo-info">
            <span className="promo-off-badge">💫 Collection</span>
            <h4>Titanium</h4>
            <span className="promo-shop-now-link">SHOP NOW</span>
          </div>
          <img
            src="/images/hero_home_luxury.png"
            alt="Titanium Collection"
            className="bottom-promo-img"
          />
        </div>

        {/* Card 3 */}
        <div
          className="bottom-promo-card"
          onClick={() => navigateTo('shop')}
        >
          <div className="bottom-promo-info">
            <span className="promo-off-badge">✨ All Items</span>
            <h4>Full Collection</h4>
            <span className="promo-shop-now-link">SHOP NOW</span>
          </div>
          <img
            src="/images/hero_home_earrings.png"
            alt="Full Collection"
            className="bottom-promo-img"
          />
        </div>

      </div>
    </section>
  );
}
