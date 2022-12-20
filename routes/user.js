const express = require('express')
const router = express.Router()
const {verifyUser} = require('../middleware/middleware')
const {verifyAjaxUser} = require('../middleware/ajaxMiddleware')
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
    addCartHome
} = require('../controllers/userController')
// const {verifyblock} = require('../middleware/middleware')

router.get('/',home)
router.get('/login',login)
router.get('/signup',signup)
router.post('/signup',postSignup)
router.post('/login',postLogin)
router.post('/otp',postOtp)
router.get('/logout',logout)
router.get('/viewMore',viewMore)
router.get('/add-to-cart',verifyUser,cart)
router.get('/cart',verifyUser,showCart)
router.post('/changeQty',verifyAjaxUser,ChangeQuantity)
router.post('/addCartHome',verifyAjaxUser,addCartHome)
module.exports=router