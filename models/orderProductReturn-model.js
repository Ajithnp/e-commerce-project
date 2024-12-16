const mongoose = require('mongoose');

const orderProductReturnSchema = new mongoose.Schema({
    order:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:"Order"
    },
    product:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'Product'
    },
    orderItemId:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    returnProductStatus: {
        type: String,
        enum: ["Return Request","Return Approved","returnRejected"],
        default:"returnInitiated",
        required:true
      },
    productRefundAmount:{
        type:Number,
        min: 0,
        default:0,
        required:true
    },
    productSalePrice:{
        type:Number,
        required: true
    },
    productColor:{
        type:String,
        required: true
    },
    productQuantity:{
        type: Number,

    },
    productReturnDate:{
        type:Date,
        default:()=> Date.now(),
        required:true
    },
    productReturnReason:{
        type:String,
        required:true
    },
    rejectionReason:{
        type:String,
        enum: [
            'Product not eligible for return',
            'Return request exceeds allowed time frame',
            'Product condition does not meet return policy',
            'Promotional or discounted item is non-returnable',
            'Return policy terms violated',
            'Other (specified in description)'
        ],
        required: false,
    }


},{timestamps:true})

module.exports = mongoose.model('ProductReturn',orderProductReturnSchema)