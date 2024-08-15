import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './NavigationPanel.css';
import {API_BASE_URL} from '../config';

//const API_BASE_URL = process.env.REACT_APP_API_BASE_URL


const NavigationPanel = ({ activeLink, setActiveLink, setIsUserSignedIn }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if the current route matches the 'Manage Orders' route
  const isManageOrdersActive = location.pathname.startsWith(`/admin/manage-orders`);
  
  // Determine if the current route matches the 'View Orders' route
  const isViewOrdersActive = location.pathname === `/admin/view-orders`;

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setIsUserSignedIn(false);
        navigate(`/`); // Redirect to login page after successful logout
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <div className="navigation-panel">
      <div className="navigation-header">
        <h1 className="navigation-title">Admin Panel</h1>
      </div>
      <nav className="nav-links">
        <Link
          to={`/admin/view-orders`}
          className={`nav-link ${isViewOrdersActive ? 'active' : ''}`}
          onClick={() => setActiveLink('View Orders')}
        >
          View Orders
        </Link>
        <Link
          to="#"
          className={`nav-link ${isManageOrdersActive ? 'active' : ''}`}
        >
          Manage Orders
        </Link>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </div>
  );
};

export default NavigationPanel;
