const Product = require('../../../models/product-model');
const User = require('../../../models/user-model')

exports.getWishlist = async (req, res, next)=>{
   
        const user = req.session.user;
        

    try {
        const userData = user ? await User.findById(user.id) : null;
        
        return res.render('user/wishlist',{
            user: userData
        })
    } catch (error) {
        console.error('Error occured while loading wishlist page..!',error)
        next(error)
        
    }
}