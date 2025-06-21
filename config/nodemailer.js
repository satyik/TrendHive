const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

if (!process.env.NODEMAILER_EMAIL || !process.env.NODEMAILER_PASSWORD) {
  throw new Error("Missing email credentials in environment variables");
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

const sendMail = (options) => {
  transporter.sendMail(options, (error, info) => {
    if (error) {
      console.error('Mail Error:', error.message);
    } else {
      console.log('Email sent to:', options.to);
    }
  });
};

const buildLink = (path, id, token, host, protocol) => {
  const PORT = process.env.PORT || 3000;
  return `${protocol}://${host}:${PORT}${path}/${id}?tkn=${token}`;
};

const signupMail = (user, host, protocol) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3h' });
  const link = buildLink('/user/verify', user._id, token, host, protocol);

  sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: user.email,
    subject: 'Please confirm your email',
    html: `Hello,<br>Please <a href="${link}">click here</a> to verify your email.`,
  });
};

const contactMail = (issue, type) => {
  const userHtml = `Hello, ${issue.name}.<br>
    We have received your issue: <br><strong>"${issue.message}"</strong><br>
    We are working on it and shall resolve it soon.<br><br>Thank you!`;

  const adminHtml = `New user issue received:<br>
    <p><strong>Name:</strong> ${issue.name}</p>
    <p><strong>Email:</strong> ${issue.email}</p>
    <p><strong>Subject:</strong> ${issue.subject}</p>
    <p><strong>Message:</strong> ${issue.message}</p>`;

  const response = {
    user: {
      from: process.env.NODEMAILER_EMAIL,
      to: issue.email,
      subject: `Issue: ${issue.subject}`,
      html: userHtml,
    },
    admin: {
      from: process.env.NODEMAILER_SECONDARYEMAIL || process.env.NODEMAILER_EMAIL,
      to: process.env.NODEMAILER_EMAIL,
      subject: 'New Issue Reported',
      html: adminHtml,
    },
  };

  sendMail(response[type]);
};

const joinGroupMail = (group, user) => {
  sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: user.email,
    subject: `You've joined Group: ${group.name}`,
    html: `<h3>${group.name}</h3><p>We're thrilled to have you as a member!</p><br><h4>- THE SORTED STORE</h4>`,
  });
};

const relationMail = (data, user, host, protocol) => {
  const token = jwt.sign({ id: data._id }, process.env.JWT_SECRET, { expiresIn: '3h' });
  const link = buildLink('/hospital/verifyRelation', data._id, token, host, protocol);

  sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: user.email,
    subject: 'Grant Hospital Access',
    html: `Hello,<br> Please <a href="${link}">click here</a> to grant hospital access to your records.`,
  });
};

const passwordMail = (user, token, host, protocol) => {
  const PORT = process.env.PORT || 3000;
  const link = `${protocol}://${host}:${PORT}/user/resetPassword/${user._id}/${token}`;

  sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: user.email,
    subject: 'Reset Your Password',
    html: `Hello,<br> Please <a href="${link}">click here</a> to reset your password.`,
  });
};

const nomineeMail = (ticket, nominee, user, host, protocol) => {
  const token = jwt.sign({ id: ticket._id }, process.env.JWT_SECRET, { expiresIn: '3h' });
  const link = buildLink('/hospital/verifyNominee', ticket._id, token, host, protocol);

  sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: nominee.email,
    subject: `Nominee Access Request for ${user.name}`,
    html: `Hello,<br>You are listed as a nominee by ${user.name}.<br>
           Please <a href="${link}">click here</a> to grant access.`,
  });
};

module.exports = {
  signupMail,
  contactMail,
  relationMail,
  passwordMail,
  nomineeMail,
  joinGroupMail,
};
