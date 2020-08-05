const validator = require('validator');
const { promisify } = require('util');
const _ = require('lodash');
const Plant = require('../models/Plant');

//the first page of plant , yes index.pug
exports.getPlant = (req, res) => {
    res.render('plant/index', { title: 'Plant Management', caption: 'จัดการพันธุ์พืช' });
};

exports.getPlantReport = (req, res) => {
  Plant.find({},(err, resultPlant)=>{
    if(err){
      res.render('plant/report', { title: 'Plant Report', caption: 'รายงานพันธุ์พืชทั้งหมด', resultPlant: 'Error Database :'+err});
    }
    else{
      if(resultPlant.length <=0){
        res.render('plant/report', { title: 'Plant Report', caption: 'รายงานพันธุ์พืชทั้งหมด', resultPlant: 'Not Found Any Record'});
      }
      else {
        res.render('plant/report', { title: 'Plant Report', caption: 'รายงานพันธุ์พืชทั้งหมด', resultPlant:resultPlant });
      }      
    }
  });  
};



//view plant add.pug
exports.getPlantAdd = (req, res) => {
    res.render('plant/add', { title: 'Plant Management', caption: 'จัดการพันธุ์พืช', findText: req.query.findText.trim() });
};

//post add
exports.postPlantAdd = (req, res) => {
    // console.log(req.params.findTextRev);
    if (req.params.findTextRev == 'undefinded') {
        findText = '';
    } else {
        findText = req.params.findTextRev;
    }
    let payload = req.body;
    const plant = new Plant({
        plantNameTh: req.body.plantNameTh.trim(),
        plantNameEn: req.body.plantNameEn.trim(),
        notes: req.body.notes.trim()
    });
    const validationErrors = [];
    if (validator.isEmpty(req.body.plantNameTh.trim())) validationErrors.push({ msg: 'Please enter a valid Plant Name Thai.' });
    if (validator.isEmpty(req.body.plantNameEn.trim())) validationErrors.push({ msg: 'Please enter a valid Plant Name Eng.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors); 
        res.render('plant/add', { title: 'Plant Manage', caption: 'จัดการพันธุ์พืช', findText: findText, payload: payload });
    } else {
        plant.save((err) => {
            if (err) {
                req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
                res.render('plant/add', { title: 'Plant Manage', caption: 'จัดการพันธุ์พืช', findText: findText, payload: payload });
            } else {
                req.flash('success', { msg: 'บันทึก เพิ่มสำเร็จ.' });
                res.render('plant/add', { title: 'Plant Manage', caption: 'จัดการพันธุ์พืช', findText: findText, payload: payload });
            }
        });
    }
}

exports.postPlant = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.findText.trim())) validationErrors.push({ msg: 'Please enter a valid Find Text Search.' });
    let findText = req.body.findText.trim();
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('plant/index', { title: 'Plant Manage', caption: 'จัดการพันธุ์พืช', findText: findText });
    } else {
        let query = [
            { plantNameTh: new RegExp(req.body.findText.trim(), 'i') },
            { plantNameEn: new RegExp(req.body.findText.trim(), 'i') }
        ]
        Plant.find({ $or: query }, (err, result) => {
            if (err) {
                req.flash('errors', 'ไม่พบข้อมูลที่จะทำการแก้ไข ตรวจสอบ!');
                res.render('plant/index', { title: 'Plant Management', caption: 'จัดการพันธุ์พืช', findText: findText });
            } else {
                req.flash('success', { msg: 'ค้นหาด้วยคำว่า : ' + req.body.findText.trim() + ' จำนวนรายการที่พบ ' + result.length + ' รายการ ' });
                res.render('plant/index', { title: 'Plant Management', caption: 'จัดการพันธุ์พืช', findText: findText, result: result });
            }
        });
    }
}

//view plant info
exports.getPlantFindByIdInfo = (req, res) => {
    Plant.findById({ _id: req.query._id }, (err, result) => {
        // console.log(result);
        if (err) {
            req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
            res.send({ 'confirm': 'failed' });
        } else {
            res.send({ 'confirm': 'success', data: result });
        }
    });
}

