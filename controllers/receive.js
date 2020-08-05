//file : controllers/member.js
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

const Receive = require('../models/Receive');

const moment = require('moment');
const { forEach, result } = require('lodash');
const { inArray } = require('jquery');

//app>> '/produce'
exports.getReceive = async(req, res) => {
  // console.log('req.params.entryKey'+req.params.entryKey);
  let filters = { statusId: { $eq: 1 }};
  let yearResult = await Yearss.aggregate([
    { $match: filters },
    {
      $project : {
        yearName: { yearName: "$yearName"}
      }
    },
    { $sort:  {yearName:-1} }
  ]);
  if(yearResult){
    res.render('receive/primary', { title: 'RECEIVE PRODUCT', caption: 'รับซื้อผลผลิต',confirm:'success',yearResult:yearResult,entryKey:req.params.entryKey});
  }
  else{
    res.render('receive/primary', { title: 'RECEIVE PRODUCT', caption: 'รับซื้อผลผลิต',confirm:'failed',entryKey:req.params.entryKey});
  }
   
};

exports.postReceiveYearName = async (req, res) => {
  // console.log('postReceiveYearName>>>>'+req.body.entryKey);
  res.render('receive/primary', { title: 'RECEIVE PRODUCT', caption: 'รับซื้อผลผลิต',confirm:'success',payload:[{yearName: req.body.yearName}, {findText: ''}, {entryKey: req.body.entryKey}] });
};

exports.postReceiveFindText = async (req,res)=>{
  const validationErrors = [];
  if (validator.isEmpty(req.body.findText)) validationErrors.push({ msg: 'Please enter a findText.' });
  if (validationErrors.length) {
    req.flash('errors', validationErrors);
    res.render('receive/primary', { title: 'RECEIVE PRODUCT', caption: 'รับซื้อผลผลิต',confirm:'success',payload:[{yearName: req.body.yearName}, {findText: req.body.findText},{entryKey: req.body.entryKey}] });
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

    let filters =  { $or: query, statusId:1, memberType:'สามัญ' };
    let resultMember = await Member.aggregate([
      { $match: filters },
      {
        $project : {
          memberId: "$memberId",
          homeNo: "$homeNo",
          groupNo: "$groupNo",
          village: "$village",
          subDistrict: "$subDistrict",
          district: "$district",
          province: "$province",
          postCode: "$postCode"
        }
      },
      { $sort:  {memberId:-1} }
    ]);
    res.render('receive/primary', { title: 'RECEIVE PRODUCT', caption: 'รับซื้อผลผลิต',confirm:'success',payload:[{yearName: req.body.yearName}, {findText: req.body.findText},{entryKey: req.body.entryKey}], resultMember:resultMember });
    // res.send({ title: 'RECEIVE Manage', caption: 'รับซื้อผลผลิต',confirm:'success',payload:[{yearName: req.body.yearName}, {findText: req.body.findText}], resultMember:resultMember });
  }
}

exports.paramReceiveShowAuditThree = async (req,res)=>{
  let filersMemberInfo = { memberId: { $eq: req.params.memberId }, memberType:{$eq: 'สามัญ'}};

  let memberInfo = await Member.aggregate([
    {$match : filersMemberInfo},
    {$lookup:{
      from: "families",
      localField: "IDCARD",
      foreignField: "IDCARD",
      as: "members_families"
      }}
  ]);
  // console.log(memberInfo);

  let filters =  { memberId: req.params.memberId, yearName: req.params.yearName, orders:3 };

  let auditMemberIdYearName = await Audit.aggregate([
    { $match: filters },
    {
      $group: {
        _id:{ 
          result :"$result",
          plantNameTh : "$plantNameTh",
        },
        totRecord: {$sum:1},
        totalSizeAction: {$sum:"$sizeAction"},
        totalEstimate: {$sum:"$estimate"},
        percentScore: {$sum:"$percentScore"}
      }
    },
    { $sort:  {plantNameTh:1} }
  ]);
  
  // console.log(auditMemberIdYearName);
  res.render('receive/primary', { memberInfo:memberInfo, auditMemberIdYearName:auditMemberIdYearName, memberId:req.params.memberId,title: 'RECEIVE PRODUCT', caption: 'รับซื้อผลผลิต',confirm:'success',payload:[{yearName: req.params.yearName}, {findText: req.params.findText},{entryKey:req.params.entryKey}]});
  // res.send({auditMemberIdYearName:auditMemberIdYearName, memberId:req.params.memberId,title: 'RECEIVE Manage', caption: 'รับซื้อผลผลิต',confirm:'success',payload:[{yearName: req.params.yearName}, {findText: req.params.findText}]});
}

