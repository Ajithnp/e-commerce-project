const express  = require('express')
const userRoute = express.Router()
const userController = require('../controllers/user/userController/userContoller')
const passport = require ('passport')
const storeController = require('../controllers/user/userStoreController/store-controller')
const wishlistController = require('../controllers/user/userWishlistController/wishlistController')
const cartController = require('../controllers/user/cart-controller/cartController')


// Langin-page
userRoute.route('/')
       .get(userController.getLandingPage)

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
        .get(passport.authenticate('google', { failureRedirect: '/user/signup'}),
        (req, res)=> {
                //success login
                // store user info: in session
                req.session.user = {
                       name: req.user.name,
                       id: req.user._id
                }
                console.log('data from route', req.session.user);
                             res.redirect('/')
        }
   ); 
         


      
// User Log-out        
userRoute.route('/user/logout')
        .post(userController.userLogout)     


//User -Store
userRoute.route('/user/store')
          .get(storeController.getStorePage)  
          

// Product detail page          
userRoute.route('/beats/product/productDetails/:id')   
         .get(storeController.getProductDetail)       


// Wish list ..!
userRoute.route('/beats/wishlist')
       .get(wishlistController.getWishlist)

// Cart..!
userRoute.route('/beats/cart')
         .get(cartController.getUserCart)       













// About...!
userRoute.route('/beats/about')
         .get(userController.aboutPage)    

// Contact...!
userRoute.route('/beats/contact')
       .get(userController.contactPage)
         
module.exports = userRoute