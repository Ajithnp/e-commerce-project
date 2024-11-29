const User = require('../../../models/user-model')
const Product = require('../../../models/product-model')
const Cart = require('../../../models/cart-model')
const Address = require('../../../models/user-address')
const OrderItem = require('../../../models/oredr-items-model')
const Order = require ('../../../models/order-modal')
// const userAddress = require('../../../models/user-address')

exports.getUserCart = async (req, res, next)=>{

    const userId = req.session.user.id;

    try {
        // Finding User details..!
        const userData = await User.findById(userId);
        // check if the user has cart..?
        const cart = await Cart.findOne({userId}).populate('items.productId')

        // count cart documents..!
        const cartCount = await Cart.countDocuments()
        console.log('cart count documents', cartCount);
        
        return res.status(200).render('user/cart',{cart,user:userData,cartCount})
    } catch (error) {
       console.error('Error occured while loading cart page', error)
       next(error) 
    }
}


// Add to cart handler..!

exports.addToCart = async (req, res, next) => {
    const { productId, color, quantity } = req.body;
    const userId = req.session.user.id;

    try {
        // Check if the user already has a cart
        let cart = await Cart.findOne({ userId })

        // If no cart exists, create a new one
        if (!cart) {
            cart = new Cart({ userId });
        }

        // Check if the product is already in the cart with the same color
        let existingItem = cart.items.find(item => 
            item.productId.toString() === productId && item.selectedColor === color
        );

        console.log('Item exists with:', existingItem); // Debugging statement

        // Fetch product details
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found..!' });
        }

        // Find the color stock for the specific selected color
        const colorStock = product.colorStock.find(stock => stock.color === color);

        if (!colorStock) {
            return res.status(404).json({ message: 'Color stock not found..!' });
        }

        // Check if the requested quantity exceeds available stock
        if (quantity > colorStock.quantity) {
            return res.status(400).json({ message: 'Product is out of stock' });
        }

        if (existingItem) {
            // If the item already exists in the cart, show a message instead of updating
            return res.status(400).json({ message: 'This item is already in your cart.' });
        } else {
            // Create a new item object since it doesn't exist in the cart
            const newItem = {
                productId,
                quantity,
                price: product.salePrice,
                totalPrice: product.salePrice * quantity,
                selectedColor: color
            };
            // Add new item to the cart's items array
            cart.items.push(newItem);
        }

        // Calculate subtotal for the cart
        cart.subTotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

        // Save updated cart
        await cart.save();
        
        return res.status(200).json(cart); // Return updated cart as response

    } catch (error) {
        console.error('An error occurred while adding new item to cart', error);
        next(error);
    }
};

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

// Cart quantity updation handler..!
exports.cartQuantityUpdate = async(req, res, next)=>{
    const userId = req.session.user.id;
    const {id} = req.params;
    const {quantity} = req.body; // Get new quantity from request body.


    try {
        const cart = await Cart.findOne({userId}).populate('items.productId');
        

        if(!cart){
            return res.status(404).json({message:'Cart not found..!'})
        }

        const existingItem = cart.items.find(item=> item._id.toString() == id);
        

        if(!existingItem){
            return res.status(404).json({message: 'Item not fount in cart'});
        }

        // Fetch the product details to check available quantity
        const product = await Product.findById(existingItem.productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found..!' });
        }

         // Find the color stock for the specific selected color
        const colorStock = product.colorStock.find(stock => stock.color === existingItem.selectedColor);

        if (!colorStock) {
            return res.status(404).json({ message: 'Color stock not found..!' });
        }


        // Check if requested quantity exceeds available stock
        if (quantity > colorStock.quantity) {
          return res.status(400).json({ message: 'Product quantity exceeds available stock.' });
        }

        // Update item quantity and total price..!
        existingItem.quantity = quantity;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;

        //Recalculate sub total..!
        cart.subTotal = cart.items.reduce((acc, item)=> acc+item.totalPrice,0);

        // save
        await cart.save()
        return res.status(200).json(cart); // return updated cart as response..!

    } catch (error) {
        console.error('An error occured while updating cart item',error);
        next(error)
        
    }
}

// CheckoutPage...!
exports.getCheckoutPage = async(req, res, next)=>{

    const userId = req.session.user.id;
    try {
       
        const [userData, address, cart] = await Promise.all([
            User.findById(userId),
            Address.find({user:userId}),
            Cart.findOne({userId}).populate('items.productId')
        ]);



       

        let errorMessage = null;
        // Check product color stock quantities

        for(item of cart.items){
            const product = await Product.findById(item.productId).select('productName colorStock');
            
            

           const selectedColorStock = product.colorStock.find(color=>color.color == item.selectedColor);

           if(selectedColorStock && selectedColorStock.quantity <=0){
              errorMessage = {
                error: true,
                
             message:`The selected color (${item.selectedColor}) for ${product.productName} is out of stock.!`
              }

              break;
           }
        }


        if (errorMessage) {
            return res.status(400).json(errorMessage)
             
        }

        res.status(200).render('user/checkout',{
            user:userData,
            userAddress:address,
            cart,
            cartItems: JSON.stringify(cart.items)
        })
    } catch (error) {
        next(error)
        
    }
}

// Checkout post handler (order confirm)
exports.orderConfirm = async (req, res, next)=>{
    const {userId, orderItems, address, paymentMethod} = req.body;
    
    

    try {
        // Address fetching...!
        const addressDetails = await Address.findById(address)

        if(!addressDetails){
            return res.status(400).json({message :'Invalid address provided..!'});
        }

        // Creating order-items and storing ID"s
        const createOrderitems = await OrderItem.insertMany(orderItems.map(item=>({
            quantity: item.quantity,
            color : item.color,
            product : item.product,
            price : item.price,
            totalPrice : item.totalPrice
        })));

        // Create Order with the created Order Items' IDs
        const createOrder = new Order ({
            userId,
            orderItems : createOrderitems.map(item=> item._id),
            shippingAddress1: addressDetails.streetAddress,
            city:addressDetails.city,
            zip: addressDetails.zip,
            country: addressDetails.country,
            phone: addressDetails.altPhone,
            orderStatus : 'Pending',
            paymentMethod,
            totalAmount: createOrderitems.reduce((total, item)=> total+item.totalPrice,0)


        })

        await createOrder.save();

        // Update product quantity..!
        for(item of orderItems){
            const product = await Product.findById(item.product);

            const selectedColorStock = product.colorStock.find(color=> color.color == item.color);


            if(selectedColorStock){
               let newQuantity = selectedColorStock.quantity - item.quantity;

              selectedColorStock.quantity = newQuantity
                if(selectedColorStock.quantity <= 0){
                    selectedColorStock.quantity = 0;
                    selectedColorStock.status = 'Out of stock';
                }
                await product.save();
            }

        }

        // delete user cart..!
        await Cart.findOneAndDelete({userId})


        res.status(201).json({
            message: 'Order placed successfully!',
            orderId: createOrder._id // Return the ID of the created order if needed
        });
    
    } catch (error) {
        next(error);
    }
};