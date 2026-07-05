import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  console.log("MAIL USER:", process.env.EMAIL_USER);
  console.log("MAIL PASS EXISTS:", Boolean(process.env.EMAIL_PASS));
  console.log("MAIL PASS LENGTH:", process.env.EMAIL_PASS?.length);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS?.trim(),
    },
  });

  await transporter.sendMail({
    from: `"SkillSphere" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;