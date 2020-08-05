//file : controllers/member.js
const validator = require('validator');
const { promisify } = require('util');
const _ = require('lodash');
const Area = require('../models/Area');
const Member = require('../models/Member');
const MemberArea = require('../models/MemberArea');
const moment = require('moment');

exports.getMemberArea = (req, res) => {
    res.render('memberarea/index', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-พื้นที่เพาะปลูก' });
};


//report getMemberAreaReport
exports.getMemberAreaReport = async (req, res) => {
  const filter = { statusId: { $eq: 1 }, memberType : {$eq :'สามัญ'} };
  let docs = await Member.aggregate([
    { $match: filter },
    {
      $lookup : {
        from: "areas",
        localField: "memberId",
        foreignField: "memberId",
        as: "member_areas"
      }
    } 
  ]);
  // console.log(docs[0].member_areas);
  // res.send({docs:docs}); 
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  if(docs.length <= 0){
    res.render('memberarea/report', { title: 'Member-Area Report', caption: 'รายงาน แปลงปลูกทั้งหมด'});
  }
  else{
    res.render('memberarea/report', { title: 'Member-Area Report', caption: 'รายงาน แปลงปลูกทั้งหมด', resultMemberArea:docs,currentYear:currentYear,currentMonth:currentMonth });
  }
};






exports.getMemberAreaFindByIdInfo = (req, res) => {
    MemberArea.findById({ _id: req.query._id }, (err, result) => {
        if (err) {
            req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
            res.send({ 'confirm': 'failed' });
        } else {
            res.send({ 'confirm': 'success', data: result });
        }
    });   
};

//find text search member
exports.getMemberAreaFindText = (req, res, next) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.findText.trim())) validationErrors.push({ msg: 'Please enter a findText.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('memberarea/index', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-พื้นที่เพาะปลูก', findText: req.body.findText.trim() });
    } else {
        let query = [
            { memberId: new RegExp(req.body.findText.trim(), 'i') },
            { district: new RegExp(req.body.findText.trim(), 'i') },
            { village: new RegExp(req.body.findText.trim(), 'i') },
            { subDistrict: new RegExp(req.body.findText.trim(), 'i') },
            { phone: new RegExp(req.body.findText.trim(), 'i') },
            { province: new RegExp(req.body.findText.trim(), 'i') },
            { IDCARD: new RegExp(req.body.findText.trim(), 'i') }
          ]
            // { memberType: 'สามัญ' }
        Member.find({ $or: query }, (err, result) => {
            if (err) {
                req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!');
                // res.render('memberarea/index', { title: 'Member-Area Management', caption: 'จัดการสมาชิก-พื้นที่เพาะปลูก', _id: req.params._id, findText: req.params.findText, payload: null });
                res.render('memberarea/index', { title: 'Member-Area Management', caption: 'จัดการสมาชิก-พื้นที่เพาะปลูก', _id: req.params._id, findText: req.body.findText.trim(), payload: null });
            } else {
                // console.log(result);
                req.flash('success', { msg: 'ค้นพบจำนวน ' + result.length + ' รายการ' });
                res.render('memberarea/index', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-แปลงเพาะปลูก', result: result, findText: req.body.findText.trim() });
            }
        });
    }
};
exports.getMemberAreaFindTextt = (req, res, next) => {
    const validationErrors = [];
    if (validator.isEmpty(req.params.findText)) validationErrors.push({ msg: 'Please enter a findText.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('memberarea/index', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-พื้นที่เพาะปลูก', findText: req.body.findText.trim() });
    } else {
        let query = [
            { memberId: new RegExp(req.params.findText, 'i') },
            { areaId: new RegExp(req.params.findText, 'i') },
            { village: new RegExp(req.params.findText, 'i') },
            { subDistrict: new RegExp(req.params.findText, 'i') },
            { phone: new RegExp(req.params.findText, 'i') },
            { province: new RegExp(req.params.findText, 'i') }
        ];
        Member.find({ $or: query }, (err, result) => {
            if (err) {
                req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!');
                res.render('memberarea/index', { title: 'Member-Area Management', caption: 'จัดการสมาชิก-พื้นที่เพาะปลูก', _id: req.params._id, findText: req.params.findText, findText_: req.params.findText, payload: null });
            } else {
                req.flash('success', { msg: 'ค้นพบจำนวน ' + result.length + ' รายการ' });
                res.render('memberarea/index', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-แปลงเพาะปลูก', result: result, findText: req.params.findText, findText_: req.params.findText });
            }
        });
    }
};

