const nodemailer = require("nodemailer");
const { EMAIL, PASS } = require("../../config");


module.exports = async function email(to, subject, text, html){ 
    try{
        console.log("begin")
        const transporter = nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: 465,
            secure: true,
            auth: {
                user: EMAIL,
                pass: PASS
            }
        });
       
    
        return await transporter.sendMail({
            from: '"Bobajanov Xumoyun", <mailrusender@mail.ru>',
            to,
            subject,
            text,
            html,
        })
        

        
    }catch(e){
        console.log("email", e)
    }
}