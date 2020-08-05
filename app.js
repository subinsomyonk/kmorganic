/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');
// const flash = require('flash');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');
const memberController = require('./controllers/member');
const familyController = require('./controllers/family');
const areaController = require('./controllers/area');
const memberAreaController = require('./controllers/memberArea');
const memberFamilyController = require('./controllers/memberFamily');
const yearssController = require('./controllers/yearss');
const plantController = require('./controllers/plant');
const productController = require('./controllers/product');
const produceController = require('./controllers/produce');
const informationController = require('./controllers/information');
const auditController = require('./controllers/audit');




const receiveController = require('./controllers/receive');



/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
    console.error(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
    process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
    store: new MongoStore({
        url: process.env.MONGODB_URI,
        autoReconnect: true,
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    if (req.path === '/api/upload') {
        // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
        next();
    } else {
        lusca.csrf()(req, res, next);
    }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user &&
        req.path !== '/login' &&
        req.path !== '/signup' &&
        !req.path.match(/^\/auth/) &&
        !req.path.match(/\./)) {
        req.session.returnTo = req.originalUrl;
    } else if (req.user &&
        (req.path === '/account' || req.path.match(/^\/api/))) {
        req.session.returnTo = req.originalUrl;
    }
    next();
});
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account/verify', passportConfig.isAuthenticated, userController.getVerifyEmail);
app.get('/account/verify/:token', passportConfig.isAuthenticated, userController.getVerifyEmailToken);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

app.get('/plant', passportConfig.isAuthenticated, plantController.getPlant);

app.get('/member', passportConfig.isAuthenticated, memberController.getMember);


//family menu
app.get('/family', passportConfig.isAuthenticated, familyController.getFamily);
app.get('/family/findText', passportConfig.isAuthenticated, familyController.getFamilyFindText);
app.post('/family', passportConfig.isAuthenticated, familyController.postFamilyFindText);
app.get('/family/add', passportConfig.isAuthenticated, familyController.getFamilyAdd);
app.post('/family/add', passportConfig.isAuthenticated, familyController.postFamilyAdd);
app.get('/family/edit/:_id/:findText', passportConfig.isAuthenticated, familyController.getFamilyEdit);
app.post('/family/edit/:_id/:findText', passportConfig.isAuthenticated, familyController.getFamilyEdit);
app.post('/family/edit/update/:_id/:findText', passportConfig.isAuthenticated, familyController.postFamilyEditUpdate);
app.get('/family/delete', passportConfig.isAuthenticated, familyController.familyDelete);
app.get('/family/findByIdInfo', passportConfig.isAuthenticated, familyController.getFamilyFindByIdInfo);

//area menu
app.get('/area', passportConfig.isAuthenticated, areaController.getArea);
app.get('/area/findText', passportConfig.isAuthenticated, areaController.getAreaFindText);
app.post('/area', passportConfig.isAuthenticated, areaController.postAreaFindText);
app.get('/area/add', passportConfig.isAuthenticated, areaController.getAreaAdd);
app.post('/area/add', passportConfig.isAuthenticated, areaController.postAreaAdd);
app.get('/area/edit/:_id/:findText', passportConfig.isAuthenticated, areaController.getAreaEdit);
app.post('/area/edit/:_id/:findText', passportConfig.isAuthenticated, areaController.getAreaEdit);
app.post('/area/edit/update/:_id/:findText', passportConfig.isAuthenticated, areaController.postAreaEditUpdate);
app.get('/area/delete', passportConfig.isAuthenticated, areaController.areaDelete);
app.get('/area/areaFindById', passportConfig.isAuthenticated, areaController.getAreaFindById);
app.get('/area/areaFindByAreaId', passportConfig.isAuthenticated, areaController.getAreaFindByAreaId);


//member menu
//get first page of member
app.get('/member', passportConfig.isAuthenticated, memberController.getMember);
app.get('/member/findText', passportConfig.isAuthenticated, memberController.getMemberFindText);
app.post('/member', passportConfig.isAuthenticated, memberController.postMemberFindText);
app.get('/member/add', passportConfig.isAuthenticated, memberController.getMemberAdd);
app.post('/member/add', passportConfig.isAuthenticated, memberController.postMemberAdd);
app.get('/member/edit/:_id/:findText', passportConfig.isAuthenticated, memberController.getMemberEdit);
app.post('/member/edit/update/:_id/:findText', passportConfig.isAuthenticated, memberController.postMemberEditUpdate);
app.get('/member/delete', passportConfig.isAuthenticated, memberController.getMemberDelete);
app.get('/member/findByIdInfo', passportConfig.isAuthenticated, memberController.getMemberFindByIdInfo);
app.get('/member/findByMemberIdInfo', passportConfig.isAuthenticated, memberController.getMemberFindByMemberIdInfo);
app.get('/member/memberAll', passportConfig.isAuthenticated, memberController.getMemberAll);
//20200616 2126 set head of member  (post memberId, and IDCARD)
app.get('/member/setMemberHead', passportConfig.isAuthenticated, memberController.setMemberHead)


