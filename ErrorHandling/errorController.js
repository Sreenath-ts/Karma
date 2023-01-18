const AppError = require('./appError')
const handleDuplicate = (error) => {
  const value = error.keyValue.name

  const message = `Duplicate field value: ${value}.Please use another value!`

  return new AppError(message, 404)
}

module.exports = (err, req, res, next) => {
  res.status(err.statusCode || 500)
  if (err.isOperational) {
    res.render('404', {
      error: {
        status: err.statusCode || 500,
        message: err.message
      },
      uzer: false,
      admin: false
    })
  } else {
    let error = { ...err }

    if (err.code === 11000) {
      console.log('aaaaaaa')
      error = handleDuplicate(err)
      res.render('404', {
        error: {
          status: error.statusCode || 500,
          message: error.message
        },
        uzer: false,
        admin: false
      })
    } else {
      res.status(500).render('404', {
        error: {
          status: 500,
          message: "We're really sorry,something bad happened we're working on it!!"
        },
        uzer: false,
        admin: false
      })
    }
  }
}
