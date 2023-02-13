const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
// import { htmlToText } from "html-to-text";
const nodemailerSendgrid = require("nodemailer-sendgrid");
const Transport = require("nodemailer-sendinblue-transport");

// new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Martin Beňa <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Sendgrid
      // return nodemailer.createTransport({
      //   service: "SendGrid",
      //   auth: {
      //     user: process.env.SENDGRID_USERNAME,
      //     pass: process.env.SENDGRID_PASSWORD,
      //   },
      // });
      // return nodemailer.createTransport(
      //   nodemailerSendgrid({
      //     apiKey: process.env.SENDGRID_PASSWORD,
      //   })
      // );

      // SendinBlue
      return nodemailer.createTransport(
        new Transport({
          apiKey: process.env.SENDINBLUE_APIKEY,
        })
      );
    }

    return nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      logger: true,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    // 2) Define template options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
      // text: htmlToText(html), nevím, jak udělat import, používám starou verzi html-to-text
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset toen (valid for only 10 minutes)"
    );
  }
};

// const sendEmail = async options => {
// 1) Create a transporter
// const transporter = nodemailer.createTransport({
//   host: "smtp.mailtrap.io",
//   port: 2525,
//   logger: true,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// Activate in gmail "less secure app" option
// });
// 2) Define the email options
// const mailOptions = {
//   from: "Martin Beňa <bena.m@seznam.cz>",
//   to: options.email,
//   subject: options.subject,
//   text: options.message,
//   // html:
// };
// 3) Actually send the email
// await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
