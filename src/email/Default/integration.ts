import { Integration, EmailRequestActivity } from "../types";

export class DefaultIntegration implements Integration {

  async sendEmail(request: EmailRequestActivity) {
    try {
      const {toEmailAddress, fromEmailAddress, body, subject = 'Temporal - Subscription Demo'} = request;
      console.log(body);

      return {additionalInfo: {body}};
    } catch (e) {
      throw e;
    }
  }
}