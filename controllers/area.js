const validator = require('validator');
const { promisify } = require('util');
const _ = require('lodash');
const Area = require('../models/Area');
const moment = require('moment');
exports.getArea = (req, res) => {
    res.render('area/index', { title: 'Area Management', caption: 'จัดการแปลงเพาะปลูก', flagAdd: true });
};

exports.areaDelete = (req, res) => {
    Area.findByIdAndRemove({ _id: req.query._id }, (err, result) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'ลบพื้นที่เพาะปลูก สำเร็จ! ' })
        res.redirect('../area/findText?findText=' + req.query.findText)
    })
}


exports.getAreaFindById = (req, res, next) => {
    Area.findById({ _id: req.query._id }, (err, result) => {
        if (err) {
            req.flash('errors', { msg: 'ค้นหาผิดพลาด ตรวจสอบ.: ' + err });
            res.send({ 'confirm': 'failed' });
        } else {
            res.send({ 'confirm': 'success', data: result });
        }
    });
};
exports.getAreaFindByAreaId = (req, res, next) => {
  Area.find({ areaId: req.query.areaId }, (err, result) => {
      if (err) {
          req.flash('errors', { msg: 'ค้นหาผิดพลาด ตรวจสอบ.: ' + err });
          res.send({ 'confirm': 'failed' });
      } else {
          res.send({ 'confirm': 'success', data: result });
      }
  });
};



exports.getAreaFindText = (req, res, next) => {
    const validationErrors = [];
    if (validator.isEmpty(req.query.findText)) validationErrors.push({ msg: 'Please enter a findText.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('area/index', { title: 'Area Management', caption: 'จัดการแปลงเพาะปลูก' });
    } else {
        let query = [
            { province: new RegExp(req.query.findText.trim(), 'i') },
            { district: new RegExp(req.query.findText.trim(), 'i') },
            { subDistrict: new RegExp(req.query.findText.trim(), 'i') },
            { village: new RegExp(req.query.findText.trim(), 'i') },
            { areaName: new RegExp(req.query.findText.trim(), 'i') },
            { areaId: new RegExp(req.query.findText.trim(), 'i') },
            { memberId: new RegExp(req.query.findText.trim(), 'i') },
            { referId: new RegExp(req.query.findText.trim(), 'i') },
            { latitude: new RegExp(req.query.findText.trim(), 'i') },
            { longitude: new RegExp(req.query.findText.trim(), 'i') }
        ];

        Area.find({ $or: query }, (err, result) => {
            if (err) { return next(err); }
            req.flash('success', { msg: 'ค้นพบจำนวน ' + result.length + ' รายการ' });
            res.render('area/index', { title: 'Area Management', caption: 'จัดการแปลงเพาะปลูก', result: result, findText: req.query.findText });
        });
    }
};
exports.postAreaFindText = (req, res, next) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.findText)) validationErrors.push({ msg: 'Please enter a findText.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('area/index', { title: 'Area Management', caption: 'จัดการพื้นที่เพาะปลูก' });
    } else {
        let query = [
            { province: new RegExp(req.body.findText.trim(), 'i') },
            { district: new RegExp(req.body.findText.trim(), 'i') },
            { subDistrict: new RegExp(req.body.findText.trim(), 'i') },
            { village: new RegExp(req.body.findText.trim(), 'i') },
            { areaName: new RegExp(req.body.findText.trim(), 'i') },
            { areaId: new RegExp(req.body.findText.trim(), 'i') },
            { memberId: new RegExp(req.body.findText.trim(), 'i') },
            { referId: new RegExp(req.body.findText.trim(), 'i') },
            { latitude: new RegExp(req.body.findText.trim(), 'i') },
            { longitude: new RegExp(req.body.findText.trim(), 'i') }
        ];
        Area.find({ $or: query }, (err, result) => {
            if (err) { return next(err); }
            req.flash('success', { msg: 'ค้นพบจำนวน ' + result.length + ' รายการ' });
            res.render('area/index', { title: 'Area Management', caption: 'จัดการแปลงเพาะปลูก', result: result, findText: req.body.findText });
        });
    }
};

