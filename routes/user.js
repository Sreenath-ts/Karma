const express = require('express')
const router = express.Router()
const {
    login,
    signup,
    postSignup,
    postLogin,
    home,
    postOtp,
    logout
} = require('../controllers/userController')
// const {verifyblock} = require('../middleware/middleware')

router.get('/',home)
router.get('/login',login)
router.get('/signup',signup)
router.post('/signup',postSignup)
router.post('/login',postLogin)
router.post('/otp',postOtp)
router.get('/logout',logout)
module.exports=router