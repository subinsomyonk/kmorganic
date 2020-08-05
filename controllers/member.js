//file : controllers/member.js
const validator = require('validator');
const { promisify } = require('util');
const _ = require('lodash');
const Member = require('../models/Member');
const Family = require('../models/Family');
const Area = require('../models/Area');
const moment = require('moment');

exports.getMember = (req, res) => {
  res.render('member/index', { title: 'Member Management', caption: 'จัดการสมาชิก' });
};


//20200616 2126 set head of member  (post memberId, and IDCARD)
//app.post('/member/setMemberHead', passportConfig.isAuthenticated, memberController.setMemberHead)
exports.setMemberHead = (req, res) => {
  Member.findOneAndUpdate({ 'memberId': req.query.memberId }, { 'IDCARD': req.query.IDCARD }, { new: true }, (err) => {
    if (err) {
      res.send({ 'confirm': 'failed' });
    } else {
      res.send({ 'confirm': 'success Set the IDCARD To Head Of The MemberID!' });
    }
  });
}

exports.getMemberHome = (req, res) => {
  res.render('member/home', { title: 'HOME Management', caption: 'ตรวจสอบ สมาชิกทั้งหมด', result: [] });
}
// app.get('/member/show/:memberId/:findText', memberController.getMemberShow);
exports.getMemberShow = (req, res) => {
  console.log(req.params);
  let memberId = req.params.memberId;
  let findText = req.params.findText;
  let query = [
    { memberId: new RegExp(req.params.findText, 'i') },
    { village: new RegExp(req.params.findText, 'i') },
    { subDistrict: new RegExp(req.params.findText, 'i') },
    { phone: new RegExp(req.params.findText, 'i') },
    { district: new RegExp(req.params.findText, 'i') },
    { province: new RegExp(req.params.findText, 'i') },
    { IDCARD: new RegExp(req.params.findText, 'i') },
    { postCode: new RegExp(req.params.findText, 'i') }
  ];
  Member.find({ $or: query }, (err, result) => {
    if (err) {
      // req.flash('errors', { msg: 'ผิดพลาดค้นหา ตรวจสอบ.: ' + err });
      res.render('member/home', { findText: req.params.findText, title: 'HOME Management', caption: 'ตรวจสอบ สมาชิกทั้งหมด', result: [] });
    } else {
      // each member
      Member.find({ memberId: memberId }, (err, memberResult) => {
        if (err) {
          req.flash('errors', { msg: 'ผิดพลาดค้นหา ตรวจสอบ.: ' + err });
          res.render('member/home', { findText: req.params.findText, title: 'HOME Management', caption: 'ตรวจสอบ สมาชิกทั้งหมด', result: result, memberResult: [] });
        }
        else {
          //Area
          Area.find({ memberId: memberId }, (err, areaResult) => {
            if (err) {
              res.render('member/home', { findText: req.params.findText, title: 'HOME Management', caption: 'ตรวจสอบ สมาชิกทั้งหมด', result: result, memberResult: memberResult, areaResult: [] });
            }
            else {
              //Family
              Family.find({ memberId: memberId }, (err, familyResult) => {
                if (err) {
                  res.render('member/home', { findText: req.params.findText, title: 'HOME Management', caption: 'ตรวจสอบ สมาชิกทั้งหมด', result: result, memberResult: memberResult, areaResult: areaResult, familyResult: [] });
                }
                else {
                  res.render('member/home', { findText: req.params.findText, title: 'HOME Management', caption: 'ตรวจสอบ สมาชิกทั้งหมด', result: result, memberResult: memberResult, areaResult: areaResult, familyResult: familyResult });
                }
              })
            }
          })
        }
      })
    }
  });
}
//export to excel url : /member/memberAll
exports.postMemberHome = (req, res) => {
  const validationErrors = [];
  if (validator.isEmpty(req.body.findText)) validationErrors.push({ msg: 'Please enter a findText.' });
  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    res.render('member/home', { title: 'Member Management', caption: 'จัดการสมาชิก' });
  } else {
    let query = [
      { memberId: new RegExp(req.body.findText.trim(), 'i') },
      { village: new RegExp(req.body.findText.trim(), 'i') },
      { subDistrict: new RegExp(req.body.findText.trim(), 'i') },
      { phone: new RegExp(req.body.findText.trim(), 'i') },
      { district: new RegExp(req.body.findText.trim(), 'i') },
      { province: new RegExp(req.body.findText.trim(), 'i') },
      { IDCARD: new RegExp(req.body.findText.trim(), 'i') },
      { postCode: new RegExp(req.body.findText.trim(), 'i') }
    ];
    Member.find({ $or: query }, (err, result) => {
      if (err) {
        req.flash('errors', { msg: 'ผิดพลาดค้นหา ตรวจสอบ.: ' + err });
        res.render('member/home', { findText: req.body.findText.trim(), title: 'HOME Management', caption: 'ตรวจสอบ สมาชิกทั้งหมด', result: [] });
      } else {
        // req.flash('success', { msg: 'แสดงรายการสมาชิกทั้งหมด' });
        // res.send({ 'confirm': 'success', data: result });
        res.render('member/home', { findText: req.body.findText.trim(), title: 'HOME Managementvvvv', caption: 'ตรวจสอบ สมาชิกทั้งหมด', result: result });
      }
    });
  }
};

