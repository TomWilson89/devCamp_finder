import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

interface IOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: IOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  } as SMTPTransport.Options);

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);
};

export default sendEmail;
