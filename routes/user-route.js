const express  = require('express')
const userRoute = express.Router()
const dotenv = require('dotenv').config()
const Razorpay = require('razorpay')
const crypto = require('crypto')
const userController = require('../controllers/user/userController/userContoller')
const passport = require ('passport')
const storeController = require('../controllers/user/userStoreController/store-controller')
const wishlistController = require('../controllers/user/userWishlistController/wishlistController')
const cartController = require('../controllers/user/cart-controller/cartController')
const userProfileController = require('../controllers/user/user-profile-controller/user-profile-controller')
const userOrderController = require('../controllers/user/user-order-controller/user-order-controller')
const walletController = require('../controllers/user/user-wallet-controller/wallet-controller')
const couponController = require('../controllers/user/coupon-contoller/coupon-controller')
const productReturnController = require('../controllers/user/product-return-controller/orderItemReturnController')
const invoiceDownloadController = require('../controllers/user/invoice-download/invoiceDownloadController')
const Order = require('../models/order-modal')

const nocache = require('../middleware/cache-middleware')

const generate = require('../utils/receiptIdGenerator')

const checkCartNotEmpty = require('../middleware/checkCart-empty');

const auth = require('../middleware/auth')


// Langin-page
userRoute.route('/')
       .get(nocache,userController.getLandingPage)

// Log-in
userRoute.route('/user/login')
       .get(userController.loadLogin) 
       .post(userController.verifyLogin)


// Sign-up
userRoute.route('/user/signup')
         .post(userController.userRegistration)         


//OTP
userRoute.route('/user/otp')
          .get(userController.getOtpPage)
          .post(userController.verifyOtp)

userRoute.route('/user/resendOtp')
         .post(userController.resendOtp)  


// User google sign route
userRoute.route('/auth/google')
         .get(passport.authenticate('google',{scope:['profile', 'email']}));
  // Sign success snd failure response
  
 userRoute.route('/auth/google/callback')
        .get(passport.authenticate('google', { failureRedirect: '/user/login'}),
        (req, res)=> {
              // if(req.user && req.user.message) {
              //        return res.status(400).json({code:'EMAIL_ALREADY_REGISTERED', message: 'Email already registered. please use your password to log in.'})
              // }
                //success login
                // store user info: in session
                req.session.user = {
                       name: req.user.name,
                       id: req.user._id
                }
                             res.redirect('/')
        }
   ); 
         


      
// User Log-out        
userRoute.route('/user/logout')
        .post(userController.userLogout)     


//User -Store
userRoute.route('/user/store')
          .get(storeController.getStorePage)  

// Product Search..!
// userRoute.route('/beats/productSearch/:name') 
//          .get(storeController.productSearch)         

          

// Product detail page          
userRoute.route('/beats/product/productDetails/:id')   
         .get(storeController.getProductDetail)       


// Cart..!
userRoute.route('/beats/cart')
         .get(auth.userAuth,cartController.getUserCart)

// Add to cart..!
userRoute.route('/beats/user/cart/add')
         .post(cartController.addToCart) 
         
// Remove item from cart..!
userRoute.route('/beats/user/cart/remove/:id')
         .delete(auth.userAuth,cartController.removeCartItem)         

// Cart Quantity updation..!
userRoute.route('/beats/user/cart/update/:id')
         .patch(cartController.cartQuantityUpdate)


// User checkout..!

userRoute.route('/beats/user/checkout')
         .get(auth.userAuth,checkCartNotEmpty,cartController.getCheckoutPage)
         .post(cartController.orderConfirm)

// Checkout user address edit- fetch!
userRoute.route('/beats/user/getAddress/:id')
          .get(userProfileController.checkOutEditAddress)         

// Order success page..!
userRoute.route('/beats/orderSuccess')
         .get(cartController.orderSuccessPage)

         
// User Profile..!
userRoute.route('/beats/userProfile')
       .get(auth.userAuth,userProfileController.getUserProfile)

// User account details ..!
userRoute.route('/beats/user/accountDetails')
         .get(auth.userAuth,userProfileController.getUserAccountDetails) 
         .put(userProfileController.userProfileEdit)      

     
// User Address Add new Adress..!
userRoute.route('/beats/user/addAddress')
         .get(auth.userAuth,userProfileController.getNewAddressForm)
         .post(userProfileController.addNewAddress)

         
// User address  edit ..!

userRoute.route('/beats/user/editAddress/:id')
          .get(auth.userAuth,userProfileController.getAddress)
          .put(userProfileController.editAddress)



// User address delete..!
userRoute.route('/beats/user/deleteAddress/:id')
         .delete(auth.userAuth,userProfileController.deleteAddress)


// User address get page 
userRoute.route('/beats/user/showAddress')
         .get(auth.userAuth,userProfileController.showAddress)


// ORDERS-----!

userRoute.route('/beats/user/orders')
         .get(auth.userAuth,userOrderController.getOrders)

// Get order details..!
userRoute.route('/beats/user/orderDetails/:id') 
          .get(auth.userAuth,userOrderController.getOrderDetails) 
          
