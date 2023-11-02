import React, { useState } from 'react';

const SpotifyLogin: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // handle login logic here
  };

  return (
    <>
      <button onClick={() => setShowPopup(true)}>Login to Spotify</button>
      {showPopup && (
        <div className="popup">
          <div className="popup-inner">
            <h2>Spotify Login</h2>
            <form onSubmit={handleLogin}>
              <label>
                Username:
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
              </label>
              <label>
                Password:
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              <button type="submit">Login</button>
            </form>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default SpotifyLogin;
