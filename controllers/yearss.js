const validator = require('validator');
const { promisify } = require('util');
const _ = require('lodash');
const Yearss = require('../models/Yearss');

//the first page of Year , yes index.pug
exports.getYear= (req, res) => {
    res.render('year/index', { title: 'Yearly Manage', caption: 'จัดการปีเพาะปลูก' });
};

//view product add.pug
exports.getYearAdd = (req, res) => {
    res.render('year/add', { title: 'Yearly Manage', caption: 'จัดการปีเพาะปลูก', findText: req.query.findText.trim() });
};

//post add postProductAdd
exports.postYearAdd = (req, res) => {
    if (req.params.findTextRev == 'undefinded') {
        findText = '';
    } else {
        findText = req.params.findTextRev;
    }
    let payload = req.body;
    const yearss = new Yearss({
        yearName: req.body.yearName.trim(),
        yearCaption: req.body.yearCaption.trim(),
        notes: req.body.notes.trim()
    });
    const validationErrors = [];
    if (validator.isEmpty(req.body.yearName.trim())) validationErrors.push({ msg: 'Please enter a valid Year Name.' });
    if (validator.isEmpty(req.body.yearCaption.trim())) validationErrors.push({ msg: 'Please enter a valid Year Caption.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('year/add', { title: 'Yearly Manage', caption: 'จัดการปีเพาะปลูก', findText: findText, payload: payload });
    } else {
        yearss.save((err) => {
            if (err) {
                req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
                res.render('year/add', { title: 'Yearly Manage', caption: 'จัดการปีเพาะปลูก', findText: findText, payload: payload });
            } else {
                req.flash('success', { msg: 'บันทึก เพิ่มสำเร็จ.' });
                res.render('year/add', { title: 'Yearly Manage', caption: 'จัดการปีเพาะปลูก', findText: findText, payload: payload });
            }
        });
    }
}

exports.postYear = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.findText.trim())) validationErrors.push({ msg: 'Please enter a valid Find Text Search.' });
    let findText = req.body.findText.trim();
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('year/index', { title: 'Yearly Manage', caption: 'จัดการปีเพาะปลูก', findText: findText });
    } else {
        let query = [
            { yearName: new RegExp(req.body.findText.trim(), 'i') },
            { yearCaption: new RegExp(req.body.findText.trim(), 'i') }
        ]
        Yearss.find({ $or: query }, (err, result) => {
            if (err) {
                req.flash('errors', 'ไม่พบข้อมูลที่จะทำการแก้ไข ตรวจสอบ!');
                res.render('year/index', { title: 'Yearly Management', caption: 'จัดการปีเพาะปลูก', findText: findText });
            } else {
                req.flash('success', { msg: 'ค้นหาด้วยคำว่า : ' + req.body.findText.trim() + ' จำนวนรายการที่พบ ' + result.length + ' รายการ ' });
                res.render('year/index', { title: 'Yearly Management', caption: 'จัดการปีเพาะปลูก', findText: findText, result: result });
            }
        });
    }
}

//view year info
exports.getYearFindByIdInfo = (req, res) => {
    Yearss.findById({ _id: req.query._id }, (err, result) => {
        if (err) {
            req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
            res.send({ 'confirm': 'failed' });
        } else {
            res.send({ 'confirm': 'success', data: result });
        }
    });
}


//find yearName info at INFORMATION sub PRODUCE INFO 
exports.getYearFindByYearName = (req, res) => {
  Yearss.find({ yearName: req.query.yearName }, (err, result) => {
      if (err) {
          req.flash('errors', { msg: 'ผิดพลาดในการค้นหา ตรวจสอบ.: ' + err });
          res.send({ 'confirm': 'failed' });
      } else {
          res.send({ 'confirm': 'success', data: result });
      }
  });
}


