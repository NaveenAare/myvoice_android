import React, { useState, useEffect, useCallback } from 'react';
import './SearchContainer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';

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
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

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

  const fetchCharacters = async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      setShowOverlay(false);
      return;
    }

    setLoading(true);
    setError(null);
    setShowOverlay(true);

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
    setShowResults(value.length > 0);
    debouncedFetch(value);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowOverlay(false);
    setShowResults(false);
  };

  return (
    <div className={`search-container-main-page ${showOverlay ? 'overlay-active' : ''}`}>
      {showOverlay && <div className="search-overlay" onClick={clearSearch}></div>}
      <div className="search-input-wrapper">
        <span className="search-icon magnifier-icon">
          <FontAwesomeIcon icon={faSearch} />
        </span>
        <input
          type="text"
          className="search-input-main-page"
          placeholder="Search characters..."
          value={query}
          onChange={handleInputChange}
        />
        {query && (
          <span className="search-icon cross-icon" onClick={clearSearch}>
            <FontAwesomeIcon icon={faTimes} />
          </span>
        )}
      </div>
      {loading && <p className="search-loading">Loading...</p>}
      {error && <p className="search-error">{error}</p>}
      {showResults && (
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
