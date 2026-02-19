import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DynamicBackground from '../components/DynamicBackground';
import AnimationPresets from '../utils/AnimationPresets';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Simulate API call - replace with actual verification logic
        setTimeout(() => {
          setStatus('success');
          setMessage('Email verified successfully!');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage('Verification failed. Please try again.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <motion.div 
      className="verify-email-container"
      variants={AnimationPresets.fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <DynamicBackground 
        variant="gradient" 
        intensity={0.3} 
        speed={0.8}
        colors={['#3b82f6', '#8b5cf6', '#ec4899']}
      />
      
      <motion.div 
        className="verify-email-card"
        variants={AnimationPresets.scaleIn}
        initial="initial"
        animate="animate"
      >
        {status === 'verifying' && (
          <>
            <motion.div 
              className="verify-icon"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              🔄
            </motion.div>
            <motion.h2
              variants={AnimationPresets.textGlow}
              animate="animate"
            >
              Verifying Your Email
            </motion.h2>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Please wait while we verify your email address...
            </motion.p>
            <div className="verifying-spinner"></div>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div 
              className="verify-icon success"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.5 }}
            >
              ✅
            </motion.div>
            <motion.h2
              className="success-text"
              variants={AnimationPresets.textGradient}
              animate="animate"
            >
              Success!
            </motion.h2>
            <motion.p
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {message}
            </motion.p>
            <motion.p className="redirect-message">
              Redirecting to login...
            </motion.p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div 
              className="verify-icon error"
              animate={{ 
                shake: [0, 5, -5, 0]
              }}
              transition={{ duration: 0.3 }}
            >
              ❌
            </motion.div>
            <motion.h2 className="error-text">
              Verification Failed
            </motion.h2>
            <motion.p>
              {message}
            </motion.p>
            <motion.button
              className="verify-button"
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Login
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default VerifyEmail;