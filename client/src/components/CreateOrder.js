import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import '../css/CreateOrder.css';
import {API_BASE_URL} from '../config';

//const API_BASE_URL = process.env.REACT_APP_API_BASE_URL


const validationSchema = Yup.object({
  first_name: Yup.string().required('Required'),
  last_name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email address').required('Required'),
  phone_number: Yup.string().required('Required'),
  street: Yup.string().required('Required'),
  city: Yup.string().required('Required'),
  state: Yup.string().required('Required'),
  zip_code: Yup.string().required('Required'),
  country: Yup.string().required('Required'),
});

const parcelValidationSchema = Yup.object({
  length: Yup.number().positive('Must be positive').required('Required'),
  width: Yup.number().positive('Must be positive').required('Required'),
  height: Yup.number().positive('Must be positive').required('Required'),
  weight: Yup.number().positive('Must be positive').required('Required'),
});

function CreateOrder({ user }) {
  const [recipientCreated, setRecipientCreated] = useState(false);
  const [recipientId, setRecipientId] = useState(null);
  const [parcelCreated, setParcelCreated] = useState(false);
  const [cost, setCost] = useState(null);
  const [directions, setDirections] = useState(null);

  const recipientFormik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch(`${API_BASE_URL}/recipients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
          setRecipientId(data.id);
          setRecipientCreated(true);
        } else {
          console.error('Failed to create recipient:', data.message);
        }
      } catch (error) {
        console.error('Error creating recipient:', error);
      }
    },
  });

  const parcelFormik = useFormik({
    initialValues: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    validationSchema: parcelValidationSchema,
    onSubmit: async (values) => {
      try {
        const distance = await calculateDistance(user.city, user.country, recipientFormik.values.city, recipientFormik.values.country);
        const calculatedCost = calculateCost(distance);
        setCost(calculatedCost);

        const parcelData = {
          recipient_id: recipientId,
          length: parseFloat(values.length),
          width: parseFloat(values.width),
          height: parseFloat(values.height),
          weight: parseFloat(values.weight),
          cost: calculatedCost,
          status: 'pending'
        };

        const response = await fetch(`${API_BASE_URL}/parcels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parcelData),
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
          setParcelCreated(true);
        } else {
          console.error('Failed to create parcel:', data.message);
        }
      } catch (error) {
        console.error('Error creating parcel:', error);
      }
    },
  });

  const calculateDistance = (originCity, originCountry, destCity, destCountry) => {
    return new Promise((resolve, reject) => {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: `${originCity}, ${originCountry}`,
          destination: `${destCity}, ${destCountry}`,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            const distance = result.routes[0].legs[0].distance.value / 1000; // Convert to km
            resolve(distance);
          } else {
            reject('Failed to calculate distance');
          }
        }
      );
    });
  };

  /*const calculateCost = (distance, parcel) => {
    const volumetricWeight = (parcel.length * parcel.width * parcel.height) / 5000;
    const chargeableWeight = Math.max(volumetricWeight, parcel.weight);
    return parseFloat((distance * 0.1 + chargeableWeight * 2).toFixed(2));
  };*/
  const calculateCost = (distance) => {
  
    return parseFloat((distance * 0.05).toFixed(2));
  };

  return (
    <div className="create-order">
      <h2>Create Order</h2>
      {!recipientCreated ? (
        <form onSubmit={recipientFormik.handleSubmit} className="order-form">
          <div className="form-fields">
            {Object.keys(recipientFormik.values).map((field) => (
              <div key={field} className="form-group">
                <label htmlFor={field}>{field.replace('_', ' ').toUpperCase()}</label>
                <input
                  id={field}
                  name={field}
                  type="text"
                  onChange={recipientFormik.handleChange}
                  onBlur={recipientFormik.handleBlur}
                  value={recipientFormik.values[field]}
                />
                {recipientFormik.touched[field] && recipientFormik.errors[field] ? (
                  <div className="error">{recipientFormik.errors[field]}</div>
                ) : null}
              </div>
            ))}
          </div>
          <button type="submit" className="submit-button" disabled={recipientCreated}>Add Recipient</button>
        </form>
      ) : !parcelCreated ? (
        <form onSubmit={parcelFormik.handleSubmit} className="order-form">
          <div className="form-fields">
            {Object.keys(parcelFormik.values).map((field) => (
              <div key={field} className="form-group">
                <label htmlFor={field}>{field.toUpperCase()}</label>
                <input
                  id={field}
                  name={field}
                  type="number"
                  onChange={parcelFormik.handleChange}
                  onBlur={parcelFormik.handleBlur}
                  value={parcelFormik.values[field]}
                />
                {parcelFormik.touched[field] && parcelFormik.errors[field] ? (
                  <div className="error">{parcelFormik.errors[field]}</div>
                ) : null}
              </div>
            ))}
          </div>
          <button type="submit" className="submit-button">Add Parcel</button>
        </form>
      ) : (
        <div className="order-summary">
          <h3>Order Created Successfully</h3>
          <p>Cost: ${cost}</p>
          {directions && (
            <div className="map-container">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '400px' }}
                zoom={7}
                center={directions.routes[0].legs[0].start_location}
              >
                <DirectionsRenderer directions={directions} />
              </GoogleMap>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CreateOrder;