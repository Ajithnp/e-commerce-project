const User = require('../../../models/user-model')
const Order = require('../../../models/order-modal');
const Wallet = require ('../../../models/wallet-model')


exports.getWallet = async (req, res, next)=>{
    const userId = req.session.user.id;

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5; 
        const skip = (page - 1) * limit;

        // const walletCount = await Wallet.countDocuments({ userId })
        const wallet = await Wallet.findOne({userId});


        if (!wallet) {
            return res.status(404).render('user/user-wallet', {
                walletBalance: 0,
                transactions: [],
                page,
                totalPage: 0 // No pages if no wallet found
            });
        }

        const sortedTransactions = wallet.transactions.sort((a, b) => b.transactionDate - a.transactionDate);

        const walletCount =sortedTransactions.length;
        const transactions = sortedTransactions.slice(skip, skip + limit);


        res.status(200).render('user/user-wallet', {
            walletBalance: wallet.walletBalance || 0, 
            transactions:transactions || []  ,
            page,
            totalPage:Math.ceil(walletCount/limit),
            limit

        });
    } catch (error) {
        console.error('An error occured while loading the wallet page..!')
        next(error)
        
    }
}