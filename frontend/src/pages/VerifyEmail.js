import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ✅ Use environment variable – this will be your live backend URL in production
const API_BASE = process.env.REACT_APP_API_URL || 'https://unidigitalcom-backend.onrender.com/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyEmail = async () => {
      console.log('🔍 VerifyEmail component mounted');
      console.log('📝 Token from URL:', token);
      console.log('🌐 API Base URL:', API_BASE);
      
      if (!token) {
        console.error('❌ No token provided in URL');
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        console.log('📡 Sending verification request to:', `${API_BASE}/auth/verify-email/${token}`);
        const response = await axios.get(`${API_BASE}/auth/verify-email/${token}`);
        console.log('✅ Verification response:', response.data);
        
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        
        // Start countdown for redirect
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              navigate('/auth');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
      } catch (error) {
        console.error('❌ Verification error:', error);
        
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          setMessage(error.response.data?.message || 'Verification failed');
        } else if (error.request) {
          console.error('No response received:', error.request);
          setMessage('Cannot connect to server. Please try again.');
        } else {
          console.error('Error setting up request:', error.message);
          setMessage('An error occurred. Please try again.');
        }
        
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 max-w-md w-full text-center shadow-2xl">
        {status === 'verifying' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Verifying Your Email</h2>
            <p className="text-slate-400">Please wait while we verify your email address...</p>
            <p className="text-sm text-slate-500 mt-4">This may take a few seconds</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-6xl mb-4 text-green-400 animate-bounce">✅</div>
            <h2 className="text-2xl font-bold text-green-400 mb-3">Email Verified!</h2>
            <p className="text-slate-300 mb-4">{message}</p>
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Redirecting to login in <span className="text-blue-400 font-bold">{countdown}</span> seconds...
              </p>
              <Link
                to="/auth"
                className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Go to Login Now
              </Link>
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-6xl mb-4 text-red-400">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-3">Verification Failed</h2>
            <p className="text-slate-300 mb-4">{message}</p>
            <div className="space-y-3">
              <p className="text-sm text-slate-400">The verification link may be invalid or expired.</p>
              <Link
                to="/auth"
                className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Back to Login
              </Link>
              <Link
                to="/auth?register=true"
                className="inline-block w-full border border-blue-500 text-blue-500 hover:bg-blue-500/10 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Register Again
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;