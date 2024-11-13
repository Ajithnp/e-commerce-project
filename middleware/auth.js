const Admin = require('../models/admin-model')
const User = require ('../models/user-model')


const adminAuth = async (req, res, next)=>{
    try {
        if (! req.session.admin ){
            return res.redirect('/admin/login')
        }
        // Find admin by id 
        const admin = await Admin.findById(req.session.admin.id)
        if (req.session.admin){
            return next()
        }else{
            return res.redirect('/admin/login')
        }
        
    } catch (error) {
        next(error)
        
    }
}

const requestData = (req, res, next)=>{
    console.log('requested data', req.body)
    next()
}

module.exports = {adminAuth,
    requestData

}

