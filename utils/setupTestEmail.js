const nodemailer = require('nodemailer');

async function setupTestEmail() {
  const testAccount = await nodemailer.createTestAccount();

  console.log('✅ Test Email Account Created:');
  console.log(`EMAIL_USER=${testAccount.user}`);
  console.log(`EMAIL_PASS=${testAccount.pass}`);
}

setupTestEmail().catch(console.error);
