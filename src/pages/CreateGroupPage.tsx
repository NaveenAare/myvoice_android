import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonBackButton,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonChip,
  IonIcon,
  IonSegment,
  IonSegmentButton,
} from '@ionic/react';
import { closeCircle } from 'ionicons/icons';
import './CreateGroupPage.css';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { useIonRouter } from '@ionic/react';
import { App } from '@capacitor/app';  // Add this import
import { useIonViewWillEnter } from '@ionic/react';


interface Character {
  id: string;
  name: string;
  image_url: string;
  description?: string;
  category?: string;
  code?: string;
  summary2?: string;
}

const CreateGroupPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');
  const [privateCharacters, setPrivateCharacters] = useState<Character[]>([]);
  const [isLoadingPrivate, setIsLoadingPrivate] = useState(false);
  const [privateError, setPrivateError] = useState<string | null>(null);

  const router = useIonRouter();


  // Debounce logic
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  useEffect(() => {
    // Prevent swipe back on iOS
    const preventSwipeBack = () => {
      if (router.canGoBack()) {
        router.push('/custom-page'); // Redirect to your custom page instead of going back
      }
    };

    // Override the default iOS swipe back behavior
    document.addEventListener('ionBackButton', preventSwipeBack);

    return () => {
      document.removeEventListener('ionBackButton', preventSwipeBack);
    };
  }, [router]);


  const useSwipeBack = (threshold = 100) => {
    let touchStartX = 0;
  
    const handleTouchStart = useCallback((e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    }, []);
  
    const handleTouchEnd = useCallback((e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;
  
      // Detect left-to-right swipe (positive deltaX)
      if (deltaX > threshold) {
        goToHome()
      }
    }, [history, threshold]);
  
    useEffect(() => {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchend', handleTouchEnd);
  
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }, [handleTouchStart, handleTouchEnd]);
  };

  useSwipeBack();




  useEffect(() => {
    const preventBack = (ev: Event) => {
      ev.preventDefault();
      console.log('Back button pressed - Custom Logic');
      router.push('/custom-page'); // Redirect to a custom page instead
    };

    document.addEventListener('ionBackButton', preventBack);

    return () => {
      document.removeEventListener('ionBackButton', preventBack);
    };
  }, [router]);


  useIonViewWillEnter(() => {
    document.addEventListener('ionBackButton', (ev) => {
      ev.preventDefault();
      console.log('Back gesture blocked on this page');
    });
  });

  





  // Add a new function to fetch all characters
  const fetchAllCharacters = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://speakingcharacter.ai/character/search?query= .');
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }
      const data = await response.json();
      setCharacters(data.data);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching characters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to fetch all characters when component mounts
  useEffect(() => {
    fetchAllCharacters();
  }, []);

  const fetchCharacters = async (searchQuery: string) => {
    if (!searchQuery) {
      // Instead of setting empty array, fetch all characters
      fetchAllCharacters();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://speakingcharacter.ai/character/search?query=${searchQuery}`);
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }
      const data = await response.json();
      setCharacters(data.data);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching characters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchCharacters, 500), []);

  const handleSearchChange = (e: CustomEvent) => {
    const value = e.detail.value!;
    setSearchText(value);
    debouncedFetch(value);
  };

  const handleCharacterSelect = (character: Character) => {
    if (selectedCharacters.find(c => c.id === character.id)) {
      setSelectedCharacters(selectedCharacters.filter(c => c.id !== character.id));
    } else {
      if (selectedCharacters.length < 4) {
        setSelectedCharacters([...selectedCharacters, character]);
      } else {
        // You might want to show a toast or alert here
        console.log('Maximum 4 characters allowed');
      }
    }
  };

  const handleRemoveCharacter = (characterId: string) => {
    setSelectedCharacters(selectedCharacters.filter(c => c.id !== characterId));
  };

  const handleCreateGroup = () => {
    if (selectedCharacters.length >= 2) {
      console.log('Selected characters for group:', selectedCharacters);
      // Here you would typically make an API call to create the group
    }
  };

  // Fetch private characters
  const fetchPrivateCharacters = async () => {
    setIsLoadingPrivate(true);
    setPrivateError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");

      const formData = new FormData();
      formData.append('authToken', token);

      const response = await fetch('https://speakingcharacter.ai/get/firstSection', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to fetch private characters');
      }

      const dataFull = await response.json();
      setPrivateCharacters(dataFull.data || []);
    } catch (err) {
      setPrivateError('Failed to fetch private characters');
      console.error('Error fetching private characters:', err);
    } finally {
      setIsLoadingPrivate(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'private') {
      fetchPrivateCharacters();
    }
  }, [activeTab]);

  // Add status bar handling
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Hide status bar when component mounts
      StatusBar.hide();

      // Show status bar when component unmounts
      return () => {
        StatusBar.show();
      };
    }
  }, []);

  const goToHome = () => {
    router.push(`/home`, 'back', 'push');
  };

  

  return (
    <IonPage className="create-group-page">
      <IonHeader>
        <IonToolbar className='toolbar-container'>
          <IonButtons slot="start">
            <IonButton onClick={goToHome}>
              <IonIcon slot="icon-only" icon="chevron-back" />
            </IonButton>
          </IonButtons>
          <IonTitle style={{color: 'black'}}>
            Create New Group ({selectedCharacters.length}/4)
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={handleCreateGroup}
              disabled={selectedCharacters.length < 2}
              color="primary"
            >
              Create
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="fixed-content">
          <div className="selected-characters-container">
            {selectedCharacters.length === 0 && (
              <div className="no-selection-text">
                Select up to 4 characters to create a group
              </div>
            )}
            {selectedCharacters.map(character => (
              <IonChip
                key={character.id}
                className="selected-character-chip"
              >
                <IonAvatar>
                  <img src={character.image_url} alt={character.name} />
                </IonAvatar>
                <IonLabel>{character.name}</IonLabel>
                <IonIcon
                  icon={closeCircle}
                  onClick={() => handleRemoveCharacter(character.id)}
                />
              </IonChip>
            ))}
          </div>

          <IonSearchbar
            value={searchText}
            onIonChange={handleSearchChange}
            placeholder="Search characters"
            debounce={300}
          />

          <IonSegment value={activeTab} onIonChange={e => setActiveTab(e.detail.value as 'public' | 'private')}>
            <IonSegmentButton value="public">
              <IonLabel>Public</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="private">
              <IonLabel>Private</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        <div className="scrollable-content">
          {activeTab === 'public' ? (
            // Public characters list
            <>
              {isLoading && <div className="loading-text">Searching...</div>}
              {error && <div className="error-text">{error}</div>}
              <IonList>
                {characters.map(character => (
                  <IonItem
                    key={character.id}
                    button
                    onClick={() => handleCharacterSelect(character)}
                    className={
                      selectedCharacters.find(c => c.id === character.id)
                        ? 'selected-character'
                        : ''
                    }
                  >
                    <IonAvatar slot="start">
                      <img src={character.image_url} alt={character.name} />
                    </IonAvatar>
                    <IonLabel>
                      <h2>{character.name}</h2>
                      {character.summary2 && <p>{character.summary2}</p>}
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </>
          ) : (
            // Private characters list
            <>
              {isLoadingPrivate && <div className="loading-text">Loading private characters...</div>}
              {privateError && <div className="error-text">{privateError}</div>}
              <IonList>
                {privateCharacters.map(character => (
                  <IonItem
                    key={character.id}
                    button
                    onClick={() => handleCharacterSelect(character)}
                    className={
                      selectedCharacters.find(c => c.id === character.id)
                        ? 'selected-character'
                        : ''
                    }
                  >
                    <IonAvatar slot="start">
                      <img src={character.image_url} alt={character.name} />
                    </IonAvatar>
                    <IonLabel>
                      <h2>{character.name}</h2>
                      {character.summary2 && <p>{character.summary2}</p>}
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CreateGroupPage; 