import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import '../../css/OrderItemCard.css';

const containerStyle = {
  width: '100%',
  height: '100%'
};

function OrderItemCard({ parcel, onCancel, onUpdateDestination }) {
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [mapCenter, setMapCenter] = useState(null);
  const [showSender, setShowSender] = useState(false);
  const [showRecipient, setShowRecipient] = useState(false);

  const userLocation = `${parcel.user.city}, ${parcel.user.country}`;
  const recipientLocation = `${parcel.recipient.city}, ${parcel.recipient.country}`;

  useEffect(() => {
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
  }, [userLocation, recipientLocation]);

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
          <button onClick={() => onCancel(parcel.id)} className="cancel-button">Cancel Order</button>
          <button onClick={() => onUpdateDestination(parcel.id, prompt('Enter new destination'))} className="update-button">
            Update Destination
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderItemCard;