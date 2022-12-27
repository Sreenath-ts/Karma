const express = require('express')
const router = express.Router()
const { verifyUser } = require('../middleware/auth')
const { verifyAjaxUser } = require('../middleware/ajaxAuth')
const {
  login,
  signup,
  postSignup,
  postLogin,
  home,
  postOtp,
  logout,
  viewMore,
  cart,
  showCart,
  ChangeQuantity,
  addCartHome,
  profile,
  address,
  verifyPayment,
  editAddress,
  deleteAdd,
  checkout,
  order,
  success,
  forget,
  postForget,
  orderList
} = require('../controllers/userController')
// const {verifyblock} = require('../middleware/middleware')

router.get('/', home)
router.get('/login', login)
router.get('/signup', signup)
router.post('/signup', postSignup)
router.post('/login', postLogin)
router.post('/otp', postOtp)
router.get('/logout', logout)
router.get('/viewMore', viewMore)
router.get('/add-to-cart', verifyUser, cart)
router.get('/cart', verifyUser, showCart)
router.post('/changeQty', verifyAjaxUser, ChangeQuantity)
router.post('/addCartHome', verifyAjaxUser, addCartHome)
router.get('/profile', verifyUser, profile)
router.post('/address', address)

router.post('/edit-address/:id', verifyUser, editAddress)
router.post('/deleteAdd', deleteAdd)
router.get('/checkout', verifyUser, checkout)
router.post('/order', verifyUser, order)
router.get('/success', success)
router.post('/verify-payment', verifyPayment)
router.get('/forget', forget)
router.post('/forget', postForget)
router.get('/orderList', verifyUser, orderList)
module.exports = router
