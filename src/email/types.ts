export interface Integration {
  sendEmail: sendEmail
}

/**
 * This method allows you to send email.
 */
export type sendEmail = (request: EmailRequestActivity) => Promise<EmailResponseActivity>;

export interface EmailRequestActivity {
  provider: string;
  toEmailAddress: string;
  fromEmailAddress: string;
  body: string;
  subject?: string;
}

export interface EmailResponseActivity {
  id?: string;
  additionalInfo?: any;
  errorMessage?: string;
}