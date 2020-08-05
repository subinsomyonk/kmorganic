const validator = require('validator');
const { promisify } = require('util');
const _ = require('lodash');
const Product = require('../models/Product');

//the first page of Year , yes index.pug
exports.getProduct = (req, res) => {
    res.render('product/index', { title: 'Product Manage', caption: 'จัดการผลผลิต' });
};



//report
exports.getProductReport = (req, res) => {
  console.log('getProductReport');
  Product.find({},(err, resultProduct)=>{
    if(err){
      res.render('product/report', { title: 'Product Report', caption: 'รายงานผลผลิตทั้งหมด', resultProduct: 'Error Database :'+err});
    }
    else{
      if(resultProduct.length <=0){
        res.render('product/report', { title: 'Product Report', caption: 'รายงานผลผลิตทั้งหมด', resultProduct: 'Not Found Any Record'});
      }
      else {
        res.render('product/report', { title: 'Product Report', caption: 'รายงานผลผลิตทั้งหมด', resultProduct:resultProduct });
      }      
    }
  }); 
};

//view product add.pug
exports.getProductAdd = (req, res) => {
    res.render('product/add', { title: 'Product Manage', caption: 'จัดการผลผลิต', findText: req.query.findText.trim() });
};

//post add postProductAdd
exports.postProductAdd = (req, res) => {
    if (req.params.findTextRev == 'undefinded') {
        findText = '';
    } else {
        findText = req.params.findTextRev;
    }
    let payload = req.body;
    const product = new Product({
        productNameTh: req.body.productNameTh.trim(),
        productNameEn: req.body.productNameEn.trim(),
        notes: req.body.notes.trim()
    });

    const validationErrors = [];
    if (validator.isEmpty(req.body.productNameTh.trim())) validationErrors.push({ msg: 'Please enter a valid Product Name Thai.' });
    if (validator.isEmpty(req.body.productNameEn.trim())) validationErrors.push({ msg: 'Please enter a valid Product Name Eng.' });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('product/add', { title: 'Product Manage', caption: 'จัดการผลผลิต', findText: findText, payload: payload });
    } else {
        product.save((err) => {
            if (err) {
                req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
                res.render('product/add', { title: 'Product Manage', caption: 'จัดการผลผลิต', findText: findText, payload: payload });
            } else {
                req.flash('success', { msg: 'บันทึก เพิ่มสำเร็จ.' });
                res.render('product/add', { title: 'Product Manage', caption: 'จัดการผลผลิต', findText: findText, payload: payload });
            }
        });
    }
}

exports.postProduct = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.findText.trim())) validationErrors.push({ msg: 'Please enter a valid Find Text Search.' });
    let findText = req.body.findText.trim();
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('product/index', { title: 'Product Manage', caption: 'จัดการผลผลิต', findText: findText });
    } else {
        let query = [
            { productNameTh: new RegExp(req.body.findText.trim(), 'i') },
            { productNameEn: new RegExp(req.body.findText.trim(), 'i') }
        ]
        Product.find({ $or: query }, (err, result) => {
            if (err) {
                req.flash('errors', 'ไม่พบข้อมูลที่จะทำการแก้ไข ตรวจสอบ!');
                res.render('product/index', { title: 'Product Management', caption: 'จัดการผลผลิต', findText: findText });
            } else {
                req.flash('success', { msg: 'ค้นหาด้วยคำว่า : ' + req.body.findText.trim() + ' จำนวนรายการที่พบ ' + result.length + ' รายการ ' });
                res.render('product/index', { title: 'Product Management', caption: 'จัดการผลผลิต', findText: findText, result: result });
            }
        });
    }
}

//view product info
exports.getProductFindByIdInfo = (req, res) => {
    Product.findById({ _id: req.query._id }, (err, result) => {
        if (err) {
            req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
            res.send({ 'confirm': 'failed' });
        } else {
            res.send({ 'confirm': 'success', data: result });
        }
    });
}

