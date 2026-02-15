import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_BASE}/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };
    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Email Verified!</h2>
            <p className="text-slate-300 mb-6">{message}</p>
            <Link
              to="/auth"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Verification Failed</h2>
            <p className="text-slate-300 mb-6">{message}</p>
            <Link
              to="/auth"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;