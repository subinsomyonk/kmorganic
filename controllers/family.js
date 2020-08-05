//file : controllers/family.js
const validator = require('validator');
const { promisify } = require('util');
const _ = require('lodash');
const Family = require('../models/Family');
const moment = require('moment');

exports.getFamily = (req, res) => {
    res.render('family/index', { title: 'Family Management', caption: 'จัดการสมาชิกในครอบครัว' });
};

  

exports.getFamilyFindByIdInfo = (req, res) => {
    // console.log(req.query._id);
    Family.findById({ _id: req.query._id }, (err, result) => {
        if (err) {
            req.flash('errors', { msg: 'ผิดพลาดค้นหา ตรวจสอบ.: ' + err });
            res.send({ 'confirm': 'failed' });
        } else {
            res.send({ 'confirm': 'success', data: result });
        }
    });
};

exports.familyDelete = (req, res) => {
    Family.findByIdAndRemove({ _id: req.query._id }, (err, result) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'ลบออกคนในครอบครัว สำเร็จ! ' });
        res.redirect('../family/findText?findText=' + req.query.findText);
    });
};
exports.getFamilyFindText = (req, res, next) => {
    const validationErrors = [];
    if (validator.isEmpty(req.query.findText)) validationErrors.push({ msg: 'Please enter a findText.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('family/index', { title: 'Family Management', caption: 'จัดการสมาชิกในครอบครัว' });
    } else {
        let query = [
            { IDCARD: new RegExp(req.query.findText.trim(), 'i') },
            { firstName: new RegExp(req.query.findText.trim(), 'i') },
            { lastName: new RegExp(req.query.findText.trim(), 'i') },
            { phone: new RegExp(req.query.findText.trim(), 'i') },
            { memberId: new RegExp(req.query.findText.trim(), 'i') }
        ];
        let sortBy = {
            firstName: 1,
            lastName: 1,
            IDCARD: 1,
            memberId: 1,
            gender: 1
        };
        Family.find({ $or: query }, (err, result) => {
            if (err) { return next(err); }
            req.flash('success', { msg: 'ค้นพบจำนวน ' + result.length + ' รายการ' });
            res.render('family/index', { title: 'Family Management', caption: 'จัดการสมาชิกในครอบครัว', result: result, findText: req.query.findText });
        });
    }
};


exports.postFamilyFindText = (req, res, next) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.findText)) validationErrors.push({ msg: 'Please enter a findText.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('family/index', { title: 'Area Management', caption: 'จัดการพื้นที่เพาะปลูก' });
    } else {
        let query = [
            { fistName: new RegExp(req.body.findText.trim(), 'i') },
            { lastName: new RegExp(req.body.findText.trim(), 'i') },
            { memberId: new RegExp(req.body.findText.trim(), 'i') },
            { IDCARD: new RegExp(req.body.findText.trim(), 'i') },
            { gender: new RegExp(req.body.findText.trim(), 'i') },
            { phone: new RegExp(req.body.findText.trim(), 'i') }
        ];
        let sortBy = {
            firstName: 1,
            lastName: 1,
            IDCARD: 1,
            memberId: 1,
            gender: 1
        };
        Family.find({ $or: query }, (err, result) => {
            if (err) { return next(err); }
            req.flash('success', { msg: 'ค้นพบจำนวน ' + result.length + ' รายการ' });
            res.render('family/index', { title: 'Family Management', caption: 'จัดการคนในครอบครับ', result: result, findText: req.body.findText });
        });
    }
};
//edit for update
exports.getFamilyEdit = (req, res, next) => {
    Family.findById(req.params._id, (err, result) => {
        console.log(result)
        if (err) { return next(err); }
        res.render('family/edit', { title: 'Family Management', caption: 'จัดการสมาชิกครอบครัว', _id: req.params._id, findText: req.params.findText, result: result });
    });
};
exports.postFamilyEdit = (req, res, next) => {
    Family.findById(req.params._id, (err, result) => {
        if (err) { return next(err); }
        res.render('family/edit', { title: 'Family Management', caption: 'จัดการสมาชิกครอบครัว', findText: req.params.findText, result: result, _id: req.params._id, payload: [] });
    });
};
//family update
exports.postFamilyEditUpdate = (req, res, next) => {
    const payload = req.body;
    console.log(req.body);
    let birthDate = '1900-01-01';
    if (req.body.birthDate) {
        birthDate = req.body.birthDate
    };
    if (req.body.statusId == 'on') {
        req.body.statusId = 1
    } else {
        req.body.statusId = 0
    }
    const validationErrors = [];
    if (validator.isEmpty(req.body.firstName)) validationErrors.push({ msg: 'Please enter a valid First Name.' });
    if (validator.isEmpty(req.body.lastName)) validationErrors.push({ msg: 'Please enter a valid Last Name.' });

    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('family/edit', { title: 'Family Management', caption: 'จัดการสมาชิกครอบครัว', findText: req.params.findText, result: payload, _id: req.params._id });
    } else {
        Family.findByIdAndUpdate({ '_id': req.params._id }, payload, { new: true }, (err) => {
            if (err) { return next(err); }
            req.flash('success', { msg: 'ทำการแก้ไข เพิ่มสำเร็จ.' });
            res.render('family/edit', { title: 'Family Management', caption: 'จัดการสมาชิกครอบครัว', findText: req.params.findText, _id: req.params._id, result: payload });
        });
    }
};
//add family get
exports.getFamilyAdd = (req, res, next) => {
    if (req.query.findText) {
        res.render('family/add', { title: 'Family Management', caption: 'จัดการคนในครอบครัว', findText: req.query.findText, payload: [] });
    } else {
        res.render('family/add', { title: 'Family Management', caption: 'จัดการคนในครอบครัว', findText: '', payload: [] });
    }
};
//add area post
exports.postFamilyAdd = (req, res, next) => {
    let payload = req.body;
    let findText = req.body.findText_;
    let birthDate = '1900-01-01';
    if (req.body.birthDate) {
        birthDate = req.body.birthDate;
    };
    const validationErrors = [];
    if (!validator.isLength(req.body.IDCARD, { min: 13, max: 13 })) validationErrors.push({ msg: 'Please enter a valid IDCARD 13 Pos.' });
    if (validator.isEmpty(req.body.firstName)) validationErrors.push({ msg: 'Please enter a valid First Name.' });
    if (validator.isEmpty(req.body.lastName)) validationErrors.push({ msg: 'Please enter a valid Last Name.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('family/add', { title: 'Family Management', caption: 'จัดการคนในครอบครัว', payload: payload, findText: findText });
    } else {
        const family = new Family({
            IDCARD: req.body.IDCARD,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            memberId: req.body.memberId,
            notes: req.body.notes,
            gender: req.body.gender,
            birthDate: new Date(birthDate)
        });
        family.save((err) => {
            if (err) {
                req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
                res.render('family/add', { title: 'Family Management', caption: 'จัดการคนในครอบครัว', payload: payload, findText: findText });
            } else {
                req.flash('success', { msg: 'บันทึก เพิ่มสำเร็จ.' });
                res.render('family/add', { title: 'Family Management', caption: 'จัดการคนในครอบครัว', payload: family, findText: findText });
            }
        });
    }
};