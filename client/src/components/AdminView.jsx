import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash/debounce';
import '../css/AdminView.css'; // Import the CSS file
import {API_BASE_URL} from '../config';

//const API_BASE_URL = process.env.REACT_APP_API_BASE_URL


const AdminView = () => {
  const [parcels, setParcels] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLink, setActiveLink] = useState('View Orders'); // Set default active link

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/parcels`); // API returns all parcels
        setParcels(response.data);
      } catch (error) {
        setError('Error fetching parcels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchParcels();
  }, []);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value);
    }, 180),
    []
  );

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const filteredParcels = useMemo(() =>
    parcels.filter(parcel => {
      const { user, recipient, tracking_number } = parcel;
      const senderFullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const recipientFullName = `${recipient.first_name} ${recipient.last_name}`.toLowerCase();
      const searchLower = search.toLowerCase();

      return (
        senderFullName.includes(searchLower) ||
        recipientFullName.includes(searchLower) ||
        tracking_number.toLowerCase().includes(searchLower)
      );
    }),
    [parcels, search]
  );

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'DELETE',
        credentials: 'include' // Include credentials (cookies) with the request
      });
      if (response.ok) {
        window.location.href = `/login`; // Redirect to login page after successful logout
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) return <p>Loading parcels...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <div className="admin-view">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-title">Admin Dashboard</div>
          <div className="navbar-nav">
            <Link to={`/admin/view-orders`} className={`nav-link ${activeLink === 'View Orders' ? 'active' : ''}`}>View Orders</Link>
            {/* Removed link to Manage Order due to undefined parcel */}
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-content">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/728315a4dee7886052f73849805a080167688f2df94a767b1b67861977e91d84?placeholderIfAbsent=true&apiKey=b545975d9f754beeb076956d4ffba058"
            className="search-icon"
            alt="Search Icon"
          />
          <input
            type="text"
            placeholder="Search by sender, recipient, or tracking number"
            value={search}
            onChange={handleSearchChange}
            aria-label="Search parcels"
            className="search-input"
          />
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/8078b41ec0fe3376c595ddb828f65d73a14699d5cbf96954433302b524a7c6fc?placeholderIfAbsent=true&apiKey=b545975d9f754beeb076956d4ffba058"
            className="search-trailing-icon"
            alt="Trailing Icon"
          />
        </div>
      </div>

      {/* Parcel List */}
      <div className="parcel-list-a">
        {filteredParcels.length === 0 ? (
          <p>No parcels found</p>
        ) : (
          filteredParcels.map(parcel => (
            <div key={parcel.id} className="parcel-item-a">
              <div className="parcel-details-a">
                <div className="parcel-detail-a">
                  <label>Tracking Number:</label>
                  <div className="parcel-detail-value-a">{parcel.tracking_number}</div>
                </div>
                <div className="parcel-detail-a">
                  <label>From:</label>
                  <div className="parcel-detail-value-a">{`${parcel.user.first_name} ${parcel.user.last_name}`}</div>
                </div>
                <div className="parcel-detail-a">
                  <label>To:</label>
                  <div className="parcel-detail-value-a">{`${parcel.recipient.first_name} ${parcel.recipient.last_name}`}</div>
                </div>
                <Link to={`/admin/manage-orders/${parcel.id}`} className="manage-link">Manage</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminView;
