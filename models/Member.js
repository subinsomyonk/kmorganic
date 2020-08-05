//file : models/Member.js
const mongoose = require('mongoose');
const memberSchema = new mongoose.Schema({
  memberId: {
    type: String,
    unique: true,
    trim: true
  },
  homeNo: {
    type: String,
    trim: true,
    defaule: 10000
  },
  groupNo: {
    type: Number,
    trim: true
  },
  village: {
    type: String,
    default: 'xxxxxxxxxx'
  },
  subDistrict: {
    type: String,
    trim: true,
    default: 'xxxxxxxxx'
  },
  district: {
    type: String,
    trim: true,
    default: 'xxxxxxxxx'
  },
  province: {
    type: String,
    trim: true,
    default: 'xxxxxxxxx'
  },
  postCode: {
    type: String,
    trim: true,
    default: 'xxxxxxxxx'
  },
  phone: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  register: {
    type: Date,
    default: Date.now
  },
  memberType: {
    type: String,
    default: 'สามัญ',
    trim: true
  },
  shareHolder: {
    type: Number,
    default: 1,
    min: 1,
    max: 20000
  },
  IDCARD: {
    type: String,
    default: 'xxxxxxxxxxxxx'
  },
  statusId: {
    type: Number,
    default: 1
  },
  organizeName: {
    type : String,
    default : null
  },
}, { timestamps: true });
const Member = mongoose.model('Member', memberSchema);

module.exports = Member;