#!/usr/bin/env node

/**
 * Real-world test for Dead Hand email notification
 * Sends test email to recipients using Resend API
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '<your_resend_api_key>';
const APP_URL = 'https://thetrustcircle.vercel.app';

const recipients = [
  'teycir@gmail.com',
  'teycir@protonmail.com',
  'teycirb@hotmail.com'
];

const testCapsuleId = 'test-' + Date.now();
const capsuleTitle = 'Test Dead Hand Capsule';

async function sendTestEmail() {
  console.log('🔐 Dead Hand Email Test\n');
  console.log('Capsule ID:', testCapsuleId);
  console.log('Recipients:', recipients.join(', '));
  console.log('\nSending individual emails via Resend...\n');

  const downloadLink = `${APP_URL}/unlock?capsule=${testCapsuleId}&dead_hand=true`;
  const results = [];

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    console.log(`Sending to ${recipient}...`);
    
    // Add delay to respect rate limit (2 requests per second)
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: recipient,
        subject: `Capsule Access: ${capsuleTitle}`,
        html: `
          <h2>Capsule Access Granted</h2>
          <p>You have been granted access to a capsule: <strong>${capsuleTitle}</strong></p>
          <p>The dead hand mechanism has been triggered, and you can now download the capsule contents.</p>
          <p><a href="${downloadLink}">Download Capsule</a></p>
          <p>Capsule ID: ${testCapsuleId}</p>
          <hr>
          <p><small>This is a test email from TrustCircle Dead Hand feature.</small></p>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Failed to send to ${recipient}:`, error);
      results.push({ recipient, status: 'failed', error });
    } else {
      const result = await response.json();
      console.log(`✅ Sent to ${recipient} (ID: ${result.id})`);
      results.push({ recipient, status: 'success', id: result.id });
    }
  }

  console.log('\n📊 Summary:');
  console.log('Total recipients:', recipients.length);
  console.log('Successful:', results.filter(r => r.status === 'success').length);
  console.log('Failed:', results.filter(r => r.status === 'failed').length);
  console.log('\n📧 Check your inboxes:');
  recipients.forEach(email => console.log(`   - ${email}`));
  console.log('\n🔗 Download link:', downloadLink);
  console.log('\n📋 Details:');
  results.forEach(r => {
    if (r.status === 'success') {
      console.log(`   ✅ ${r.recipient}: ${r.id}`);
    } else {
      console.log(`   ❌ ${r.recipient}: ${r.error}`);
    }
  });
}

sendTestEmail().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
