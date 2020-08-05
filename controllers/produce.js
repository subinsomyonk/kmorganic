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

const moment = require('moment');
const { forEach, result } = require('lodash');
const { inArray } = require('jquery');

//app>> '/produce'
exports.getProduce = (req, res) => {
  Yearss.find({ statusId: 1 }, (err, result) => {
    if (err) {
        req.flash('errors', { msg: 'ผิดพลาดในการค้นหา ตรวจสอบ.: ' + err });
        res.render('produce/index', { title: 'PRODUCE Manage', caption: 'เพาะปลูก' });
    } else {
      res.render('produce/index', { title: 'PRODUCE Manage', caption: 'เพาะปลูก',yearResult:result });
    }
  }).sort({areaId:1,plantNameTh:1});
    
};








//report app.get('/report/product', passportConfig.isAuthenticated, plantController.getProductReport);
exports.getProductReport = (req, res) => {
  res.render('product/report', { title: 'Product Report', caption: 'รายงานพันธุ์ผลผลิต' });
};



//app>> '/produce/produceMember'
exports.getProduceMember = (req, res) => {
  Yearss.findById(req.query.yearName, (err,result)=>{
    if (err) {
      req.flash('errors', { msg: 'ผิดพลาดในการค้นหา ตรวจสอบ.: ' + err });
      res.render('produce/index', { title: 'PRODUCE Manage!', caption: 'เพาะปลูก!',yearResult:null });
    } else {
      res.render('produce/produceMember', { title: 'PRODUCE Manage', caption: 'เลือกสมาชิกที่จะทำการเพาะปลูก', yearResult:result }); 
    }
  });
};

//produce/findById
exports.getRegisterProduceFindById = (req, res, next) => {
  Produce.findById({ _id: req.query._id }, (err, result) => {
      if (err) {
          req.flash('errors', { msg: 'ค้นหาผิดพลาด ตรวจสอบ.: ' + err });
          res.send({ 'confirm': 'failed' });
      } else {
          res.send({ 'confirm': 'success', data: result });
      }
  }).sort({'areaId':1,'plantNameTh':1});
};

//app.post('/produce/selectMember', passportConfig.isAuthenticated, produceController.postSelectMember);
exports.postSelectMemberSearch = (req, res) => {

  // console.log('req.body._idYear :: '+req.body._idYear);
  // console.log('req.body.findTextMemberId : '+req.body.findTextMemberId);
  const validationErrors = [];
  Yearss.findById(req.body._idYear, (err,yearResult)=>{
    if (err) {
      req.flash('errors', { msg: 'ผิดพลาดในการค้นหา ตรวจสอบ.: ' + err });
      res.render('produce/index', { title: 'PRODUCE Manage!', caption: 'เพาะปลูก!',yearResult:null });
    } else {
      if (validator.isEmpty(req.body.findTextMemberId.trim())) validationErrors.push({ msg: 'Please enter a findTextMemberId.' });
      if (validationErrors.length) {
        res.render('produce/produceMember', { title: 'PRODUCE Manage!', caption: 'เพาะปลูก!',yearResult:yearResult, findTextMemberId: req.body.findTextMemberId.trim() }); 
      } else {
        let query = [
          { memberId: new RegExp(req.body.findTextMemberId.trim(), 'i') },
          { district: new RegExp(req.body.findTextMemberId.trim(), 'i') },
          { village: new RegExp(req.body.findTextMemberId.trim(), 'i') },
          { subDistrict: new RegExp(req.body.findTextMemberId.trim(), 'i') },
          { phone: new RegExp(req.body.findTextMemberId.trim(), 'i') },
          { province: new RegExp(req.body.findTextMemberId.trim(), 'i') },
          { IDCARD: new RegExp(req.body.findTextMemberId.trim(), 'i') },
          { phone: new RegExp(req.body.findTextMemberId.trim(), 'i') }
        ];
        let andQuery = [{memberType:'สามัญ'},{statusId:1}];


        Member.find({ $or: query, $and:andQuery }, (err, memberResult) => {
          if (err){
            req.flash('errors', { msg: 'ผิดพลาดในการค้นหา ตรวจสอบ.: ' + err });
            res.render('produce/produceMember', { title: 'PRODUCE Manage!', caption: 'เพาะปลูก!',yearResult:yearResult, findTextMemberId: req.body.findTextMemberId.trim() });
          }
          else{
            req.flash('success', { msg: 'ค้นพบจำนวน ' + memberResult.length + ' รายการ' });
            // console.log('findTextMemberId===='+req.body.findTextMemberId.trim());
            res.render('produce/produceMember', { title: 'Member-Area Manage', caption: 'จัดการสมาชิก-พื้นที่เพาะปลูก', yearResult:yearResult ,  findTextMemberId: req.body.findTextMemberId.trim(),memberResult:memberResult });
          }
        });
      }
    }
  });
};