//view product to edit
exports.getProductEdit = (req, res) => {
    // console.log('getProductEdit body ' + req.body);
    // console.log('getProductEdit params ' + req.params);
    Product.findById({ _id: req.params._id }, (err, result) => {
        if (err) {
            req.flash('errors', { msg: 'ผิดพลาดในการบันทึก ตรวจสอบ.: ' + err });
            res.render('product/edit', { title: 'Product Manage', caption: 'จัดการผลผลิต', _id: req.params._id, findText: req.params.findText, result: req.body });
        } else {
            res.render('product/edit', { title: 'Product Manage', caption: 'จัดการผลผลิต', _id: req.params._id, findText: req.params.findText, result: result });
        }
    });
}

//post update product '/product/edit/'+ _id +'/'+findText
exports.postProductEdit = (req, res) => {
    // console.log('postProductEdit:::' + req.body);
    const payload = req.body;
    const validationErrors = [];
    if (validator.isEmpty(req.body.productNameEn.trim())) validationErrors.push({ msg: 'Please enter a valid Product Name Eng......' });
    if (validationErrors.length) {
        // console.log(payload);
        req.flash('errors', validationErrors);
        res.render('product/edit', { title: 'Product Manage', caption: 'จัดการผลผลิต', _id: req.params._id, findText: req.params.findText, result: payload });
    } else {
        Product.findByIdAndUpdate({ '_id': req.params._id }, payload, { new: true }, (err) => {

            if (err) {
                req.flash('errors', 'ไม่พบข้อมูลที่จะทำการแก้ไข ตรวจสอบ!' + err);
                res.render('product/edit', { title: 'Product Manage', caption: 'จัดการผลผลิต', _id: req.params._id, findText: req.params.findText, result: payload });
            } else {
                req.flash('success', { msg: 'ทำการแก้ไข สำเร็จ.' });
                res.render('product/edit', { title: 'Product Manage', caption: 'จัดการผลผลิต', _id: req.params._id, findText: req.params.findText, result: payload });
            }
        });
    }
}

//delete   /product/delete/:_id/:findText
exports.getProductDelete = (req, res) => {
    // console.log('req.params' + req.params);
    Product.findByIdAndRemove({ _id: req.params._id }, (err, result) => {
        if (err) { return next(err); }
        let query = [
            { productNameTh: new RegExp(req.params.findText, 'i') },
            { productNameEn: new RegExp(req.params.findText, 'i') }
        ]
        Product.find({ $or: query }, (err, result) => {
            if (err) {
                req.flash('errors', 'ไม่พบข้อมูล ตรวจสอบ!');
                res.render('product/index', { title: 'Product Management', caption: 'จัดการผลผลิต', findText: req.params.findText });
            } else {
                req.flash('success', { msg: 'ลบ ผลผลิตออกจากระบบ สำเร็จ! ' });
                res.render('product/index', { title: 'Product Management', caption: 'จัดการผลผลิต', findText: req.params.findText, result: result });
            }
        });
    });
}

//product/findText?findText=p   getFindText
exports.getFindText = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.query.findText.trim())) validationErrors.push({ msg: 'Please enter a valid Find Text Search.' });
    let findText = req.query.findText.trim();
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        res.render('product/index', { title: 'Product Manage', caption: 'จัดการผลผลิต', findText: findText });
    } else {
        let query = [
            { productNameTh: new RegExp(req.query.findText.trim(), 'i') },
            { productNameEn: new RegExp(req.query.findText.trim(), 'i') }
        ]
        Product.find({ $or: query }, (err, result) => {
            if (err) {
                req.flash('errors', 'ไม่พบข้อมูลที่จะทำการแก้ไข ตรวจสอบ!');
                res.render('product/index', { title: 'Product Manage', caption: 'จัดการผลผลิต', findText: findText });
            } else {
                req.flash('success', { msg: 'ค้นพบ จำนวน ' + result.length + ' รายการ ' });
                res.render('product/index', { title: 'Product Manage', caption: 'จัดการผลผลิต', findText: findText, result: result });
            }
        });
    }
}