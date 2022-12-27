module.exports = {
  verifyAdmin: (req, res, next) => {
    if (req.session.admin) {
      next()
    } else {
      res.redirect('/admin/adminLogin')
    }
  },
  verifyUser: (req, res, next) => {
    if (req.session.loggedIn) {
      next()
    } else {
      res.redirect('/login')
    }
  }
}
