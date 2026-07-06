const sendEmail = async (to, subject, html) => {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SkillSphere <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend Email Error:", data);
      throw new Error(data?.message || "Failed to send email");
    }

    return data;
  } catch (error) {
    console.error("Send Email Error:", error);
    throw error;
  }
};

export default sendEmail;