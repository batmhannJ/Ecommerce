// models/Delivery.js
const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  pickupAddress: {
    type: String,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  riderPayment: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'in_progress', 'picked_up', 'completed', 'cancelled'],
    default: 'assigned'
  },
  riderRating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Delivery', DeliverySchema);

// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['delivery', 'system', 'payment'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);