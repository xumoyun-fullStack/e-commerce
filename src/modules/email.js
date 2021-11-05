const nodemailer = require("nodemailer");
const { EMAIL, PASS } = require("../../config");


module.exports = async function email(to, subject, text, html){ 
    const transport = await nodemailer.createTransport({
        host: "smpt.yandex.ru",
        port: 465,
        secure: true,
        auth: {
            user: EMAIL,
            pass: PASS
        }
    });

    return awaittransport.sendmail({
        from: '"Bobajanov Xumoyun", <xumoyunbobajanov@yandex.com>',
        to,
        subject,
        text,
        html,
    })
}