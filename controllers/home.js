/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
    res.render('home', {
        title: 'KM-Organic',
        caption: 'ขวัญน้ำอ้อม ออร์กานิก'
    });
};