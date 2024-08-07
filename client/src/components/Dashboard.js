import React, { useState } from 'react';
import CreateOrder from './CreateOrder';
import GetQuote from './GetQuote';
import ViewOrders from './ViewOrders';
import avatarImage from '../assets/images/avartar.avif';
import '../css/Dashboard.css';

function Dashboard({ setIsUserSignedIn }) {
  const [activeLink, setActiveLink] = useState('Get a Quote');
  
  // This would typically come from your user state or context
  const user = {
    fullName: "John Doe",
    profileImage: avatarImage
  };

  const handleLogout = () => {
    setIsUserSignedIn(false);
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
          <img src={user.profileImage} alt="Profile" className="profile-image" />
          <p className="profile-name">{user.fullName}</p>
        </div>
        <div className="main-view">
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;