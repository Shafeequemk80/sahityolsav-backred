    const { strict } = require('assert')
    const mongoose= require('mongoose')
    const { type } = require('os')

    const resultData=new mongoose.Schema({
        position:{
            enum:['first','second','third']
        },
        name:{
            type:String
        },

        unit:{
            type:String
        }
    })

    const ResultSchema= new mongoose.Schema({

        resultCount:{
            type:Number,
            required:true
        },
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