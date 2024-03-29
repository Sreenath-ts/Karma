if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const flash = require('connect-flash')
const multer = require('multer')
const path = require('path')
const User = require('./models/user')
const AppError = require('./errorhandling/appError')
const globalErrorHandler = require('./errorhandling/errorController')
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
  }
})
app.use(function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  res.header('Expires', '-1')
  res.header('Pragma', 'no-cache')
  next()
})
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.set('layout', 'layouts/layout')

app.use(expressLayouts)
app.use(express.static('public'))
app.use(
  multer({ storage: fileStorage, fileFilter }).fields([
    { name: 'imagee1' },
    { name: 'imagee2', maxCount: 3 }
  ])
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: 'key',
    cookie: { maxAge: 6000000 },
    resave: true,
    saveUninitialized: true
  })
)
app.use(flash())

const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, {})
const db = mongoose.connection

db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to mongoose'))
app.use((req, res, next) => {
  if (req.session.loggedIn) {
    const id = req.session.loggedIn.user._id

    User.findById(id).then((useer) => {
      const count = useer.count()
      res.locals.count = count
      next()
    })
  } else {
    next()
  }
})
app.use('/', userRouter)
app.use('/admin', adminRouter)

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

app.listen(process.env.PORT || 3000, (err) => {
  if (err) console.log(err)
  else console.log('server running successfully')
})
