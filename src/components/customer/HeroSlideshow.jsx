import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { navigateTo } from '../../Router';

const slidesConfig = {
  home: [
    {
      image: '/images/hero_home_luxury.png',
      subtitle: 'DAINTY STUDS & CHAINS',
      title: 'Timeless Luxury, Crafted For You',
      description: 'Explore our handcrafted 18K gold plated studs, necklaces, and statement chains. Unmatched shine, everyday durability.'
    },
    {
      image: '/images/hero_home_chains.png',
      subtitle: 'THE CHAINS COLLECTION',
      title: 'Effortless Layering & Modern Links',
      description: 'Water-resistant, tarnish-free paperclip chains and pendants designed to make a statements in classic gold.'
    },
    {
      image: '/images/hero_home_earrings.png',
      subtitle: 'STUDS & EAR CUFFS',
      title: 'Elegant Sparkle & Seamless Huggies',
      description: 'Upgrade your ear stack with premium cubic zirconia, drop earrings, and minimal cuffs in sterling silver.'
    }
  ],
  rings: [
    {
      image: '/images/hero_rings.png',
      subtitle: '💍 CLASSIC BANDS & SOLITAIRES',
      title: 'Rings of Devotion & Promises',
      description: 'From stunning engagement rings to promise rings and wedding bands. Gold, silver, and rose gold.'
    },
    {
      image: '/images/hero_rings.png',
      subtitle: '💍 FASHION & STATEMENT RINGS',
      title: 'Sculpt Your Hands With Gold',
      description: 'Adjustable bands, cocktail rings, and couple matching sets to wear on every fingers.'
    }
  ],
  necklaces: [
    {
      image: '/images/hero_necklaces.png',
      subtitle: '📿 PENDANTS & CHOKERS',
      title: 'Adorn Your Neckline With Gold',
      description: 'Chic initial chains, layered lockets, and chokers in 18K gold plated stainless steel.'
    },
    {
      image: '/images/hero_necklaces.png',
      subtitle: '📿 BAROQUE PEARL NECKLACES',
      title: 'Natural & Lustrous Pearls',
      description: 'Individually selected freshwater baroque pearls paired with gold toggle clasps.'
    }
  ],
  earrings: [
    {
      image: '/images/hero_home_earrings.png',
      subtitle: '✨ EARRING STACKS',
      title: 'Studs, Huggies, & Ear Cuffs',
      description: 'Mix and match hoops, drop earrings, and cartilage cuffs with no piercing required.'
    }
  ],
  bracelets: [
    {
      image: '/images/hero_bracelets.png',
      subtitle: '⛓️ CUFFS & CHAINS',
      title: 'Bangles & Friendship Links',
      description: 'Complete your look with gold-plated bangles, charms, and minimalist chains.'
    }
  ],
  watches: [
    {
      image: '/images/hero_watches.png',
      subtitle: '⌚ CLASSIC HOROLOGY',
      title: 'Timepieces of Distinction',
      description: 'Luxury quartz watches, couple fashion watches, and premium chronograph dials.'
    }
  ],
  collections: [
    {
      image: '/images/hero_home_luxury.png',
      subtitle: '💎 DAINTY SPECIAL COLLECTIONS',
      title: 'Curated Trends & Premium Drops',
      description: 'New arrivals, best sellers, and limited edition releases. Find the perfect gift or treat yourself.'
    }
  ],
  accessories: [
    {
      image: '/images/hero_accessories.png',
      subtitle: '🎁 ACCESSORIES & CARE',
      title: 'Store & Maintain Your Gems',
      description: 'Luxury velvet boxes, travel rolls, organizers, and jewelry polishing sprays.'
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
    <section className="hero-slider">
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
              className="btn-gold"
              onClick={() => navigateTo('shop', category ? { category } : (collection ? { collection } : {}))}
            >
              Shop Collection
            </button>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div className="hero-controls">
          <button className="hero-arrow" onClick={handlePrev} aria-label="Previous Slide">
            <ArrowLeft size={18} />
          </button>
          <button className="hero-arrow" onClick={handleNext} aria-label="Next Slide">
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}

