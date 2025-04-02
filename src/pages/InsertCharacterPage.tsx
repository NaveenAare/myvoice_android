import React, { useState, useEffect } from 'react';
import { useIonRouter, IonContent, IonPage, IonHeader } from '@ionic/react';
import './InsertCharacter.css';
import { faBold } from '@fortawesome/free-solid-svg-icons';

const InsertCharacterPage: React.FC = () => {
  const router = useIonRouter();
  const [audioOptions, setAudioOptions] = useState<Array<{name: string, voice_url: string, transcribe_text: string}>>([]);
  const [audioOptionsFetched, setAudioOptionsFetched] = useState(false);
  const [showAudioForm, setShowAudioForm] = useState(false);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [showCharacterFormContainer, setShowCharacterFormContainer] = useState(false);
  const [showAudioFormContainer, setShowAudioFormContainer] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('https://img.freepik.com/premium-vector/camera-with-plus-sign-icon_625445-191.jpg');
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState('No file chosen');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAudioCloneTips, setShowAudioCloneTips] = useState(false);
  const [isLoadingAudios, setIsLoadingAudios] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);
  const [showAudioTermsPopup, setShowAudioTermsPopup] = useState(false);
  const [isMultilingual, setIsMultilingual] = useState(false);
  const [isPopupLoading, setIsPopupLoading] = useState(false);

  const fetchAudioOptions = async () => {
    if (audioOptionsFetched || isLoadingAudios) return;

    setIsLoadingAudios(true);
    const loadingSpinner = document.getElementById('loadingSpinner-list');
    if (loadingSpinner) {
      loadingSpinner.style.display = 'block';
    }

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('authToken', token || '');

      const response = await fetch('https://speakingcharacter.ai/user/audios', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to fetch audio options');

      const data = await response.json();
      setAudioOptions(data.data);
      setAudioOptionsFetched(true);

    } catch (error) {
      console.error('Error fetching audio options:', error);
      showToast('Failed to load audio options', 'error');
    } finally {
      setIsLoadingAudios(false);
      if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
      }
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openDescriptionPopup = () => {
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('overlay');
    if (popup && overlay) {
        popup.style.display = 'block';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
  };
  
  const closeDescriptionPopup = () => {
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('overlay');
    if (popup && overlay) {
      popup.style.display = 'none';
      overlay.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  };

  const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedAudioFile(file);
      setAudioFileName(file.name);
      
      const audioUpload = document.getElementById('audioFileUpload');
      if (audioUpload) {
        audioUpload.style.display = 'block';
      }
    }
  };

  const openAudioCloneTips = () => {
    const overlay = document.getElementById('overlay');
    const audioCloneTipsPopup = document.getElementById('audioCloneTipsPopup');
    
    if (overlay && audioCloneTipsPopup) {
      overlay.style.display = 'block';
      overlay.classList.add('active');
      audioCloneTipsPopup.style.display = 'block';
      document.body.style.overflow = 'hidden';
      setShowAudioCloneTips(true);
    }
  };

  const closeAudioCloneTips = () => {
    const overlay = document.getElementById('overlay');
    const audioCloneTipsPopup = document.getElementById('audioCloneTipsPopup');
    const audioFileUpload = document.getElementById('audioFileUpload');
    const audioUrlField = document.getElementById('AudioUrl');
    
    if (overlay && audioCloneTipsPopup) {
      overlay.style.display = 'none';
      overlay.classList.remove('active');
      audioCloneTipsPopup.style.display = 'none';
      document.body.style.overflow = 'auto';
      setShowAudioCloneTips(false);

      if (audioFileUpload) {
        audioFileUpload.style.display = 'block';
      }
      if (audioUrlField) {
        audioUrlField.style.display = 'none';
        audioUrlField.value = '';
      }
    }
  };

  const handleAudioSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = event.target.value;
    const audioUpload = document.getElementById('audioFileUpload');
    const audioUrlField = document.getElementById('AudioUrl');

    if (selectedOption === 'new') {
        openAudioCloneTips();
    } else if (audioUpload && audioUrlField) {
        audioUpload.style.display = 'none';
        const selectedElement = event.target.options[event.target.selectedIndex];
        const audioUrl = selectedElement.getAttribute('data-url') || '';
        const dataTrans = selectedElement.getAttribute('data-trans') || '';
        audioUrlField.value = audioUrl;
        audioUrlField.style.display = 'block';
        const token = localStorage.getItem('authToken');
        if (token) {
            localStorage.setItem(`${token}_Character_audio_trans`, dataTrans);
        }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const imageInput = form.querySelector<HTMLInputElement>('#imageInput');
    const audioSelection = form.querySelector<HTMLSelectElement>('#audioSelection');
    const audioFileInput = form.querySelector<HTMLInputElement>('#audioFile');

    // Check if image input exists and has a file
    if (!imageInput || !imageInput.files || imageInput.files.length === 0) {
        showToast('Please upload an image!', 'error');
        return;
    }

    // If not multilingual, check audio selection and audio file
    if (!isMultilingual) {
        if (!audioSelection) {
            showToast('Audio selection element not found!', 'error');
            return;
        }
        if (!audioSelection.value) {
            showToast('Please select audio!', 'error');
            return;
        }

        if (audioSelection.value === 'new' && (!audioFileInput || !audioFileInput.files || audioFileInput.files.length === 0)) {
            showToast('Please upload an audio file!', 'error');
            return;
        }
    }

    const formData = new FormData();
    const title = form.querySelector<HTMLInputElement>('#title')?.value;
    const tagline = form.querySelector<HTMLInputElement>('#tagline')?.value;
    const description = form.querySelector<HTMLTextAreaElement>('#description')?.value;
    const audioSelect = audioSelection?.value; // Use optional chaining
    const audioUrl = form.querySelector<HTMLTextAreaElement>('#AudioUrl')?.value;

    if (selectedImage) {
        formData.append('image', selectedImage);
    }
    if (title) formData.append('title', title);
    if (tagline) formData.append('tagline', tagline);
    if (description) formData.append('description', description);
    
    // Handle audio selection
    if (isMultilingual) {
        // Set audio and audio URL to null for multilingual
        formData.append('audio', null);
        formData.append('Audio_url', null);
        formData.append('trans_scribe', null); // Set transcription text to null
        formData.append('lang_type', "Multi"); // Set transcription text to null
    } else {
        if (audioSelect) formData.append('audio', audioSelect);
        if (audioUrl) formData.append('Audio_url', audioUrl);
        formData.append('lang_type', "English"); 
        
        if (audioSelect === 'new' && selectedAudioFile) {
            formData.append('audioFile', selectedAudioFile);
            const token = localStorage.getItem('authToken');
            const trans = localStorage.getItem(`${token}_Character_audio_trans`);
            formData.append('trans_scribe', trans || '');
        }
    }

    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.style.display = 'block';
        overlay.classList.add('active');
    }
    setFormDataToSubmit(formData);
    setShowTermsPopup(true);
    document.body.style.overflow = 'hidden';
  };

  const handleAudioSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const formData = new FormData(document.getElementById('contentForm-audio') as HTMLFormElement);
    setFormDataToSubmit(formData);
    setShowAudioTermsPopup(true);
    
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.style.display = 'block';
      overlay.style.zIndex = '100000';
    }
    document.body.style.overflow = 'hidden';
  };
  
  const closeAudioTermsPopup = () => {
    setShowAudioTermsPopup(false);
    setFormDataToSubmit(null);
    
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
  };

  const handleAudioTermsAccept = async () => {
    if (!formDataToSubmit) return;
    
    setIsLoading(true);
    const loadingSpinner = document.getElementById('loadingSpinner-audio');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('https://speakingcharacter.ai/get/insert/audio/' + token, {
            method: 'POST',
            body: formDataToSubmit
        });

        if (!response.ok) {
            throw new Error('Failed to create audio');
        }

        const data = await response.json(); // Parse the JSON response

        if (data.error) {
            showToast('Error: ' + data.error, 'error');
        } else {
            showToast('Audio created successfully!', 'success');
            setTimeout(() => {
                router.push('/character-chat/' + data.code, 'back', 'push'); // Access code from data
            }, 1500);
        }

    } catch (error) {
        console.error('Error creating audio:', error);
        showToast('Failed to create audio. Please try again.', 'error');
    } finally {
        setIsLoading(false);
        setShowAudioTermsPopup(false);
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }
  };
  
  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.className = `toast show ${type}`;
      setTimeout(() => {
        toast.className = 'toast';
      }, 4000);
    }
  };

  const goHome = () => {
    router.push('/home', 'back', 'push');
  };

  const showCharacterFormContainerFunc = () => {
    const formContainer = document.querySelector('.form-container') as HTMLElement;
    if (formContainer) {
      formContainer.style.display = 'block';
      setShowCharacterFormContainer(true);
    }
  };

  const hideCharacterFormContainer = () => {
    const formContainer = document.querySelector('.form-container') as HTMLElement;
    if (formContainer) {
      formContainer.style.display = 'none';
      setShowCharacterFormContainer(false);
    }
  };

  const showAudioFormContainerFunc = () => {
    const formContainer = document.querySelector('.form-container-audio') as HTMLElement;
    if (formContainer) {
      formContainer.style.display = 'block';
      setShowAudioFormContainer(true);
    }
  };

  const hideAudioFormContainer = () => {
    const formContainer = document.querySelector('.form-container-audio') as HTMLElement;
    if (formContainer) {
      formContainer.style.display = 'none';
      setShowAudioFormContainer(false);
    }
  };

  const showCreateAudioOrCharacterPopUp = () => {
    const popup = document.getElementById('choose-pop');
    const overlay = document.getElementById('overlay');
    if (popup && overlay) {
      document.body.style.overflow = 'hidden';
      overlay.style.display = 'block';
      overlay.style.position = 'fixed';
      popup.style.display = 'flex';

      const createCharacterBtn = document.getElementById('create-character');
      const createAudioBtn = document.getElementById('create-audio');

      if (createCharacterBtn) {
        createCharacterBtn.onclick = () => {
          showCharacterFormContainerFunc();
          hideAudioFormContainer();
          if (popup && overlay) {
            overlay.style.display = 'none';
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';
          }
        };
      }

      if (createAudioBtn) {
        createAudioBtn.onclick = () => {
          hideCharacterFormContainer();
          showAudioFormContainerFunc();
          if (popup && overlay) {
            overlay.style.display = 'none';
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';
          }
        };
      }
    }
  };

  const handleTermsAccept = async () => {
    if (!formDataToSubmit) return;
    
    setIsPopupLoading(true);
    setIsLoading(true);
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
      loadingSpinner.style.display = 'block';
    }

    try {
      const token = localStorage.getItem('authToken');
      const endpoint = `https://speakingcharacter.ai/get/insert/characters/${token}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
          'Connection': 'keep-alive',
          'Origin': 'https://speakingcharacter.ai',
          'Referer': 'https://speakingcharacter.ai/create/character',
        },
        body: formDataToSubmit
      });

      if (!response.ok) throw new Error('Failed to create character');
      
      

      const data = await response.json(); // Parse the JSON response
        if (data.error) {
            showToast('Error: ' + data.error, 'error');
        } else {
          showToast('Character created successfully!', 'success');
            setTimeout(() => {
                router.push('/character-chat/' + data.code, 'back', 'push'); // Access code from data
            }, 1500);
        }
      
      
    } catch (error) {
      console.error('Error creating character:', error);
      showToast('Failed to create character. Please try again.', 'error');
    } finally {
      setIsPopupLoading(false);
      setIsLoading(false);
      setShowTermsPopup(false);
      document.body.style.overflow = 'auto';
      if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
      }
    }
  };

  const closeTermsPopup = () => {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('delete-popup');
    
    if (overlay && popup) {
      overlay.style.display = 'none';
      overlay.classList.remove('active');
      popup.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
    setShowTermsPopup(false);
    setFormDataToSubmit(null);
  };

  useEffect(() => {
    showCreateAudioOrCharacterPopUp();
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    fetchAudioOptions();
  }, []);

  const generatePrompt = () => {
    const characterName = (document.getElementById('characterName') as HTMLInputElement)?.value;
    const characterAge = (document.getElementById('characterAge') as HTMLInputElement)?.value;
    const characterGender = (document.getElementById('characterGender') as HTMLInputElement)?.value;
    const characterOccupation = (document.getElementById('characterOccupation') as HTMLInputElement)?.value;
    const characterHeight = (document.getElementById('characterHeight') as HTMLInputElement)?.value;
    const characterHair = (document.getElementById('characterHair') as HTMLInputElement)?.value;
    const characterEyes = (document.getElementById('characterEyes') as HTMLInputElement)?.value;
    const characterPersonality = (document.getElementById('characterPersonality') as HTMLInputElement)?.value;
    const characterStrength = (document.getElementById('characterStrength') as HTMLInputElement)?.value;
    const characterWeakness = (document.getElementById('characterWeakness') as HTMLInputElement)?.value;
    const characterOrigin = (document.getElementById('characterOrigin') as HTMLInputElement)?.value;
    const characterBackground = (document.getElementById('characterBackground') as HTMLInputElement)?.value;
    const characterHobby = (document.getElementById('characterHobby') as HTMLInputElement)?.value;
    const characterGoal = (document.getElementById('characterGoal') as HTMLInputElement)?.value;

    const prompt = `My character's name is ${characterName}, a ${characterAge} year old ${characterGender} who works as a ${characterOccupation}. They are ${characterHeight} tall with ${characterHair} hair and ${characterEyes} eyes. They are known for being ${characterPersonality}, with strengths like ${characterStrength} and weaknesses such as ${characterWeakness}. Originally from ${characterOrigin}, their journey includes ${characterBackground}. They love to ${characterHobby}, and their main goal is to ${characterGoal}.`;

    const descriptionTextarea = document.getElementById('description') as HTMLTextAreaElement;
    if (descriptionTextarea) {
      descriptionTextarea.value = prompt;
    }

    const popup = document.getElementById('popup');
    const overlay = document.getElementById('overlay');
    if (popup && overlay) {
      popup.style.display = 'none';
      overlay.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  };

  const handleLanguageToggle = () => {
    setIsMultilingual(!isMultilingual);
    if (!isMultilingual) {
        showToast('Multilingual voice clone is not supported.', 'success');
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="insert-character-page">
          <div className="overlay" id="overlay"></div>

          <div className="audio_clone_tips-container" id="audioCloneTipsPopup">
            <h2 style={{ color: '#808080' }}>Upload Clear Audio ˓ 🎧 ˒</h2>
            <p style={{ color: '#808080', fontFamily: 'sans-serif' }}>
              For the best results in voice cloning, follow these guidelines:
            </p>
            <ul>
              <li style={{ fontSize: '12px' }} className="good">
                <i>✔️</i> Clear Audio Quality.
              </li>
              <li style={{ fontSize: '12px' }} className="good">
                <i>✔️</i> Short and Concise Audio
              </li>
              <li style={{ fontSize: '12px' }} className="good">
                <i>✔️</i> Clear Enunciation: Ensure every word is articulated clearly.
              </li>
            </ul>
            <p style={{ color: '#808080', fontFamily: 'sans-serif' }}>Avoid:</p>
            <ul>
              <li style={{ fontSize: '12px' }} className="bad">
                <i>❌</i> Background Noise
              </li>
              <li style={{ fontSize: '12px' }} className="bad">
                <i>❌</i> Background Music
              </li>
              <li style={{ fontSize: '12px' }} className="bad">
                <i>❌</i> Lengthy Audio: Keep recordings short to preserve focus and clarity.
              </li>
              <li> </li>
              <li style={{ fontSize: '15px', color: '#808080' }} className="bad">
                <i>Note: </i> Audio will be trimmed to 15 seconds for better quality
              </li>
            </ul>
            <button
              onClick={closeAudioCloneTips}
              style={{
                alignContent: 'center',
                alignItems: 'center',
                maxWidth: '200px',
                display: 'block',
                justifyContent: 'center',
                padding: '14px 28px',
                borderRadius: '30px',
                background: 'linear-gradient(90deg, #42A5F5, #26C6DA)',
                color: '#F1F1F1',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 600,
                transition: 'background 0.3s ease, transform 0.3s ease',
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                marginTop: '20px',
                position: 'relative',
                overflow: 'hidden',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              Continue
            </button>
          </div>

       

          <div className="pop" id="delete-popup" style={{ display: showTermsPopup ? 'block' : 'none' }}>
            <div className="pop-content">
              <p className="pop-heading">⚠ Important Notice for Users ⚠</p>
              <p>By using speakingcharacter.ai, you agree to these terms:</p>
              <ul>
                <li style={{ fontSize: '11px' }}>
                  ❣You are responsible: All content you create, including characters and voice clones, 
                  is your responsibility. speakingcharacter.ai is not liable for user-generated content.
                </li>
                <li style={{ fontSize: '11px' }}>
                  No harmful or misleading content: Do not use this platform for offensive, abusive, 
                  or misleading purposes. Ensure you have permission for any voices or likenesses you use.
                </li>
                <li style={{ fontSize: '11px' }}>
                  Respect copyrights and laws: Only use this tool for legal purposes, respecting others' rights and privacy.
                </li>
                <li style={{ fontSize: '11px' }}>
                  Cloning consent required: If using real voices, you must have permission from the individual or owner.
                </li>
                <li style={{ fontSize: '11px' }}>
                  You accept all risks: You understand the risks and accept responsibility for any 
                  consequences that arise from the use of AI-generated content.
                </li>
              </ul>
              <p style={{ fontSize: '15px' }}>
                Thank you for understanding and using speakingcharacter.ai responsibly!
              </p>
            </div>

            <div className="pop-button-wrapper">
              <button className="pop-button secondary" onClick={closeTermsPopup} disabled={isPopupLoading}>
                Cancel
              </button>
              <button 
                className="pop-button primary" 
                onClick={handleTermsAccept}
                disabled={isPopupLoading || isLoading}
              >
                Accept & Create
              </button>
              <div 
                id="loadingSpinner" 
                className="spinner" 
                style={{ display: isLoading ? 'block' : 'none' }}
              ></div>
            </div>
            
            <button className="exit-button" onClick={closeTermsPopup}>
              <svg height="20px" viewBox="0 0 384 512">
                <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
              </svg>
            </button>
          </div>

          <div className="choose-pop" id="choose-pop">
            <div className="choose-pop-button-wrapper">
              <button className="choose-pop-button primary" id="create-character">
                Create New Character with Audio 🎭🎤
              </button>
              <p style={{ marginTop: '15px' }}> (or) </p>
              <button className="choose-pop-button primary" id="create-audio">Create New Audio 🎶✨</button>
              <div id="loadingSpinner" style={{ display: 'none' }} className="spinner"></div>
            </div>
          </div>

          <div className="loading-bar" id="loading-bar-2"></div>

          <button className="back-arrow-btn" onClick={goHome}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="36px" height="36px" className="arrow-icon">
              <path d="M0 0h24v24H0z" fill="none"/>
              <path d="M12 4L10.59 5.41 16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </button>

          <div className="form-container" style={{ display: 'none' }}>
            <div className="form-title">Create New Character</div>
            <form id="contentForm" encType="multipart/form-data" method="POST" onSubmit={handleSubmit}>
              <div className="image-upload">
                <label htmlFor="imageInput" className="image-preview" id="imagePreview">
                  <img id="imageDisplay" src={imagePreview} alt="Preview" />
                </label>
                <input 
                  type="file" 
                  id="imageInput" 
                  name="image" 
                  accept="image/*" 
                  onChange={handleImageChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="title">Name of the Character*</label>
                <input type="text" id="title" name="title" placeholder="Enter title" required />
              </div>

              <div className="form-group">
                <label htmlFor="tagline">Tagline *</label>
                <input type="text" id="tagline" name="tagline" placeholder="Enter tagline" required />
              </div>

              <div className="form-group">
                <label htmlFor="description">About the character *</label>
                <button 
                        type="button"
                        className="generate-btn" 
                        onClick={openDescriptionPopup}
                    >
                  Generate Description
                </button>
                <textarea 
                  id="description" 
                  name="description" 
                  placeholder="Insert how do you want the character to act..." 
                  required
                ></textarea>
              </div>

              <label htmlFor="audioSelection" style={{ color: "green" }}>
                Character Language: (Only English voice clone supported)
              </label>


              <div className="language-toggle">
                
                <div className={`tab ${!isMultilingual ? 'active' : ''}`} onClick={() => setIsMultilingual(false)}>
                  English
                </div>
                <div className={`tab ${isMultilingual ? 'active' : ''}`} onClick={() => {
                    setIsMultilingual(true);
                    showToast('Multilingual voice clone is not supported.', 'success');
                }}>
                  Multilingual
                </div>
              </div>

              {!isMultilingual && (
                <div className="form-group" style={{ position: 'relative' }}>
                  <label htmlFor="audioSelection">Select Audio:</label>
                  <div id="loadingSpinner-list" style={{ display: isLoadingAudios ? 'block' : 'none' }}>
                    🔄 Loading...
                  </div>
                  <select 
                    id="audioSelection" 
                    name="audio"
                    defaultValue=""
                    onChange={handleAudioSelection}
                    onFocus={() => {
                      if (!audioOptionsFetched) {
                        fetchAudioOptions();
                      }
                    }}
                    disabled={isLoadingAudios}
                  >
                    <option value="" disabled>Select Audio</option>
                    <option value="new" style={{ color: 'blue', fontWeight: 'bold' }}>
                      Upload New Audio
                    </option>
                    {audioOptions.map((audio, index) => (
                      <option 
                        key={index} 
                        value={audio.name} 
                        data-url={audio.voice_url} 
                        data-trans={audio.transcribe_text}
                      >
                        {audio.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!isMultilingual && (
                <div className="audio-upload" id="audioFileUpload">
                  <label htmlFor="audioFile">Click to Upload Audio File</label>
                  <input 
                    type="file" 
                    id="audioFile" 
                    name="audioFile" 
                    accept=".mp3, .wav, .aac, .ogg, .flac, .m4a" 
                    onChange={handleAudioChange}
                  />
                  <p id="audioFileName">{audioFileName}</p>
                </div>
              )}

            {!isMultilingual && (

              <div className="form-group">
                <textarea style={{ color: '#D3D3D3' }} id="AudioUrl" name="Audio_url" placeholder="Enter title" required readOnly></textarea>
              </div>
              )}

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Submit'}
              </button>
            </form>
          </div>

          <div className="form-container-audio" style={{ display: 'none' }}>
          <div className="pop-audio" id="audio-terms-popup" style={{ display: showAudioTermsPopup ? 'block' : 'none' }}>
    <div className="pop-content-audio">
      <p className="pop-heading-audio">⚠ Important Notice for Audio Upload ⚠</p>
      <p>By uploading audio to speakingcharacter.ai, you agree to these terms:</p>
      <ul>
        <li style={{ fontSize: '11px' }}>
          ❣You are responsible: All audio content you upload is your responsibility. 
          speakingcharacter.ai is not liable for user-uploaded content.
        </li>
        <li style={{ fontSize: '11px' }}>
          No harmful content: Do not upload offensive or abusive audio content.
        </li>
        <li style={{ fontSize: '11px' }}>
          Respect copyrights: Only upload audio that you have permission to use.
        </li>
        <li style={{ fontSize: '11px' }}>
          Voice consent required: If uploading real voices, you must have permission from the voice owner.
        </li>
        <li style={{ fontSize: '11px' }}>
          You accept all risks: You understand and accept responsibility for any consequences 
          that arise from the use of your uploaded audio.
        </li>
      </ul>
      <p style={{ fontSize: '15px' }}>
        Thank you for using speakingcharacter.ai responsibly!
      </p>
    </div>

    <div className="pop-button-wrapper-audio">
      <button className="pop-button-audio secondary" onClick={closeAudioTermsPopup}>
        Cancel
      </button>
      <button 
        className="pop-button-audio primary" 
        onClick={handleAudioTermsAccept}
        disabled={isLoading}
      >
        Accept & Create
      </button>
      <div 
        id="loadingSpinner-audio" 
        className="spinner" 
        style={{ display: isLoading ? 'block' : 'none' }}
      ></div>
    </div>
    
    <button className="exit-button-audio" onClick={closeAudioTermsPopup}>
      <svg height="20px" viewBox="0 0 384 512">
        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
      </svg>
    </button>
  </div>

            <form id="contentForm-audio" encType="multipart/form-data" method="POST" onSubmit={handleAudioSubmit}>
                <div className="image-upload">
                <img id="imageDisplay" src="https://cdn.iconscout.com/icon/free/png-256/free-audio-icon-download-in-svg-png-gif-file-formats--listen-media-music-ui-essence-pack-user-interface-icons-267545.png?f=webp&w=128" alt="Preview" />
                </div>

                <div className="form-title">Create New Audio</div>

                <div className="form-group-audio">
                <label htmlFor="title">Name of the Audio*</label>
                <input type="text" id="title" name="title" placeholder="Enter title" required />
                </div>

                <div className="audio-upload" id="audioFileUpload-audio" style={{ display: 'block' }}>
                <label htmlFor="audioFile-audio">Click to Upload Audio File</label>
                <input 
                    type="file" 
                    id="audioFile-audio" 
                    name="audioFile" 
                    accept=".mp3, .wav, .aac, .ogg, .flac, .m4a" 
                    onChange={handleAudioChange}
                    required
                />
                <p id="audioFileName-audio">{audioFileName}</p>
                </div>

                <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Submit'}
                </button>
            </form>
            </div>

          <div className="popup" id="popup">
            <h3>Describe Your Character</h3>
            <div className="description-text">
              My character's name is <input type="text" id="characterName" placeholder="name" />, a 
              <input type="text" id="characterAge" placeholder="age" /> year old 
              <input type="text" id="characterGender" placeholder="gender" /> who works as a 
              <input type="text" id="characterOccupation" placeholder="occupation" />. They are 
              <input type="text" id="characterHeight" placeholder="height" /> tall with 
              <input type="text" id="characterHair" placeholder="hair color" /> hair and 
              <input type="text" id="characterEyes" placeholder="eye color" /> eyes.
              <br />
              They are known for being <input type="text" id="characterPersonality" placeholder="personality trait" />, with strengths like 
              <input type="text" id="characterStrength" placeholder="strength" /> and weaknesses such as 
              <input type="text" id="characterWeakness" placeholder="weakness" />.
              <br />
              Originally from <input type="text" id="characterOrigin" placeholder="hometown" />, their journey includes 
              <input type="text" id="characterBackground" placeholder="significant event" />. They love to 
              <input type="text" id="characterHobby" placeholder="hobby" />, and their main goal is to 
              <input type="text" id="characterGoal" placeholder="goal" />.
            </div>
            <button 
              className="ok-btn" 
              onClick={(e) => {
                e.preventDefault();
                generatePrompt();
              }}
            >
              OK
            </button>
            <div className="generated-prompt" id="generatedPrompt"></div>
          </div>

          <div id="loading-spinner"></div>
          <div id="toast" className="toast"></div>
          
        </div>
      </IonContent>
    </IonPage>
  );
};

export default InsertCharacterPage;