import { IonContent, IonPage, IonTabs } from '@ionic/react';
import { useState } from 'react';
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
import Dashboard from '../components/UserProfile'

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home'); // Track active tab

  const renderContent = () => {
    switch(activeTab) {
      case 'home': // Home Tab
        return (
          <>
            <SearchCharacters/>
            <CardComponent/>
            <EmojiFilter/>
            <LatestCharcatersSection/>
            <FilterSection2/>
            <SpecialSectionContainer />
            <PopularToolsContainer/>
            <PopularAssistants2/>
            <AudioList/>
          </>
        );
      case 'chats': // Chats Tab
        return <MenuCards/>;
      case 'profile': // Profile Tab
        return <Dashboard/>;
      default:
        return null;
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="home-container">
          {renderContent()} {/* Render content based on active tab */}
        </div>
      </IonContent>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} /> {/* Update tab on change */}
    </IonPage>
  );
};

export default Home;
