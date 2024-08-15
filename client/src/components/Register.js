import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import '../css/Register.css';
import {API_BASE_URL} from '../config';

//const API_BASE_URL = process.env.REACT_APP_API_BASE_URL


const validationSchema = Yup.object({
  firstName: Yup.string()
    .required('First name is required')
    .matches(/^[A-Za-z]+$/, 'First name should only contain letters'),
  lastName: Yup.string()
    .required('Last name is required')
    .matches(/^[A-Za-z]+$/, 'Last name should only contain letters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

function Register({ setActivePage, onRegisterSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            password: values.password,
          }),
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Sign up successful:', data);
          onRegisterSuccess();
        } else {
          formik.setStatus(data.message || 'An error occurred during signup');
        }
      } catch (error) {
        console.error('Error during signup:', error);
        formik.setStatus('An error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">SIGN UP</h2>
        <form className="register-form" onSubmit={formik.handleSubmit}>
          <div className="input-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              {...formik.getFieldProps('firstName')}
            />
            {formik.touched.firstName && formik.errors.firstName ? (
              <div className="error-message">{formik.errors.firstName}</div>
            ) : null}
          </div>

          <div className="input-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              {...formik.getFieldProps('lastName')}
            />
            {formik.touched.lastName && formik.errors.lastName ? (
              <div className="error-message">{formik.errors.lastName}</div>
            ) : null}
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...formik.getFieldProps('email')}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="error-message">{formik.errors.email}</div>
            ) : null}
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              {...formik.getFieldProps('password')}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="error-message">{formik.errors.password}</div>
            ) : null}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              {...formik.getFieldProps('confirmPassword')}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="error-message">{formik.errors.confirmPassword}</div>
            ) : null}
          </div>

          {formik.status && <p className="error-message">{formik.status}</p>}
          
          <button type="submit" className="signup-button" disabled={isLoading || !formik.isValid}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
          
          <p className="login-link">
            Already have an account? <button type="button" onClick={() => setActivePage('login')}>Login</button>
          </p>
        </form>
      </div>
    </div>
  );
}

Register.propTypes = {
  setActivePage: PropTypes.func.isRequired,
  onRegisterSuccess: PropTypes.func.isRequired,
};

export default Register;