const mongoose = require ('mongoose')

const colorStockSchema = new mongoose.Schema({
    color:{
        type: String,
        enum :['white','black','blue'],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min :0
        
    },
    status: {
        type: String,
        enum: ["Available", "Out of stock", "Discontinued", "In stock"],
        required : true,
        default: "In stock"
    },

})


const productSchema = new mongoose.Schema({
    productName : {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    additionalInfo :{
        type: String,
        required: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    regularPrice: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        default : 0
    },
    productOffer: {
        type: Number,
        default : 0
    },
    colorStock:[colorStockSchema],
    
    productImage: {
        type: [String],
        required: true
    },
    tags:{
        type :[String],
        enum: ['Noise cancellation', 'High battery power', 'Waterproof', 'Gaming', 'Limited edition'],
        default :[]

    },
    productOffer:{
        type: Number,
        default :0
    },
    categoryOffer:{
        type: Number,
        default:0
    },
    brandOffer:{
        type:Number,
        default:0
    },
    finalOffer:{
        type:Number,
        default:0
    },

    isBlocked: {
        type: Boolean,
        default: false
    },
    shippingAndReturn :{
        type: String,
        default: "We deliver to over 100 countries around the world. For full details of the delivery options we offer, please view our Delivery information  We hope you ll love every purchase, but if you ever need to return an item you can do so within a month of receipt. For full details of how to make a return, please view our Returns information"
                 
    },
    rating:{
        type: Number,
        default:0
    },
    numReviews:{
        type: Number,
        default:0

    },
    isFeatured:{
        type: Boolean,
        default: false
    },
   

} , {timestamps: true});


module.exports = mongoose.model ('Product', productSchema)

// const productSchema = new mongoose.Schema({
//     productName : {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true,
//     },
//     additionalInfo: {
//         type: String,
//         required: true
//     },
//     brand: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Brand",
//         required: true
//     },
//     category: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Category",
//         required: true
//     },
//     regularPrice: {
//         type: Number,
//         required: true
//     },
//     salePrice: {
//         type: Number,
//         default : 0
//     },
//     productOffer: {
//         type: Number,
//         default : 0
//     },
  
//     isBlocked: {
//         type: Boolean,
//         default: false
//     },

//     variants:[
//         {
//             color:{
//                 type: String,
//                 enum: ["white", "black", "red", "blue", "grey"],
//                 required: true
//             },
//             quantity: {
//                 type: Number,
//                 default : 1
//             },
//             sku :{
//                 type: String,
//                 required: true
//             },
//             status: {
//                 type: String,
//                 enum: ["Available", "Out of stock", "Discontinued", "In stock"],
//                 required : true,
//                 default: "In stock"
//             },
//              images: {
//                 type: [String],
//                 required: true // Array of image URLs for each color
//             },     
//         }

//     ]
  

// } , {timestamps: true});


module.exports = mongoose.model ('Product', productSchema)

