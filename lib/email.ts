import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_4bBxEVbd_6cZUf2jT3DTPH5apHPCw9gBe");

export async function sendOwnerWarning(
  email: string,
  capsuleId: string,
  capsuleTitle: string,
  resetLink: string
): Promise<void> {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: `Dead Hand Warning: ${capsuleTitle || "Capsule"} will unlock in 2 days`,
    html: `
      <h2>Dead Hand Warning</h2>
      <p>Your capsule <strong>${capsuleTitle || "Untitled"}</strong> will auto unlock in 2 days.</p>
      <p>If you want to prevent automatic unlock, please reset the trigger date.</p>
      <p><a href="${resetLink}">Reset Trigger Date</a></p>
      <p>Capsule ID: ${capsuleId}</p>
    `,
  });
}

export async function sendRecipientNotification(
  emails: string[],
  capsuleId: string,
  capsuleTitle: string,
  downloadLink: string
): Promise<void> {
  // Send individual emails with rate limiting (2 requests per second)
  for (let i = 0; i < emails.length; i++) {
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: emails[i],
      subject: `Capsule Access: ${capsuleTitle || "Untitled"}`,
      html: `
        <h2>Capsule Access Granted</h2>
        <p>You have been granted access to a capsule: <strong>${capsuleTitle || "Untitled"}</strong></p>
        <p>The dead hand mechanism has been triggered, and you can now download the capsule contents.</p>
        <p><a href="${downloadLink}">Download Capsule</a></p>
        <p>Capsule ID: ${capsuleId}</p>
      `,
    });
  }
}
