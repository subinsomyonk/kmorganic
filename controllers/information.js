//file : controllers/information.js
const validator = require('validator');
const { promisify } = require('util');
const _ = require('lodash');
const Area = require('../models/Area');
const Member = require('../models/Member');
const MemberArea = require('../models/MemberArea');
const Yearss = require('../models/Yearss');
const Produce = require('../models/Produce');
const Plant = require('../models/Plant');
const Family = require('../models/Family');
const Audit = require('../models/Audit');

const moment = require('moment');
const { forEach, result, now } = require('lodash');
const { inArray } = require('jquery');



exports.getInformationGeneral = async (req,res,next)=>{
  let filter = { statusId: { $eq: 1 }, memberType : {$eq :'สามัญ'} };
  let memberNormal = await Member.aggregate([
    { $match: filter },
    {
      $group : {
        _id:null,
        count: {$sum:1} ,
        totalShareHolder: { $sum: "$shareHolder"},
        minShareHolder: { $min: "$shareHolder"},
        maxShareHolder: { $max: "$shareHolder"},
        minRegister: { $min: "$register"},
        maxRegister: { $max: "$register"}
      }
    } 
  ]);
  filter = { statusId: { $eq: 1 }, memberType : {$eq :'วิสามัญ'} };
  let memberUnnormal = await Member.aggregate([
    { $match: filter },
    {
      $group : {
        _id:null,
        count: {$sum:1},
        totalShareHolder: { $sum: "$shareHolder"},
        minShareHolder: { $min: "$shareHolder"},
        maxShareHolder: { $max: "$shareHolder"},
        minRegister: { $min: "$register"},
        maxRegister: { $max: "$register"}
      }
    } 
  ]);

  filter = {};
  let family = await Family.aggregate([
    { $match: filter },
    {
      $group : {
        _id : null,
        count: {$sum:1},
        minBirthDate: { $min: "$birthDate"},
        maxBirthDate: { $max: "$birthDate"}
      }
    } 
  ]);
    

  filter = { statusId: { $eq: 1 }, memberType : {$eq :'สามัญ'} };
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
  // console.log('docs สามัญ')
  // console.log(docs)

  let countGender = await Family.aggregate([
    {$group:{
      _id:'$gender',
      totalCount :{$sum :1}}}
    ]);

//===========================Area

  filter = { statusId: { $eq: 1 }};
  let area = await Area.aggregate([
    { $match: filter },
    {
      $group : {
        _id : null,
        count: {$sum:1} ,
        totalSize: { $sum: "$size"},
        minRegister: { $min: "$register"},
        maxRegister: { $max: "$register"},
        minSize :{ $min: "$size"},
        maxMax : { $max: "$size"}
      }
    }
  ]);

  //=============================
  filters = { statusId: { $eq: 1 }, memberType:{$eq: 'สามัญ'}};
  let memberRegisterDate = await Member.aggregate([
    { $match: filters },
    {
      $project : {
        member: { memberId: "$memberId",register: {$year:"$register"}}
      }
    }
  ]);
  // console.log(memberRegisterDate);
  //=============================

  //=============================
  filters = { statusId: { $eq: 1 }, memberType:{$eq: 'วิสามัญ'}};
  let memberRegisterDateUn = await Member.aggregate([
    { $match: filters },
    {
      $project : {
        member: { memberId: "$memberId" ,shareHolder: "$shareHolder",register: {$year: "$register"}}
      }
    }
  ]);
  // console.log(memberRegisterDateUn);
  // console.log(memberRegisterDate);
  //=============================

  filters = { statusId: { $eq: 1 }, memberType:{$eq: 'สามัญ'}};

  let allNormalMemberFamily = await Member.aggregate([
    {$match : filters},
    {$lookup:{
      from: "families",
      localField: "memberId",
      foreignField: "memberId",
      as: "member_families"
      }}
  ]);
  // console.log(allNormalMemberFamily);

  filters = { statusId: { $eq: 1 }, memberType:{$eq: 'สามัญ'}};

  let allNormalMemberArea = await Member.aggregate([
    {$match : filters},
    {$lookup:{
      from: "areas",
      localField: "memberId",
      foreignField: "memberId",
      as: "member_areas"
      }}
  ]);

  // console.log(allNormalMemberArea);

  res.render('information/general', {
    memberNormal:memberNormal,
    memberUnnormal:memberUnnormal,
    family:family,
    currentDate: new Date().getDate(),
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    member_families:docs,
    countGender:countGender,
    area:area,
    memberRegisterDate: memberRegisterDate,
    memberRegisterDateUn: memberRegisterDateUn,
    allNormalMemberFamily: allNormalMemberFamily,
    allNormalMemberArea:allNormalMemberArea,
    title : 'General Info', 
    caption : 'ข้อมูลทั่วไป'});
}

