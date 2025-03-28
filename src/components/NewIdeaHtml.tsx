import React, { useEffect, useRef, useState } from 'react';
import './NewIdeaHtml.css';
import { useIonRouter } from '@ionic/react';


type Character = {
  id: string;
  name: string;
  image_url: string;
  description: string;
};

const InfiniteCarousel: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [characters, setCharacters] = useState<Character[]>([]);
  const autoScrollInterval = useRef<NodeJS.Timeout>();

  const [activeFilter, setActiveFilter] = useState<string>('');
  const router = useIonRouter();
  const emojis: string[] = ["premium"]; // Emoji list




  useEffect(() => {
    const fetchCharacters = async () => {
      if (characters.length > 0) return; // Prevent fetching if already loaded

      const formData = new FormData();
      formData.append('filters', "html");
      try {
        const response = await fetch('https://speakingcharacter.ai/get/filterSection', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setCharacters(data.data);
      } catch (error) {
        console.error('Error fetching characters:', error);
      }
    };

    fetchCharacters();
  }, [characters.length]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || characters.length === 0) return;

    let startX = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const diff = startX - currentX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        isDragging = false;
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    const handleTransitionEnd = () => {
      if (currentIndex === 0) {
        carousel.style.transition = 'none';
        setCurrentIndex(characters.length);
        carousel.style.transform = `translateX(-${characters.length * 100}%)`;
      } else if (currentIndex === characters.length + 1) {
        carousel.style.transition = 'none';
        setCurrentIndex(1);
        carousel.style.transform = `translateX(-100%)`;
      }
    };

    const updateCarousel = () => {
      if (!carousel) return;
      carousel.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    updateCarousel();

    autoScrollInterval.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % (characters.length + 2)); // Loop through characters
    }, 5000);

    carousel.addEventListener('transitionend', handleTransitionEnd);
    carousel.addEventListener('touchstart', handleTouchStart);
    carousel.addEventListener('touchmove', handleTouchMove);
    carousel.addEventListener('touchend', handleTouchEnd);

    return () => {
      clearInterval(autoScrollInterval.current);
      carousel.removeEventListener('transitionend', handleTransitionEnd);
      carousel.removeEventListener('touchstart', handleTouchStart);
      carousel.removeEventListener('touchmove', handleTouchMove);
      carousel.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, characters.length]);

  const handleCardClick = (id: string) => {
    router.push(`/character-chat-4/${id}`, 'forward', 'push');
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (characters.length + 2)); // Loop through characters
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + (characters.length + 2)) % (characters.length + 2)); // Loop back
  };

  return (
    <div className="carousel-container-btm">
      <div ref={carouselRef} className="carousel-track">
        {/* Clone of the last character for infinite loop */}
        {characters.length > 0 && (
          <div className="carousel-card-btm" onClick={() => handleCardClick(characters[characters.length - 1].id)}>
            <img src={characters[characters.length - 1].image_url} className="carousel-image-btm" />
            <div className="carousel-info">
              <h3 className="carousel-name">{characters[characters.length - 1].name}</h3>
              <p className="carousel-desc">{characters[characters.length - 1].description}</p>
            </div>
          </div>
        )}

        {/* Original characters */}
        {characters.map((character, index) => (
          <div key={index} className="carousel-card-btm" onClick={() => handleCardClick(character.id)}>
            <img src={character.image_url} className="carousel-image-btm" />
            <div className="carousel-info">
              <h3 className="carousel-name">{character.name}</h3>
              <p className="carousel-desc">{character.description}</p>
            </div>
          </div>
        ))}

        {/* Clone of the first character for infinite loop */}
        {characters.length > 0 && (
          <div className="carousel-card-btm" onClick={() => handleCardClick(characters[0].id)}>
            <img src={characters[0].image_url} className="carousel-image-btm" />
            <div className="carousel-info">
              <h3 className="carousel-name">{characters[0].name}</h3>
              <p className="carousel-desc">{characters[0].description}</p>
            </div>
          </div>
        )}
      </div>
      <div className="carousel-dots">
        {characters.map((_, index) => (
          <div key={index} className={`carousel-dot ${index === currentIndex - 1 ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
};

export default InfiniteCarousel;