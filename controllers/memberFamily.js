//file : controllers/memberFamily.js
const validator = require('validator');
const { promisify } = require('util');
const _ = require('lodash');
const Member = require('../models/Member');
const MemberFamily = require('../models/MemberFamily');
const Family = require('../models/Family');

const moment = require('moment');

exports.getMemberFamily = (req, res) => {
    res.render('memberfamily/index', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว' });
};



exports.getMemberFamilyReport = async (req, res) => {
  const filter = { statusId: { $eq: 1 }, memberType : {$eq :'สามัญ'} };
  let docs = await Member.aggregate([
    { $match: filter },
    {
      $lookup : {
        from: "families",
        localField: "memberId",
        foreignField: "memberId",
        as: "member_families"
      }
    } 
  ]);
  // console.log(docs[0].member_families);
  // res.send({docs:docs}); 
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  if(docs.length <= 0){
    res.render('memberfamily/report', { title: 'Member-Family Report', caption: 'รายงาน สมาชิก-คนในครอบครัวทั้งหมด'});
  }
  else{
    res.render('memberfamily/report', { title: 'Member-Family Report', caption: 'รายงาน สมาชิก-คนในครอบครัวทั้งหมด', resultMemberFamily:docs,currentYear:currentYear,currentMonth:currentMonth });
  }
}

 


exports.getMemberFamilyFindByIdInfo = (req, res) => {
    MemberFamily.findById({ _id: req.query._id }, (err, result) => {
        if (err) {
            req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
            res.send({ 'confirm': 'failed' });
        } else {
            res.send({ 'confirm': 'success', data: result });
        }
    });
};

// memberFamily/findByIdInfo getMemberFamilyFindByIdInfoFamily
exports.getMemberFamilyFindByIdInfoFamily = (req, res) => {
    Family.findById({ _id: req.query._id }, (err, result) => {
        if (err) {
            req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
            res.send({ 'confirm': 'failed', data: [] });
        } else {
            res.send({ 'confirm': 'success', data: result });
        }
    });
};

//find text search member
exports.getMemberFamilyFindText = (req, res, next) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.findText.trim())) validationErrors.push({ msg: 'Please enter a findText.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('memberfamily/index', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว', findText: req.body.findText.trim() });
    } else {
        let query = [
            { memberId: new RegExp(req.body.findText.trim(), 'i') },
            { district: new RegExp(req.body.findText.trim(), 'i') },
            { village: new RegExp(req.body.findText.trim(), 'i') },
            { subDistrict: new RegExp(req.body.findText.trim(), 'i') },
            { phone: new RegExp(req.body.findText.trim(), 'i') },
            { province: new RegExp(req.body.findText.trim(), 'i') },
            { IDCARD: new RegExp(req.body.findText.trim(), 'i') }
        ];
        Member.find({ $or: query }, (err, result) => {
            if (err) {
                req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!');
                res.render('memberfamily/index', { title: 'Member-Family Management', caption: 'จัดการสมาชิก-คนในครอบครัว', _id: req.params._id, findText: req.body.findText, payload: null });
            } else {
                req.flash('success', { msg: 'ค้นพบจำนวน ' + result.length + ' รายการ' });
                res.render('memberfamily/index', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว', result: result, findText: req.body.findText });
            }
        });
    }
};

//find text search member
exports.getMemberFamilyFindTextt = (req, res, next) => {
    const validationErrors = [];
    if (validator.isEmpty(req.params.findText)) validationErrors.push({ msg: 'Please enter a findText.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('memberfamily/index', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว', findText: req.params.findText });
    } else {
        let query = [
            { memberId: new RegExp(req.params.findText, 'i') },
            { district: new RegExp(req.params.findText, 'i') },
            { village: new RegExp(req.params.findText, 'i') },
            { subDistrict: new RegExp(req.params.findText, 'i') },
            { phone: new RegExp(req.params.findText, 'i') },
            { province: new RegExp(req.params.findText, 'i') },
            { IDCARD: new RegExp(req.params.findText, 'i') }
        ];
        Member.find({ $or: query }, (err, result) => {
            if (err) {
                req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!');
                res.render('memberfamily/index', { title: 'Member-Family Management', caption: 'จัดการสมาชิก-คนในครอบครัว', _id: req.params._id, findText: req.params.findText, payload: null });
            } else {
                req.flash('success', { msg: 'ค้นพบจำนวน ' + result.length + ' รายการ' });
                res.render('memberfamily/index', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว', result: result, findText: req.params.findText });
            }
        });
    }
};

