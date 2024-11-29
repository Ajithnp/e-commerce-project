const User = require('../../../models/user-model')
const Product = require('../../../models/product-model')
const Cart = require('../../../models/cart-model')
const Address = require('../../../models/user-address')
const OrderItem = require('../../../models/oredr-items-model')
const Order = require ('../../../models/order-modal')


// Orders getpage..!
exports.getOrders = async (req, res, next)=>{
      const userId = req.session.user.id;
    try {
        const orders = await Order.find({userId})
            .populate('orderItems')
            .populate('userId')
        res.status(200).render('user/user-order-details',{
            orders
        })
        
    } catch (error) {
        console.error('An error occured while loading order page..', error);
        next(error)
        
    }
}