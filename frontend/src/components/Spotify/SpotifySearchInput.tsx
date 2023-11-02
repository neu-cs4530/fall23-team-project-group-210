import React, { useState } from 'react';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const SpotifySearchInput: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    // TODO: implement search logic here
  };

  const handlePlay = async () => {
    // TODO: handle play logic here
  };

  return (
    <div>
      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {searchResults.map(track => (
          <li>
            // TODO: display track name, artist, and album art here
            <button onClick={handlePlay}>Play</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SpotifySearchInput;
