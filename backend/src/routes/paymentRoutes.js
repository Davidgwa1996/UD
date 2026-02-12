const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// ------------------------------------------------------------------
// SAFE IMPORT – fallback to dummy functions if controller is missing
// ------------------------------------------------------------------
let paymentController;
try {
  paymentController = require('../controllers/paymentController');
} catch (error) {
  console.warn('⚠️ paymentController not found – using fallback functions');
  paymentController = {};
}

// Ensure every required function exists (even if just a placeholder)
const {
  processPayment = (req, res) => res.status(501).json({ message: 'processPayment not implemented' }),
  getPaymentStatus = (req, res) => res.status(501).json({ message: 'getPaymentStatus not implemented' }),
  getMyPayments = (req, res) => res.status(501).json({ message: 'getMyPayments not implemented' }),
  initiateRefund = (req, res) => res.status(501).json({ message: 'initiateRefund not implemented' }),
  getPaymentMethods = (req, res) => res.status(501).json({ message: 'getPaymentMethods not implemented' })
} = paymentController;

// ------------------------------------------------------------------
// PUBLIC ROUTES
// ------------------------------------------------------------------
router.get('/methods', getPaymentMethods);

// ------------------------------------------------------------------
// USER ROUTES (protected)
// ------------------------------------------------------------------
router.post('/process', protect, processPayment);
router.get('/', protect, getMyPayments);
router.get('/:id/status', protect, getPaymentStatus);

// ------------------------------------------------------------------
// ADMIN ROUTES (protected + admin)
// ------------------------------------------------------------------
router.post('/:id/refund', protect, admin, initiateRefund);

module.exports = router;