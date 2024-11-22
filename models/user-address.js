const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    user :{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name:{
        type: String,
        required: true
    },
    lastName:{
        type: String
    },
    email:{
        type:String,
        required: true
    },
    companyName: {
        type: String
    },
    landmark: {
        type: String
    },
    streetAddress: {
        type:String
    },
    city:{
        type: String
    },
    district:{
        type: String
    },
    state:{
        type: String
    },
    country:{
        type:String

    },
    zip :{
        type: String
    },
    altPhone:{
        type: String,
    },
    addressType:{
        type:String,
        enum: ['Home','Office','Other'],
        default: 'Home'
    }

},{ timestamps: true });

// Indexes for performance optimization
// addressSchema.index({ user : 1 });
// addressSchema.index({ city : 1 });
// addressSchema.index({ zip : 1 });

module.exports = mongoose.model('Address',addressSchema)