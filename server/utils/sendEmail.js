const sendEmail = async (to, subject, html) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "SkillSphere",
          email: process.env.EMAIL_FROM,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo API Error:", data);
      throw new Error(data?.message || "Failed to send email");
    }

    console.log("Email sent successfully to:", to);
    return data;
  } catch (error) {
    console.error("Send Email Error:", error);
    throw error;
  }
};

export default sendEmail;