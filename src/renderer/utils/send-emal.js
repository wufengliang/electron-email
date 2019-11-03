import nodemailer from 'nodemailer';
import enmu from '../config/enmu';

/**
 * @description 根据当前的邮箱账号密码进行发送
 */
export default async function sendEmail({
    account, password, revicers, subject, html, text,
}) {
    const host = /@(([0-9a-z])+)\./.exec(account)[1];
    const smtpTransport = nodemailer.createTransport({
        host: enmu[host],
        auth: {
            user: account,
            pass: password,
        },
    });
    const data = await smtpTransport.sendMail({
        from: account,
        to: revicers,
        subject,
        html,
        text,
    });
    return data;
}