exports.paramReceiveSavePrevPrimary = async (req,res)=>{
  let findYearNameMemberId = await Receive.find({yearName:req.body.yearName,memberId:req.body.memberId});

  res.send({
    confirm : 'success',
    _plantNameThArr : req.body._plantNameThArr,
    _idArr : req.body._idArr,
    _areaIdAr : req.body._areaIdArr,
    notes : req.body.notes,
    memberId : req.body.memberId,
    yearName : req.body.yearName,
    findYearNameMemberId:findYearNameMemberId,
    confirmEntry:false
  })
}





//app.get('/receive/pay'
exports.getReceivePay = async (req, res) => {
  res.render('receive/pay', { title: 'RECEIVE & PAY', caption: 'รับ - จ่ายเงิน',confirm:'success'});
}
// /receive/pay/findText
exports.postReceivePayFindText = async (req,res) => {
  const validationErrors = [];
  if (validator.isEmpty(req.body.findText.trim())) validationErrors.push({ msg: 'Please enter a valid Receive No.' });

  if (validationErrors.length) {
    req.flash('errors', validationErrors); 
    res.render('receive/pay', { title: 'RECEIVE & PAY', caption: 'รับ - จ่ายเงิน',confirm:'failed',findText: req.body.findText.trim()});
  } else {
    let resultReceive = await Receive.find({statusId:1,receiveOrders:req.body.findText});
    if(!resultReceive){
      res.render('receive/pay', { title: 'RECEIVE & PAY', 
        caption: 'รับ - จ่ายเงิน',confirm:'failed', message:'Error : ผิดพลาด ' ,
        findText: req.body.findText.trim()});
    }
    else{
      if(resultReceive.length <= 0){
        req.flash('errors', {msg:'ไม่พบเลขที่ใบรับนี้ !'+req.body.findText.trim()});
        res.render('receive/pay', { title: 'RECEIVE & PAY', 
          caption: 'รับ - จ่ายเงิน',confirm:'failed',
          findText: req.body.findText.trim()});
      }
      else{
        res.render('receive/pay', { title: 'RECEIVE & PAY', 
          caption: 'รับ - จ่ายเงิน',confirm:'success',
          findText: req.body.findText.trim(),
          resultReceive: resultReceive});
      }
    }
    
  }
  




  // res.send({
  //   'postReceivePayFindText':'/receive/pay/findText',
  //   findText: req.body.findText.trim()
  // });
}







// /receive/primary/saveReceiveNew
exports.postSaveReceiveNew = async (req, res)=>{
  let addFlag = req.body.addFlag
  if(!addFlag){
    let receiveOrders = await Receive.find({yearName:req.body.yearName}).sort({receiveOrders:-1});
    let newReceiveOrder = 1;
    if(receiveOrders.length > 0 && receiveOrders){
      newReceiveOrder = (receiveOrders[0].receiveOrders+1);
    }
    let currentDateTime = Date.now();
    let _AllOK = req.body._AllOK
    let receiveNew = new Receive({
      'receiveOrders': newReceiveOrder,
      'yearName' : req.body.yearName,
      'memberId' : req.body.memberId,
      'payFlag' : req.body.flagAdd,
      'items' : req.body._AllOK,
      'checkNo': req.body.checkNoArr,
      'currentDateTime': currentDateTime,
      'transactDate' : moment().format('YYYY-MM-DD')
    });
    await receiveNew.save((err)=>{
      if (err){
        res.send({
          msg :'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err ,
          confirm:'failed',
          receivedNo: '',
          addFlag: addFlag,
          newReceiveOrder:newReceiveOrder
        });
      }
      else{ // success add 
        var currentFullDateTime = moment().format('YYYY-MM-DD hh:mm:ss');
        var currentTime = moment().format('hh:mm:ss');
        res.send({
          msg: 'บันทึก เพิ่มสำเร็จ.',
          confirm:'success',
          receivedNo: newReceiveOrder,
          addFlag: addFlag,
          newReceiveOrder:newReceiveOrder,
          currentDateTime: currentDateTime,
          currentDate: new Date().getDate(),
          currentMonth: new Date().getMonth(),
          currentYear: new Date().getFullYear(),
          currentTime: currentTime,
          currentFullDateTime:currentFullDateTime
        });
      }
    });
  }
  else{
    res.send({
      confirm:'success',
      receivedNo: '898989',
      addFlag: false
    })
  }

}


// received history  /receive/history postReceivePrimaryHistory
exports.postReceivePrimaryHistory = (req, res) => {
  Receive.find({
    memberId:req.body.memberId,
    yearName:req.body.yearName
  },(err, result)=>{
    if(err){
      // req.flash('errors', 'Error : '+err);
      res.send({
        'confirm':'failed',
        '/receive/primary/history': '/receive/primary/history',
        'body':req.body,
        'error':'Error :'+err
      })
    }
    else{
      // req.flash('success', validationErrors);
      // req.flash('success', { msg: 'บันทึก เพิ่มสำเร็จ.' });
      res.send({
        'confirm':'success',
        '/receive/primary/history': '/receive/primary/history',
        'body':req.body,
        'resultData':result
      })
    }
  }).sort({receiveOrders:-1}).limit(5);  
}

