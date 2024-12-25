import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner } from '@ionic/react';
import { useParams } from 'react-router-dom';

interface ChatScreenParams {
  charId: string;
}

interface ChatData {
  char_data: {
    char_voice_name: string;
    char_voice_trans: string;
    char_voice_url: string;
    image_url: string;
    name: string;
    welcome_message: string;
  };
  chats: {
    id: number;
    is_user: number;
    text: string;
  }[];
}

const ChatScreen: React.FC = () => {
  const { charId } = useParams<ChatScreenParams>();
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authToken = 'eyJ1c2VySWQiOiAzOCwgIm1haWwiOiAiaWFtc2FyYXRoY2hhbmRyYS44QGdtYWlsLmNvbSIsICJuYW1lIjogInNhcmF0aCBjaGFuZHJhIiwgInByb2ZpbGVfcGljIjogImh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0k2UENiZGMxOFp5NEEydmlnOUdabk5pQ3pBd3B5VGJxOFVycWdvM1lRY25ZWFZKVEM1PXM5Ni1jIn02YmUwYTQ1MDViNzQ4MDgwMDViZmFlMDQ5ZTc1YTczYWViYjdjMzBmZjJiZWRhZmZlMDE2NGE2OTE2MDI1OTBi'; // Replace with your actual authToken
    fetch(`https://speakingcharacter.ai/get_messages?authToken=${authToken}&charId=${charId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch chat data');
        }
        return response.json();
      })
      .then((data) => {
        setChatData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, [charId]);

useEffect(() => {
    console.log('Fetching chat data...');
    const authToken = 'eyJ1c2VySWQiOiAzOCwgIm1haWwiOiAiaWFtc2FyYXRoY2hhbmRyYS44QGdtYWlsLmNvbSIsICJuYW1lIjogInNhcmF0aCBjaGFuZHJhIiwgInByb2ZpbGVfcGljIjogImh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0k2UENiZGMxOFp5NEEydmlnOUdabk5pQ3pBd3B5VGJxOFVycWdvM1lRY25ZWFZKVEM1PXM5Ni1jIn02YmUwYTQ1MDViNzQ4MDgwMDViZmFlMDQ5ZTc1YTczYWViYjdjMzBmZjJiZWRhZmZlMDE2NGE2OTE2MDI1OTBi'; // Replace with your actual authToken
    fetch(`https://speakingcharacter.ai/get_messages?authToken=${authToken}&charId=${charId}`)
        .then((response) => {
            console.log('Response received:', response);
            if (!response.ok) {
                throw new Error('Failed to fetch chat data');
            }
            return response.json();
        })
        .then((data) => {
            console.log('Data received:', data);
            setChatData(data);
            setLoading(false);
        })
        .catch((error) => {
            console.error('Error fetching chat data:', error);
            setError(error.message);
            setLoading(false);
        });
}, [charId]);

if (loading) {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Loading...</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonSpinner />
            </IonContent>
        </IonPage>
    );
}

  if (error) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Error</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <p>{error}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{chatData?.char_data.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <img src={chatData?.char_data.image_url} alt={chatData?.char_data.name} />
        <p>{chatData?.char_data.welcome_message}</p>
        <audio controls>
          <source src={chatData?.char_data.char_voice_url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <div>
          {chatData?.chats.map((chat) => (
            <div key={chat.id} className={chat.is_user ? 'user-chat' : 'character-chat'}>
              {chat.text}
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ChatScreen;
