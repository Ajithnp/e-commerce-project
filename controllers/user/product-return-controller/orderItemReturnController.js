const User = require('../../../models/user-model')
const Product = require('../../../models/product-model')
const Cart = require('../../../models/cart-model')
const Address = require('../../../models/user-address')
const OrderItem = require('../../../models/oredr-items-model')
const Order = require ('../../../models/order-modal')
const Coupon = require('../../../models/coupon-model')
const ProductReturn = require('../../../models/orderProductReturn-model')



exports.itemReturnRequest = async (req, res, next)=>{
    console.log('ivide ethii: product return');
    
    const {productId, orderId, reason, color, quantity}= req.body;

    try {
        if(!productId || !orderId || !reason){
            return res.status(400).json({ message :'Please provide the informations..!'})
        }

        const product = await Product.findById(productId, { salePrice: 1, _id: 0 });

        console.log('product sale price found', product.salePrice);
        

        // find the order..!
        const order = await Order.findById(orderId).populate('orderItems')
        console.log('populated order details:', order);
        if(!order){
            return res.status(404).json({message: 'Order not found..!'})
        }

        // find the product in order;
        const orderItem = order.orderItems.find(item => item.product.toString() === productId)
        if(!orderItem){
            return res.status(404).json({message: 'Product not found in this order..!'})
        }

        // check if a return request already exist..!

        const existsReturnRequest = await ProductReturn.findOne({
            order: orderId,
            product: productId,
            orderItemId: orderItem._id
        });

        if(existsReturnRequest){
            return res.status(400).json({message: 'Return request for this product already exists.!'});
        }
        
        // create a return request
        const returnRequest = new ProductReturn({
            order:orderId,
            returnId:`RTN-${Date.now()}`, 
            product:productId,
            orderItemId:orderItem._id,
            returnProductStatus: 'Return Request',
            productReturnReason:reason,
            productColor:color,
            productSalePrice:product.salePrice,
            productQuantity:quantity

        })

        await returnRequest.save();

        res.status(201).json({message:'Return request submitted successfully..!', returnRequest})
    } catch (error) {
        console.error('An error occured while accepting return request..!');
        next(error);
        
    }
}