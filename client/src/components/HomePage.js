import React, { useState } from 'react';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import '../css/Homepage.css';
import logo from '../assets/images/favicon.ico';

function Homepage({ setIsUserSignedIn }) {
    const [activePage, setActivePage] = useState('home');
  
    const handleSignIn = () => {
      // This would typically involve authentication logic
      setIsUserSignedIn(true);
    };

  return (
    <div className="homepage">
      <header>
        <img src={logo} alt="SendIT Logo" className="logo" />
        <h2 className="title">SendIT</h2>
      </header>
      <main>
        {activePage === 'home' && <Home setActivePage={setActivePage} />}
        {activePage === 'register' && <Register setActivePage={setActivePage} />}
        {activePage === 'login' && <Login setActivePage={setActivePage} onSignIn={handleSignIn} />}
      </main>
      <footer>
        <p>SendIT: Delivering Smiles. One Parcel at a Time!</p>
      </footer>
    </div>
  );
}

export default Homepage;