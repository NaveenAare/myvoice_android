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
  IonModal,
  IonInput,
  IonToast,
  IonSpinner,
} from '@ionic/react';
import { chevronBack, closeCircle } from 'ionicons/icons';
import './CreateGroupPage.css';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { useIonRouter } from '@ionic/react';
import { App } from '@capacitor/app';  // Add this import
import { useIonViewWillEnter } from '@ionic/react';
import { createAnimation } from '@ionic/react';

// Add constants at the top of the file
const GROUP_LIMITS = {
  MAX_CHARACTERS: 6,
  CHARACTERS_PER_ROW: 3
} as const;

interface Character {
  id: string;
  name: string;
  image_url: string;
  description?: string;
  category?: string;
  code?: string;
  summary2?: string;
}

// Add these animation functions
const enterAnimation = (baseEl: HTMLElement) => {
  const root = baseEl.shadowRoot;

  const backdropAnimation = createAnimation()
    .addElement(root?.querySelector('ion-backdrop')!)
    .fromTo('opacity', '0', '0.5');

  const wrapperAnimation = createAnimation()
    .addElement(root?.querySelector('.modal-wrapper')!)
    .keyframes([
      { offset: 0, opacity: '0', transform: 'translateY(20px)' },
      { offset: 1, opacity: '1', transform: 'translateY(0)' }
    ]);

  return createAnimation()
    .duration(200)
    .addAnimation([backdropAnimation, wrapperAnimation]);
};

const leaveAnimation = (baseEl: HTMLElement) => {
  const root = baseEl.shadowRoot;

  const backdropAnimation = createAnimation()
    .addElement(root?.querySelector('ion-backdrop')!)
    .fromTo('opacity', '0.5', '0');

  const wrapperAnimation = createAnimation()
    .addElement(root?.querySelector('.modal-wrapper')!)
    .keyframes([
      { offset: 0, opacity: '1' },
      { offset: 1, opacity: '0' }
    ]);

  return createAnimation()
    .duration(200)
    .addAnimation([backdropAnimation, wrapperAnimation]);
};

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
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('');

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
      if (selectedCharacters.length < GROUP_LIMITS.MAX_CHARACTERS) {
        setSelectedCharacters([...selectedCharacters, character]);
      } else {
        console.log(`Maximum ${GROUP_LIMITS.MAX_CHARACTERS} characters allowed`);
      }
    }
  };

  const handleRemoveCharacter = (characterId: string) => {
    setSelectedCharacters(selectedCharacters.filter(c => c.id !== characterId));
  };

  const handleCreateGroup = () => {
    if (selectedCharacters.length >= 2) {
      setShowModal(true);
    }
  };

  const handleFinalCreate = async () => {
    if (groupName.trim() && selectedCharacters.length >= 2) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        const members = selectedCharacters.map(char => char.code);
        
        const response = await fetch('https://speakingcharacter.ai/create/private/group', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            authToken: token,
            groupName: groupName.trim(),
            members: members
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create group');
        }

        const data = await response.json();

        // Show success toast
        setToastMessage('Group created successfully!');
        setToastColor('success');
        setShowToast(true);

        // Navigate to home after a short delay
        setTimeout(() => {
          router.push(`/group-chat/${data.groupCode}`)
        }, 1500);

      } catch (error) {
        console.error('Error creating group:', error);
        setToastMessage('Failed to create group. Please try again.');
        setToastColor('danger');
        setShowToast(true);
      } finally {
        setIsLoading(false);
        setShowModal(false);
      }
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

  const handleCloseModal = () => {
    const modalElement = document.querySelector('.group-name-modal');
    if (modalElement) {
      modalElement.classList.add('closing'); // Add class to disable animation
    }
    setShowModal(false); // Close the modal
  };



  

  return (
    <IonPage className="create-group-page">
      <IonHeader>
        <IonToolbar className='toolbar-container'>
          <IonButtons slot="start">
            <IonButton onClick={goToHome} className='backButton'>
              <IonIcon slot="icon-only" icon={chevronBack}/>
            </IonButton>
          </IonButtons>
          <IonTitle style={{color: 'black'}}>
            Create New Group ({selectedCharacters.length}/{GROUP_LIMITS.MAX_CHARACTERS})
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
            {selectedCharacters.length === 0 ? (
              <div className="no-selection-text">
                Select up to {GROUP_LIMITS.MAX_CHARACTERS} characters to create a group
              </div>
            ) : (
              <>
                {Array.from({ length: Math.ceil(selectedCharacters.length / GROUP_LIMITS.CHARACTERS_PER_ROW) }).map((_, rowIndex) => (
                  <div key={rowIndex} className="selected-characters-row">
                    {selectedCharacters
                      .slice(
                        rowIndex * GROUP_LIMITS.CHARACTERS_PER_ROW, 
                        (rowIndex + 1) * GROUP_LIMITS.CHARACTERS_PER_ROW
                      )
                      .map(character => (
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
                ))}
              </>
            )}
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

      <IonModal
        isOpen={showModal}
        onDidDismiss={handleCloseModal}
        className="group-name-modal"
        breakpoints={[0, 1]}
        initialBreakpoint={1}
        animated={true}
        enterAnimation={enterAnimation}
        leaveAnimation={leaveAnimation}
      >
        <div className="modal-header">
          <h2>Name Your Group</h2>
        </div>
        
        <IonItem>
          <IonInput
            value={groupName}
            placeholder="Enter group name"
            onIonChange={e => setGroupName(e.detail.value || '')}
            clearInput={true}
            autofocus={true}
          />
        </IonItem>

        <div className="modal-buttons">
          <IonButton
            expand="block"
            onClick={() => setShowModal(false)}
            className="cancel-btn"
            disabled={isLoading}
          >
            Cancel
          </IonButton>
          <IonButton
            expand="block"
            onClick={handleFinalCreate}
            className="create-btn"
            disabled={!groupName.trim() || isLoading}
          >
            {isLoading ? (
              <IonSpinner name="crescent" />
            ) : (
              'Create'
            )}
          </IonButton>
        </div>
      </IonModal>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={1500}
        position="top"
        color={toastColor}
      />
    </IonPage>
  );
};

export default CreateGroupPage; 