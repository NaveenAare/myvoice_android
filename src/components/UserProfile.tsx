import React, { useState, useEffect } from 'react';
import './UserProfile.css';

interface UserProfile {
  mail: string;
  name: string;
  profile_pic: string;
  userId: number;
}

interface ProfileDetails {
  code: string;
  created_date: string;
  id: number;
  image_url: string;
  name: string;
  summary1: string;
  summary2: string;
  transcribe_text: string;
  user_id: number;
  voice: string;
  voice_code: string;
  voice_url: string;
  welcome_message: string;
}

const UserProfile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileDetails, setProfileDetails] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          'https://speakingcharacter.ai/get/details/eyJ1c2VySWQiOiAzOCwgIm1haWwiOiAiaWFtc2FyYXRoY2hhbmRyYS44QGdtYWlsLmNvbSIsICJuYW1lIjogInNhcmF0aCBjaGFuZHJhIiwgInByb2ZpbGVfcGljIjogImh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0k2UENiZGMxOFp5NEEydmlnOUdabk5pQ3pBd3B5VGJxOFVycWdvM1lRY25ZWFZKVEM1PXM5Ni1jIn02YmUwYTQ1MDViNzQ4MDgwMDViZmFlMDQ5ZTc1YTczYWViYjdjMzBmZjJiZWRhZmZlMDE2NGE2OTE2MDI1OTBi'
        );
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const data = await response.json();
        setUserProfile(data); // Set user profile data
      } catch (err) {
        setError('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleViewProfile = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      // Construct the API endpoint using the userId from the userProfile
      const response = await fetch(
        `https://speakingcharacter.ai/get/firstSection/${userProfile.userId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch profile details');
      }

      const data = await response.json();
      console.log("data", data);
      setProfileDetails(data.data[0]); // Assuming the response contains an array of data
    } catch (err) {
      setError('Failed to fetch profile details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="user-profile-container">
      {userProfile && (
        <div className="profile-summary">
          <img src={userProfile.profile_pic} alt={userProfile.name} className="profile-pic" />
          <h2>{userProfile.name}</h2>
          <p>Email: {userProfile.mail}</p>
          <button onClick={handleViewProfile} className="view-profile-button">
            View Profile
          </button>
        </div>
      )}

      {profileDetails && (
        <div className="profile-details">
          <h3>{profileDetails.name}</h3>
          <img src={profileDetails.image_url} alt={profileDetails.name} className="profile-details-image" />
          <p>{profileDetails.summary1}</p>
          <p>{profileDetails.summary2}</p>
          <audio controls>
            <source src={profileDetails.voice_url} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
