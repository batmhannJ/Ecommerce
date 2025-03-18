const mongoose = require('mongoose');

const RiderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNumber: {
    type: String,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: {
    type: String,
    required: [true, 'Please provide your complete address'],
    trim: true
  },
  isApproved: { type: Boolean, default: false },
  idPicture: { type: String },
  driverLicense: {
    type: String,
    required: [true, 'Please upload your driver\'s license']
  },
  vehicleType: {
    type: String,
    required: [true, 'Please select your vehicle type'],
    enum: ['motorcycle', 'bicycle', 'car', 'van']
  },
  plateNumber: {
    type: String,
    required: [true, 'Please provide your vehicle plate number'],
    trim: true
  },
  vehicleRegistration: {
    type: String,
    required: [true, 'Please upload your vehicle registration']
  },
  otp: { type: String },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
});

module.exports = mongoose.model("Rider", RiderSchema);
