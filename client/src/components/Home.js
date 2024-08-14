import React from 'react';
import '../css/Home.css';
//import {API_BASE_URL} from '../config';


function Home({ setActivePage }) {
  return (
    <div className="home">
      <p className="slogan">
        Got a package? <span className="highlight">Let's SendIT</span> for you!
      </p>
      <div className="buttons">
        <button onClick={() => setActivePage('register')}>Sign Up</button>
        <button onClick={() => setActivePage('login')}>Login</button>
      </div>
    </div>
  );
}

export default Home;