//edit member-area with memberId
exports.getMemberAreaWithMemberId = (req, res, next) => {
    let query = [{
        memberId: req.params.memberId
    }];
    MemberArea.find({ $or: query }, (err, memberAreaResult) => {
        if (err) {  
            req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
            res.render('memberarea/index', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-พื้นที่เพาะปลูก', _id: req.params._id, findText: req.params.findText, memberAreaResult: null, areaResult: null });
        } else {
            Area.find({ $or: query }, (err, areaResult) => {
                if (err) {
                    req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
                    res.render('memberarea/edit', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-แปลงเพาะปลูก', memberId: req.params.memberId, findText: req.params.findText, memberAreaResult: memberAreaResult, areaResult: null });
                } else {
                    req.flash('success', { msg: 'ค้นพบจำนวน ' + areaResult.length + ' รายการ' });
                    res.render('memberarea/edit', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-แปลงเพาะปลูก', memberId: req.params.memberId, findText: req.params.findText, memberAreaResult: memberAreaResult, areaResult: areaResult });
                }
            });
        }
    });
};

// setAreaIdToMember
exports.setAreaIdToMember = (req, res, next) => {
    console.log(req.params);
    let setGet = req.params.memberId.trim();
    let findText = null;
    if (req.params.setGet == '0') {
        setGet = 'XXXXXXXXXX';
    } 

    // console.log('findText>>>>' + findText);
    findText = req.params.findText;
    // console.log('findText>>>>' + findText);
    const payload = { memberId: setGet };
    Area.findByIdAndUpdate({ '_id': req.params._id }, payload, { new: true }, (err) => {
        if (err) {
            // return next(err);
            req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
            res.render('memberarea/edit', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-แปลงเพาะปลูก', memberId: req.params.memberId, findText: findText, memberAreaResult: [], areaResult: [], areaResultNotIn: [], findTextAreaId:req.params.findTextAreaId });
        } else {
            let query = [{
                areaId: new RegExp(findText, 'i'),
                memberId: { $not: { $eq: req.params.memberId } }
            }];
            Area.find({ $and: query }, (err, areaResult) => {
                if (err) {
                    req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
                    res.render('memberarea/edit', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-แปลงเพาะปลูก', memberId: req.params.memberId, findText: findText, memberAreaResult: null, areaResult: areaResult0, areaResultNotIn: null, findTextAreaId:req.params.findTextAreaId });
                } else {
                    Area.find({ memberId: req.params.memberId }, (err, areaResult0) => {
                        if (err) {
                            req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
                            res.render('memberarea/edit', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-แปลงเพาะปลูก', memberId: req.params.memberId, findText: findText, memberAreaResult: null, areaResult: null, areaResultNotIn: areaResult, findTextAreaId:req.params.findTextAreaId });
                        } else {
                            req.flash('success', { msg: 'Set Area ID to Member ID Success' });
                            res.render('memberarea/edit', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-แปลงเพาะปลูก', memberId: req.params.memberId, findText: findText, memberAreaResult: null, areaResult: areaResult0, areaResultNotIn: areaResult, findTextAreaId:req.params.findTextAreaId });
                        }
                    });
                }
            });
        }
    });
}

exports.postFindAreaId = (req, res, next) => {
    // console.log(req.body);
    //{$and: [{areaId:'1000-002',memberId:{$not:{$eq:'Member ID'}}}]}
    let query = [{
        $or:[
          {areaId: new RegExp(req.body.findTextAreaId.trim(), 'i')},
          {areaName: new RegExp(req.body.findTextAreaId.trim(), 'i')},
          {village: new RegExp(req.body.findTextAreaId.trim(), 'i')},
          {subDistrict: new RegExp(req.body.findTextAreaId.trim(), 'i')},
          {district: new RegExp(req.body.findTextAreaId.trim(), 'i')},
          {province: new RegExp(req.body.findTextAreaId.trim(), 'i')},
          {latitude: new RegExp(req.body.findTextAreaId.trim(), 'i')},
          {longitude: new RegExp(req.body.findTextAreaId.trim(), 'i')}
        ],
        memberId: { $not: { $eq: req.params.memberId } }
    }];
    // console.log(query);
    Area.find({ $and: query }, (err, areaResult) => {
        if (err) {
            req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
            res.render('memberarea/edit', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-แปลงเพาะปลูก', memberId: req.params.memberId, findTextAreaId: req.body.findTextAreaId, memberAreaResult: [], areaResult: areaResult0, areaResultNotIn: [], findText: req.body.findText_ });
        } else {
            // console.log(memberAreaResult);
            // console.log(areaResult);
            Area.find({ memberId: req.params.memberId }, (err, areaResult0) => {
                if (err) {
                    req.flash('errors', 'ไม่พบข้อมูลที่จะทำที่ค้นหา ตรวจสอบ!' + err);
                    res.render('memberarea/edit', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-แปลงเพาะปลูก', memberId: req.params.memberId, findTextAreaId: req.body.findTextAreaId, memberAreaResult: [], areaResult: [], areaResultNotIn: areaResult, findText: req.body.findText_ });
                } else {
                    req.flash('success', { msg: 'ค้นพบจำนวน ' + areaResult.length + ' รายการ' });
                    res.render('memberarea/edit', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-แปลงเพาะปลูก', memberId: req.params.memberId, findTextAreaId: req.body.findTextAreaId, memberAreaResult: [], areaResult: areaResult0, areaResultNotIn: areaResult, findText: req.body.findText_ });
                }
            });
        }
    });
};