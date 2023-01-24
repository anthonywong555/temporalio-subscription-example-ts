import { proxyActivities, CancelledFailure, sleep, defineQuery, defineSignal, setHandler } from '@temporalio/workflow';
import type * as activities from './activities';
import type { SubscribeRequest } from './types';

const { sendEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
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

    // Setup Handlers
    setHandler(getNumberOfEmailsSentQuery, () => numberOfEmailsSent);
    setHandler(cancelSubscription, () => void (isSubscribe = false));

    // Send a Welcome Message.
    await sendEmail(email, 'Thank you for subscribing!');
    while (isSubscribe) {
      await sleep(frequency);
      if (isSubscribe) {
        numberOfEmailsSent++;
        await sendEmail(email, `Frequency Email: ${numberOfEmailsSent}!`);
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
