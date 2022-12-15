const user = require('../models/user')
const bcrypt = require('bcrypt')
module.exports={
    dologin:(userLog)=>{
        return new Promise(async(resolve,reject)=>{
            let response = {}
           
           
            let userz = await user.find({ email: userLog.email })
            
            if(userz.length>0 && userz[0].access){
                bcrypt.compare(userLog.password, userz[0].password).then((stat) => {
                    if(stat){
                        response.user = userz.name
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