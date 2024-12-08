const User = require('../../../models/user-model')
const Order = require('../../../models/order-modal');
const Wallet = require ('../../../models/wallet-model')


exports.getWallet = async (req, res, next)=>{
    const userId = req.session.user.id;

    try {
        res.status(200).render('user/user-wallet')
    } catch (error) {
        console.error('An error occured while loading the wallet page..!')
        next(error)
        
    }
}