exports.getInformationProduce = async (req,res,next)=>{

  const resultYear = await Yearss.find({statusId:1}).sort({areaName:1}).sort({yearName:-1});

  // console.log(resultYear);
  res.render('information/produce', { 
    resultYear: resultYear,
    title: 'Produce Info', 
    caption: 'ข้อมูลเลขที่ การเพาะปลูก'});  
};

exports.postInformationProduce = async (req, res, next) => {

  let filter = {yearName:req.body.yearName};
  // num record of produce and sum sizeAction
  let resultProduceProduce = await Produce.aggregate([
    { $match: filter },
    {
      $group : {
        _id  : null,
        countRecord: {$sum:1} ,
        totalSizeAction: { $sum: "$sizeAction"}
      }
    },
    { $sort:
      {memberId:1}
    }
  ]);
  // foreach the num record member of produce and sum sizeAction
  let resultProduceMemberId = await Produce.aggregate([
    { $match: filter },
    {
      $group : {
        _id  : "$memberId",
        countRecord: {$sum:1} ,
        totalSizeAction: { $sum: "$sizeAction"}
      }
    },
    { $sort:
      {memberId:1}
    }
  ]);
  // foreach the num record member of produce and sum sizeAction
  let resultProducePlant = await Produce.aggregate([
    { $match: filter },
    {
      $group : {
        _id  : "$plantNameTh",
        countRecord: {$sum:1} ,
        totalSizeAction: { $sum: "$sizeAction"}
      }
    },
    { $sort:
      {  totalSizeAction: -1, _id: 1}
    } 
  ]);

  let minMaxSizeActionCount = await Produce.aggregate([
    { $match: filter },
    {"$group" : {_id:"$memberId",
      plantNameThSumSizeAction:{ $sum :"$sizeAction"}}
    },
    { "$sort":
      {_id:-1}
    }
  ]);

  let allProduce = await Produce.aggregate([
    { $match: filter },
    {
      $group : {
        _id  : {plantNameTh:"$plantNameTh"},
        count: {$sum:1},
        count2: { $sum:"$sizeAction"}
      }
    }
  ]);

  let allProduce2 = await Produce.aggregate([
    { $match: filter },
    {
      $group : {
        _id  : {memberId:"$memberId",plantNameTh:"$plantNameTh"},
        count: {$sum:1},
        count2: { $sum:"$sizeAction"}
      }
    }
  ]);

  // console.log(allProduce2);
  // res.send({allProduce:allProduce,allProduce2:allProduce2});

  res.render('information/produce', { 
    yearName: req.body.yearName,
    resultProduceProduce :resultProduceProduce,
    resultProduceMemberId:resultProduceMemberId,
    resultProducePlant: resultProducePlant,
    minMaxSizeActionCount:minMaxSizeActionCount,
    title: 'Produce Info', 
    caption: 'ข้อมูลเลขที่ การเพาะปลูก_____'});

}

//audit
exports.getInformationAudit = async (req, res, next) => {
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
  // console.log(yearResult);
  res.render('information/audit', { 
    yearResult: result,
    title: 'Audit Info', 
    caption: 'ข้อมูการตรวจสอบแปลงเพาะปลูก',
    yearResult: yearResult
  });
}


