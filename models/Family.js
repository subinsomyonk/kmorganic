const mongoose = require('mongoose');
const familySchema = new mongoose.Schema({
    IDCARD: {
        type: String,
        unique: true,
        trim: true
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        default: 'MALE'
    },
    memberId: {
        type: String,
        trim: true,
        default: 'xxxxxxxxx'
    },
    birthDate: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    statusId: {
        type: Number,
        default: 1
    },
}, { timestamps: true });
const Family = mongoose.model('Family', familySchema);

module.exports = Family;