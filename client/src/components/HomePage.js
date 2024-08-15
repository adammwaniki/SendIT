import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import '../css/Homepage.css';
import logo from '../assets/images/favicon.ico';
import {API_BASE_URL} from '../config';

//const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

function Homepage({ setIsUserSignedIn, initialPage = 'home' }) {
    const [activePage, setActivePage] = useState(initialPage);
    const navigate = useNavigate();
  
    useEffect(() => {
      setActivePage(initialPage);
    }, [initialPage]);

    const handleSignIn = () => {
      setIsUserSignedIn(true);
      navigate(`/dashboard`);
    };

    const handleRegisterSuccess = () => {
      setActivePage('login');
    };

  return (
    <div className="homepage">
      <header>
        <img src={logo} alt="SendIT Logo" className="logo" />
        <h2 className="title">SendIT</h2>
      </header>
      <main>
        {activePage === 'home' && <Home setActivePage={setActivePage} />}
        {activePage === 'register' && <Register setActivePage={setActivePage} onRegisterSuccess={handleRegisterSuccess} />}
        {activePage === 'login' && <Login setActivePage={setActivePage} onSignIn={handleSignIn} />}
      </main>
      <footer>
        <p>SendIT :  Delivering Smiles One Parcel at a Time!</p>
      </footer>
    </div>
  );
}

export default Homepage;