const Product = require('../../../models/product-model');
const User = require('../../../models/user-model')
const Wishlist = require('../../../models/wishlist-model')
const Cart = require('../../../models/cart-model')


exports.getWishlist = async (req, res, next)=>{
   
        const userId = req.session.user.id;
        

    try {
        let userData = userId ? await User.findById(userId) : null;

        // Check the user have wishlist..!

        const wishlistData = await Wishlist.findOne({ userId }).populate({
            path: 'products.productId',
            populate: [
                { path: 'brand', select: 'isBlocked' },
                { path: 'category', select: 'isListed' }
            ]
        });

        const filteredWishlist = wishlistData
        ? wishlistData.products.filter(item => {
            const product = item.productId;
            return (
                product &&
                !product.isBlocked && 
                product.brand && !product.brand.isBlocked && 
                product.category && !product.category.isListed 
            );
        })
        : [];

        

        const sortedWishlist = filteredWishlist.sort((a, b) => b.createdOn - a.createdOn);
        // Render the wishlist page with wishlist data's..!
        
        return res.render('user/wishlist',{
            user: userData,
            wishlist:sortedWishlist
            
        })
    } catch (error) {
        console.error('Error occured while loading wishlist page..!',error)
        next(error)
        
    }
}

// Wishlist add Handler (Post)..!

exports.addWishlist = async (req, res, next)=>{
    const userId = req.session.user.id;
    const {productId} = req.body;


    try{

        // check if the wishlist exists for the user..!

        let wishlist = await Wishlist.findOne({userId});

        // if no wishlist create one..!
        if(!wishlist){
            wishlist = new Wishlist({userId, products: []});
        }

        // check the product already in wishlist.

        const existingProduct = wishlist.products.find(item => item.productId.toString() === productId.toString())
        
        
        if(existingProduct){
            return res.status(400).json({message: 'Product already in your wishlist'});
        }
       
        //Add new product to the wishlist..!
        wishlist.products.push({productId})
        await wishlist.save();

        res.status(201).json({message:'Product added to wishlist..!'})




    }catch(error){
        console.error('An error occured while adding product to wishlist..!')
        next(error)
    }
}

// Wishlist item remove Handler (Delete)..!

exports.removeItemFromWishlist = async(req, res, next)=>{
    const userId = req.session.user.id;
    
    const productId = req.params.id;
    

    try {
        // Find the user's wishlist and remove specific item;

        const updateWishlist = await Wishlist.findOneAndUpdate(
            {userId},
            {$pull :{products:{productId: productId}}},
            {new: true}
        )

        if(!updateWishlist){
            return res.status(404).json({message: 'Wishlist not found..!'})
        }

        res.status(201).json({message: 'Product removed from wishlist'});
        
    } catch (error) {
        console.error('An error occured while removing an item from wishlist..!',error)
        next(error)
        
    }
}



