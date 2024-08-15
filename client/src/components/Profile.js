import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import '../css/Profile.css';
import {API_BASE_URL} from '../config';

//const API_BASE_URL = process.env.REACT_APP_API_BASE_URL


const validationSchema = Yup.object({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  phone_number: Yup.string().required('Phone number is required'),
  street: Yup.string().required('Street is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  country: Yup.string().required('Country is required'),
  zip_code: Yup.string().required('ZIP code is required'),
});

function Profile({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(false);

  const formik = useFormik({
    initialValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number || '',
      street: user.street || '',
      city: user.city || '',
      state: user.state || '',
      country: user.country || '',
      zip_code: user.zip_code || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
          credentials: 'include',
        });

        if (response.ok) {
          const updatedUser = await response.json();
          setUser(updatedUser);
          setIsEditing(false);
        } else {
          const errorData = await response.json();
          formik.setStatus(errorData.message || 'Failed to update profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        formik.setStatus('An error occurred. Please try again later.');
      }
    },
  });

  return (
    <div className="profile-container">
      <h2 className="profile-title">User Profile</h2>
      {!isEditing ? (
        <div className="profile-info">
          <div className="info-group">
            <h3>Personal Information</h3>
            <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone_number || 'Not provided'}</p>
          </div>
          <div className="info-group">
            <h3>Address</h3>
            <p><strong>Street:</strong> {user.street || 'Not provided'}</p>
            <p><strong>City:</strong> {user.city || 'Not provided'}</p>
            <p><strong>State:</strong> {user.state || 'Not provided'}</p>
            <p><strong>Country:</strong> {user.country || 'Not provided'}</p>
            <p><strong>ZIP Code:</strong> {user.zip_code || 'Not provided'}</p>
          </div>
          <button className="edit-button" onClick={() => setIsEditing(true)}>Update Profile</button>
        </div>
      ) : (
        <form onSubmit={formik.handleSubmit} className="profile-form">
          <div className="form-fields">
            {Object.keys(formik.values).map((field) => (
              <div key={field} className="form-group">
                <label htmlFor={field}>{field.replace('_', ' ').toUpperCase()}</label>
                <input
                  id={field}
                  name={field}
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values[field]}
                />
                {formik.touched[field] && formik.errors[field] ? (
                  <div className="error">{formik.errors[field]}</div>
                ) : null}
              </div>
            ))}
          </div>
          {formik.status && <div className="error">{formik.status}</div>}
          <div className="button-group">
            <button type="submit" className="save-button">Save Changes</button>
            <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Profile;