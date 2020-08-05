//file : models/Audit.js
const mongoose = require('mongoose');
const auditSchema = new mongoose.Schema({  
    _idProduce: {  
      type: String,
      trim: true
    },
    yearName: {
      type: String,
      trim: true
    },
    areaId: {
      type: String,
      trim: true
    },
    memberId: {
      type: String,
      trim: true,
    },
    plantNameTh: {
      type: String,
      trim: true
    },
    orders: {
      type:Number,
      default:1
    },
    sizeAction: {
      type: Number,
      default: 0.00
    },
    comment: {
      type: String,  
      trim: true
    },
    result: {
      type: Boolean,
      default: false
    },
    percentScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    estimate: {
      type: Number,
      min: 0,
      max: 1000000000,
      default: 0
    },
    staffName: {
      type: String
    },
    areaName: {
      type: String
    },

}, { timestamps: true });   
const Audit = mongoose.model('Audit', auditSchema);

module.exports = Audit;