// url : produce/deleteProduce
// app.get('produce/deleteProduce', passportConfig.isAuthenticated, produceController.getDeleteProduce);
exports.getDeleteProduce = (req,res,next)=>{

  Produce.findByIdAndRemove(req.query._id,(err,result)=>{
    if(err){
      res.send({'confirm':'failed',findTextArea:req.query.findTextArea});
    }
    else{
      res.send({'confirm':'success',findTextArea:req.query.findTextArea});
    }
  });
};

// app.get('/produce/produceReport', passportConfig.isAuthenticated, produceController.getProduceReport);
exports.getProduceReport = (req,res,next)=>{
  Produce.find( { yearName:req.query.yearName },(err,produceResult)=>{
    if(err){
      res.send({ 'confirm':'failed',yearName:req.query.yearName });
    }
    else{
      // res.json({ 'confirm':'success',resultProduce:resultProduce });
      Yearss.find({ statusId:1 },(err, yearResult)=>{
        if(err){
          res.send({ 'confirm':'failed',yearName:req.query.yearName });
        }
        else{
          res.render('produce/produceReport', { 
            yearName :req.query.yearName,
            produceResult:produceResult, 
            yearResult:yearResult,
            title: 'Produce Manage', 
            caption: 'พิมพ์รายการเพาะปลูกประจำปี'});
        }
      });     
    }
  }).sort({'areaId':1,'plantNameTh':1});
};

// /produce/keyProduceAreaToMember/:_idYear/:_idMember/:findTextMemberId
exports.getKeyProduceAreaToMember = (req,res,next)=>{
  Yearss.findById(req.params._idYear,(err,yearResult)=>{
    if(err){

    }
    else{
      Member.findById(req.params._idMember,(err,memberResult)=>{
        // console.log(memberResult);
        if(err){

        }
        else{
          // console.log(memberResult.memberId+'='+yearResult.yearName);
          Produce.find({memberId:memberResult.memberId, yearName:yearResult.yearName},(err,produceResult)=>{
            // console.log('produceResult');
            if(err){

            }
            else{
              res.render('produce/keyProduceAreaToMember', { 
                findTextMemberId:req.params.findTextMemberId,
                yearResult:yearResult,
                memberResult:memberResult,
                produceResult:produceResult, 
                title: 'Produce Manage', 
                caption: 'เลือกสมาชิกที่จะทำการเพาะปลูก'});
            }
          }).sort({'areaId':1,'plantNameTh':1});
        }
      })
    }
  });
};

