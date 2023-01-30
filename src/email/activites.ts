import { DefaultIntegration } from "./Default/integration";
import { SendGridIntegration } from "./SendGrid/integration";
import { EmailRequestActivity, EmailResponseActivity } from "./types";

export const PROVIDER_DEFAULT = 'Default';
export const PROVIDER_SENDGRID = 'SendGrid';

export async function sendEmailActivity(request: EmailRequestActivity): Promise<EmailResponseActivity> {
  try {
    const {provider} = request;
    const client = getProvider(provider);
    const result = await client.sendEmail(request);
    return result;
  } catch (e) {
    throw e;
  }
}

function getProvider(provider:string): any {
  let client: any;
  switch(provider) {
    case PROVIDER_DEFAULT:
      client = new DefaultIntegration();
      break;
    case PROVIDER_SENDGRID:
      client = new SendGridIntegration();
      break;
    default:
      throw Error('No Provider Found');
  }

  return client;
}