//export to excel url : /member/memberAll
exports.getMemberAll = (req, res) => {
  Member.find({}, (err, result) => {
    // let arr = [{'IDCARD':'2222222222222'},{'IDCARD':'111111111111'}];
    if (err) {
      req.flash('errors', { msg: 'ผิดพลาดค้นหา ตรวจสอบ.: ' + err });
      res.render('member/all', { title: 'Member Management', caption: 'สมาชิกทั้งหมด', result: [] });
    } else {
      req.flash('success', { msg: 'แสดงรายการสมาชิกทั้งหมด' });
      res.render('member/all', { title: 'Member Management', caption: 'สมาชิกทั้งหมด', result: result });
    }
  });
};
exports.getMemberFindByIdInfo = (req, res) => {
  // console.log(req.query._id);
  Member.findById({ _id: req.query._id }, (err, result) => {
    if (err) {
      req.flash('errors', { msg: 'ผิดพลาดค้นหา ตรวจสอบ.: ' + err });
      res.send({ 'confirm': 'failed' });
    } else {
      // req.flash('success', { msg: 'แสดงรายการสมาชิกทั้งหมด' });
      // console.log(result.IDCARD);
      // console.log('result.IDCARD');

      Family.find({ IDCARD: result.IDCARD }, (err, resultFLName) => {
        if (err) {
          // req.flash('errors', { msg: 'ผิดพลาดค้นหา ตรวจสอบ.: ' + err });
          // res.send({ 'confirm': 'failed' });
          res.send({ 'confirm': 'success', data: result, flName: 'ยังไม่ได้ กำหนด' });
        }
        else {
          if (resultFLName.length <= 0) {
            res.send({ 'confirm': 'success', data: result, flName: 'ยังไม่ได้ กำหนด' });
          }
          else {
            res.send({ 'confirm': 'success', data: result, flName: resultFLName[0].firstName + ' ' + resultFLName[0].lastName });
          }
        }
      });
    }
  });
};

exports.getMemberFindByMemberIdInfo = (req, res) => {
  // console.log(req.query._id);
  Member.find({ memberId: req.query.memberId }, (err, result) => {
    if (err) {
      req.flash('errors', { msg: 'ผิดพลาดค้นหา ตรวจสอบ.: ' + err });
      res.send({ 'confirm': 'failed' });
    } else {

      Family.findOne({ IDCARD: result[0].IDCARD }, (err, familyFLNameResult) => {
        if (err) {
          req.flash('errors', { msg: 'ผิดพลาดค้นหา ตรวจสอบ.: ' + err });
          res.send({ 'confirm': 'failed' });
        }
        else {
          res.send({ 'confirm': 'success', data: result, familyResult: familyFLNameResult });
        }
      });


    }
  });
};

