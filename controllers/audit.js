//file : controllers/audit.js

const validator = require('validator');
const { promisify } = require('util');
const _ = require('lodash');
const Area = require('../models/Area');
const Member = require('../models/Member');
const MemberArea = require('../models/MemberArea');

const Yearss = require('../models/Yearss');
const Produce = require('../models/Produce');
const Plant = require('../models/Plant');
const Audit = require('../models/Audit');

const moment = require('moment');
const { forEach, result } = require('lodash');
const { inArray } = require('jquery');


//app>> '/audit'
// /audit/audit/1
exports.getAudit = (req, res) => {
  let orders = req.params.orders;
  Yearss.find({ statusId: 1 }, (err, result) => {
    if (err) {
        req.flash('errors', { msg: 'ผิดพลาดในการค้นหา ตรวจสอบ.: ' + err });
        res.render('audit/index', { title: 'AUDIT Manage', caption: 'ตรวจสอบ ครั้งที่ '+ orders , orders:orders });
    } else {
      res.render('audit/index', { title: 'AUDIT Manage', caption: 'ตรวจสอบ ครั้งที่ '+ orders, yearResult:result , orders:orders  });
    } 
  }).sort({yearName:-1});   
};

exports.postAuditMember = (req, res) => {
  res.render('audit/member', { 
    title: 'AUDIT Manage',
    caption: 'ตรวจสอบ ครั้งที่ '+ req.body.orders, 
    yearName: req.body.yearName, 
    orders: req.body.orders });
};

exports.postAuditMemberFind = (req, res) => {
  const validationErrors = [];
    if (validator.isEmpty(req.body.findText)) validationErrors.push({ msg: 'Please enter a findText.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('audit/member', { 
          title: 'AUDIT Manage',
          caption: 'ตรวจสอบ ครั้งที่ '+ req.body.orders, 
          yearName: req.body.yearName, 
          orders: req.body.orders ,
          findText: req.body.findText,
          resultMember: resultMember})
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
        Member.find({ $or: query }, (err, resultMember) => {
            if (err) { 
              req.flash('errors', 'Database Error At Find Member Document, Let Admin To Know!');
              res.render('audit/member', { 
                title: 'AUDIT Manage',
                caption: 'ตรวจสอบ ครั้งที่ '+ req.body.orders, 
                yearName: req.body.yearName, 
                orders: req.body.orders ,
                findText: req.body.findText});
             }
            else{
              if(resultMember.length <=0){
                req.flash('errors', 'Note Found Any Member Document, Let Admin To Know!');
                res.render('audit/member', { 
                  title: 'AUDIT Manage',
                  caption: 'ตรวจสอบ ครั้งที่ '+ req.body.orders, 
                  yearName: req.body.yearName, 
                  orders: req.body.orders ,
                  findText: req.body.findText});
              }
              else{
                req.flash('success', { msg: 'ค้นหาด้วย : '+req.body.findText.trim() +' จำนวนที่พบ : ' + resultMember.length + ' รายการ' });
                res.render('audit/member', { 
                  title: 'AUDIT Manage',
                  caption: 'ตรวจสอบ ครั้งที่ '+ req.body.orders, 
                  yearName: req.body.yearName, 
                  orders: req.body.orders ,
                  findText: req.body.findText.trim(),
                  resultMemberLenght: resultMember.length,
                  resultMember: resultMember}); 
              }
            }          
        });
    }

};

exports.paramAuditMemberProduce = (req,res)=>{


  // console.log('paramAuditMemberProduce');
  // console.log(req.params);
  Produce.find({yearName:req.params.yearName, memberId:req.params.memberId},(err, resultProduce)=>{
    // console.log(resultProduce);
    if(err){
      req.flash('errors', 'Database Error At Find Produce Document, Let Admin To Know!');
      res.render('audit/produce', { 
        title: 'AUDIT Manage',
        caption: 'ตรวจสอบ ครั้งที่ '+ req.params.orders, 
        yearName: req.params.yearName, 
        orders: req.params.orders,
        memberId: req.params.memberId
        }); 
    }
    else{
      if(resultProduce.length <= 0){
        req.flash('success', 'Not Found Any Produce Document, Let Admin To Know!');
        res.render('audit/produce', { 
          title: 'AUDIT Manage',
          caption: 'ตรวจสอบ ครั้งที่ '+ req.params.orders, 
          yearName: req.params.yearName, 
          orders: req.params.orders,
          memberId: req.params.memberId }); 
      }
      else{
        res.render('audit/produce', { 
          title: 'AUDIT Manage',
          caption: 'ตรวจสอบ ครั้งที่ '+ req.params.orders, 
          yearName: req.params.yearName, 
          orders: req.params.orders,
          memberId: req.params.memberId,
          resultProduceLength:resultProduce.length,
          resultProduce:resultProduce });
      }
    }
  }).sort({areaId:1});
}

