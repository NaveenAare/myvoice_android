import React, { useState, useEffect } from 'react';
import './SpecialSectionContainer.css';

interface SpecialSection {
  category: string;
  code: string;
  id: string;
  image_url: string;
  name: string;
  summary2: string;
}

const SpecialSectionsComponent: React.FC = () => {
  const [specialSections, setSpecialSections] = useState<SpecialSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialSections = async () => {
      try {
        const response = await fetch('https://speakingcharacter.ai/get/specialSection');
        if (!response.ok) {
          throw new Error('Failed to fetch special sections');
        }
        const data = await response.json();
        setSpecialSections(data.data); // Assuming the data is in the 'data' field
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchSpecialSections();
  }, []);

  if (loading) {
    return <p>Loading special sections...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="special-sections-container">
      <div className="special-sections-cards">
        {specialSections.map((section) => (
          <div className="special-section-card" key={section.id}>
            <img
              src={section.image_url}
              alt={section.name}
              className="special-section-image"
            />
            <div className="special-section-info">
              <h3 className="special-section-title">{section.name}</h3>
              <p className="special-section-summary">{section.summary2}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialSectionsComponent;
