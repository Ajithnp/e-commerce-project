const User = require('../../../models/user-model')
const Category = require('../../../models/category-model')
const Product = require('../../../models/product-model')
const Brand =require('../../../models/brand-model')
const Cart = require('../../../models/cart-model')
const bcrypt = require('bcrypt')

const dotenv = require('dotenv').config()
const securePassword = require('../../../utils/hashpassword')
const generateOTP = require('../../../utils/generate-otp')
const sendEmail = require('../../../utils/nodemailer')


// Load landing page handler....!

exports.getLandingPage = async (req, res, next)=>{
    try {
        const user = req.session.user

        const categories = await Category.find({ isListed: false})
        const brands = await Brand.find({isBlocked :false})

        let cartCount = Cart.countDocuments();

        let productData = await Product.find(
            {isBlocked: false,
                category:{ $in:categories.map(category =>category._id)},
                brand:{ $in: brands.map(brand=>brand._id)},
                // colorStock: {$elemMatch: { quantity: { $gt: 0}}}
            }
        )
  
        // Sort product data for we want to show onlt few images in the front end landing page..
        

        if(user){
            const userData = await User.findOne({_id: user.id})
            return res.status(200).render('user/landing-page',{
                user: userData,
                products :productData,
                cartCount
            })
        }
        else{
            return res.status(200).render('user/landing-page',{
                products: productData
            })
        }
      
    } catch (error) {
        console.error(error)
        next(error)
        
    }
}



// User sign-Up handler...!
exports.userRegistration = async (req,res, next )=>{ 
    const { name, email, phone, password } = req.body
    
    try {

        // Email already exists..
        const existEmail = await User.findOne({ email:email})
        
        if(existEmail) {
            return res.status(400).json({message: 'Email already exists...!'})
        }

        // Sttore user data in session..
        let userData = {
            name,
            email,
            phone,
            password
        }

        req.session.userData = userData
       // Generate OTP and Time
       const otpExpirationT =  Date.now() +  60 * 1000;
        const otp = generateOTP();
     

        //send OTP email
        await sendEmail ({to: email, otp})

        // Store OTP in session
        req.session.otp = otp;
        req.session.otpExpiration = otpExpirationT;

        res.status(201).json({ message : 'User registered successfully! Please check your email for OTP.'})
        
        
        // After success reidtration render OTP page.
        // res.status(200).render('user/otp',{otpExpiration:req.session.otpExpiration})
        
    } catch (error) {
        console.error(error)
        next(error)
        
    }
}

// Resend OTP handler

exports.resendOtp = async (req, res, next)=>{
    try {

        if(! req.session.userData || !req.session.userData.email){
            return res.status(400).json({ message: 'User data not found..!'})
        }

        const {email} = req.session.userData;
     
        const otp = generateOTP()
        const newExpirationTime = Date.now() + 1 * 60 * 1000;
    
        

        req.session.otp = otp;
        req.session.otpExpiration = newExpirationTime;

        await sendEmail ({to: email, otp})

        res.status(200).json({ otpExpiration: newExpirationTime, message : " A new OTP has been send..!"})

        
    } catch (error) {
        console.error('Error during OTP resend..!',error)
        next(error);
        
    }
}



// OTP get handler
exports.getOtpPage = async (req, res, next)=>{
    try {
        const otpExpiration = req.session.otpExpiration || null;
       return res.status(200).render('user/otp', { otpExpiration})
        
        
    } catch (error) {
        console.error(error)
        next(error)
        
    }
}

// Verify OTP
exports.verifyOtp = async (req, res, next) =>{
    try {
        const { otp } = req.body;
      
        const storedOtp = req.session.otp?.toString();
        const otpExpiration = req.session.otpExpiration;
        
        //  Check if the OTP has expired..!
       
        if(Date.now() > otpExpiration) {
            delete req.session.otp;
            delete req.session.otpExpiration;
            return res.status(400).json({ message: "OTP expired. please request a new OTP"});
        }
        // Validate OTP
        if(otp == storedOtp) {

            const getUser = req.session.userData;

            // Hashing password
            const sPassword =  await securePassword(getUser.password)

            //  Storing User data in DB
            const user = new User({
                name: getUser.name,
                email: getUser.email,
                phone: getUser.phone,
                password: sPassword
            })

            await user.save()
            

           delete req.session.otp ;  // clear OTP from session after successfull registration
           delete req.session.otpExpiration ;
           delete req.session.userData;
    
            return res.status(200).json({ success: true ,message: "OTP verification successfull..!"})
        } else {
            return res.status(400).json( { message: "Invalid OTP. Please try again..!"})
        }
    } catch (error) {
        console.error('Error during OTP verifivation', error)
        next(error);
        
    }
}

// Log-in page handler
exports.loadLogin = async (req, res, next)=>{
    try {
        return res.status(200).render('user/login-page')
    } catch (error) {
        console.error(error)
        next(error)
        
    }
 
}

