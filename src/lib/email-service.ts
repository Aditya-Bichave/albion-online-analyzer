
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!RESEND_API_KEY) {
    console.warn('[EmailService] RESEND_API_KEY is not set. Email notification skipped.');
    return { success: false, error: 'API key missing' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Albion Online Analyzer <notifications@aditya-bichave.github.io/albion-online-analyzer>',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = errorText;
      }
      console.error('[EmailService] Failed to send email via Resend API:', response.status, error);
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('[EmailService] Error sending email:', error);
    return { success: false, error };
  }
}