// Order cancel..!
userRoute.route('/beats/user/cancelOrder/:id')
         .patch(userOrderController.orderCancel) 
         
//-------------Product Return routes--------//
userRoute.route('/order/product/return')
         .post(auth.userAuth,productReturnController.itemReturnRequest)            
         
         
         // Wishlist
// Add
userRoute.route('/beats/user/wishlist/add')
         .post(auth.userAuth,wishlistController.addWishlist)  
//Get
userRoute.route('/beats/wishlist')
       .get(auth.userAuth, wishlistController.getWishlist)      
//Remove
userRoute.route('/beats/user/wishlist/remove/:id')
         .delete(auth.userAuth,wishlistController.removeItemFromWishlist)

         // Wallet..!
userRoute.route('/beats/user/wallet')
         .get(auth.userAuth,walletController.getWallet)  
         
         //Coupon..!
//Apply
userRoute.route('/coupons/apply')
          .post(auth.userAuth,couponController.couponApply) 
          
//Remove
userRoute.route('/coupons/remove')
         .post(auth.userAuth,couponController.removeCoupon)        

//------------------------------------------//
      

// About...!
userRoute.route('/beats/about')
         .get(userController.aboutPage)    

// Contact...!
userRoute.route('/beats/contact')
       .get(userController.contactPage)


// User forgot Password Handler..!
userRoute.route('/beats/user/forgotPassword')
         .get(userController.forgotPassword)
         .post(userController.verifyEmail) 

         // User forgot Password OTP ..!  
// resend OTP  
userRoute.route('/beats/user/forgotPassword/resendOtp')
         .post(userController.forgotResendOtp)        

// forgot password OTP page       
userRoute.route('/beats/user/forgotPassword/otpVerify')
         .get(userController.forgotVerifyOtpPage) 
         .post(userController.forgotPasswordOtpVerify)
         
userRoute.route('/beats/user/forgotPassword/newPassword')
          .get(userController.newResetPassword) 
          .post(userController.confirmResetPassword)        




// Razor pay ..!

 
userRoute.post('/order', async (req, res) => {
       console.log('helloo razorpay',);
      
       
       // initializing razorpay
       const razorpay = new Razorpay({
           key_id: process.env.RAZOR_PAY_ID,
           key_secret: process.env.RAZOR_PAY_SECRET_KEY,
       });

       if (!req.body.amount || !req.body.currency) {
              return res.status(400).json({ error: 'Invalid request. Amount and currency are required.' });
          }
   
       // setting up options for razorpay order.
       const options = {
           amount: req.body.amount,
           currency: req.body.currency,
           receipt: generate(),
           payment_capture: 1
       };

       
       try {
           const response = await razorpay.orders.create(options)
           
           
           res.json({
               order_id: response.id,
               currency: response.currency,
               amount: response.amount,
           })
       } catch (err) {
          res.status(400).send('Not able to create order. Please try again!');
       }
   });

// razor pay failed payment!
userRoute.post('/retry/payment',async (req, res)=>{
       console.log('helooo1');
       
       const {pendingOrderId} = req.body;
       console.log('hello2',pendingOrderId, req.body);
       

       try {
              
              
              const pendingOrder = await Order.findById(pendingOrderId).populate('orderItems');
              console.log('order fetched', pendingOrder);
              

              if (!pendingOrder || pendingOrder.orderStatus !== 'Failed') {
                     return res.status(400).json({ error: 'Order not found or not eligible for retry.' });
                 }
                 console.log('log3');
                 

                  // Recreate Razorpay order
                  const razorpay = new Razorpay({
                     key_id: process.env.RAZOR_PAY_ID,
                     key_secret: process.env.RAZOR_PAY_SECRET_KEY,
                 });

          console.log('log4');
          

          const options = {
              amount: pendingOrder.totalAmount * 100, // Amount in paise
              currency: 'INR',
              receipt: pendingOrder._id.toString()
          };
          console.log('log5');
          

          const razorpayOrder = await razorpay.orders.create(options);
         console.log('log6');
         
          // Update the order with new Razorpay order ID
          pendingOrder.razorpayOrderId = razorpayOrder.id;
          await pendingOrder.save();
          console.log('log7');
          

          return res.status(200).json({
              status: 'ok',
              razorpayOrderId: razorpayOrder.id,
              key: process.env.RAZORPAY_KEY_ID,
              amount: options.amount,
              currency: options.currency,
              orderId: pendingOrder._id
          });

       } catch (error) {
              res.status(400).send('Not able to create order. Please try again!');
              
       }
})   
   
userRoute.post('/paymentCapture',cartController.razorPayOrderSave)

// failed order..!
userRoute.post('/save/failedOrder', cartController.razorPayfailedOrderSave)
   
// Invoice download.
userRoute.route('/order/invoice/download/:orderId')
         .get(auth.userAuth,invoiceDownloadController.downloadInvoice)


// Authetication check route.
userRoute.route('/api/user/check-auth')
         .get(auth.isAuthenticated)          
         
module.exports = userRoute