// Verify log-in handler..!
exports.verifyLogin = async (req,res, next )=>{

    const { email, password }= req.body;
    try {
        // User exists
        const user = await User.findOne({ email })
        if(! user ){
            return res.status(401).json({message : 'User not found..!'})
        }
        if(user.isBlocked){
            return res.status(401).json({message: 'Sorry.. You Cannot Enter..!'})
        }

        // Password match..
        const passwordMatch = await bcrypt.compare(password, user.password)
        if(!passwordMatch){
            return res.status(401).json({message: 'Password do not match..!'})
        }
        
        // Create session for user..!
        req.session.user = { 
            id: user._id,
            name: user.name
        }
        res.status(200).json({ message: 'Login successfull..!'})
    } catch (error) {
        console.error(error)
        next(error)
        
    }
}

// User logout.. Handler
exports.userLogout = async(req, res, next )=>{
    
    try {
        req.session.destroy((err)=>{
            
            if (err) {
                
                return res.status(500).json({ message :" Could not logout..!"})
                
            }

            // Clear the admin session cookie
            res.clearCookie('user.sid');
            res.status(200).json({ message: "Logout successfull..!"})
        })
       
 
    } catch (error) {
        console.error('Error while user logout', error)
        next(error)
        
    }
}


// About page Handler..!
exports.aboutPage = async(req, res, next)=>{

    try {
        return res.status(200).render('user/about')
    } catch (error) {
        console.error('Error occured while loading about page..!', error)
        next(error)
        
    }
}

// Contact page Handler...!
exports.contactPage = async(req, res, next)=>{

    try {
        return res.status(200).render('user/contact')
    } catch (error) {
        console.error('Error occured while loading contact page..!', error);
        next(error)
        
    }
}

// User forgot Password..!
exports.forgotPassword = async(req, res, next)=>{
    try {
       res.status(200).render('user/forgot-password-email') 
    } catch (error) {
        console.error('An error occured while loading forgot email page',error);
        next(error)   
    }
}

// User forgot Password email verify..!
exports.verifyEmail = async (req, res, next)=>{
    const {email} = req.body;
  
    try {
        // Check the email address already have ?
        const existEmail = await User.findOne({email:email});
       
        if(!existEmail){
            return res.status(500).json({message:'User email not registered..!'})
        }

        //
        const otp = generateOTP();
        const expiryTime = Date.now()+ 60 * 1000;


         // Send OTP corresponding email!
         await sendEmail({to: email, otp})

         req.session.otp = otp;
         req.session.otpExpiration = expiryTime;
         req.session.email = email;
       
         res.status(200).json({ message: 'Email verified successfully!'})

    } catch (error) {
        console.error('An error occured while verifying email',error)
        next(error)
        
    }

}

//Forgot Password resend OTP handler..!
exports.forgotResendOtp = async (req, res, next)=>{
    const {email} = req.body;

    try {

        if(!email){
            return res.status(500).json({message:'An error occured'})
        }
        const otp = generateOTP();
        const expiryTime = Date.now() + 1 *60 * 1000;
    

        await sendEmail({to: email, otp})

        req.session.otp = otp;
     

        req.session.otpExpiration = expiryTime;

        res.status(200).json({otp,otpExpiration:expiryTime, message: "A new OTP has been send..!"})
        
    } catch (error) {
        console.error('An error occured while sending resend OTP')
        next(error)
        
    }
}


// User forgot password OTP Handler..!
exports.forgotVerifyOtpPage = async(req, res, next)=>{
       
    try {

        res.status(200).render('user/forgot-otp')
    } catch (error) {
        console.error('An error occured while loading otp page',error)
        next(error)
    }
}


// forgot password otp verify Handler..!
exports.forgotPasswordOtpVerify = async(req, res, next)=>{
    const {otp}= req.body;

    try{
    const storedOtp = req.session.otp?.toString();
  
    
    const otpExpiration = req.session.otpExpiration || null;

    //  Check if the OTP has expired..!
    
        if (Date.now() > otpExpiration){
            delete req.session.otp;
            delete req.session.otpExpiration;
            return res.status(400).json({message: 'OTP expired'})

        }
        if(storedOtp == otp ){
            delete req.session.otp ;  // clear OTP from session after successfull registration
            delete req.session.otpExpiration ;
          return res.status(200).json({
            message: 'Email verifird',
             redirectUrl:'/beats/user/forgotPassword/newPassword'
        })
        }else{
          return res.status(400).json({message:'Invalid OTP..!'})
            
        }

    }catch(error){
        console.error('An error occured while verifying otp',error)
        next(error)
    }
}

// New reset password get..!

exports.newResetPassword = async (req, res, next)=>{
    try {
        res.status(200).render('user/reset-newPassword')
    } catch (error) {
        
    }
} 

// Reset Password password verification handler..!
exports.confirmResetPassword = async(req, res, next)=>{
    const email = req.session.email;
    const {newPassword} = req.body;
  
    
   try{

    // Finding user details with email
    const user = await User.findOne({email})
  
    if(!user){
        return res.status(404).json({message:'User not found..! try again'});

    }

    // Bycript new password..!
    const resetPassword = await securePassword(newPassword)
    user.password=resetPassword;

    await user.save()

    delete req.session.email;

    return res.status(200).json({
        message: 'Operation success..!',
         redirectUrl:'/user/login'
    })
     
    
   }catch(error){
    console.error('An error occured..!',error)
    next(error)
   }
}