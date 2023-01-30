import { Integration, EmailRequestActivity } from "../types";

export class MailGunIntegration implements Integration {
  client: any;

  constructor () {
    
  }

  async sendEmail(request: EmailRequestActivity) {
    try {
      return {};
    } catch (e) {
      throw e;
    }
  }
}