const User = require('../../../models/user-model')
const Order = require('../../../models/order-modal');
const Wallet = require ('../../../models/wallet-model')


exports.getWallet = async (req, res, next)=>{
    const userId = req.session.user.id;

    try {
        // Find the wallet for the user!
        const wallet = await Wallet.findOne({userId})


        res.status(200).render('user/user-wallet', {
            walletBalance: wallet.walletBalance || 0, 
            transactions: wallet.transactions || []  
        });
    } catch (error) {
        console.error('An error occured while loading the wallet page..!')
        next(error)
        
    }
}