import { Integration, EmailRequestActivity } from "../types";
import sgMail from '@sendgrid/mail';

export class SendGridIntegration implements Integration {
  client: any;

  constructor () {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY : '';
    this.client = sgMail.setApiKey(SENDGRID_API_KEY);
  }

  async sendEmail(request: EmailRequestActivity) {
    try {
      const {toEmailAddress, fromEmailAddress, body, subject = 'Temporal - Subscription Demo'} = request;
      const result = await this.client.send({
        subject,
        to: toEmailAddress,
        from: fromEmailAddress,
        text: body
      });
      return {additionalInfo: result};
    } catch (e) {
      throw e;
    }
  }
}