// 20200616 1522
app.get('/member/home', memberController.getMemberHome);
app.post('/member/home', memberController.postMemberHome);
app.get('/member/info/:memberId/:findText', memberController.getMemberShow);





//member-area menu 
app.get('/memberArea', passportConfig.isAuthenticated, memberAreaController.getMemberArea);
app.post('/memberArea', passportConfig.isAuthenticated, memberAreaController.getMemberAreaFindText);
app.get('/memberArea/:findText', passportConfig.isAuthenticated, memberAreaController.getMemberAreaFindTextt);
app.get('/memberArea/edit/:memberId/:findText', passportConfig.isAuthenticated, memberAreaController.getMemberAreaWithMemberId);
//with post from link memberarea/findAreaId/:memberId, body.findTextAreadId
app.post('/memberArea/findAreaId/:memberId', passportConfig.isAuthenticated, memberAreaController.postFindAreaId);
app.get('/memberArea/setAreaIdToMember/:memberId/:areaId/:findText/:_id/:setGet/:findTextAreaId', passportConfig.isAuthenticated, memberAreaController.setAreaIdToMember);



//report
app.get('/report/member-area', passportConfig.isAuthenticated, memberAreaController.getMemberAreaReport);




//member-family menu ===============================================******************************

app.get('/memberFamily', passportConfig.isAuthenticated, memberFamilyController.getMemberFamily);
app.post('/memberFamily', passportConfig.isAuthenticated, memberFamilyController.getMemberFamilyFindText);
app.get('/memberFamily/:findText', passportConfig.isAuthenticated, memberFamilyController.getMemberFamilyFindTextt);
app.get('/memberFamily/edit/:memberId/:findText', passportConfig.isAuthenticated, memberFamilyController.getMemberFamilyWithMemberId);
app.post('/memberFamily/findIDCARD/:memberId', passportConfig.isAuthenticated, memberFamilyController.postfindIDCARD);

app.get('/memberFamily/setIDCARDToMember/:memberId/:IDCARD/:findText/:_id/:setGet/:findTextIDCARD', passportConfig.isAuthenticated, memberFamilyController.setIDCARDToMember);

//Cannot GET /report/member-family
app.get('/report/member-family', passportConfig.isAuthenticated, memberFamilyController.getMemberFamilyReport);






//menu plant ================================********************************
app.get('/plant', passportConfig.isAuthenticated, plantController.getPlant);
app.post('/plant', passportConfig.isAuthenticated, plantController.postPlant);
//view add 
app.get('/plant/add', passportConfig.isAuthenticated, plantController.getPlantAdd);
app.post('/plant/add/', passportConfig.isAuthenticated, plantController.postPlantAdd);
app.post('/plant/add/:findTextRev', passportConfig.isAuthenticated, plantController.postPlantAdd);
//view information by id
app.get('/plant/findByIdInfo', passportConfig.isAuthenticated, plantController.getPlantFindByIdInfo);
//view edit
app.get('/plant/edit', passportConfig.isAuthenticated, plantController.getPlantEdit);
app.get('/plant/edit/:_id/:findText', passportConfig.isAuthenticated, plantController.getPlantEdit);
app.post('/plant/edit/:_id/:findText', passportConfig.isAuthenticated, plantController.postPlantEdit);
app.get('/plant/delete/:_id/:findText', passportConfig.isAuthenticated, plantController.getPlantDelete);
//plant/findText?findText=p   
app.get('/plant/findText', passportConfig.isAuthenticated, plantController.getFindText);
//report
app.get('/report/plant', passportConfig.isAuthenticated, plantController.getPlantReport);





//menu product =======================
app.get('/product', passportConfig.isAuthenticated, productController.getProduct);
app.post('/product', passportConfig.isAuthenticated, productController.postProduct);
//view add 
app.get('/product/add', passportConfig.isAuthenticated, productController.getProductAdd);
app.post('/product/add/', passportConfig.isAuthenticated, productController.postProductAdd);
app.post('/product/add/:findTextRev', passportConfig.isAuthenticated, productController.postProductAdd);
//view information by id
app.get('/product/findByIdInfo', passportConfig.isAuthenticated, productController.getProductFindByIdInfo);
//view edit
app.get('/product/edit', passportConfig.isAuthenticated, productController.getProductEdit);
app.get('/product/edit/:_id/:findText', passportConfig.isAuthenticated, productController.getProductEdit);
app.post('/product/edit/:_id/:findText', passportConfig.isAuthenticated, productController.postProductEdit);
app.get('/product/delete/:_id/:findText', passportConfig.isAuthenticated, productController.getProductDelete);
app.get('/product/findText', passportConfig.isAuthenticated, productController.getFindText);
//report
app.get('/report/product', passportConfig.isAuthenticated, productController.getProductReport);





