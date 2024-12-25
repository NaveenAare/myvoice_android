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
import CardComponent from '../components/TopBanner';
import BottomNav from '../components/BottomNavigation';
import EmojiFilter from '../components/EmojiFilter';
import LatestCharcatersSection from '../components/LatestCharacters'
import FilterSection2 from '../components/FilterSection2';
import PopularAudiosSection from '../components/AudioList';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
      </IonHeader>
      <IonContent>
        <SearchCharacters/>
        <CardComponent/>
        <EmojiFilter/>
        <LatestCharcatersSection/>
        <FilterSection2/>
        <SpecialSectionContainer />
        <PopularToolsContainer/>
        <AudioList/>
        <TextToSpeech />
      </IonContent>
      <IonFooter>
      </IonFooter>

    </IonPage>
  );
};

export default Home;