//delete member
exports.getMemberDelete = (req, res) => {
    Member.findByIdAndRemove({ _id: req.query._id }, (err, result) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'ลบออกคนในครอบครัว สำเร็จ! ' });
        res.redirect('../member/findText?findText=' + req.query.findText);
    });
};
exports.getMemberFindText = (req, res, next) => {
  const validationErrors = [];
  if (validator.isEmpty(req.query.findText)) validationErrors.push({ msg: 'Please enter a findText.' });
  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    res.render('member/index', { title: 'Member Management', caption: 'จัดการสมาชิก' });
  } else {
    let query = [
      { memberId: new RegExp(req.query.findText.trim(), 'i') },
      { village: new RegExp(req.query.findText.trim(), 'i') },
      { subDistrict: new RegExp(req.query.findText.trim(), 'i') },
      { phone: new RegExp(req.query.findText.trim(), 'i') },
      { district: new RegExp(req.query.findText.trim(), 'i') },
      { province: new RegExp(req.query.findText.trim(), 'i') },
      { IDCARD: new RegExp(req.query.findText.trim(), 'i') },
      { postCode: new RegExp(req.query.findText.trim(), 'i') }
    ];
    Member.find({ $or: query }, (err, result) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'ค้นพบจำนวน ' + result.length + ' รายการ' });
      res.render('member/index', { title: 'Member Management', caption: 'จัดการสมาชิก', result: result, findText: req.query.findText });
    });
  }
};

exports.postMemberFindText = (req, res, next) => {
  const validationErrors = [];
  if (validator.isEmpty(req.body.findText)) validationErrors.push({ msg: 'Please enter a findText.' });
  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    res.render('member/index', { title: 'Member Management', caption: 'จัดการสมาชิก' });
  } else {
    let query = [
      { memberId: new RegExp(req.body.findText.trim(), 'i') },
      { village: new RegExp(req.body.findText.trim(), 'i') },
      { subDistrict: new RegExp(req.body.findText.trim(), 'i') },
      { phone: new RegExp(req.body.findText.trim(), 'i') },
      { district: new RegExp(req.body.findText.trim(), 'i') },
      { province: new RegExp(req.body.findText.trim(), 'i') },
      { IDCARD: new RegExp(req.body.findText.trim(), 'i') },
      { postCode: new RegExp(req.body.findText.trim(), 'i') }
    ];
    Member.find({ $or: query }, (err, result) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'ค้นพบจำนวน ' + result.length + ' รายการ' });
      res.render('member/index', { title: 'Member Management', caption: 'จัดการสมาชิก', result: result, findText: req.body.findText });
    });
  }
};
//edit for update
exports.getMemberEdit = (req, res, next) => {
  Member.findById(req.params._id, (err, result) => {
    if (err) {
      // return next(err);
      req.flash('errors', 'ไม่พบข้อมูลที่จะทำการแก้ไข ตรวจสอบ!');
      res.render('member/edit', { title: 'Member Management', caption: 'จัดการสมาชิก', _id: req.params._id, findText: req.params.findText, payload: null });
    } else {
      res.render('member/edit', { title: 'Member Management', caption: 'จัดการสมาชิก', _id: req.params._id, findText: req.params.findText, payload: result });
    }
  });
};

