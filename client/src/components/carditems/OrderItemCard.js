import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import '../../css/OrderItemCard.css';

function OrderItemCard({ order, onCancel, onUpdateDestination }) {
  const [newDestination, setNewDestination] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [directions, setDirections] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleUpdateClick = () => {
    if (isUpdating) {
      onUpdateDestination(order.id, newDestination);
      setIsUpdating(false);
    } else {
      setIsUpdating(true);
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '200px'
  };

  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
    }
  }, []);

  const fetchDirections = useCallback(() => {
    if (!isLoaded) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: order.currentLocation,
        destination: order.destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          const route = result.routes[0];
          if (route && route.overview_path) {
            const midpoint = route.overview_path[Math.floor(route.overview_path.length / 2)];
            setMapCenter({ lat: midpoint.lat(), lng: midpoint.lng() });
          }
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }, [order.currentLocation, order.destination, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      fetchDirections();
    }
  }, [fetchDirections, isLoaded]);

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="order-item-card">
      <div className="map-container">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={7}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#FF0000",
                  strokeOpacity: 0.8,
                  strokeWeight: 3,
                },
              }}
            />
          )}
          <Marker 
            position={directions?.routes[0]?.legs[0]?.start_location}
            label="C"
          />
          <Marker 
            position={directions?.routes[0]?.legs[0]?.end_location}
            label="D"
          />
        </GoogleMap>
      </div>
      <div className="order-details">
        <h3>Order Number {order.id}</h3>
        <ul>
          <li>Status: {order.status}</li>
          <li>Destination: {isUpdating ? 
            <input 
              type="text" 
              value={newDestination} 
              onChange={(e) => setNewDestination(e.target.value)}
            /> : 
            order.destination}
          </li>
          <li>Current Location: {order.currentLocation}</li>
          {directions && (
            <li>Estimated Distance: {directions.routes[0].legs[0].distance.text}</li>
          )}
          {directions && (
            <li>Estimated Duration: {directions.routes[0].legs[0].duration.text}</li>
          )}
        </ul>
        <div className="button-container">
          <button 
            className="update-btn" 
            onClick={handleUpdateClick}
          >
            {isUpdating ? 'Confirm Update' : 'Update Destination'}
          </button>
          <button 
            className="cancel-btn" 
            onClick={() => onCancel(order.id)}
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderItemCard;