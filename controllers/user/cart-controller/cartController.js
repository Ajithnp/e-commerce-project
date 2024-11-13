const User = require('../../../models/user-model')
const Product = require('../../../models/product-model')

exports.getUserCart = async (req, res, next)=>{

    try {
        return res.status(200).render('user/cart')
    } catch (error) {
       console.error('Error occured while loading cart page', error)
       next(error) 
    }
}