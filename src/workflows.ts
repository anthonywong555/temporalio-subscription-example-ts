import { proxyActivities, CancelledFailure, sleep, defineQuery, defineSignal, setHandler } from '@temporalio/workflow';
import type * as activities from './activities';
import { Subscribe_Request } from './types';

const { sendEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export const NumberOfEmailSentQuery = defineQuery<number>('NumberOfEmailSent');
export const cancelSubscription = defineSignal('cancelSubscription');
export const DEFAULT_FREQUENCY_IN_MIN = 0.5;
export const DEFAULT_FREQUENCY_IN_MIL_SEC = DEFAULT_FREQUENCY_IN_MIN * 60000;

export async function subscription(request: Subscribe_Request): Promise<void> {
  try {
    const { email, frequency = DEFAULT_FREQUENCY_IN_MIL_SEC } = request;
    let isSubscribe = true;
    let NumberOfEmailSent = 0;

    // Setup Handlers
    setHandler(NumberOfEmailSentQuery, () => NumberOfEmailSent);
    setHandler(cancelSubscription, () => void (isSubscribe = false));

    // Send a Welcome Message.
    await sendEmail(email, 'Thank you for subscribing!');
    while (isSubscribe) {
      await sleep(frequency);
      if (isSubscribe) {
        NumberOfEmailSent++;
        await sendEmail(email, `Frequency Email: ${NumberOfEmailSent}!`);
      }
    }

    if (!isSubscribe) {
      await sendEmail(email, 'We are sorry to see you go.');
    }
  } catch (error) {
    if (!(error instanceof CancelledFailure)) {
      throw error;
    }
    console.log('Cancelled');
  }
}
