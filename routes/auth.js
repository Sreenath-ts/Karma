const { check } = require('express-validator')

module.exports.signnup = check('email').isEmail()
