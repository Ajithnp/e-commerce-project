const express  = require('express')
const userRoute = express.Router()
const userController = require('../controllers/user/userController/userContoller')
const passport = require ('passport')
const storeController = require('../controllers/user/userStoreController/store-controller')
const wishlistController = require('../controllers/user/userWishlistController/wishlistController')
const cartController = require('../controllers/user/cart-controller/cartController')
const userProfileController = require('../controllers/user/user-profile-controller/user-profile-controller')
const userOrderController = require('../controllers/user/user-order-controller/user-order-controller')


const auth = require('../middleware/auth')


// Langin-page
userRoute.route('/')
       .get(auth.userAuth,userController.getLandingPage)

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
          .get(auth.userAuth,storeController.getStorePage)  

// Product Search..!
// userRoute.route('/beats/productSearch/:name') 
//          .get(storeController.productSearch)         

          

// Product detail page          
userRoute.route('/beats/product/productDetails/:id')   
         .get(auth.userAuth,storeController.getProductDetail)       


// Wish list ..!
userRoute.route('/beats/wishlist')
       .get(auth.userAuth, wishlistController.getWishlist)

// Cart..!
userRoute.route('/beats/cart')
         .get(auth.userAuth,cartController.getUserCart)

// Add to cart..!
userRoute.route('/beats/user/cart/add')
         .post(cartController.addToCart) 
         
// Remove item from cart..!
userRoute.route('/beats/user/cart/remove/:id')
         .delete(cartController.removeCartItem)         

// Cart Quantity updation..!
userRoute.route('/beats/user/cart/update/:id')
         .patch(cartController.cartQuantityUpdate)


// User checkout..!

userRoute.route('/beats/user/checkout')
         .get(cartController.getCheckoutPage)
         .post(cartController.orderConfirm)


         
// User Profile..!
userRoute.route('/beats/userProfile')
       .get(userProfileController.getUserProfile)

// User account details ..!
userRoute.route('/beats/user/accountDetails')
         .get(userProfileController.getUserAccountDetails) 
         .put(userProfileController.userProfileEdit)      

     
// User Address Add new Adress..!
userRoute.route('/beats/user/addAddress')
         .get(userProfileController.getNewAddressForm)
         .post(userProfileController.addNewAddress)


// User address  edit ..!

userRoute.route('/beats/user/editAddress/:id')
          .get(userProfileController.getAddress)
          .put(userProfileController.editAddress)



// User address delete..!
userRoute.route('/beats/user/deleteAddress/:id')
         .delete(userProfileController.deleteAddress)


// User address get page 
userRoute.route('/beats/user/showAddress')
         .get(userProfileController.showAddress)


// ORDERS-----!

userRoute.route('/beats/user/orders')
         .get(userOrderController.getOrders)

// Get order details..!
userRoute.route('/beats/user/orderDetails/:id') 
          .get(userOrderController.getOrderDetails) 
          
// Order cancel..!
userRoute.route('/beats/user/cancelOrder/:id')
         .patch(userOrderController.orderCancel)          



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
         
module.exports = userRoute