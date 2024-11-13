const Admin = require ('../../../models/admin-model')
const User = require ('../../../models/user-model')
const bcrypt = require ('bcrypt')


const securePassword = require ('../../../utils/hashpassword')
const { query } = require('express')

// Admin log-in handler
exports.loadLogin = async (req, res, next)=>{
    try {
        if( req.session.admin){
            return res.redirect('/admin/dashboard')
        }
        return res.status(200).render('admin/login')
    } catch (error) {
        next(error)
    }
}
exports.verifyLogin = async (req, res, next)=>{
    try {
        const { email, password} =req.body

        // Admin already exist
        const admin = await Admin.findOne({email : email})
        if( !admin ){
            return res.status(401).json({ message : "Invalid email or password"})
        }
        const passwordMatch = await bcrypt.compare(password, admin.password)
        if (!passwordMatch){
            return res.status(401).json({message: "Invalid email or password"})
        }
         // Set admin id in session
        req.session.admin = admin._id

        res.status(200).json({ message: "Login successful"})

    } catch (error) {
        next(error)
        
    }
}

// Dasboad hanler
exports.loadDashboard = async( req, res )=>{
    try {
        return res.status(200).render('admin/dashboard')
    } catch (error) {
        next(error)
        
    }
}

// Logout handler
exports.logout = async (req, res, next)=>{
    try {
        // session destroy
        req.session.destroy((err)=>{
            if (err){
                console.log('session destruction error...', err.message);;
              return  res.status(500).json({ message : "could not logout..!"})
            }
            // clear cookie
            res.clearCookie('connect.sid');
            res.status(200).json({ message: "Log out successfull..!"})
        })
       
        
    } catch (error) {
        next(error)
    }
}

