import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from './activities';
import { Example_Request, Example_Response, Subscribe_Request, Subscribe_Response, Unsubscribe_Request, Unsubscribe_Response} from './types';

const { echo } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

/** A workflow that simply calls an activity */
export async function example(request: Example_Request): Promise<Example_Response> {
  try {
    const {message} = request;
    const result = await echo(message);
    return {message: result};
  } catch (e) {
    throw e;
  }
}

export async function subscription(request: Subscribe_Request): Promise<Subscribe_Response> {
  try {
    let isSubscribe = true;
    
    while(isSubscribe) {
      sleep('1 minute');
      console.log('Hit!');
    }
    
    sleep('1 minute');
    console.log('1 minute sleep!');

    const {email} = request;
    const result = await echo(email);
    return {status: result};
  } catch (e) {
    throw e;
  }
}