export async function sendEmail(email: string, message: string): Promise<void> {
  console.log(`Sending email to ${email} with the following message: \n${message}.`);
}