//audit
exports.postInformationAudit = async (req, res, next) => {
  let filters = {yearName:req.body.yearName};

  let filter = { statusId: { $eq: 1 }};
  let yearResult = await Yearss.aggregate([
    { $match: filter },
    {
      $project : {
        yearName: { yearName: "$yearName"}
      }
    },
    { $sort:  {yearName:-1} }
  ]);
  // console.log(yearResult);
  let allAudit = await Audit.aggregate([
    { $match: filters },
    {
      $group : {
        _id  : {result:"$result", orders:"$orders",plantNameTh:"$plantNameTh"},
        countRecord: {$sum:1} ,
        totalSizeAction: { $sum: "$sizeAction"},
        sumPercentScore: {$sum:"$percentScore"},
        sumEstimate: {$sum:"$estimate"}
      }
    },
    { $sort:
      {orders:1, result:1, plantNameTh:1,countRecord:1}
    }
  ]);

  let allAudit1 = await Audit.aggregate([
    { $match: {yearName:req.body.yearName, orders:1} },
    {
      $group : {
        _id  : {result:"$result", orders:"$orders",plantNameTh:"$plantNameTh"},
        countRecord: {$sum:1} ,
        totalSizeAction: { $sum: "$sizeAction"},
        sumPercentScore: {$sum:"$percentScore"},
        sumEstimate: {$sum:"$estimate"}
      }
    },
    { $sort:
      {orders:1, result:1, plantNameTh:1,countRecord:1}
    }
  ]);
  let allAudit2 = await Audit.aggregate([
    { $match: {yearName:req.body.yearName, orders:2} },
    {
      $group : {
        _id  : {result:"$result", orders:"$orders",plantNameTh:"$plantNameTh"},
        countRecord: {$sum:1} ,
        totalSizeAction: { $sum: "$sizeAction"},
        sumPercentScore: {$sum:"$percentScore"},
        sumEstimate: {$sum:"$estimate"}
      }
    },
    { $sort:
      {orders:1, result:1, plantNameTh:1,countRecord:1}
    }
  ]);
  let allAudit3 = await Audit.aggregate([
    { $match: {yearName:req.body.yearName, orders:3} },
    {
      $group : {
        _id  : {result:"$result", orders:"$orders",plantNameTh:"$plantNameTh"},
        countRecord: {$sum:1} ,
        totalSizeAction: { $sum: "$sizeAction"},
        sumPercentScore: {$sum:"$percentScore"},
        sumEstimate: {$sum:"$estimate"}
      }
    },
    { $sort:
      {orders:1, result:1, plantNameTh:1,countRecord:1}
    }
  ]);
  // console.log(allAudit);

  // res.send({'postInformationAudit':'postInformationAudit',yearResult:yearResult});

  res.render('information/audit', { 
    yearResult: yearResult,
    title: 'Audit Info', 
    caption: 'ข้อมูลการตรวจสอบแปลงเพาะปลูก',
    yearName: req.body.yearName,
    allAudit: allAudit,
    allAudit1: allAudit1,
    allAudit2: allAudit2,
    allAudit3: allAudit3});

}