// audit/member/auditListAll/:yearName/:memberId/:orders
exports.paramAuditListAll = (req, res) =>{
  console.log(req.params);
  Audit.find({
    yearName: req.params.yearName,
    orders: req.params.orders,
    memberId: req.params.memberId
    }, (err, resultAudit) =>{

      if(err){
        res.send({
          confirm: 'Failed Error Database :'+err + ', Contact Admin!',
          yearName:req.params.yearName,
          memberId: req.params.memberId,
          orders: req.params.orders
        });
      }
      else{
        if(resultAudit.length <= 0){
          res.send({
            confirm: 'Not Found Any Document !',
            yearName:req.params.yearName,
            memberId: req.params.memberId,
            orders: req.params.orders
          });
        }
        else{
          res.send({
            confirm: 'Success!',
            yearName:req.params.yearName,
            memberId: req.params.memberId,
            orders: req.params.orders,
            resultAudit: resultAudit
          });
        }
      }

    }).sort({areaId:1});
}

// List Audit For Each MemberId
exports.paramAuditListItem = (req, res) =>{
  // console.log(req.query.areaName);
  // '+yearName+'/'+memberId+'/'+orders+'/'+_idProduce
  Audit.find({
    yearName: req.params.yearName,
    orders: req.params.orders,
    memberId: req.params.memberId,
    _idProduce: req.params._idProduce

    }, (err, resultAudit) =>{

      if(err){
        res.send({
          confirm:'failed',
          notes: 'Failed Error Database :'+err + ', Contact Admin!',
          yearName:req.params.yearName,
          memberId: req.params.memberId,
          orders: req.params.orders,
          areaName: req.query.areaName
        });
      }
      else{
        if(resultAudit.length <= 0){
          res.send({
            confirm:'failed',
            notes: 'Not Found Any Document !',
            yearName:req.params.yearName,
            memberId: req.params.memberId,
            orders: req.params.orders,
            areaName: req.query.areaName
          });
        }
        else{
          res.send({
            confirm: 'Success!',
            yearName:req.params.yearName,
            memberId: req.params.memberId,
            orders: req.params.orders,
            areaName: req.query.areaName,
            resultAudit: resultAudit
          });
        }
      }

    })
}