exports.getReceivePrimaryHistoryCancel = (req,res) => {
  // console.log('req.params._url==='+req.params._url);
  Receive.findByIdAndUpdate({ _id: req.query._id },{ statusId: 0 }, (err,result) =>{
    if (err) {
      // req.flash('errors', 'Error : '+err);
      // res.flash({'errors': 'Error : '+err});
      res.send({'message': 'Failed ยกเลิกรายการ  '+result.receiveOrders+' ไม่สำเร็จ.',confirm:'failed'});
    } else { 
      // req.flash({'message': 'ยกเลิกรายการ  '+result.receiveOrders+' สำเร็จ.',confirm:'success'}); 
      res.send({'message': 'ยกเลิกรายการ  '+result.receiveOrders+' สำเร็จ.',confirm:'success'});
    }
  });
}



// /receive/primary/saveReceive
exports.postSaveReceive = (req, res)=>{
  let _AllOK = req.body._AllOK

  
  const receiveNew = new Receive({
    'yearName' : req.body.yearName,
    'memberId' : req.body.memberId,
    'items' : req.body._AllOK,
    'checkNo': req.body.checkNoArr,
    'transactDate' : moment().format('YYYY-MM-DD')
  });

  Receive.find({ 'yearName': req.body.yearName, 'memberId':req.body.memberId }, (err,resultFindReceive) => {

      if (err) {
        res.send({
        'confirm':'ผิดพลาดในการ ตรวจสอบ.: ' + err ,
          reqBody: req.body
       });
      } else {
 
        if(resultFindReceive.length == 0){

          receiveNew.save((err) => {
            if (err) {
              console.log(err);
              res.send({
                'confirm':'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err ,
                reqBody: req.body
              });
            } 
            else {
              // console.log('OK>>>>>'+_AllOK);
              res.send({
                'confirm': 'บันทึก เพิ่มสำเร็จ.',
                reqBody: req.body
              });
            }
          });
        }
        else{        
          // case flagAdd  = false yes to update the old record
          if(!req.body.flagAdd){
            let receiveUpdate = {
              'orders' : (resultFindReceive[0].orders+1),
              'yearName' : req.body.yearName,
              'memberId' : req.body.memberId,
              'items' : req.body._AllOK,
              'checkNo': req.body.checkNoArr
            };
            Receive.findByIdAndUpdate({'_id':resultFindReceive[0]._id},receiveUpdate,(err)=>{
              if(err){
                res.send({
                  'confirm':'ผิดพลาดในการ ค้นหาและบันทึก.: ' + err ,
                  reqBody: req.body
                });
              }
              else{
                res.send({
                  'confirm': 'บันทึก เพิ่มสำเร็จ+++.',
                  reqBody: req.body,
                  '_id':resultFindReceive[0]._id,
                  'orders' : (resultFindReceive[0].orders+1)
                });
              }
            });
          }   // flagAdd =  true yes to insert the new record
          else{
            res.send({
              'confirm': 'บันทึก เพิ่มสำเร็จ+++.',
              reqBody: req.body,
              '_id':resultFindReceive[0]._id,
              'orders' : (resultFindReceive[0].orders+1),
              'newOnce' : 'newOne'
            });
          }   
        }       
      }
  });
}
// save pay
exports.postReceivePaySaveReceive = (req,res) =>{
  let payload = {statusId:2, typePay: req.body.payVal, chequeInfo: req.body.chequeText};
  Receive.findByIdAndUpdate({ '_id': req.body._id }, payload, { new: true }, (err) => {
    if (err) {
      res.send({
        'confirm': false,
        'message': 'ผิดพลาดในการปรับปรุง ติดต่อ Admin ',
        'receiveOrders': req.body.receiveOrders
      });
    } else {
      res.send({
        'confirm': true,
        'message': 'ทำรายการจ่าย ด้วย '+ req.body.payVal +' : '+req.body.chequeText+' สำเร็จ! ',
        'receiveOrders': req.body.receiveOrders
      });        
    }
  });  
}

// '/receive/pay/list'
exports.getReceivePayList = (req,res) => {

  Receive.find({statusId:2},(err,result)=>{
    if(err){
      res.send({
        'confirm':'failed',
        'message' : 'ผิดพลาดในการค้นหา !',
        'resultReceive' : result
      });
    }
    else{
      res.send({
        'confirm':'success',
        'resultReceive' : result
      });
    }
  }).sort({receiveOrders:-1}).limit(20);
  
}