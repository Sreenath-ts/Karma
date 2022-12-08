const express = require('express')
const router = express.Router()
const {get} = require('../controllers/userController')

router.get('/',get)

module.exports=router