//yearController
//menu year =======================
app.get('/year', passportConfig.isAuthenticated, yearssController.getYear);
app.post('/year', passportConfig.isAuthenticated, yearssController.postYear);
//view add 
app.get('/year/add', passportConfig.isAuthenticated, yearssController.getYearAdd);
//back
app.get('/year/findText', passportConfig.isAuthenticated, yearssController.getFindText);
app.post('/year/add/', passportConfig.isAuthenticated, yearssController.postYearAdd);
app.post('/year/add/:findTextRev', passportConfig.isAuthenticated, yearssController.postYearAdd);
//view information by id
app.get('/year/findByIdInfo', passportConfig.isAuthenticated, yearssController.getYearFindByIdInfo);
//view edit
app.get('/year/edit', passportConfig.isAuthenticated, yearssController.getYearEdit);
app.get('/year/edit/:_id/:findText', passportConfig.isAuthenticated, yearssController.getYearEdit);
app.post('/year/edit/:_id/:findText', passportConfig.isAuthenticated, yearssController.postYearEdit);
app.get('/year/delete/:_id/:findText', passportConfig.isAuthenticated, yearssController.getYearDelete);

app.get('/year/findByYearName', passportConfig.isAuthenticated, yearssController.getYearFindByYearName);


//produce ot the year
app.get('/produce', passportConfig.isAuthenticated, produceController.getProduce);
app.get('/produce/produceMember', passportConfig.isAuthenticated, produceController.getProduceMember);
app.post('/produce/selectMemberSearch', passportConfig.isAuthenticated, produceController.postSelectMemberSearch);
app.get('/produce/keyProduceAreaToMember/:_idYear/:_idMember/:findTextMemberId', passportConfig.isAuthenticated, produceController.getKeyProduceAreaToMember);
app.post('/produce/areaFindText', passportConfig.isAuthenticated, produceController.postAreaFindText);
app.get('/produce/registerProduce', passportConfig.isAuthenticated, produceController.getRegisterProduce);
app.get('/produce/findById', passportConfig.isAuthenticated, produceController.getRegisterProduceFindById);
app.get('/produce/deleteProduce', passportConfig.isAuthenticated, produceController.getDeleteProduce);
app.get('/produce/produceReport', passportConfig.isAuthenticated, produceController.getProduceReport);






//information
app.get('/information/general', passportConfig.isAuthenticated, informationController.getInformationGeneral);
app.get('/information/produce', passportConfig.isAuthenticated, informationController.getInformationProduce);
app.post('/information/produce', passportConfig.isAuthenticated, informationController.postInformationProduce);
app.get('/information/audit', passportConfig.isAuthenticated, informationController.getInformationAudit);
app.post('/information/audit', passportConfig.isAuthenticated, informationController.postInformationAudit);


app.get('/information/statistic', passportConfig.isAuthenticated, informationController.getInformationStatistic);
app.get('/information/statisticGroup', passportConfig.isAuthenticated, informationController.getInformationStatisticGroup);




//**********audit**********************/
app.get('/audit/report/reportsss', passportConfig.isAuthenticated, auditController.getAuditReport);
app.post('/audit/report/reportsss', passportConfig.isAuthenticated, auditController.postAuditReport);
app.get('/audit/:orders', passportConfig.isAuthenticated, auditController.getAudit);
app.post('/audit/member', passportConfig.isAuthenticated, auditController.postAuditMember);
app.post('/audit/member/find', passportConfig.isAuthenticated, auditController.postAuditMemberFind);
app.get('/audit/member/produce/:yearName/:memberId/:orders/:_idProduce', passportConfig.isAuthenticated, auditController.paramAuditMemberProduce);
app.get('/audit/member/auditListAll/:yearName/:memberId/:orders/:_idProduce', passportConfig.isAuthenticated, auditController.paramAuditListAll);
app.get('/audit/member/auditListItem/:yearName/:memberId/:orders/:_idProduce', passportConfig.isAuthenticated, auditController.paramAuditListItem);
app.get('/audit/member/auditSave/:yearName/:memberId/:orders/:_idProduce', passportConfig.isAuthenticated, auditController.paramGetAuditSave);



//a(href="/audit/ListAuditByMemberId/"+yearName+'/'+i.memberId+'/'+orders+'/false')
app.get('/audit/ListAuditByMemberId/:yearName/:memberId/:orders/:result', passportConfig.isAuthenticated, auditController.paramListAuditByMemberId);


