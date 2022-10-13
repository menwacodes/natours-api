const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Create Transporter
    const transporter = nodemailer.createTransport({
        /*
            GMAIL:
            - activate less secure app in gmail
            - 500 emails per day, likely get marked as a spammer
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }

            MAIL TRAP
            - mailtrap.io
            - used free tier with menwa.codes via gmail oath
         */
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2) Define email options
    const mailOptions = {
        from: 'Menwa <menwa.codes@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // 3) Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail