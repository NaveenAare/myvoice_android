import { IonContent, IonPage , IonHeader} from '@ionic/react';
import { useState, useEffect } from 'react';
import './Home.css';
import SearchCharacters from '../components/SearchContainer';
import CardComponent from '../components/TopBanner';
import EmojiFilter from '../components/EmojiFilter';
import LatestCharcatersSection from '../components/LatestCharacters';
import FilterSection2 from '../components/FilterSection2';
import SpecialSectionContainer from '../components/SpecialSectionContainer';
import PopularToolsContainer from '../components/PopularToolsContainer';
import PopularAssistants2 from '../components/popularAssistants';
import AudioList from '../components/AudioList';
import BottomNavigation from '../components/BottomNavigation';
import MenuCards from '../components/chatHistory';
import Dashboard from '../components/UserProfile';
import TTSComponent from '../components/TTS'
import GroupSection from '../components/group_section'
import GetSubscriptionButton from '../components/GetSubscriptionButton'; // Import the new component

import NewIdeaHtml from '../components/NewIdeaHtml'

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home'); // Track active tab
  const [showTour, setShowTour] = useState(false); // State to control tour visibility
  const [currentIndex, setCurrentIndex] = useState(0); // Track current image index

  const tourImages = [
    'assets/2.png',
    'assets/3.png',
    'assets/4.png',
    'assets/5.png',
    // Add more images as needed
  ];

  useEffect(() => {
    const isFirstVisit = localStorage.getItem('isFirstVisit') === null;
    if (isFirstVisit) {
      setShowTour(false);
      localStorage.setItem('isFirstVisit', 'true'); // Set flag to indicate first visit is done
    }
  }, []);

  const handleNext = () => {
    if (currentIndex < tourImages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowTour(false); // Close tour when reaching the last image
    }
  };

  const handleSkip = () => {
    setShowTour(false); // Close tour
  };

  const renderTour = () => (
    <>
      <div className="overlayss" onClick={handleSkip} /> {/* Overlay that closes the tour on click */}
      <div className="tour-popup">
        <img src={tourImages[currentIndex]} alt={`Tour ${currentIndex + 1}`} />
        <div className="tour-controls">
        <button className='tour-controls-button' onClick={handleNext}>
          {currentIndex < tourImages.length - 1 ? 'Next' : 'Finish'}
        </button>
      </div>
      </div>
      
    </>
  );

  const authToken = "eyJ1c2VySWQiOiAxLCAibWFpbCI6ICJhYXJlbmF2ZWVudmFybWFAZ21haWwuY29tIiwgIm5hbWUiOiAibmF2ZWVuIGFhcmUiLCAicHJvZmlsZV9waWMiOiAiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSTZQa3BFSGJkdGZoQTFETFp5OHVCcnZrejRIaDhTVjhMQmtzajRYRjdTVlB2OEllRDU9czEwMCIsICJpc19wcmVtaXVtX3VzZXIiOiB0cnVlLCAic3Vic2NyaXB0aW9uX2VuZF9kYXRlIjogIjIwMjUtMDQtMjMgMjI6MTg6MDguMjM3NjUyIn0wNjdiNGZiMDlkNTc3NDg5NTYxNTU0MmM1M2I4NjBmNjlhN2VhN2FlODE3MDBlZTdkYjYyNjY1YjFjOTAwMDJh";

  localStorage.setItem(`authToken`, authToken);
  const renderContent = () => {
    switch(activeTab) {
      case 'home': // Home Tab
        return (
          <>
            <SearchCharacters/>
            <GetSubscriptionButton/>

            <CardComponent/>

            <EmojiFilter/>
            <GroupSection/>
            <LatestCharcatersSection/>
            <FilterSection2/>
            <SpecialSectionContainer />
            <PopularToolsContainer/>
            <PopularAssistants2/>
            <AudioList/>
            <NewIdeaHtml/>
            
          </>
        );
      case 'chats': // Chats Tab
        return <MenuCards/>;
      case 'TTS': // Profile Tab
        return <TTSComponent/>;
      case 'profile': // Profile Tab
        return <Dashboard/>;
      default:
        return null;
    }
  };

  return (
    <IonPage className="force-light-theme">
      <IonContent fullscreen scrollY={true} className="ios-content">
        <div className="home-container">
          {renderContent()}
          {showTour && renderTour()} {/* Show tour if applicable */}
        </div>
      </IonContent>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </IonPage>
  );
};

export default Home;
