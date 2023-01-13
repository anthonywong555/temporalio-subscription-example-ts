import { proxyActivities, CancelledFailure, sleep, defineQuery, setHandler} from '@temporalio/workflow';
import type * as activities from './activities';
import { Subscribe_Request } from './types';

const { sendEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export const NumberOfEmailSentQuery = defineQuery<number>('NumberOfEmailSent');

export async function subscription(request: Subscribe_Request): Promise<void> {
  try {
    const {email} = request;
    //
    let NumberOfEmailSent = 0;

    // Setup Handlers
    setHandler(NumberOfEmailSentQuery, () => NumberOfEmailSent);

    // Send a Welcome Message.
    const minutes = 0.5;
    const milliseconds = 60000;
    while (true) {
      await sleep(milliseconds * minutes);
      await sendEmail(email);
      NumberOfEmailSent++;
    }

  } catch (error) {
    if (!(error instanceof CancelledFailure)) {
      throw error;
    }
    console.log('Cancelled');
  }
}