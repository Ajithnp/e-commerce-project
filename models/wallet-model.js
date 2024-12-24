const mongoose = require('mongoose');

const walletSchema =  new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    walletBalance :{
        type: Number,
        required : true,
        min: 0
    },
    transactions:[{

        transactionType:{
            type: String,
            enum:['debit', 'credit'],
            required: true
        },
        transactionAmount:{
            type: Number,
            required: true
        },
        transactionDate:{
            type: Date,
            default: Date.now
        },
        transactionId:{
            type: String,
            required: true
        },
        transactionDescription:{
            type: String,
            enum:['Order amount refunded', 'Order amount deducted', 'Amount added', 'Order cancel amount refunded'],
            required: true
        }
    }]
},{timestamps: true})

module.exports = mongoose.model('Wallet',walletSchema)