exports.postAreaFindText = (req,res,next)=>{
  // console.log('postAreaFindText');
  let findTextArea = req.body.findTextArea.trim();

  const validationErrors = [];
  if (validator.isEmpty(findTextArea)) validationErrors.push({ msg: 'Please enter a find TextArea.' });
  if (validationErrors.length) {
    req.flash('errors', validationErrors);

    //modify for return reference data
    Yearss.findById(req.body._idYear,(err,yearInfo)=>{
      let yearName = yearInfo.yearName
      // console.log(yearName);
      Member.findById(req.body._idMember,(err,memberInfo)=>{
        let memberId = memberInfo.memberId
        // console.log(memberId);
        Produce.find({memberId:memberId,yearName:yearName}, (err,produceResult)=>{
          // console.log('produceResult');
          res.render('produce/keyProduceAreaToMember', { 
            confirm:'success',
            findTextArea:req.body.findTextArea,
            findTextMemberId:req.body.findTextMemberId,
            _idYear:req.body._idYear,
            _idMember:req.body._idMember,
            areaResult:[],
            produceResult:produceResult,
            memberInfo:memberInfo,
            yearInfo:yearInfo,
            yearResult:yearInfo,
            memberResult:memberInfo,
            title: 'Produce Manage', 
            caption: 'เลือกสมาชิกที่จะทำการเพาะปลูก'
          });
        }).sort({'areaId':1,'plantNameTh':1});
      });
    });
  }
  else{
    let yearName = null;
    let memberId = null;

    Yearss.findById(req.body._idYear,(err,yearInfo)=>{
      yearName = yearInfo.yearName
      // console.log('yearName : '+yearName);
      if(!err){
        Member.findById(req.body._idMember,(err,memberInfo)=>{
          memberId = memberInfo.memberId
          // console.log('memberId : '+memberId);
   
          //***********************************/
          let query = [
            { province: new RegExp(findTextArea, 'i') },
            { district: new RegExp(findTextArea, 'i') },
            { subDistrict: new RegExp(findTextArea, 'i') },
            { village: new RegExp(findTextArea, 'i') },
            { areaName: new RegExp(findTextArea, 'i') },
            { areaId: new RegExp(findTextArea, 'i') },
            { memberId: new RegExp(findTextArea, 'i') },
            { referId: new RegExp(findTextArea, 'i') },
            { latitude: new RegExp(findTextArea, 'i') },
            { longitude: new RegExp(findTextArea, 'i') }
          ];
          Area.find({ $or: query }, (err, areaResult) => {
            if(err){
              res.json({'confirm':'Failed!'});
            }
            else{
              
              Produce.find({memberId:memberId,yearName:yearName},(err,produceResult)=>{
                if(!err){
                  Plant.find({},(err,plantResult)=>{
                    if(!err){
                      res.render('produce/keyProduceAreaToMember', { 
                        confirm:'success',
                        findTextArea:req.body.findTextArea,
                        findTextMemberId:req.body.findTextMemberId,
                        _idYear:req.body._idYear,
                        _idMember:req.body._idMember,
                        areaResult:areaResult,
                        produceResult:produceResult,
                        memberInfo:memberInfo,
                        yearInfo:yearInfo,
                        yearResult:yearInfo,
                        memberResult:memberInfo,
                        plantResult:plantResult,
                        title: 'Produce Manage', 
                        caption: 'เลือกสมาชิกที่จะทำการเพาะปลูก'
                      });
                    }
                  });                  
                }
              }).sort({'areaId':1,'plantNameTh':1});
            }
          });
          /***************************************/
        });
      }
    });
  }
}

// ****************************************************************************