//view product to edit
exports.getYearEdit = (req, res) => {
    Yearss.findById({ _id: req.params._id }, (err, result) => {
        if (err) {
            req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
            res.render('year/edit', { title: 'Yearly Manage', caption: 'จัดการปีเพาะปลูก', _id: req.params._id, findText: req.params.findText, result: req.body });
        } else {
            res.render('year/edit', { title: 'Yearly Manage', caption: 'จัดการปีเพาะปลูก', _id: req.params._id, findText: req.params.findText, result: result });
        }
    });
}

//post update product '/product/edit/'+ _id +'/'+findText
exports.postYearEdit = (req, res) => {
    // console.log('postProductEdit:::' + req.body);
    const payload = req.body;
    const validationErrors = [];
    if (validator.isEmpty(req.body.yearCaption.trim())) validationErrors.push({ msg: 'Please enter a valid Caption' });
    if (validationErrors.length) {
        // console.log(payload);
        req.flash('errors', validationErrors);
        res.render('year/edit', { title: 'Year Manage', caption: 'จัดการปีเพาะปลูก', _id: req.params._id, findText: req.params.findText, result: payload });
    } else {
        Yearss.findByIdAndUpdate({ '_id': req.params._id }, payload, { new: true }, (err) => {

            if (err) {
                req.flash('errors', 'ไม่พบข้อมูลที่จะทำการแก้ไข ตรวจสอบ!' + err);
                res.render('year/edit', { title: 'Yearly Manage', caption: 'จัดการปีเพาะปลูก', _id: req.params._id, findText: req.params.findText, result: payload });
            } else {
                req.flash('success', { msg: 'ทำการแก้ไข สำเร็จ.' });
                res.render('year/edit', { title: 'Yearly Manage', caption: 'จัดการปีเพาะปลูก', _id: req.params._id, findText: req.params.findText, result: payload });
            }
        });
    }
}

//delete   /year/delete/:_id/:findText
exports.getYearDelete = (req, res) => {
    // console.log('req.params' + req.params);
    Yearss.findByIdAndRemove({ _id: req.params._id }, (err, result) => {
        if (err) { return next(err); }
        let query = [
            { yearName: new RegExp(req.params.findText, 'i') },
            { yearCaption: new RegExp(req.params.findText, 'i') }
        ]
        Yearss.find({ $or: query }, (err, result) => {
            if (err) {
                req.flash('errors', 'ไม่พบข้อมูล ตรวจสอบ!');
                res.render('year/index', { title: 'Product Management', caption: 'จัดการปีเพาะปลูก', findText: req.params.findText });
            } else {
                req.flash('success', { msg: 'ลบ ปีเพาะออกจากระบบ สำเร็จ! ' });
                res.render('year/index', { title: 'Yearly Management', caption: 'จัดการปีเพาะปลูก', findText: req.params.findText, result: result });
            }
        });
    });
}

//year/findText?findText=p   getFindText
exports.getFindText = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.query.findText.trim())) validationErrors.push({ msg: 'Please enter a valid Find Text Search.' });
    let findText = req.query.findText.trim();
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('year/index', { title: 'Yearly Manage', caption: 'จัดการปีเพาะปลูก', findText: findText });
    } else {
        let query = [
            { yearName: new RegExp(req.query.findText.trim(), 'i') },
            { yearCaption: new RegExp(req.query.findText.trim(), 'i') }
        ]
        Yearss.find({ $or: query }, (err, result) => {
            if (err) {
                req.flash('errors', 'ไม่พบข้อมูลที่จะทำการแก้ไข ตรวจสอบ!');
                res.render('year/index', { title: 'Yearly Manage', caption: 'จัดการปีเพาะปลูก', findText: findText });
            } else {
                req.flash('success', { msg: 'ค้นพบ จำนวน ' + result.length + ' รายการ ' });
                res.render('year/index', { title: 'ํYearly Manage', caption: 'จัดการปีเพาะปลูก', findText: findText, result: result });
            }
        });
    }
}