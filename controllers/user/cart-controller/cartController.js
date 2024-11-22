const User = require('../../../models/user-model')
const Product = require('../../../models/product-model')
const Cart = require('../../../models/cart-model')

exports.getUserCart = async (req, res, next)=>{

    const userId = req.session.user.id;

    try {
        // check if the user has cart..?
        const cart = await Cart.findOne({userId}).populate('items.productId')
        return res.status(200).render('user/cart',{cart})
    } catch (error) {
       console.error('Error occured while loading cart page', error)
       next(error) 
    }
}


// Add to cart handler..!

exports.addToCart = async (req, res, next)=>{

    const {productId, color, quantity}= req.body;
    const userId = req.session.user.id;
    

    try {
        // Check the user already has cart..?

        let cart = await Cart.findOne({userId})

        if(!cart){
            cart = new Cart({userId})
        }

        //Check the product alredy in cart with same color..!
        let existingItem = cart.items.find(item=> item.productId.toString() ==productId && item.selectedColor==color)

        if(existingItem){
            // The item already exist update the quantity and price..!
            existingItem.quantity +=quantity;

            existingItem.totalPrice += existingItem.price*quantity;
        }else {
            // The item does't existing the cart

            let product = await Product.findById(productId)

            if(!product){
                return res.status(404).json({message: 'Product not found..!'})
            }

            // Create a new items Object

            const newItem ={
                productId,
                quantity,
                price:product.salePrice,
                totalPrice:(product.salePrice)*quantity,
                selectedColor:color
            }
            // Add new item to the cart's items array;

            cart.items.push(newItem);
        }

        // Calculate the subtotal
        cart.subTotal = cart.items.reduce((acc, item)=> acc+item.totalPrice,0)

        // save
        cart.save()
        return res.status(200).json(cart)
        
    } catch (error) {
        console.error('An error hloo occured while adding new item in cart', error)
        next(error)
    }
}


// Remove Cart item Handler..!

exports.removeCartItem = async(req, res, next)=>{
    const userId = req.session.user.id;
    const {id}= req.params;

    try {
        let cart = await Cart.findOne({userId})

        if(!cart){
            return res.status(400).json({message: 'User not found..!'})
        }

        // Item remove..!
        cart.items = cart.items.filter(item => item._id.toString() !== id)

        // Re calculate subtotal..!
        cart.subTotal = cart.items.reduce((acc, item)=> acc+item.totalPrice,0)

        // Save Updated cart..!
        await cart.save();

        return res.status(200).json({message: 'Item removed from cart..!'})

        
    } catch (error) {
        console.error('An error occured while removing item from cart..!')
        next(error)
        
    }
}