// url : /information/statistic'
exports.getInformationStatistic = async (req, res, next) => {
  filters = { statusId: { $eq: 1 }, memberType:{$eq: 'สามัญ'}};

  let allNormalMemberArea = await Member.aggregate([
    {$match : filters},
    {$lookup:{
      from: "areas",
      localField: "memberId",
      foreignField: "memberId",
      as: "member_areas"
      }}
  ]).sort({memberId:1});

  let allNormalMemberFamily = await Member.aggregate([
    {$match : filters},
    {$lookup:{
      from: "families",
      localField: "memberId",
      foreignField: "memberId",
      as: "member_family"
      }}
  ]).sort({memberId:1});
  // res.send({
  //   statistic : 'getInformationStatistic',
  //   'allNormalMemberAreaLength': allNormalMemberArea.length,
  //   'allNormalMemberArea' : allNormalMemberArea,
  //   'allNormalMemberFamilyLength' : allNormalMemberFamily.length,
  //   'allNormalMemberFamily' : allNormalMemberFamily
  // });
  res.render('information/statistic', { 
    title: 'STATISTIC MEMBER Info', 
    caption: 'ข้อมูลสถิติ สมาชิก',
    'allNormalMemberAreaLength': allNormalMemberArea.length,
    'allNormalMemberArea' : allNormalMemberArea,
    'allNormalMemberFamilyLength' : allNormalMemberFamily.length,
    'allNormalMemberFamily' : allNormalMemberFamily,
    currentDate: new Date().getDate(),
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    currentDateTime: new Date()
  });


}
// url : /information/statisticGroup'
exports.getInformationStatisticGroup = async (req, res, next) => {
  let filters = { statusId: { $eq: 1 }, memberType:{$eq: 'สามัญ'}};
  let allNormalMember = await Member.find(filters).sort({groupNo:1, village:1, subDistrict:1, district:1,province:1,memberId:1});
  
  
  let allGroup = await Member.aggregate([
    { $match: filters },
    {
      $group : {
        _id  : {groupNo:"$groupNo", village:"$village", subDistrict:"$subDistrict",district:"$district", province:"$province"},
        countRecord: {$sum:1} ,
        totalShareHolder: { $sum: "$shareHolder"},
        minRegister: {$min:"$register"},
        maxRegister: {$max:"$register"}
      }
    },
    { $sort:
      {groupNo:1, village:1, subDistrict:1, district:1,province:1}
    }
  ]);

  let groupArr = [];
  if (allGroup && allGroup.length>0){
    for(let i = 0; i< allGroup.length; i++){
      groupArr.push(allGroup[i]._id);
    }
  }
  let areaMemberArr = []
  if (groupArr && groupArr.length >0){
    let filters = null;
    for(let j= 0; j< groupArr.length; j++){
      filters = { statusId: { $eq: 1 }, 
        memberType:{$eq: 'สามัญ'},
        groupNo:{$eq: groupArr[j].groupNo},
        village:{$eq: groupArr[j].village},
        subDistrict:{$eq: groupArr[j].subDistrict},
        district:{$eq: groupArr[j].district},
        province:{$eq: groupArr[j].province}
      };
      let areaMemberItem = await Member.aggregate([
        {$match : filters},
        {$lookup:{
          from: "areas",
          localField: "memberId",
          foreignField: "memberId",
          as: "member_areas"
          }}
      ]).sort({memberId:1});
      areaMemberArr.push(areaMemberItem);
    }
  }
  let familyMemberArr = []
  if (groupArr && groupArr.length >0){
    let filters = null;
    for(let j= 0; j< groupArr.length; j++){
      filters = { statusId: { $eq: 1 }, 
        memberType:{$eq: 'สามัญ'},
        groupNo:{$eq: groupArr[j].groupNo},
        village:{$eq: groupArr[j].village},
        subDistrict:{$eq: groupArr[j].subDistrict},
        district:{$eq: groupArr[j].district},
        province:{$eq: groupArr[j].province}
      };
      let familyMemberItem = await Member.aggregate([
        {$match : filters},
        {$lookup:{
          from: "families",
          localField: "memberId",
          foreignField: "memberId",
          as: "member_family"
          }}
      ]).sort({memberId:1});
      familyMemberArr.push(familyMemberItem);
    }
  }
  // res.send({
  //   getInformationStatisticGroup : 'getInformationStatisticGroup',
  //   allGroup: allGroup,
  //   groupArr: groupArr,
  //   areaMemberArr:areaMemberArr,
  //   familyMemberArr:familyMemberArr,
  //   allNormalMember:allNormalMember,
  //   currentDate: new Date().getDate(),
  //   currentMonth: new Date().getMonth(),
  //   currentYear: new Date().getFullYear(),
  //   currentDateTime: new Date()
  // });

  res.render('information/statisticgroup', { 
    title: 'STATISTIC MEMBER BY GROUP Info', 
    caption: 'ข้อมูลสถิติสมาชิก ตามพื้นที่',
    allGroup: allGroup,
    groupArr: groupArr,
    areaMemberArr:areaMemberArr,
    familyMemberArr:familyMemberArr,
    allNormalMember:allNormalMember,
    currentDate: new Date().getDate(),
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    currentDateTime: new Date()
  });


}