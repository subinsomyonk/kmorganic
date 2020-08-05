//file : models/Member.js
const mongoose = require('mongoose');
const memberFamilySchema = new mongoose.Schema({
    memberId: {
        type: String,
        trim: true,
        required:true
    },
    IDCARD: {
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
const MemberFamily = mongoose.model('MemberFamily', memberFamilySchema);

module.exports = MemberFamily;