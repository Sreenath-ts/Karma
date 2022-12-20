const user = require('../models/user')
const bcrypt = require('bcrypt')
module.exports={
    dologin:(userLog)=>{
        return new Promise(async(resolve,reject)=>{
            let response = {}
           
           
            let userz = await user.findOne({ email: userLog.email })
            
            if(userz && userz.access){
                bcrypt.compare(userLog.password, userz.password).then((stat) => {
                    if(stat){
                        response.user = userz
                        response.status = true
                        resolve(response)
                        console.log("login success");
                    }else{
                        resolve({status:false})
                        console.log("password wrong");
                    }
                })
            }
            else{
                resolve({status:false})
                console.log('no user')
            }
        })
    }
}