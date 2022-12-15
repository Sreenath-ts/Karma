const adminEmail = process.env.AdminEmail
const adminPassword = process.env.AdminPassword

const {handleDuplicate} = require('../ErrorHandling/dbErrors')

const category = require('../models/category')
const user = require('../models/user')
const products = require('../models/product')
module.exports={
    dash:(req,res)=>{
        res.render('admin/dash',{uzer:false,admin:true})
    },
    userpage:async(req,res)=>{
      const userlist = await user.find()
      console.log(userlist)
        res.render('admin/userlist',{uzer:false,admin:true,userlist})
    },
    block:async(req,res)=>{
        console.log(req.params.id)
        const id = req.params.id
       await user.findByIdAndUpdate(id,{access:false})
       
        res.redirect('/admin/userlist')
    },
    unblock:async(req,res)=>{
        const _id = req.params.id
       const docs =  await user.findByIdAndUpdate(_id,{access:true},{
        })
        
        res.redirect('/admin/userlist')
    },
    addcategory:(req,res)=>{
        res.render('admin/addcategory',{uzer:false,admin:true,errors:''})
    },
    postaddcategory:async(req,res)=>{
        console.log(req.body);
       
      
      const image = req.files.imagee1
      

      if(!image){
        res.render('admin/addcategory',{uzer:false,admin:true,error:"File is not image."})
        error=''
      }
       let imageUrl = image[0].path;
       console.log(imageUrl);
        imageUrl = imageUrl.substring(6)
      

       console.log('hoooooooooooooooooo'+imageUrl);
      const newCategory = new category({
        name:req.body.categoryName,
        description:req.body.description,
        image:imageUrl
      })
     newCategory.save().then((newOne)=>{
      console.log(newOne)
      res.redirect('/admin/category')
     }).catch((err)=>{
      let error = {...err}
      console.log(error.code);
      var errors;
      if(error.code === 11000 ){
        errors = handleDuplicate(error)
        res.render('admin/addcategory',{uzer:false,admin:true,errors})
      } 
    
     })


    },
    listcategory:async(req,res)=>{
        const cate = await category.find()
       
        res.render('admin/categoryView',{uzer:false,admin:true,cate})
    },
    editCate:async(req,res)=>{
         const iid = req.query.id
         console.log(iid);
         
         const oneUser = await category.findOne({_id:iid})
        console.log(oneUser+'hiii');
      res.render('admin/editCategory',{uzer:false,admin:true,oneUser})
    },
    postEditCategory:async(req,res)=>{
      console.log(req.body)
    
       const id = req.params.id
      const updatedName = req.body.categoryName.trim()
      const updatedDescription = req.body.description.trim()
      // console.log(req.files);
      // console.log(req.files.path);
      const image = req.files.imagee1
      let cat = {name:updatedName,description:updatedDescription}
       if(image){
       let imageUrl = image[0].path.substring(6)
        cat.image=imageUrl
       }
       await category.updateOne({_id:id},{
        $set:{
          name:cat.name,
          description:cat.description,
          image:cat.image
        }
       })
       res.redirect('/admin/category')
     
    },
    delCat:(req,res)=>{
      const id=req.params.id
      console.log(id);
      category.deleteOne({_id:id}).then((doc)=>{
        console.log(doc)
      }).catch((e)=>console.log(e))
      res.redirect('/admin/category')
    },
    products:async(req,res)=>{
     const pros = await products.find()
      res.render('admin/products',{uzer:false,admin:true,pros})
  },
  addPro:async(req,res)=>{
    const categories = await category.find()
    res.render('admin/addPro',{uzer:false,admin:true,categories})
  },
  addProPost:(req,res)=>{
   
    console.log(req.files.imagee2)
    const image = req.files.imagee2
    let imageUrl = image[0].path
    imageUrl = imageUrl.substring(6)
    const productz = new products({
      title:req.body.title,
      brand:req.body.brand,
      price:req.body.price,
      stock:req.body.stock,
      category:req.body.category.trim(),
      image:[imageUrl],
      description:req.body.description,
      discount:req.body.discount,
      size:req.body.size
    })
    productz.save((error,doc)=>{
      if(error){
       
        res.redirect('/admin/addPro')
       
      }else{
        console.log(doc);
        res.redirect('/admin/products')
      }
    })
  },
  adminLogin:(req,res)=>{
    if(req.session.admin){
      res.redirect('/admin/adminLogin')
    }else{
    
     
        let error = req.session.adminLogErr
      
      
      res.render('admin/adminLogin',{uzer:false,admin:false,error})
    
      req.session.adminLogErr = null
    } 
  },
  adminPOst:(req,res)=>{
    console.log(req.body);
    const admin = req.body.email
    const password = req.body.password
    if(admin === adminEmail && password === adminPassword){
      req.session.admin = true
      res.redirect('/admin')
    }else{
      req.session.adminLogErr = true
      res.redirect('/admin/adminLogin')
    }
  },
  logout:(req,res)=>{
    req.session.admin = null
    res.redirect('/admin/adminLogin')
  },
  editPro:(req,res)=>{
    console.log(req.params.id);
    res.render('admin/editPro',{uzer:false,admin:true})
  }
}