import React, { useState, useEffect } from 'react';
import OrderItemCard from './carditems/OrderItemCard';
import '../css/ViewOrders.css';

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
      const response = await fetch(`/parcels?user_id=${user.id}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch parcels');
      }
      const data = await response.json();
      setParcels(data);
      setFilteredParcels(data);
    } catch (err) {
      setError('Failed to load parcels. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCancelOrder = async (id) => {
    // Implement cancel functionality if needed
  };

  const handleUpdateDestination = async (id, newDestination) => {
    // Implement update destination functionality if needed
  };

  if (isLoading) return <div>Loading parcels...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="view-orders">
      <h2>Your Parcels</h2>
      {/*<div className="search-container">
        <input
          type="text"
          placeholder="Search by tracking number"
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>*/}
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
          <p>No parcels found.</p>
        ) : (
          filteredParcels.map(parcel => (
            <OrderItemCard 
              key={parcel.id}
              parcel={parcel}
              onCancel={handleCancelOrder}
              onUpdateDestination={handleUpdateDestination}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ViewOrders;