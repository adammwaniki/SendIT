import React, { useState, useCallback } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import '../css/GetQuote.css';
//import {API_BASE_URL} from '../config';


const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

function GetQuote({ user }) {
  const [formData, setFormData] = useState({
    recipientCountry: '',
    recipientCity: '',
    recipientStreet: '',
    recipientZipcode: '',
    length: '',
    width: '',
    height: '',
    weight: ''
  });
  const [errors, setErrors] = useState({});
  const [quoteResult, setQuoteResult] = useState(null);
  const [directions, setDirections] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.recipientCountry) newErrors.recipientCountry = 'Country is required';
    if (!formData.recipientCity) newErrors.recipientCity = 'City is required';
    if (!formData.recipientStreet) newErrors.recipientStreet = 'Street is required';
    if (!formData.recipientZipcode) newErrors.recipientZipcode = 'Zipcode is required';
    if (!formData.length) newErrors.length = 'Length is required';
    if (!formData.width) newErrors.width = 'Width is required';
    if (!formData.height) newErrors.height = 'Height is required';
    if (!formData.weight) newErrors.weight = 'Weight is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateQuote = useCallback(() => {
    if (!validateForm()) return;

    const origin = `${user.city}, ${user.country}`;
    const destination = `${formData.recipientCity}, ${formData.recipientCountry}`;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          const distance = result.routes[0].legs[0].distance.value / 1000; // km
          const duration = result.routes[0].legs[0].duration.text;
          const cost = distance * 0.05; // $0.05 per km
          setQuoteResult({ distance, duration, cost });
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }, [formData, user]);

  return (
    <div className="get-quote">
      <h2>Get a Quote</h2>
      <div className="quote-form">
        <div className="form-fields">
          <div className="form-group">
            <label htmlFor="recipientCountry">Recipient Country:</label>
            <input
              type="text"
              id="recipientCountry"
              name="recipientCountry"
              value={formData.recipientCountry}
              onChange={handleInputChange}
            />
            {errors.recipientCountry && <span className="error">{errors.recipientCountry}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="recipientCity">Recipient City:</label>
            <input
              type="text"
              id="recipientCity"
              name="recipientCity"
              value={formData.recipientCity}
              onChange={handleInputChange}
            />
            {errors.recipientCity && <span className="error">{errors.recipientCity}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="recipientStreet">Recipient Street:</label>
            <input
              type="text"
              id="recipientStreet"
              name="recipientStreet"
              value={formData.recipientStreet}
              onChange={handleInputChange}
            />
            {errors.recipientStreet && <span className="error">{errors.recipientStreet}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="recipientZipcode">Recipient Zipcode:</label>
            <input
              type="text"
              id="recipientZipcode"
              name="recipientZipcode"
              value={formData.recipientZipcode}
              onChange={handleInputChange}
            />
            {errors.recipientZipcode && <span className="error">{errors.recipientZipcode}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="length">Length (cm):</label>
            <input
              type="number"
              id="length"
              name="length"
              value={formData.length}
              onChange={handleInputChange}
            />
            {errors.length && <span className="error">{errors.length}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="width">Width (cm):</label>
            <input
              type="number"
              id="width"
              name="width"
              value={formData.width}
              onChange={handleInputChange}
            />
            {errors.width && <span className="error">{errors.width}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="height">Height (cm):</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
            />
            {errors.height && <span className="error">{errors.height}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="weight">Weight (kg):</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
            />
            {errors.weight && <span className="error">{errors.weight}</span>}
          </div>
        </div>
        <button onClick={calculateQuote} className="generate-quote-btn">Generate Quotation</button>
      </div>
      {directions && (
        <div className="map-container">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={7}
            center={directions.routes[0].legs[0].start_location}
          >
            <DirectionsRenderer directions={directions} />
          </GoogleMap>
        </div>
      )}
      {quoteResult && (
        <div className="quote-result">
          <h3>Quotation Result</h3>
          <p>Distance: {quoteResult.distance.toFixed(2)} km</p>
          <p>Estimated Time: {quoteResult.duration}</p>
          <p>Estimated Cost: ${quoteResult.cost.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

export default GetQuote;