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
            <GroupSection/>
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
        </div>
      </IonContent>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </IonPage>
  );
};

export default Home;
