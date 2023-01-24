import { Worker } from '@temporalio/worker';
import 'dotenv/config';
import * as activities from './activities';
import { TemporalSingleton } from './temporal';

async function run() {
  const isMTLS = process.env.MTLS === 'true';
  const namespace = isMTLS ? process.env.TEMPORAL_NAMESPACE : 'default';

  const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'subscription';
  const connection = await TemporalSingleton.getNativeConnection();

  const worker = await Worker.create({
    connection,
    namespace,
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue,
  });
  console.log('Worker connection successfully established');

  await worker.run();
  await connection.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
