import { IonContent, IonFooter, IonHeader, IonPage, IonText, IonTitle, IonToolbar ,IonSearchbar} from '@ionic/react';
import './Home.css';
import SearchCharacters from '../components/SearchContainer';
import TextToSpeech from '../components/TextToSpeech';
import SpecialSectionContainer from '../components/SpecialSectionContainer';
import PopularToolsContainer from '../components/PopularToolsContainer';
import LatestCharacters from '../components/LatestCharacters';
import AudioList from '../components/AudioList';
import FilterSection from '../components/FilterSection';
import UserProfile from '../components/UserProfile';
import PremiumAssistants from '../components/PremiumAssistants';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
      </IonHeader>
      <IonContent>
        <SearchCharacters/>
        <IonText className="popular-tools-heading">❤️ Special Section 💎</IonText>
        <SpecialSectionContainer />
        <IonText className="popular-tools-heading">🔥 Popular Assistants 🚀</IonText>
        <PopularToolsContainer/>
        <IonText className="latest-characters-heading">🌟 Latest Characters ✨</IonText>
        <LatestCharacters/>
        <IonText className="latest-characters-heading">👷Popular Tools🛠️</IonText>
        <PremiumAssistants/>
        <FilterSection/>
        <AudioList/>
        <TextToSpeech />
        <UserProfile/>
      </IonContent>
      <IonFooter>
        
      </IonFooter>
    </IonPage>
  );
};

export default Home;
