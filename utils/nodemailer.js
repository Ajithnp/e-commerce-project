
const nodemailer = require('nodemailer')

// emailsend-function

const sendEmail = async ({ to, otp }) => {
    try{
    // create a transporter - responsible to send emeil
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NODEMAILER_EMAIL, 
            pass: process.env.NODEMAILER_PASSWORD, 
        },

    });

    // Define email-options
    const emailOPtions = {
        from: process.env.NODEMAILER_EMAIL, // Sender address
        to,
        subject: 'OTP send successfully',
        text: `This is your verification otp ${otp}`
    };

  await transporter.sendMail(emailOPtions)
  console.log(`OTP email sent successfully`);
  
}catch(error){
    console.error('Error sending email:',error)

 }
};



module.exports = sendEmail