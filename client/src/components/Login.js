import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import {API_BASE_URL} from '../config';

//const API_BASE_URL = process.env.REACT_APP_API_BASE_URL


const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

function Login({ setActivePage, onSignIn }) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Login successful:', data);
          sessionStorage.setItem('userId', data.user.id); // making use of session storage before i figure out jwt
          onSignIn();

          // Redirect based on admin status
          if (data.user.isAdmin) {
            navigate(`/admin/view-orders`);
          } else {
            navigate(`/dashboard`);
          }
        } else {
          formik.setStatus(data.message || 'Invalid email or password');
        }
      } catch (error) {
        console.error('Error during login:', error);
        formik.setStatus('An error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    // Implement forgot password functionality
    console.log('Forgot password clicked');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login</h2>
        <form className="login-form" onSubmit={formik.handleSubmit}>
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

          {formik.status && <p className="error-message">{formik.status}</p>}

          <button type="submit" className="login-button" disabled={isLoading || !formik.isValid}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          {/*<button type="button" className="forgot-password" onClick={handleForgotPasswordClick}>
            Forgot Password?
          </button>*/}

          <p className="register-link">
            Don't have an account? <button type="button" onClick={() => setActivePage('register')}>Register</button>
          </p>
        </form>
      </div>
    </div>
  );
}

Login.propTypes = {
  setActivePage: PropTypes.func.isRequired,
  onSignIn: PropTypes.func.isRequired,
};

export default Login;
