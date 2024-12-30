const User = require('../../../models/user-model')
const Product = require('../../../models/product-model')
const Cart = require('../../../models/cart-model')
const Address = require('../../../models/user-address')
const OrderItem = require('../../../models/oredr-items-model')
const Order = require ('../../../models/order-modal')
const ProductReturn = require('../../../models/orderProductReturn-model')
const Wallet = require('../../../models/wallet-model')
const mongoose = require('mongoose')


// Orders getpage..!
exports.getOrders = async (req, res, next)=>{
      const userId = req.session.user.id;
    try {
        // find user.
        let user = await User.findById(userId)


        const orders = await Order.find({userId}).sort({ createdAt: -1 })
            .populate('orderItems')
            .populate('userId')
            .exec();
        res.status(200).render('user/user-order-details',{
            orders,
            user
        })
        
    } catch (error) {
        console.error('An error occured while loading order page..', error);
        next(error)
        
    }
}

// Get order details..!

exports.getOrderDetails = async (req, res, next)=>{
    const orderId = req.params.id;
    const userId = req.session.user.id;

    try {
        
         const user = await User.findById(userId)
        const order = await Order.findById(orderId)
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product', // Populate product details
                select: 'productName productImage colorStock' // Select fields you need
            }
        });

        if(!order){
            return res.status(400).json({message: "Order not found..!"})
        }
        
        const returnRequests = await ProductReturn.find({ order: orderId });
        

        const orderWithReturnStatus = {
            ...order._doc,
            orderItems: order.orderItems.map(item => {
                const returnRequest = returnRequests.find(req => req.orderItemId.toString() === item._id.toString());
                return {
                    ...item._doc,
                    returnStatus: returnRequest ? returnRequest.returnProductStatus : 'No Return Requested',
                };
            }),
        };
        

        res.status(200).render('user/order-details',{
            order: orderWithReturnStatus,
            user
        })
        
    } catch (error) {
        console.error('An error occured while loading order detail page..!');
        next(error)
        
    }
}

// Order cancellation Handler..!
exports.orderCancel = async (req, res, next) => {
    const orderId = req.params.id;
    const {reason}= req.body;
    const {flag} = req.body;
    

    try {
        // Find the order and populate orderItems 
        const order = await Order.findById(orderId).populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                select: 'colorStock' 
            }
        });

        if (!order) {
            return res.status(400).json({ message: 'Order ID not found!' });
        }

        // check the Order payment method.
        if(order.paymentMethod === 'razorpay' && !flag){
            const userId = order.userId;

            // Find the order Amount!

            const refundAmount = order.totalAmount;

            const wallet = await Wallet.findOneAndUpdate(
                {userId},
                {$inc: {walletBalance: refundAmount}},
                {new:true, upsert:true}
            )

            wallet.transactions = wallet.transactions || [];
            wallet.transactions.push({
            transactionType: 'credit',
            transactionAmount: refundAmount,
            transactionDescription: 'Order amount refunded',
            transactionId: `TXN-${Date.now()}`, 
        });

        await wallet.save();

        }else if (order.paymentMethod === 'Wallet'){
           

            const userId = order.userId;

            const refundAmount = order.totalAmount;

            const wallet = await Wallet.findOneAndUpdate(
                {userId},
                {$inc: {walletBalance: refundAmount}},
                {new:true, upsert:true}
            )
           
            

            wallet.transactions = wallet.transactions || [];
            wallet.transactions.push({
            transactionType: 'credit',
            transactionAmount: refundAmount,
            transactionDescription: 'Order cancel amount refunded',
            transactionId: `TXN-${Date.now()}`, 
        });

        await wallet.save();



        }

        // Change order status to 'Cancelled'
        order.orderStatus = 'Cancelled';
        order.cancelReason = reason;


        // Restore product quantities
        for (const item of order.orderItems) {
            const product = item.product; 
            

            if (product) {
                // Find the corresponding color stock
                const selectedColorStock = product.colorStock.find(color => color.color === item.color);


                if (selectedColorStock) {
                    selectedColorStock.quantity += item.quantity; // Restore the quantity
                    selectedColorStock.status = selectedColorStock.quantity > 0 ? 'In stock' : 'Out of stock';
                }
            }
        }

        // Save updated product quantities
        await Promise.all(order.orderItems.map(async item => {
            const product = item.product; 
            await product.save(); 
        }));

        // Save updated order status
        await order.save();

        res.status(200).json({ message: 'Order cancelled successfully!' });

    } catch (error) {
        console.error('An error occurred while cancelling the order:', error);
        next(error);
    }
};

