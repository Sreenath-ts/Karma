const serviceid = process.env.SSID
const sid = process.env.SID
const token = process.env.TOKEN
const client = require('twilio')(sid, token)

function sendotp (mobile) {
  console.log('start')

  client.verify.v2.services(serviceid)
    .verifications
    .create({ to: `+91${mobile}`, channel: 'sms' })
    .then(verification => console.log(verification.status))
  console.log('end')
}

function verifyotp (mobile, otp) {
  return new Promise((resolve, reject) => {
    client.verify.v2.services(serviceid)
      .verificationChecks
      .create({ to: `+91${mobile}`, code: otp })
      .then((verificationCheck) => {
        console.log(verificationCheck.status)
        resolve(verificationCheck)
      }).catch((verificationCheck) => {
        console.log(verificationCheck.status)
        reject(verificationCheck)
      })
  })
}

module.exports = {
  sendotp,
  verifyotp
}
