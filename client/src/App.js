
import React, { useState } from 'react';
import { LoadScript } from '@react-google-maps/api';
import Homepage from './components/HomePage'
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);

  //AlphaG
  return (
    <LoadScript
      googleMapsApiKey="AIzaSyBZrvf_oBQ0EmEtg8jpDe5e6hki1swgMJQ"
      libraries={["geometry", "drawing", "places", "directions"]}
    >
      <div className="App">
        {isUserSignedIn ? (
          <Dashboard setIsUserSignedIn={setIsUserSignedIn} />
        ) : (
          <Homepage setIsUserSignedIn={setIsUserSignedIn} />
        )}
      </div>
    </LoadScript>
  );
}

export default App;
