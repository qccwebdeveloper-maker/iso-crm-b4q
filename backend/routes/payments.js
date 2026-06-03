const express = require('express');
const router = express.Router();
const {
  PAYMENTS,
  getPayments, getPaymentById, createPayment, updatePayment, deletePayment
} = require('../mockData');
const { protect, authorize } = require('../middleware/auth');

// GET /api/payments - Get all payments (admin only)
router.get('/', protect, authorize('admin'), (req, res) => {
  const payments = getPayments(req.query);
  res.json(payments);
});

// GET /api/payments/:id
router.get('/:id', protect, authorize('admin'), (req, res) => {
  const payment = getPaymentById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json(payment);
});

// POST /api/payments - Create manual payment entry
router.post('/', protect, authorize('admin'), (req, res) => {
  const { name, transactionId, applicationId, amount, paymentStatus, paymentDate } = req.body;
  
  if (!name || !transactionId || !amount) {
    return res.status(400).json({ message: 'Name, transaction ID, and amount are required' });
  }

  const payment = createPayment({
    name,
    transactionId,
    applicationId: applicationId || null,
    amount: parseInt(amount),
    paymentStatus: paymentStatus || 'pending',
    paymentDate: paymentStatus === 'received' ? (paymentDate || new Date()) : null,
  });

  res.status(201).json({ message: 'Payment entry created', payment });
});

// PUT /api/payments/:id - Update payment entry
router.put('/:id', protect, authorize('admin'), (req, res) => {
  const payment = updatePayment(req.params.id, req.body);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json({ message: 'Payment updated', payment });
});

// DELETE /api/payments/:id - Delete payment entry
router.delete('/:id', protect, authorize('admin'), (req, res) => {
  const deleted = deletePayment(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Payment not found' });
  res.json({ message: 'Payment deleted' });
});

module.exports = router;