//edit member-area with memberId getMemberFamilyWithMemberId
exports.getMemberFamilyWithMemberId = (req, res, next) => {
    let query = [{
        memberId: req.params.memberId
    }];
    MemberFamily.find({ $or: query }, (err, memberFamilyResult) => {
        if (err) {
            req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
            res.render('memberfamily/index', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว', _id: req.params._id, findText: req.params.findText, memberFamilyResult: null, familyResult: null });
        } else {
            Family.find({ $or: query }, (err, familyResult) => {
                if (err) {
                    req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
                    res.render('memberfamily/edit', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว', memberId: req.params.memberId, findText: req.params.findText, memberFamilyResult: memberFamilyResult, familyResult: null });
                } else {
                    req.flash('success', { msg: 'ค้นพบจำนวน ' + familyResult.length + ' รายการ' });
                    res.render('memberfamily/edit', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว', memberId: req.params.memberId, findText: req.params.findText, memberFamilyResult: memberFamilyResult, familyResult: familyResult });
                }
            });
        }
    });
};

// setAreaIdToMember
exports.setIDCARDToMember = (req, res, next) => {
    let setGet = req.params.memberId.trim();
    let findText = null;
    if (req.params.setGet == '0') {
        setGet = 'XXXXXXXXXXXXX';


        //IF IDCARD OF MEMBER == IDCARD OF FAMILY THEN DELETE
        //OR UPDATE MEMBER WITH THE NEW IDCARD ='0000000000000'
        // Member.findOneAndUpdate({IDCARD:req.params.IDCARD})

        Member.findOneAndUpdate({ 'IDCARD':req.params.IDCARD }, { 'IDCARD':'0000000000000' }, { new: true }, (err) => {
          if (err) {
              res.send({ 'confirm': 'failed' });
          }
        });
    }

    findText = req.params.findText;
    const payload = { memberId: setGet };
    Family.findByIdAndUpdate({ '_id': req.params._id }, payload, { new: true }, (err) => {
        if (err) {
            req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
            res.render('memberfamily/edit', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว', memberId: req.params.memberId, findText: findText, memberFamilyResult: [], familyResult: [], familyResultNotIn: [] });
        } else {
            let query = [{
                $or: [
                    { IDCARD: new RegExp(req.params.findTextIDCARD.trim(), 'i') },
                    { firstName: new RegExp(req.params.findTextIDCARD.trim(), 'i') },
                    { lastName: new RegExp(req.params.findTextIDCARD.trim(), 'i') },
                    { phone: new RegExp(req.params.findTextIDCARD.trim(), 'i') }
                ],
                memberId: { $not: { $eq: req.params.memberId } }
            }];
            Family.find({ $and: query }, (err, familyResult) => {
                if (err) {
                    req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
                    res.render('memberfamily/edit', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว', memberId: req.params.memberId, findText: findText, memberFamilyResult: null, familyResult: familyResult0, familyResultNotIn: null, findTextIDCARD: req.params.findTextIDCARD });
                } else {
                    Family.find({ memberId: req.params.memberId }, (err, familyResult0) => {
                        if (err) {
                            req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
                            res.render('memberfamily/edit', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว', memberId: req.params.memberId, findText: findText, memberFamilyResult: null, familyResult: null, familyResultNotIn: familyResult, findTextIDCARD: req.params.findTextIDCARD });
                        } else {
                            req.flash('success', { msg: 'Set IDCARD to Member ID Success' });
                            res.render('memberfamily/edit', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว', memberId: req.params.memberId, findText: findText, memberFamilyResult: null, familyResult: familyResult0, familyResultNotIn: familyResult, findTextIDCARD: req.params.findTextIDCARD });
                        }
                    });
                }
            });
        }
    });
}

//memberFamily/findIDCARD/:memberId  (POST findTextIDCARD, findText)
exports.postfindIDCARD = (req, res, next) => {
    let query = [{
        $or: [
            { IDCARD: new RegExp(req.body.findTextIDCARD.trim(), 'i') },
            { firstName: new RegExp(req.body.findTextIDCARD.trim(), 'i') },
            { lastName: new RegExp(req.body.findTextIDCARD.trim(), 'i') },
            { phone: new RegExp(req.body.findTextIDCARD.trim(), 'i') }
        ],
        memberId: { $not: { $eq: req.params.memberId } }
    }];
    Family.find({ $and: query }, (err, familyResult) => {
        if (err) {
            req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
            res.render('memberarea/edit', { title: 'Member-Area Family', caption: 'จัดการสมาชิก-คนในครอบครัว', memberId: req.params.memberId, findTextIDCARD: req.body.findTextIDCARD, memberAreaResult: [], areaResult: areaResult0, areaResultNotIn: [] });
        } else {
            Family.find({ memberId: req.params.memberId }, (err, familyResult0) => {
                if (err) {
                    req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
                    res.render('memberfamily/edit', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว', memberId: req.params.memberId, findTextIDCARD: req.body.findTextIDCARD, memberFamilyResult: [], familyResult: [], familyResultNotIn: familyResult, findText: req.body.findText_ });
                } else {
                    req.flash('success', { msg: 'ค้นพบจำนวน ' + familyResult.length + ' รายการ' });
                    res.render('memberfamily/edit', { title: 'Member-Family Manage', caption: 'จัดการสมาชิก-คนในครอบครัว', memberId: req.params.memberId, findTextIDCARD: req.body.findTextIDCARD, memberFamilyResult: [], familyResult: familyResult0, familyResultNotIn: familyResult, findText: req.body.findText_ });
                }
            });
        }
    });
};