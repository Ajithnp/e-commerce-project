const Cart = require('../models/cart-model')

const checkCartNotEmpty = async (req, res, next)=>{

    userId = req.session.user.id;

    const cart = await Cart.findOne({userId});

    if(!cart || cart.items.length === 0){
        return res.redirect('/beats/cart')
    }

    next()  
}

module.exports = checkCartNotEmpty;