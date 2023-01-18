const express = require('express')
const router = express.Router()
const { verifyUser } = require('../middleware/auth')
const { verifyAjaxUser } = require('../middleware/ajaxauth')
const { check, body } = require('express-validator')
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
  reset,
  Postreset,
  orderList,
  orderProduct,
  wishlist,
  couponCheck,
  shopList,
  search,
  invoice,
  removeProduct,
  AddWishlist
} = require('../controllers/usercontroller')
// const {verifyblock} = require('../middleware/middleware')

router.get('/', home)
router.get('/login', login)
router.get('/signup', signup)
router.post('/signup', [check('email', 'Invalid Email').isEmail(), body('password', 'Invalid Password').isLength({ min: 5 }).custom((value) => {
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
  if (specialChars.test(value) === false) throw new Error('Password aleast need one special character')
  else return true
}
).custom((value, { req }) => {
  if (value !== req.body.confirmPassword) {
    throw new Error('Password and confirm password must be equal!')
  }
  return true
}), body('phone', 'Invalid phone number!').isNumeric().isLength({ min: 10, max: 10 })], postSignup)
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
router.get('/reset/:token', reset)
router.post('/reset', Postreset)
router.get('/orderList', verifyUser, orderList)
router.post('/orderProducts', orderProduct)
router.get('/Getwishlist', verifyUser, wishlist)
router.post('/couponCheck', verifyUser, couponCheck)
router.get('/shop', shopList)
router.get('/wishlist-add', AddWishlist)
router.post('/search', search)
router.get('/invoice', invoice)
router.get('/removeProduct', removeProduct)
module.exports = router
