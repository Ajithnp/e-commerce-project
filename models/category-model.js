const monggose = require ('mongoose')

const categorySchema = new monggose.Schema({
    name:{
        type: String,
        required: [true, 'name is required field'],
        unique: true
    },

    description:{
        type: String,
        required: true
    },

    isListed: {
        type: Boolean,
        default: false
    },
    categoryOffer:{
        type: Number,
        default: 0
    },
    createdAt:{
        type: Date,
        default: Date.now()
    }


})

module.exports = monggose.model ('Category', categorySchema)