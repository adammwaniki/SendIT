import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateOrder from './CreateOrder';
import GetQuote from './GetQuote';
import ViewOrders from './ViewOrders';
import avatarImage from '../assets/images/avartar.avif';
import '../css/Dashboard.css';

function Dashboard({ setIsUserSignedIn }) {
  const [activeLink, setActiveLink] = useState('Get a Quote');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/check_session', {
          method: 'GET',
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // If there's no active session, redirect to login
          setIsUserSignedIn(false);
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsUserSignedIn(false);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [setIsUserSignedIn, navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setIsUserSignedIn(false);
        navigate('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const renderActiveComponent = () => {
    switch(activeLink) {
      case 'Get a Quote':
        return <GetQuote />;
      case 'Create Order':
        return <CreateOrder />;
      case 'View Orders':
        return <ViewOrders />;
      default:
        return <GetQuote />;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          <span className="highlight">SendIT</span> Dashboard
        </h1>
        <nav className="dashboard-nav">
          {['Get a Quote', 'Create Order', 'View Orders'].map((link) => (
            <button
              key={link}
              className={`nav-link ${activeLink === link ? 'active' : ''}`}
              onClick={() => setActiveLink(link)}
            >
              {link}
            </button>
          ))}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>
      <main className="dashboard-content">
        <div className="profile-view">
          <img src={user.profileImage || avatarImage} alt="Profile" className="profile-image" />
          <p className="profile-name">{`${user.first_name} ${user.last_name}`}</p>
        </div>
        <div className="main-view">
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;