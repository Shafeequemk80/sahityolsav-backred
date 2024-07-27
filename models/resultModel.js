    const { strict } = require('assert')
    const mongoose= require('mongoose')




    const ResultSchema= new mongoose.Schema({

    
        category:{
            type:String,
            required:true
            
        },
        item:{
            type:String,
            required:true
        },
        result:[]
    })

    const Result= mongoose.model("Result",ResultSchema)
    module.exports=Result