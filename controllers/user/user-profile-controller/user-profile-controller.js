const User = require('../../../models/user-model')
const Address = require('../../../models/user-address')
const bcrypt = require('bcrypt')
const securePassword = require('../../../utils/hashpassword')
const userAddress = require('../../../models/user-address')



// User profile page Handler..!
exports.getUserProfile = async (req, res, next)=>{
    
    const userId = req.session.user.id;
    
    try {

        // Finding user
        const user = await User.findById(userId)

           // Check is there any address user have
       const addresess = await Address.find({user:userId})
       

        //Render profile page..!
        res.status(200).render('user/user-profile',{
            user,
            userAddress:addresess
        })
        
    } catch (error) {
        console.error('An error occured while loading user profile page', error)
        next(error)
    }
}

// User Account access (Get)
exports.getUserAccountDetails = async (req, res, next)=>{
    const userId = req.session.user.id;

    try {
        const user = await User.findById(userId)

        if(!user){
            return res.status(400).json({message: 'User not found..!'});
        }

        res.status(200).render('user/user-account',{user})
    } catch (error) {
        console.error('An error occured while loading user account page..!');
        next(error)
    }
}

// User profile edit post Handler..!
exports.userProfileEdit = async(req, res, next)=>{

    const userId = req.session.user.id;
    const {name, phone, password, newPassword}=req.body;
   
    try {
        // find user..!
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message: 'User not found..!'});
        }
       

        // Update data's..!
        if(name) user.name = name;
        if(phone) user.phone = phone;

        // Check if password needs to be updated..!
        if(newPassword){
            // Verify with current password
            const isMatch = await bcrypt.compare(password,user.password)

            if(!isMatch){
              return  res.status(400).json({message:'Password is incorrect..!'})
            }
            
            // Bcrypt new password..!
            const sPassword =  await securePassword(newPassword)

            user.password = sPassword;
        }

        // Save updations..!
        await user.save()
        res.status(200).json({message: 'Profile updated successfully..!'})
        
    } catch (error) {
        console.error('An error occured while updating user profile',error);
        next(error)
        
    }
}

// New Address add form (Get){

exports.getNewAddressForm = async (req, res, next)=>{
    const userId = req.session.user.id;

    try {

        // find user..!
        const user = await User.findById(userId)
        return res.status(200).render('user/user-address-new-address',{
            user
        })
        
    } catch (error) {
        console.error('An error occured while loading new address form')
        next(error)
        
    }
}



// User new Address add handler...!
exports.addNewAddress = async(req, res, next)=>{
    const {name,lastName,email,companyName,streetAddress,landmark,country,state,dist,city,zip,altPhone,addressType} = req.body;
   
    try {

        // Find userid
        const userId = req.session.user?.id
        console.log('user id undoooo',userId);
        
        if(!userId){
            return res.status(404).message({message:'User not found..!'})
        }

        const newAddress = new Address({
            user:userId,
            name,
            lastName,
            email,
            companyName,
            streetAddress,
            landmark,
            country,
            state,
            district:dist,
            city,
            zip,
            altPhone,
            addressType
        });
        // Save the address..!
        await newAddress.save()
        res.status(201).json({message:'New Address saved successfully..!'})
        
    } catch (error) {
        console.error('An error occured while saving new address',error)
        next(error)
        
    }
}


// User address page (Get).

exports.getAddress = async (req, res, next)=>{
    const addressId = req.params.id;
    console.log('address id', addressId);
    
    try {
        // Fetching Address..!
        const address = await Address.findById(addressId)

         if(!address){
            return res.status(400).json({message: 'Addeess not found..!'});
             
         }
            res.status(200).render('user/user-edit-address',{
            address
         })
    } catch (error) {
        console.error('An error occured while loading edit address page',error)

        next(error)
        
    }
}



// Edit User Address handler..!
exports.editAddress = async (req, res,next)=>{
    const {id}= req.params;
    const {name, lastName, companyName, streetAddress, landmark, country, state, dist, city, zip, altPhone, email, addressType}=req.body;
   console.log('Ivde aaall inddooooo', id);
   
    try {
        // fields updating..!
        const updatedAddress = await Address.findByIdAndUpdate(id, {
            name,
            lastName,
            companyName,
            streetAddress,
            landmark,
            country,
            state,
            district:dist,
            city,
            zip,
            altPhone,
            email,
            addressType
        })

        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({message: 'Address updated..!'})

        
    } catch (error) {
        console.error('An error occured while updating user address..!',error);
        next(error);
        
    }
}


// Delete user address Handler..!

exports.deleteAddress = async (req, res, next)=>{
     
    const {id} = req.params;
   
    try {
        //Delete address
        await Address.findByIdAndDelete(id)
        res.status(201).json({message:'Address deleted..!'})
        
    } catch (error) {
        console.error('An error occured while deleting address',error)
        next(error)
    
    }
}
 
// User profile address controller..!

exports.showAddress = async (req, res, next)=>{
    const userId = req.session.user.id;
    try {
        const [user, addresess] = await Promise.all([
            User.findById(userId),
            Address.find({user:userId})
        ])
        res.render('user/user-address-page',{
            user,
            userAddress:addresess
        })
    } catch (error) {
        console.error('An error occured while loading user profile page', error)
        next(error)
    }
}

// Checkout page user address edit -fetch handler!
exports.checkOutEditAddress = async (req, res, next)=>{
    const addressId = req.params.id;
    console.log('helloooo');
    
    try {
        const address = await Address.findById(addressId);

        if(!address){
            return res.status(404).json({message: 'Address not found!'})
        }

        res.status(200).json(address)
    } catch (error) {
        console.error('An error occured while fetching address!',error)
        next(error);
        
    }
}