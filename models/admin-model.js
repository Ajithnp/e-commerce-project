const { default: mongoose } = require('mongoose')
const monggose = require('mongoose')

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true,'email is required field!'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'password is required feild!']
    }


})

module.exports = monggose.model ('Admin', adminSchema)