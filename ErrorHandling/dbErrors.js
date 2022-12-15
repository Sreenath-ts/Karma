module.exports = {
     handleDuplicate : (error)=>{
        let value = error.keyValue.name
      
      
      const message = `Duplicate field value: ${value}.Please use another value!`
      
      return message;
      }
}