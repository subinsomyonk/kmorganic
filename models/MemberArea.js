//file : models/Member.js
const mongoose = require('mongoose');
const memberAreaSchema = new mongoose.Schema({
    memberId: {
        type: String,
        trim: true,
        required:true
    },
    areaId: {
        type: String,
        trim: true,
        required:true
    },
    register: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    },
}, { timestamps: true });
const MemberArea = mongoose.model('MemberArea', memberAreaSchema);

module.exports = MemberArea;