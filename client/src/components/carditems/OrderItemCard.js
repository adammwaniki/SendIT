import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import '../../css/OrderItemCard.css';
import {API_BASE_URL} from '../../config';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const DESTINATION_CHANGE_FINE = 20; // $20 fine for changing destination
//const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

function OrderItemCard({ parcel, onCancel, onUpdateDestination }) {
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [mapCenter, setMapCenter] = useState(null);
  const [showSender, setShowSender] = useState(false);
  const [showRecipient, setShowRecipient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatedRecipient, setUpdatedRecipient] = useState({
    city: parcel.recipient.city,
    country: parcel.recipient.country,
    street: parcel.recipient.street,
    zip_code: parcel.recipient.zip_code,
    state: parcel.recipient.state
  });

  const popupRef = useRef(null);

  const userLocation = `${parcel.user.city}, ${parcel.user.country}`;
  const recipientLocation = `${parcel.recipient.city}, ${parcel.recipient.country}`;

  useEffect(() => {
    updateDirections();
  }, [parcel.recipient]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsUpdating(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef]);

  const isDelivered = parcel.status === "Delivered";

  const updateDirections = () => {
    if (window.google) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userLocation,
          destination: recipientLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            const route = result.routes[0];
            const distanceInKm = route.legs[0].distance.value / 1000; // Convert meters to kilometers
            setDistance(route.legs[0].distance.text);
            setDuration(route.legs[0].duration.text);
            
            const bounds = new window.google.maps.LatLngBounds();
            route.legs[0].steps.forEach((step) => {
              bounds.extend(step.start_location);
              bounds.extend(step.end_location);
            });
            setMapCenter(bounds.getCenter());
          } else {
            console.error('Directions request failed due to ' + status);
          }
        }
      );
    }
  };

  const calculateCost = (distanceInKm) => {
    return (0.05 * distanceInKm).toFixed(2);
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setIsLoading(true);
      setError(null);
      try {
        await onCancel(parcel.id);
      } catch (error) {
        console.error('Error cancelling order:', error);
        setError('Failed to cancel order. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateDestination = async (e) => {
    e.preventDefault();
    if (window.confirm(`Updating the destination will incur a $${DESTINATION_CHANGE_FINE} fine in addition to any changes in shipping cost. Do you want to proceed?`)) {
      setIsLoading(true);
      setError(null);
      try {
        // First, update the recipient information
        const recipientResponse = await fetch(`${API_BASE_URL}/recipients/${parcel.recipient_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedRecipient),
          credentials: 'include',
        });

        if (!recipientResponse.ok) {
          throw new Error('Failed to update recipient information');
        }

        const updatedRecipientData = await recipientResponse.json();

        // Now, calculate the new cost
        const directionsService = new window.google.maps.DirectionsService();
        const result = await new Promise((resolve, reject) => {
          directionsService.route(
            {
              origin: userLocation,
              destination: `${updatedRecipientData.city}, ${updatedRecipientData.country}`,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                resolve(result);
              } else {
                reject(new Error('Failed to calculate new route'));
              }
            }
          );
        });

        const distanceInKm = result.routes[0].legs[0].distance.value / 1000;
        const newCost = parseFloat(calculateCost(distanceInKm)) + DESTINATION_CHANGE_FINE;

        // Update the parcel with the new cost
        const parcelResponse = await fetch(`${API_BASE_URL}/parcels/${parcel.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            cost: newCost.toFixed(2),
            recipient_id: updatedRecipientData.id 
          }),
          credentials: 'include',
        });

        if (!parcelResponse.ok) {
          throw new Error('Failed to update parcel information');
        }

        const updatedParcel = await parcelResponse.json();
        
        onUpdateDestination(updatedParcel);
        setIsUpdating(false);
        updateDirections();
      } catch (error) {
        console.error('Error updating destination:', error);
        setError(error.message || 'An unexpected error occurred while updating the destination');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedRecipient(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="order-item-card">
      <div className="map-container">
        {mapCenter && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={10}
          >
            {directions && (
              <>
                <Marker position={directions.routes[0].legs[0].start_location} label="S" />
                <Marker position={directions.routes[0].legs[0].end_location} label="R" />
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: "#FF0000",
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                    },
                  }}
                />
              </>
            )}
          </GoogleMap>
        )}
      </div>
      <div className="details-container">
        <div className="parcel-details">
          <h3>Parcel ID: {parcel.id}</h3>
          <p><strong>Tracking Number:</strong> {parcel.tracking_number}</p>
          <p><strong>Status:</strong> {parcel.status}</p>
          <p><strong>Cost:</strong> ${parcel.cost}</p>
          <p><strong>Dimensions:</strong> {parcel.length}" x {parcel.width}" x {parcel.height}"</p>
          <p><strong>Weight:</strong> {parcel.weight} lbs</p>
          <p><strong>Estimated Distance:</strong> {distance}</p>
          <p><strong>Estimated Duration:</strong> {duration}</p>
          
          <div className="address-section">
            <button onClick={() => setShowSender(!showSender)} className="toggle-button">
              {showSender ? 'Hide Sender Info' : 'Show Sender Info'}
            </button>
            {showSender && (
              <div className="address-details">
                <h4>Sender:</h4>
                <p>{parcel.user.first_name} {parcel.user.last_name}</p>
                <p>{parcel.user.street}, {parcel.user.city}, {parcel.user.state} {parcel.user.zip_code}</p>
                <p>{parcel.user.country}</p>
              </div>
            )}
          </div>
          
          <div className="address-section">
            <button onClick={() => setShowRecipient(!showRecipient)} className="toggle-button">
              {showRecipient ? 'Hide Recipient Info' : 'Show Recipient Info'}
            </button>
            {showRecipient && (
              <div className="address-details">
                <h4>Recipient:</h4>
                <p>{parcel.recipient.first_name} {parcel.recipient.last_name}</p>
                <p>{parcel.recipient.street}, {parcel.recipient.city}, {parcel.recipient.state} {parcel.recipient.zip_code}</p>
                <p>{parcel.recipient.country}</p>
              </div>
            )}
          </div>
        </div>
        <div className="action-buttons">
        <button 
          onClick={handleCancel} 
          className={`cancel-button ${isDelivered ? 'disabled' : ''}`} 
          disabled={isLoading || isDelivered}
        >
          {isLoading ? 'Cancelling...' : 'Cancel Order'}
        </button>
        <button 
          onClick={() => setIsUpdating(true)} 
          className={`update-button ${isDelivered ? 'disabled' : ''}`}
          disabled={isDelivered}
        >
          Update Destination
        </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
      {isUpdating && (
        <div className="popup-backdrop">
          <div className="popup" ref={popupRef}>
            <h3>Update Destination</h3>
            <p className="warning">Note: Updating the destination will incur a ${DESTINATION_CHANGE_FINE} fine in addition to any changes in shipping cost.</p>
            <form onSubmit={handleUpdateDestination} className="update-form">
              <input
                type="text"
                name="street"
                value={updatedRecipient.street}
                onChange={handleInputChange}
                placeholder="Street"
                required
              />
              <input
                type="text"
                name="city"
                value={updatedRecipient.city}
                onChange={handleInputChange}
                placeholder="City"
                required
              />
              <input
                type="text"
                name="state"
                value={updatedRecipient.state}
                onChange={handleInputChange}
                placeholder="State"
                required
              />
              <input
                type="text"
                name="zip_code"
                value={updatedRecipient.zip_code}
                onChange={handleInputChange}
                placeholder="ZIP Code"
                required
              />
              <input
                type="text"
                name="country"
                value={updatedRecipient.country}
                onChange={handleInputChange}
                placeholder="Country"
                required
              />
              <div className="popup-buttons">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Confirm Update'}
                </button>
                <button type="button" onClick={() => setIsUpdating(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderItemCard;