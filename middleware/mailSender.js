const smtpTransport = require('nodemailer-smtp-transport')
const nodemailer = require('nodemailer')

exports.emailCredentaials = (to, data) => {

    var transporter = nodemailer.createTransport(smtpTransport({
        name: 'hostgator',
        host: 'gator3264.hostgator.com',
        port: 465,
        secure: true,
        auth: {
            user: 'no-reply@sefryek.com',
            pass: 'no-reply1423!$@#'
        }
    }));

    var mailOptions = {
        from: 'TradersPlus <no-reply@sefryek.com>',
        to: to,
        subject: 'آلارم انجام شد',
        html: '<h3 dir="rtl">تریدرزپلاس' + '</h3>' + '<p dir="rtl">' + data.name + '</p>' + '<b>' + '<p dir="rtl">' + data.message + '</p>' + '</b>'
    };


    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("*********" + error);
        } else {
            console.log('********* Email sent: ' + info.response);
        }
    });
}

exports.emailCredentaialsForWeb = async (to, data) => {
    console.log(to ,data);
    var transporter = nodemailer.createTransport(smtpTransport({
       
        host: 'mail.traderzplus.ir',
        port: 465,
        secure: true,
        auth: {
            user: "forgetpassword@traderzplus.ir",
            pass: "UkCk4)(2kcuy"
        },
        tls:{
            rejectUnauthorized:false,
        }
    }));
    
    var mailOptions = {
        from: "forgetpassword@traderzplus.ir",
        to,
        subject: 'تغییر رمز عبور تریدرزپلاس',
        html: '<h3 dir="rtl">تریدرزپلاس' + '</h3>' + '<p dir="rtl">' + data.name + '</p>' + '<b>' + '<p dir="rtl">' + data.message + '</p>' + '</b>' + '<b>' + `<a dir="rtl" href=${data.link}>  تغییر رمز عبور   </a>` + '</b>'
    };


    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("*********" + error);
        } else {
            console.log('********* Email sent: ' + info.response);
        }
    });
}
 
