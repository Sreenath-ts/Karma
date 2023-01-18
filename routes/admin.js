const express = require('express')
const router = express.Router()
const { verifyAdmin } = require('../middleware/auth')

const {
  dash,
  userpage,
  block,
  unblock,
  addcategory,
  postaddcategory,
  listcategory,
  editCate,
  postEditCategory,
  delCat,
  products,
  addPro,
  addProPost,
  adminLogin,
  adminPOst,
  logout,
  editPro,
  postEditPro,
  deletePro,
  addCoupons,
  postAddCoupons,
  bannerAdd,
  PostBannerAdd,
  banner,
  deleteBanner,
  order,
  changeStatus,
  coupons,
  DeleteCoupon,
  salesReport,
  monthSalesReport,
  yearSalesReport,
  chart1,
  monthlyRev
} = require('../controllers/admincontroller')

router.get('/', verifyAdmin, dash)
router.get('/userlist', verifyAdmin, userpage)
router.get('/block/:id', block)
router.get('/unblock/:id', unblock)
router.get('/addcategory', verifyAdmin, addcategory)
router.post('/addcategory', postaddcategory)
router.get('/category', verifyAdmin, listcategory)
router.get('/editCategory', verifyAdmin, editCate)
router.post('/editCategory/:id', postEditCategory)
router.get('/delCategory/:id', delCat)
router.get('/products', verifyAdmin, products)
router.get('/addPro', verifyAdmin, addPro)
router.post('/addProd', addProPost)
router.get('/adminLogin', adminLogin)
router.post('/adminPost', adminPOst)
router.get('/logout', logout)
router.get('/editPro', verifyAdmin, editPro)
router.post('/postEditPro/:id', postEditPro)
router.get('/deletePro/:id', deletePro)
router.get('/add-coupon', verifyAdmin, addCoupons)
router.post('/add-coupon', verifyAdmin, postAddCoupons)
router.get('/add-banner', bannerAdd)
router.post('/add-banner', PostBannerAdd)
router.get('/banner', verifyAdmin, banner)
router.get('/delete-banner', verifyAdmin, deleteBanner)
router.get('/order', verifyAdmin, order)
router.get('/changeStatus', verifyAdmin, changeStatus)
router.get('/coupons', coupons)
router.get('/coupon-delete', DeleteCoupon)
router.get('/salesReport', salesReport)
router.get('/monthSales', monthSalesReport)
router.get('/yearSales', yearSalesReport)
router.get('/chart1', chart1)
router.get('/getRevenue', monthlyRev)
module.exports = router
