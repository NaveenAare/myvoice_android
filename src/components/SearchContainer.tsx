import React, { useState, useEffect, useCallback } from 'react';
import './SearchContainer.css';

interface Character {
  category: string;
  code: string;
  id: string;
  image_url: string;
  name: string;
  summary2: string;
}

const SearchCharacters: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce logic using useCallback
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const fetchCharacters = async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://speakingcharacter.ai/character/search?query=${searchQuery}`);
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }
      const data = await response.json();
      setResults(data.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchCharacters, 500), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetch(value);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search characters..."
        value={query}
        onChange={handleInputChange}
      />
      {loading && <p className="search-loading">Loading...</p>}
      {error && <p className="search-error">{error}</p>}
      {results.length > 0 && (
        <ul className="search-results-dropdown">
          {results.map((character) => (
            <li key={character.id} className="search-result-item">
              <img
                src={character.image_url}
                alt={character.name}
                className="search-result-image"
              />
              <div className="search-result-info">
                <p className="search-result-name">{character.name}</p>
                <p className="search-result-summary">{character.summary2}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchCharacters;
