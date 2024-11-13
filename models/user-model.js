const mongoose = require ('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, 'name is required field']
    },
    email:{
        type: String,
        required: [true, 'email is required field'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone:{
        type: Number,
        required: [false, 'phone is required field'],
    },
    password:{
        type: String,
        required: false
    },
    confirmPassword:{
        type:String,
        required:false
    },

    googleId:{
        type:String,
        required: false,
        unique:false
    },

    isBlocked:{
        type: Boolean,
        default: false 
    },
    joinedOn: {
        type : Date,
        default: Date.now()

    }



})


module.exports = mongoose.model ('User', userSchema)