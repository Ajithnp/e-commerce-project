const User = require('../../../models/user-model')
const Order = require('../../../models/order-modal');
const Wallet = require ('../../../models/wallet-model')


exports.getWallet = async (req, res, next)=>{
    const userId = req.session.user.id;

    try {

        // const page = req.query.page*1 || 1;
        // const limit = req.query.limit*1 || 4
        // const skip = (page -1) * limit

        // const walletCount = await Wallet.countDocuments()
        // const wallet = await Wallet.findOne({userId}).skip(skip).limit(limit).exec()

        // Find the wallet for the user!
        // const wallet = await Wallet.findOne({userId})


        res.status(200).render('user/user-wallet', {
            walletBalance: wallet.walletBalance || 0, 
            transactions: wallet.transactions || []  ,
            page,
            totalPage:Math.ceil(walletCount)

        });
    } catch (error) {
        console.error('An error occured while loading the wallet page..!')
        next(error)
        
    }
}