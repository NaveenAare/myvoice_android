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
  IonCheckbox,
} from '@ionic/react';
import { chevronBack, closeCircle } from 'ionicons/icons';
import './CreateGroupPage.css';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { useIonRouter } from '@ionic/react';
import { App } from '@capacitor/app';  // Add this import
import { useIonViewWillEnter } from '@ionic/react';
import { createAnimation } from '@ionic/react';
import { useParams } from 'react-router-dom';

// Add constants at the top of the file
const GROUP_LIMITS = {
  MAX_CHARACTERS: 1,
  CHARACTERS_PER_ROW: 1
} as const;

interface Character {
  id: string;
  name: string;
  image_url_1: string;
  description?: string;
  category?: string;
  code?: string;
  summary2?: string;
  groupCode?: string;
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

// Add this new component for the loading overlay
const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div className="loading-overlay">
    <IonSpinner name="crescent" />
    <div className="loading-message">{message}</div>
  </div>
);

const AddCharacterToGroup: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Access the id parameter

  // You can now use the id as needed
  console.log('Selected Character ID:', id);

  const [publicCharacters, setPublicCharacters] = useState<Character[]>([]);
  const [privateCharacters, setPrivateCharacters] = useState<Character[]>([]);
  const [selectedPublic, setSelectedPublic] = useState<string | null>(null);
  const [selectedPrivate, setSelectedPrivate] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPrivate, setIsLoadingPrivate] = useState(false);
  const [privateError, setPrivateError] = useState<string | null>(null);
  const [selectedGroupMeta, setSelectedGroupMeta] = useState<Character | null>(null);
  const [loadingOverlayMessage, setLoadingOverlayMessage] = useState('');


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
      const response = await fetch('https://speakingcharacter.ai/get/public/groups');
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }
      const data = await response.json();
      setPublicCharacters(data.data);
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
      setPublicCharacters(data.data);
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
    console.log('Search Text:', value);
  };

  const handlePublicSelection = (characterId: string) => {
    const selectedCharacter = publicCharacters.find(character => character.id === characterId);
    setSelectedPublic(selectedPublic === characterId ? null : characterId);
    setSelectedPrivate(null);
    setSelectedGroupMeta(selectedCharacter || null);
  };

  const handlePrivateSelection = (characterId: string) => {
    const selectedCharacter = privateCharacters.find(character => character.id === characterId);
    setSelectedPrivate(selectedPrivate === characterId ? null : characterId);
    setSelectedPublic(null);
    setSelectedGroupMeta(selectedCharacter || null);
  };

  const handleCreateGroup = () => {
    if (selectedPublic || selectedPrivate) {
      setShowModal(true);
    }
  };

  const handleFinalCreate = async () => {
    if (groupName.trim() && (selectedPublic || selectedPrivate)) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        const members = [selectedPublic, selectedPrivate].filter(Boolean).map(id => id.split('-')[1]);
        
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

        // Show success toast
        setToastMessage('Group created successfully!');
        setToastColor('success');
        setShowToast(true);

        // Navigate to home after a short delay
        setTimeout(() => {
          router.push('/home', 'root');
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

      const response = await fetch('https://speakingcharacter.ai/get/user/groups', {
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
    //router.push(`/home`, 'back', 'push');
    router.push("/character-chat/" + id , "back", "push");

  };

  const handleCloseModal = () => {
    const modalElement = document.querySelector('.group-name-modal');
    if (modalElement) {
      modalElement.classList.add('closing'); // Add class to disable animation
    }
    setShowModal(false); // Close the modal
  };

  // Filter characters based on search text
  const filteredPublicCharacters = publicCharacters.filter(character =>
    character.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredPrivateCharacters = privateCharacters.filter(character =>
    character.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleTabChange = (value: 'public' | 'private') => {
    setActiveTab(value);
    setSearchText(''); // Clear search text when switching tabs
  };

  const handleJoinCharacter = async () => {
    setIsLoading(true); // Show loading indicator
    try {
        const authToken = localStorage.getItem("authToken");
        const charCode = id;

        setLoadingOverlayMessage('Joining character into group...');

        // Get the group code from the selected private character
        const selectedCharacter = activeTab === 'private' && selectedPrivate 
            ? privateCharacters.find(character => character.id === selectedPrivate) 
            : publicCharacters.find(character => character.id === selectedPublic);

        const groupCode = selectedCharacter?.code;

        if (!authToken || !charCode || !groupCode) {
            setToastMessage('Please select a character to join.');
            setToastColor('danger');
            setShowToast(true);
            return;
        }

        const requestBody = {
            authToken: authToken,
            groupCode: groupCode,
            charCode: charCode,
        };

        // Show loading overlay while joining character
        const response = await fetch('https://speakingcharacter.ai/add/character/to/group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            setToastMessage(`Error: ${errorData.error}`);
            setToastColor('danger');
            setShowToast(true);
        } else {
            const responseData = await response.json(); // Get the response data
            const groupCodeFromResponse = responseData.groupCode; // Assuming the response contains the group code
            setToastMessage('Character added to group successfully!');
            setToastColor('success');
            setShowToast(true);
            // Navigate to the group chat page with the group code
            router.push(`/group-chat/${groupCodeFromResponse}`); // Adjust the route as necessary
        }
    } catch (error) {
        console.error('Error joining character:', error);
        setToastMessage('An error occurred while joining the character.');
        setToastColor('danger');
        setShowToast(true);
    } finally {
        setIsLoading(false); // Hide loading indicator
    }
  };

  useEffect(() => {
    const fetchCharacterDetails = async () => {
      try {
        const response = await fetch(`https://speakingcharacter.ai/get/character/${id}`);
        const data = await response.json();
        // Handle the fetched character data
        console.log('Fetched Character Data:', data);
      } catch (error) {
        console.error('Error fetching character details:', error);
      }
    };

    if (id) {
      fetchCharacterDetails();
    }
  }, [id]);

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
            Add Character Into Group
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={handleJoinCharacter}
              disabled={!selectedPublic && !selectedPrivate}
              color="primary"
            >
              Join
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="fixed-content">
          <IonSearchbar
            className="custom-searchbar"
            value={searchText}
            onIonChange={handleSearchChange}
            placeholder="Search characters"
            debounce={0}
          />

          <IonSegment value={activeTab} onIonChange={e => handleTabChange(e.detail.value as 'public' | 'private')}>
            <IonSegmentButton value="public">
              <IonLabel>Public</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="private">
              <IonLabel>Private</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        <div className="scrollable-content">
          {isLoading ? (
            <LoadingOverlay message={loadingOverlayMessage} />
          ) : activeTab === 'public' ? (
            // Public characters list
            <>
              {error && <div className="error-text">{error}</div>}
              <IonList>
                {filteredPublicCharacters.map(character => (
                  <IonItem
                    key={character.id}
                    button
                    onClick={() => handlePublicSelection(character.id)}
                    className={
                      selectedPublic === character.id
                        ? 'selected-character'
                        : ''
                    }
                  >
                    <IonAvatar slot="start">
                      <img src={character.image_url_1} alt={character.name} />
                    </IonAvatar>
                    <IonLabel>
                      <h2>{character.name}</h2>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </>
          ) : (
            // Private characters list
            <>
              {isLoadingPrivate && <LoadingOverlay message="Loading private characters..." />}
              {privateError && <div className="error-text">{privateError}</div>}
              <IonList>
                {filteredPrivateCharacters.map(character => (
                  <IonItem
                    key={character.id}
                    button
                    onClick={() => handlePrivateSelection(character.id)}
                    className={
                      selectedPrivate === character.id
                        ? 'selected-character'
                        : ''
                    }
                  >
                    <IonAvatar slot="start">
                      <img src={character.image_url_1} alt={character.name} />
                    </IonAvatar>
                    <IonLabel>
                      <h2>{character.name}</h2>
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

export default AddCharacterToGroup; 