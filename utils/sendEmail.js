

const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,     
        pass: process.env.EMAIL_PASS      
      }
    });

    const mailOptions = {
      from: `"Task Assigner" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent to', to);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

module.exports = sendEmail;