exports.paramGetAuditSave = (req, res)=>{
  // console.log(req.query);
  Produce.findById({'_id':req.params._idProduce}, (err, resultProduce) =>{
    // console.log(req.query);
    if(err){
      res.send({
        confirm : 'failed',
        resultProcess :'Error Document Produce, Contact Admin : Error '+err
      });
    }
    else{
      if(resultProduce.length <= 0){
        res.send({
          confirm : 'failed',
          resultProcess :'Not Found Any Record!, Try Anothers!'
        });
      }
      else{
        //find Audit with yearName, orders, memberId, areaId, plantNameTh
        // yearName+'/'+memberId+'/'+orders+'/'+_idProduce
        let query = {
          yearName : req.params.yearName,
          orders : req.params.orders,
          memberId : req.params.memberId,
          areaId : resultProduce.areaId,
          plantNameTh : resultProduce.plantNameTh,
          _idProduce : req.params._idProduce,
          areaName : req.query.areaName
        };
        // console.log('query : '+req.params.yearName);
        // console.log('query : '+req.params.orders);
        // console.log('query : '+req.params.memberId);
        // console.log('query : '+resultProduce.areaId);
        // console.log('query : '+resultProduce.plantNameTh);
        // console.log('query : '+req.params._idProduce);
        Audit.find( query , (err, resultAudit) => {
          // console.log('resultAudit.Lenght : '+resultAudit.length);
          if(err){
            res.send({
              confirm : 'failed',
              resultProcess :'Error Document Audit!, Contact Admin : Error '+err
            });
          }
          else{
            // _idProduce, yearName, areaId, memberId, plantNameTh, orders, comment, result, percentScore, estimate, staffName
             
            if(resultAudit.length == 0){
              // console.log(resultAudit);
              // console.log(resultAudit[0]._id);
              //insert new audit

              let filter = {
                yearName : req.params.yearName,
                orders : req.params.orders,
                memberId : req.params.memberId,
                areaId : resultProduce.areaId,
                plantNameTh : resultProduce.plantNameTh,
                _idProduce : req.params._idProduce,
                areaName : req.query.areaName
              };
              const opts = { upsert: true, new: true};
              let update = 
                {
                  yearName:req.params.yearName,
                  memberId: req.params.memberId,
                  orders: req.params.orders,
                  comment: req.query.comment,
                  result: req.query.result,
                  estimate: req.query.estimate,
                  percentScore: req.query.percentScore,
                  _idProduce: req.params._idProduce,
                  areaId : resultProduce.areaId, 
                  plantNameTh: resultProduce.plantNameTh,
                  staffName :req.query.staffName,
                  sizeAction: resultProduce.sizeAction,
                  areaName : req.query.areaName
                  };
              // let doc = await Character.findOneAndUpdate(filter, update, opts);
              // console.log('filter:::');
              // console.log(filter);
              // console.log('update:::');
              // console.log(update);
              Audit.findOneAndUpdate(filter, update, opts,(err,newResultAudit)=>{
                // console.log(newResultAudit);
                if(err){
                  res.send({
                    confirm : 'failed',
                    resultProcess :'Error Document Audit To Insert!, Contact Admin : Error '+err
                  });
                }
                else{
                  res.send({
                    yearName:req.params.yearName,
                    memberId: req.params.memberId,
                    orders: req.params.orders,
                    comment: req.query.comment,
                    result: req.query.result,
                    estimate: req.query.estimate,
                    percentScore: req.query.percentScore,
                    staffName :req.query.staffName,
                    _idProduce: req.query._idProduce,
                    areaId : resultProduce.areaId,
                    areaName : resultProduce.areaName,
                    plantNameTh: resultProduce.plantNameTh,
                    confirm : 'success', 
                    resultProcess: 'Success Add Audit!',
                    newResultAudit:newResultAudit
                  });
                }
              })
            }
            else{
              // console.log('resultAudit._id : '+resultAudit[0]._id);
              // update audit 
              let auditUpdate = {
                comment: req.query.comment,
                result: req.query.result,
                estimate: req.query.estimate,
                percentScore: req.query.percentScore,
                _idProduce: req.params._idProduce,
                staffName :req.query.staffName,
                areaName : req.query.areaName 
                }; 
              Audit.findByIdAndUpdate( {'_id': resultAudit[0]._id}, auditUpdate,{ upsert: true, new: true }, (err, oldResultAudit) => {
                if(err){
                  res.send({
                    confirm : 'failed',
                    resultProcess :'Error Document Audit To Update!, Contact Admin : Error '+err
                  });
                }
                else{
                  res.send({
                    yearName:req.params.yearName,
                    memberId: req.params.memberId,
                    orders: req.params.orders,
                    comment: req.query.comment,
                    result: req.query.result,
                    estimate: req.query.estimate,
                    percentScore: req.query.percentScore,
                    staffName :req.query.staffName,
                    _idProduce: req.query._idProduce,
                    areaId : resultProduce.areaId,
                    confirm : 'success', 
                    resultProcess: 'Success Update Audit!',
                    _idAudit : resultAudit[0]._id,
                    newAudit : oldResultAudit,
                    areaName : req.query.areaName
                  });
                }
              });
            }
          }
        });
      }
    }
  }).sort({areaId:1});
}








//audit report url :/audit/report
exports.getAuditReport = async (req, res)=>{
  let yearResult = await Yearss.aggregate([
    {
      $project : {
        yearName: { yearName: "$yearName"}
      }
    },
    { $sort:  {yearName:-1} }
  ]);
  // res.send({
  //   getAuditReport:'getAuditReport',
  //   yearResult:yearResult
  // });


  res.render('audit/report', { 
    yearResult:yearResult,
    title: 'AUDIT Manage',
    caption: 'แสดงรายการตรวจสอบ '});
}





exports.postAuditReport = async (req, res)=>{
  let yearResult = await Yearss.aggregate([
    {
      $project : {
        yearName: { yearName: "$yearName"}
      }
    },
    { $sort:  {yearName:-1} }
  ]);
  
  let allAudit = await Audit.find({yearName:req.body.yearName}).sort({orders:1, memberId:1, plantNameTh:1, areaId:1});

  // res.send({
  //   getAuditReport:'getAuditReport',
  //   yearResult:yearResult,
  //   allAudit:allAudit
  // });
  res.render('audit/report', { 
    yearResult : yearResult,
    yearName : req.body.yearName,
    allAudit : allAudit,
    title : 'AUDIT Manage List',
    caption : 'แสดงรายการตรวจสอบ '});
}

//app.get('/audit/ListAuditByMemberId/:yearName/:memberId/:orders/:result'
exports.paramListAuditByMemberId = async (req, res)=>{

  let listAuditByMemberId = await Audit.find({
    yearName:req.params.yearName,
    memberId:req.params.memberId,
    orders:req.params.orders,
    result:req.params.result,
    }).sort({orders:1, memberId:1, plantNameTh:1, areaId:1});

  res.send({
    result:listAuditByMemberId
  });
  // res.render('audit/report', { 
  //   yearResult : yearResult,
  //   yearName : req.body.yearName,
  //   allAudit : allAudit,
  //   title : 'AUDIT Manage List',
  //   caption : 'แสดงรายการตรวจสอบ '});
}