//edit for update
exports.getAreaEdit = (req, res, next) => {
    Area.findById(req.params._id, (err, result) => {
        if (err) { return next(err); }
        res.render('area/edit', { title: 'Area Management', caption: 'จัดการแปลงเพาะปลูก', _id: req.params._id, findText: req.params.findText, result: result });
    });
};
exports.postAreaEdit = (req, res, next) => {
    Area.findById(req.params._id, (err, result) => {
        if (err) { return next(err); }
        res.render('area/edit', { title: 'Area Management', caption: 'จัดการแปลงเพาะปลูก', findText: req.params.findText, result: result, _id: req.params._id, payload: [] });
    });
};
//area update
exports.postAreaEditUpdate = (req, res, next) => {
    // console.log(req.body);
    let register = '1900-01-01';

    if (req.body.statusId == 'on') {
        req.body.statusId = 1;
    } else {
        req.body.statusId = 0;
    }
    if (!req.body.register) {
        req.body.register = register;
    };
    let payload = req.body;
    // delete payload.areaId
    const validationErrors = [];

    if (validator.isEmpty(req.body.areaName.trim())) validationErrors.push({ msg: 'Please enter a valid Area Name.' });
    if (validator.isEmpty(req.body.village.trim())) validationErrors.push({ msg: 'Please enter a valid Village.' });
    if (validator.isEmpty(req.body.subDistrict.trim())) validationErrors.push({ msg: 'Please enter a valid Sub District.' });
    if (validator.isEmpty(req.body.district.trim())) validationErrors.push({ msg: 'Please enter a valid District.' });
    if (validator.isEmpty(req.body.province.trim())) validationErrors.push({ msg: 'Please enter a valid Province.' });
    if (validator.isEmpty(req.body.referId.trim())) validationErrors.push({ msg: 'Please enter a valid ReferID.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('area/edit', { title: 'Area Management', caption: 'จัดการแปลงเพาะปลูก', findText: req.params.findText, result: payload, _id: req.params._id });
    } else {
        Area.findByIdAndUpdate({ '_id': req.params._id }, payload, { new: true }, (err) => {
            if (err) {
                // return next(err); 
                req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
                res.render('area/edit', { title: 'Area Management', caption: 'จัดการแปลงเพาะปลูก', result: payload });
            } else {
                req.flash('success', { msg: 'ทำการแก้ไข สำเร็จ.' });
                res.render('area/edit', { title: 'Area Management', caption: 'จัดการแปลงเพาะปลูก', findText: req.params.findText, _id: req.params._id, result: payload });
            }
        });
    }
};
//add area get
exports.getAreaAdd = (req, res, next) => {
    if (req.query.findText) {
        res.render('area/add', { title: 'Area Management', caption: 'จัดการพื้นที่เพาะปลูก', findText: req.query.findText, payload: [] });
    } else {
        res.render('area/add', { title: 'Area Management', caption: 'จัดการแปลงเพาะปลูก', findText: '', payload: [] });
    }
};
//add area post
exports.postAreaAdd = (req, res, next) => {
    let payload = req.body
    let findText = req.body.findText_;
    let register = '1900-01-01';
    if (req.body.register) {
        register = req.body.register
    }
    const validationErrors = [];
    if (validator.isEmpty(req.body.areaId.trim())) validationErrors.push({ msg: 'Please enter a valid Area Id.' });
    if (validator.isEmpty(req.body.areaName.trim())) validationErrors.push({ msg: 'Please enter a valid Area Name.' });
    if (validator.isEmpty(req.body.village.trim())) validationErrors.push({ msg: 'Please enter a valid Village.' });
    if (validator.isEmpty(req.body.subDistrict.trim())) validationErrors.push({ msg: 'Please enter a valid Sub District.' });
    if (validator.isEmpty(req.body.district.trim())) validationErrors.push({ msg: 'Please enter a valid District.' });
    if (validator.isEmpty(req.body.province.trim())) validationErrors.push({ msg: 'Please enter a valid Province.' })
    if (validator.isEmpty(req.body.referId.trim())) validationErrors.push({ msg: 'Please enter a valid Refer Id.' })
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('area/add', { title: 'Area Management', caption: 'จัดการแปลงเพาะปลูก', payload: payload, findText: findText });
    } else {
        const area = new Area({
            areaId: req.body.areaId,
            areaName: req.body.areaName,
            village: req.body.village,
            subDistrict: req.body.subDistrict,
            district: req.body.district,
            province: req.body.province,
            memberId: req.body.memberId,
            size: req.body.size,
            register: new Date(register),
            notes: req.body.notes,
            referId: req.body.referId,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        });
        area.save((err) => {
            if (err) {
                req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
                res.render('area/add', { title: 'Area Management', caption: 'จัดการแปลงเพาะปลูก', payload: payload, findText: findText });
            } else {
                req.flash('success', { msg: 'บันทึก เพิ่มสำเร็จ.' });
                res.render('area/add', { title: 'Area Management', caption: 'จัดการแปลงเพาะปลูก', payload: payload, findText: findText });
            }
        });
    }
};