//***********receive product */ 
app.get('/receive/primary/:entryKey', passportConfig.isAuthenticated, receiveController.getReceive);
app.post('/receive/primary/yearName', passportConfig.isAuthenticated, receiveController.postReceiveYearName);
app.post('/receive/primary/findText', passportConfig.isAuthenticated, receiveController.postReceiveFindText);
app.get('/receive/primary/showAuditThree/:memberId/:yearName/:findText/:entryKey', passportConfig.isAuthenticated, receiveController.paramReceiveShowAuditThree);
// app.post('/receive/primary/savePrevPrimary/:memberId/:yearName', passportConfig.isAuthenticated, receiveController.paramReceiveSavePrevPrimary);
app.post('/receive/primary/savePrevPrimary', passportConfig.isAuthenticated, receiveController.paramReceiveSavePrevPrimary);
app.post('/receive/history', passportConfig.isAuthenticated, receiveController.postReceivePrimaryHistory);
app.get('/receive/history/cancel', passportConfig.isAuthenticated, receiveController.getReceivePrimaryHistoryCancel);


app.post('/receive/primary/saveReceive', passportConfig.isAuthenticated, receiveController.postSaveReceive);
app.post('/receive/primary/saveReceiveNew', passportConfig.isAuthenticated, receiveController.postSaveReceiveNew);


app.get('/receive/pay', passportConfig.isAuthenticated, receiveController.getReceivePay);
app.post('/receive/pay', passportConfig.isAuthenticated, receiveController.postReceivePayFindText);
app.post('/receive/pay/saveReceive', passportConfig.isAuthenticated, receiveController.postReceivePaySaveReceive);
app.get('/receive/pay/list', passportConfig.isAuthenticated, receiveController.getReceivePayList);






// /receive/history/cancel/'+data[i]._id+'


// received history  /receive/primary/history postReceivePrimaryHistory





/*
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/lastfm', apiController.getLastfm);
app.get('/api/nyt', apiController.getNewYorkTimes);
app.get('/api/steam', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getSteam);
app.get('/api/stripe', apiController.getStripe);
app.post('/api/stripe', apiController.postStripe);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get('/api/clockwork', apiController.getClockwork);
app.post('/api/clockwork', apiController.postClockwork);
app.get('/api/foursquare', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFoursquare);
app.get('/api/tumblr', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTumblr);
app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
app.get('/api/github', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGithub);
app.get('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitter);
app.post('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postTwitter);
app.get('/api/twitch', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitch);
app.get('/api/instagram', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getInstagram);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/lob', apiController.getLob);
app.get('/api/upload', lusca({ csrf: true }), apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), lusca({ csrf: true }), apiController.postFileUpload);
app.get('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getPinterest);
app.post('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postPinterest);
app.get('/api/here-maps', apiController.getHereMaps);
app.get('/api/google-maps', apiController.getGoogleMaps);
app.get('/api/google/drive', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGoogleDrive);
app.get('/api/chart', apiController.getChart);
app.get('/api/google/sheets', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGoogleSheets);
app.get('/api/quickbooks', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getQuickbooks);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/instagram', passport.authenticate('instagram', { scope: ['basic', 'public_content'] }));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/snapchat', passport.authenticate('snapchat'));
app.get('/auth/snapchat/callback', passport.authenticate('snapchat', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets.readonly'], accessType: 'offline', prompt: 'consent' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitch', passport.authenticate('twitch', {}));
app.get('/auth/twitch/callback', passport.authenticate('twitch', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});

/**
 * OAuth authorization routes. (API examples)
 */
app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), (req, res) => {
    res.redirect('/api/foursquare');
});
app.get('/auth/tumblr', passport.authorize('tumblr'));
app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), (req, res) => {
    res.redirect('/api/tumblr');
});
app.get('/auth/steam', passport.authorize('openid', { state: 'SOME STATE' }));
app.get('/auth/steam/callback', passport.authorize('openid', { failureRedirect: '/api' }), (req, res) => {
    res.redirect(req.session.returnTo);
});
app.get('/auth/pinterest', passport.authorize('pinterest', { scope: 'read_public write_public' }));
app.get('/auth/pinterest/callback', passport.authorize('pinterest', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/api/pinterest');
});
app.get('/auth/quickbooks', passport.authorize('quickbooks', { scope: ['com.intuit.quickbooks.accounting'], state: 'SOME STATE' }));
app.get('/auth/quickbooks/callback', passport.authorize('quickbooks', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo);
});

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
    // only use in development
    app.use(errorHandler());
} else {
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).send('Server Error');
    });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
module.exports = app;