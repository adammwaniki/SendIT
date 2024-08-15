import React, { useState, useEffect } from 'react';
import OrderItemCard from './carditems/OrderItemCard';
import '../css/ViewOrders.css';
import {API_BASE_URL} from '../config';

//const API_BASE_URL = process.env.REACT_APP_API_BASE_URL


function ViewOrders({ user }) {
  const [parcels, setParcels] = useState([]);
  const [filteredParcels, setFilteredParcels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && user.id) {
      fetchParcels();
    }
  }, [user]);

  useEffect(() => {
    const results = parcels.filter(parcel =>
      parcel.tracking_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredParcels(results);
  }, [searchTerm, parcels]);

  const fetchParcels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/user/parcels`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch parcels');
      }
      const data = await response.json();
      setParcels(data);
      setFilteredParcels(data);
    } catch (err) {
      console.error('Error fetching parcels:', err);
      setError('Failed to load parcels. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleParcelCancelled = async (cancelledParcelId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/parcels/${cancelledParcelId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to cancel parcel');
      }
      setParcels(prevParcels => prevParcels.filter(parcel => parcel.id !== cancelledParcelId));
    } catch (err) {
      console.error('Error cancelling parcel:', err);
      setError('Failed to cancel parcel. Please try again later.');
    }
  };

  const handleUpdateDestination = (updatedParcel) => {
    setParcels(prevParcels => prevParcels.map(parcel => 
      parcel.id === updatedParcel.id ? updatedParcel : parcel
    ));
  };

  if (isLoading) return <div className="loading">Loading parcels...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="view-orders">
      <h2>Your Parcels</h2>
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search by tracking number"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <i className="fa fa-search search-icon"></i>
        </div>
      </div>
      <div className="orders-list">
        {filteredParcels.length === 0 ? (
          <p className="no-parcels">No parcels found.</p>
        ) : (
          filteredParcels.map(parcel => (
            <OrderItemCard 
              key={parcel.id}
              parcel={parcel}
              onCancel={handleParcelCancelled}
              onUpdateDestination={handleUpdateDestination}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ViewOrders;