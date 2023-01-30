import { CancelledFailure, defineQuery, defineSignal, proxyActivities, setHandler, sleep } from '@temporalio/workflow';
import type * as activities from './email/activites';
import type { SubscribeRequest } from './types';

const { sendEmailActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 3
  }
});

export const getNumberOfEmailsSentQuery = defineQuery<number>('getNumberOfEmailsSent');
export const cancelSubscription = defineSignal('cancelSubscription');
export const DEFAULT_FREQUENCY_IN_MIN = 0.5;
export const DEFAULT_FREQUENCY_IN_MIL_SEC = DEFAULT_FREQUENCY_IN_MIN * 60000;

export async function subscription(request: SubscribeRequest): Promise<void> {
  try {
    const { email, frequency = DEFAULT_FREQUENCY_IN_MIL_SEC } = request;
    let isSubscribe = true;
    let numberOfEmailsSent = 0;

    // Build EmailRequestActivity
    const emailRequest = {
      provider: 'SendGrid',
      toEmailAddress: email,
      fromEmailAddress: ''
    };

    // Setup Handlers
    setHandler(getNumberOfEmailsSentQuery, () => numberOfEmailsSent);
    setHandler(cancelSubscription, () => void (isSubscribe = false));

    // Send a Welcome Message.
    await sendEmailActivity({subject: 'Greetings', body: 'Thank you for subscribing!', ...emailRequest});
    while (isSubscribe) {
      await sleep(frequency);
      if (isSubscribe) {
        numberOfEmailsSent++;
        await sendEmailActivity({subject: 'Frequency Email', body: `This email is number ${numberOfEmailsSent}!`, ...emailRequest});
      }
    }

    if (!isSubscribe) {
      await sendEmailActivity({subject: 'Goodbye Email', body: `We are sorry to see you go.`, ...emailRequest});
    }
  } catch (error) {
    if (!(error instanceof CancelledFailure)) {
      throw error;
    }
    console.log('Cancelled');
  }
}