//view plant to edit
exports.getPlantEdit = (req, res) => {
    Plant.findById({ _id: req.params._id }, (err, result) => {
        // console.log(result);
        if (err) {
            req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
            res.render('plant/edit', { title: 'Plant Management', caption: 'จัดการพันธุ์พืช', _id: req.params._id, findText: req.params.findText });
        } else {
            // res.send({ 'confirm': 'success'});
            // req.flash('success', { msg: 'ค้นพบ จำนวน '+result.length+' รายการ ' });
            res.render('plant/edit', { title: 'Plant Management', caption: 'จัดการพันธุ์พืช', _id: req.params._id, findText: req.params.findText, result: result });
        }
    });
}

//post update plant
exports.postPlantEdit = (req, res) => {
    // console.log(req.params);
    const payload = req.body;
    const validationErrors = [];
    if (validator.isEmpty(req.body.plantNameEn.trim())) validationErrors.push({ msg: 'Please enter a valid Plant Name Eng.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('plant/edit', { title: 'Plant Management', caption: 'จัดการพันธุ์พืช', _id: req.params._id, findText: req.params.findText, result: payload });
    } else {
        Plant.findByIdAndUpdate({ '_id': req.params._id }, payload, { new: true }, (err) => {
            if (err) {
                // return next(err);
                req.flash('errors', 'ไม่พบข้อมูลที่จะทำการแก้ไข ตรวจสอบ!' + err);
                res.render('plant/edit', { title: 'Plant Management', caption: 'จัดการพันธุ์พืช', _id: req.params._id, findText: req.params.findText, result: payload });
            } else {
                req.flash('success', { msg: 'ทำการแก้ไข สำเร็จ.' });
                res.render('plant/edit', { title: 'Plant Management', caption: 'จัดการพันธุ์พืช', _id: req.params._id, findText: req.params.findText, result: payload });
            }
        });
    }
}

//delete   /plant/delete/:_id/:findText
exports.getPlantDelete = (req, res) => {
    Plant.findByIdAndRemove({ _id: req.params._id }, (err, result) => {
        if (err) { return next(err); }
        let query = [
            { plantNameTh: new RegExp(req.params.findText, 'i') },
            { plantNameEn: new RegExp(req.params.findText, 'i') }
        ]
        Plant.find({ $or: query }, (err, result) => {
            if (err) {
                req.flash('errors', 'ไม่พบข้อมูล ตรวจสอบ!');
                res.render('plant/index', { title: 'Product Management', caption: 'จัดการพันธุ์พืช', findText: findText });
            } else {
                req.flash('success', { msg: 'ลบ พันธุ์พืชออกจากระบบ สำเร็จ! ' });
                res.render('plant/index', { title: 'Plant Management', caption: 'จัดการพันธุ์พืช', findText: findText, result: result });
            }
        });


    });
}

//plant/findText?findText=p   getFindText
exports.getFindText = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.query.findText.trim())) validationErrors.push({ msg: 'Please enter a valid Find Text Search.' });
    let findText = req.query.findText.trim();
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('plant/index', { title: 'Plant Manage', caption: 'จัดการพันธุ์พืช', findText: findText });
    } else {
        let query = [
            { plantNameTh: new RegExp(req.query.findText.trim(), 'i') },
            { plantNameEn: new RegExp(req.query.findText.trim(), 'i') }
        ]
        Plant.find({ $or: query }, (err, result) => {
            if (err) {
                req.flash('errors', 'ไม่พบข้อมูลที่จะทำการแก้ไข ตรวจสอบ!');
                res.render('plant/index', { title: 'Plant Management', caption: 'จัดการพันธุ์พืช', findText: findText });
            } else {
                req.flash('success', { msg: 'ค้นพบ จำนวน ' + result.length + ' รายการ ' });
                res.render('plant/index', { title: 'Plant Management', caption: 'จัดการพันธุ์พืช', findText: findText, result: result });
            }
        });
    }
}