exports.getRegisterProduce = (req,res,next)=>{
  let query =  [
    {yearName : req.query.yearName},
    {areaId : req.query.areaId}
  ] ;
  // 1. find yearName and areaId
  Produce.find({ $and: query } , (err, resultProduceFound) => {
    //1.0 Error When resultProduceFound 
    if(err){
      res.send({'confirm':'Any Database Error, Contact Admin!'+err});
    }
    else{
      //1.1 resultProduceFound length > 0  records , yes found some record
      if(resultProduceFound.length > 0){
        //find total sizeAction of the produce , plantNameTh and memberId keep array
        let totalSizeAction = 0.00;
        let plantNameThArr = [];
        let memberIdArr = [];
        resultProduceFound.forEach( function(val, index, array) {
          totalSizeAction +=val.sizeAction;
          plantNameThArr.push(val.plantNameTh);
          memberIdArr.push(val.memberId);
        });


        //==================================begin========================
        // console.log('req.query.size)  :: '+req.query.size);
        // console.log('req.query.sizeAction  :: '+req.query.sizeAction);
        // console.log('totalSizeAction  :: '+totalSizeAction);
        let availableSizeAction = (parseFloat(totalSizeAction) + parseFloat(req.query.sizeAction));
        // console.log('totalSizeAction + req.query.sizeAction  :: '+availableSizeAction);

        if(availableSizeAction <= parseFloat(req.query.size)){

          //test indexOf Array  is -1 not found other else found with return index of array
          // let tempArray = ['PLANT NAME TH_','TH_'];
          let checkExistPlantNameThArray = plantNameThArr.indexOf(req.query.plantNameTh,0);
          let checkMemberIdArray = memberIdArr.indexOf(req.query.memberId,0);
          //2.0 found with memberId, areaId and plantNameTh
          let query =  [
            {yearName : req.query.yearName},
            {areaId : req.query.areaId},
            {memberId : req.query.memberId},
            {plantNameTh : req.query.plantNameTh}
          ] ;
          Produce.find({ $and: query },(err,resultProduceFouneMemberIdPlantNameTh) => {
            if(err){
              //database Error
              req.flash('errors', { msg: 'Databases Error Contact Admin!'+err });
              res.send({
                'confirm':'Failed',
                'notes':'Databases Error When resultProduceFouneMemberIdPlantNameTh Contact Admin! Error : '+err,
                'resultProduceFound':resultProduceFound,
                'plantNameThArr':plantNameThArr,
                'memberIdArr':memberIdArr,
                'totalSizeAction':totalSizeAction,
                'checkExistPlantNameThArray':checkExistPlantNameThArray
              });

            }
            else{
              if(resultProduceFouneMemberIdPlantNameTh.length>0){
                //plus sizeAction with req.query.sizeAction (sizeAction +new sizeAction)
                /*****************main update the same memberId and plantNameTh *******************/
                //test sum sizeAction with plus count number
                // console.log(resultProduceFouneMemberIdPlantNameTh[0].sizeAction);
                // console.log(resultProduceFouneMemberIdPlantNameTh[0].memberId);
                // console.log(resultProduceFouneMemberIdPlantNameTh[0].plantNameTh);
                //***************//
                let newSizeAction = parseFloat(resultProduceFouneMemberIdPlantNameTh[0].sizeAction)+parseFloat(req.query.sizeAction);
                //update sizeAction with sizeAction = 
                //db.getCollection('produces').updateOne({yearName:'2563-01',memberId:'1000-001',plantNameTh:'TH',areaId:'10-10'},{$set:{sizeAction:15}})
                Produce.updateOne({
                  yearName:req.query.yearName, 
                  memberId:req.query.memberId,
                  plantNameTh:req.query.plantNameTh,
                  areaId:req.query.areaId
                },{
                  $set :{
                    sizeAction:newSizeAction,
                    notes:req.query.notes
                  }
                },(err,resultProduceFoundMemberIdPlantThUpdate) => {
                  if(err){  // error update database
                    req.flash('errors', { msg: 'Databases Error Contact Admin!' });
                    res.send({
                      'confirm':'Failed',
                      'notes':'Error Data When New Insert To produce Collection With yearName :'+req.query.yearName+' And AreaId :'+req.query.areaId+', Contact Admin!',
                      'data':req.query,
                    });
                  }
                  else{
                    Produce.find({ yearName:req.query.yearName , memberId:req.query.memberId },( err, produceResultAll ) =>{
                      if(err){
                        // req.flash('errors', { msg: 'Databases Error Contact Admin!' });
                        res.send({
                          'confirm':'Failed',
                          'notes':'New Insert Produce Failed, Data Error :'+err,
                          'payload':req.query
                        });
                      }
                      else{
                        // req.flash('success', { msg: 'บันทึก เพิ่มสำเร็จ.' });
                        res.send({
                          'confirm':'success',
                          'notes':'New Insert Produce With yearName : '+req.query.yearName+' And areaId : '+req.query.areaId+', plantNameTh : '+req.query.plantNameTh+' And sizeAction : '+req.query.sizeAction,
                          'produceResult':produceResultAll
                        });   
                      }
                    }).sort({'areaId':1,'plantNameTh':1});

                  }
                });

                /*****************end main update the same memberId and plantNameTh *******************/

              }
              else{

                //not found so add one with memberId and plantNameTh
                const produce = new Produce({
                  yearName: req.query.yearName,
                  memberId: req.query.memberId,
                  areaId: req.query.areaId,
                  areaName: req.query.areaName,
                  location: req.query.location,
                  sizeAction: req.query.sizeAction,
                  plantNameTh: req.query.plantNameTh,
                  size: req.query.size,
                  notes: req.query.notes
                })
                //add the new document in produce collection
                produce.save((err) => {
                  if (err) {
                    req.flash('errors', { msg: 'Databases Error Contact Admin!' });
                    res.send({
                      'confirm':'Failed',
                      'notes':'Error Data When New Insert To produce Collection With yearName :'+req.query.yearName+' And AreaId :'+req.query.areaId+', Contact Admin!',
                      'data':req.query,
                    });
                  } else {
                    //if yes, return all data reference 
                    Produce.find({ yearName:req.query.yearName , memberId:req.query.memberId },( err, produceResultAll ) =>{
                      if(err){
                        req.flash('errors', { msg: 'Databases Error Contact Admin!' });
                        res.send({
                          'confirm':'Failed',
                          'notes':'New Insert Produce Failed, Data Error :'+err,
                          'payload':req.query
                        });
                      }
                      else{
                        req.flash('success', { msg: 'บันทึก เพิ่มสำเร็จ.' });
                        res.send({
                          'confirm':'success',
                          'notes':'New Insert Produce With yearName : '+req.query.yearName+' And areaId : '+req.query.areaId+', plantNameTh : '+req.query.plantNameTh+' And sizeAction : '+req.query.sizeAction,
                          'payload':req.query,
                          'produceResultAll':produceResultAll
                        });
        
                      }
                    }).sort({'areaId':1,'plantNameTh':1});
                  }
                });              
              }    
            }
          }).sort({'areaId':1,'plantNameTh':1});
        }
        else{
          //no add the new record
          req.flash('errors', { msg: 'Not Enough size available, try less than '+req.query.sizeAction });
            res.send({
              'confirm':'Failed',
              'notes':'Not Enough size available, Failed insert to produce Collection With yearName :'+req.query.yearName+' And AreaId :'+req.query.areaId+', Try again !',
              'data':req.query,
            });

        }
        //==================================end========================
      }
      else{

        //1.2 not found some record of produce collection, so add  new with req.query.sizeAction
        const produce = new Produce({
          yearName: req.query.yearName,
          memberId: req.query.memberId,
          areaId: req.query.areaId,
          areaName: req.query.areaName,
          location: req.query.location,
          sizeAction: req.query.sizeAction,
          plantNameTh: req.query.plantNameTh,
          size: req.query.size,
          notes: req.query.notes
        })
        //add the new document in produce collection
        produce.save((err) => {
          if (err) {
            req.flash('errors', { msg: 'Databases Error Contact Admin!' });
            res.send({
              'confirm':'Failed',
              'notes':'Error Data When New Insert To produce Collection With yearName :'+req.query.yearName+' And AreaId :'+req.query.areaId+', Contact Admin!',
              'data':req.query,
            });
          } else {
            //if yes, return all data reference 
            Produce.find({ yearName:req.query.yearName , memberId:req.query.memberId },( err, produceResultAll ) =>{
              if(err){
                req.flash('errors', { msg: 'Databases Error Contact Admin!' });
                res.send({
                  'confirm':'Failed',
                  'notes':'New Insert Produce Failed, Data Error :'+err,
                  'payload':req.query
                });
              }
              else{
                req.flash('success', { msg: 'บันทึก เพิ่มสำเร็จ.' });
                res.send({
                  'confirm':'success',
                  'notes':'New Insert Produce With yearName : '+req.query.yearName+' And areaId : '+req.query.areaId+', plantNameTh : '+req.query.plantNameTh+' And sizeAction : '+req.query.sizeAction,
                  'payload':req.query,
                  'produceResultAll':produceResultAll
                });

              }
            }).sort({'areaId':1,'plantNameTh':1});
          }
        });

      }    
    }
  }).sort({'areaId':1,'plantNameTh':1});
}
// ****************************************************************************