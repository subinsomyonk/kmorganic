const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose);
const areaSchema = new mongoose.Schema({
  areaId: {
    type: String,
    unique: true
  },
  areaName: {
    type: String,
    trim: true
  },
  village: {
    type: String,
    trim: true
  },
  subDistrict: {
    type: String
  },
  district: {
    type: String,
    trim: true
  },
  province: {
    type: String,
    trim: true
  },
  size: {
    type: Float,
    min: 0.02,
    max: 3000.00,
    default:0.02
  },
  memberId: {
    type: String,
    trim: true,
    default:'xxxxxxxxx'
  },
  notes: {
    type: String,
    trim: true
  },
  statusId: {
    type: Number,
    default: 1
  },
  register: {
    type: Date,
    default: Date.now
  },
  referId: {
    type: String,
    trim: true,
    default: 'xxxxxxxxx'
  },
  latitude: {
    type: String,
    default: '0.0000000'
  },
  longitude: {
    type: String,
    default: '0.0000000'
  },
}, { timestamps: true });
const Area = mongoose.model('Area', areaSchema);

module.exports = Area;