//member update
exports.postMemberEditUpdate = (req, res, next) => {

  if (req.body.statusId == 'on') {
    req.body.statusId = 1;
  } else {
    req.body.statusId = 0;
  }
  // delete req.body.memberId;
  const payload = req.body;
  const validationErrors = [];
  if (validator.isEmpty(req.body.memberId.trim())) validationErrors.push({ msg: 'Please enter a valid Member Id.' });
  if (validator.isEmpty(req.body.homeNo.trim())) validationErrors.push({ msg: 'Please enter a valid Home No.' });
  if (validator.isEmpty(req.body.groupNo)) validationErrors.push({ msg: 'Please enter a valid Group No.' });
  if (validator.isEmpty(req.body.village.trim())) validationErrors.push({ msg: 'Please enter a valid Village.' });
  if (validator.isEmpty(req.body.subDistrict.trim())) validationErrors.push({ msg: 'Please enter a valid Sub District.' });
  if (validator.isEmpty(req.body.district.trim())) validationErrors.push({ msg: 'Please enter a valid District.' });
  if (validator.isEmpty(req.body.province.trim())) validationErrors.push({ msg: 'Please enter a valid Province.' });
  if (validator.isEmpty(req.body.postCode.trim())) validationErrors.push({ msg: 'Please enter a valid Post Code.' });

  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    res.render('member/edit', { title: 'Member Management', caption: 'จัดการสมาชิก', findText: req.params.findText, payload: payload, _id: req.params._id });
  } else {
    Member.findByIdAndUpdate({ '_id': req.params._id }, payload, { new: true }, (err) => {
      if (err) {
        // return next(err);
        req.flash('errors', 'ไม่พบข้อมูลที่จะทำการแก้ไข ตรวจสอบ!' + err);
        res.render('member/edit', { title: 'Member Management', caption: 'จัดการสมาชิก', findText: req.params.findText, _id: req.params._id, payload: payload });
      } else {
        req.flash('success', { msg: 'ทำการแก้ไข สำเร็จ.' });
        res.render('member/edit', { title: 'Member Management', caption: 'จัดการสมาชิก', findText: req.params.findText, _id: req.params._id, payload: payload });
      }
    });
  };
};
//add member get
exports.getMemberAdd = (req, res, next) => {
  if (req.query.findText) {
    res.render('member/add', { title: 'Member Manage', caption: 'จัดการสมาชิก', findText: req.query.findText, payload: [] });
  } else {
    res.render('member/add', { title: 'Member Manage', caption: 'จัดการสมาชิก', findText: req.query.findText, payload: [] });
  }
};
//add member post
exports.postMemberAdd = (req, res, next) => {
  // console.log(req.body);
  let findText = req.body.findText_;
  let register = '1900-01-01';
  if (req.body.register) {
    register = req.body.register;
    // req.body.register = register;
  };
  let payload = req.body;
  const validationErrors = [];

  if (validator.isEmpty(req.body.memberId.trim())) validationErrors.push({ msg: 'Please enter a valid Member Id.' });
  if (validator.isEmpty(req.body.homeNo.trim())) validationErrors.push({ msg: 'Please enter a valid Home No.' });
  if (validator.isEmpty(req.body.groupNo)) validationErrors.push({ msg: 'Please enter a valid Group No.' });
  if (validator.isEmpty(req.body.village.trim())) validationErrors.push({ msg: 'Please enter a valid Village.' });
  if (validator.isEmpty(req.body.subDistrict.trim())) validationErrors.push({ msg: 'Please enter a valid Sub District.' });
  if (validator.isEmpty(req.body.district.trim())) validationErrors.push({ msg: 'Please enter a valid District.' });
  if (validator.isEmpty(req.body.province.trim())) validationErrors.push({ msg: 'Please enter a valid Province.' });
  if (validator.isEmpty(req.body.postCode.trim())) validationErrors.push({ msg: 'Please enter a valid Post Code.' });

  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    res.render('member/add', { title: 'Member Management', caption: 'จัดการสมาชิก', payload: payload });
  } else {
    const member = new Member({
      memberId: req.body.memberId.trim(),
      homeNo: req.body.homeNo.trim(),
      groupNo: req.body.groupNo,
      village: req.body.village.trim(),
      subDistrict: req.body.subDistrict.trim(),
      district: req.body.district.trim(),
      province: req.body.province.trim(),
      postCode: req.body.postCode.trim(),
      memberType: req.body.memberType.trim(),
      shareHolder: req.body.shareHolder,
      register: new Date(register),
      notes: req.body.notes.trim(),
      IDCARD: req.body.IDCARD.trim(),
      phone: req.body.phone.trim(),
      organizeName: req.body.organizeName.trim()
    });
    member.save((err) => {
      if (err) {
        req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
        res.render('member/add', { title: 'Member Management', caption: 'จัดการสมาชิก', payload: payload, findText: findText });
      } else {
        req.flash('success', { msg: 'บันทึก เพิ่มสำเร็จ.' });
        res.render('member/add', { title: 'Member Management', caption: 'จัดการสมาชิก', payload: member, findText: findText });
      }
    });
  }
};