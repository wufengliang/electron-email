import nodemailer from 'nodemailer';

/**
 * @description 根据当前的邮箱账号密码进行发送
 */
export default function sendEmail(account, password, revicers, subject) {
    const smtpTransport = nodemailer.createTransport({
        service: 'qq',
        auth: {
            user: account,
            pass: password,
        },
    });
    return new Promise((resolve, reject) => {
        smtpTransport.sendMail({
            from: account,
            to: revicers,
            subject,
        }, (err, response) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        });
    });
}
