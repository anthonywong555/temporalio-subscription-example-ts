/**
 * Imports
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { subscription } from './workflows';
import { Subscribe_Request } from "./types";
import { TemporalSingleton } from './temporal';

/**
 * Clients
 */
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.PORT ? process.env.PORT : '3000';

const subscribePostHandler = async(payload: Subscribe_Request) => {
  try {
    const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'hello-world-mtls';
    const client = await TemporalSingleton.getWorkflowClient();
    const { email } = payload;
    const result = await client.execute(subscription, {
      taskQueue,
      workflowId: email,
      args: [payload],
    });
    return result;
  } catch (e) {
    throw e;
  }
}

/**
 * Express Functions
 */

app.post('/subscribe', async(request: any, response: any) => {
  try {
    const { body } = request;
    response.send({'status': 'OK'});
    await subscribePostHandler(body);
  } catch(e) {
    console.error(e);
    //response.send(e);
  }
});

app.delete('/unsubscribe', async (request: any, response: any) => {
  try {
    const { email } = request.body;
    const client = await TemporalSingleton.getWorkflowClient();
    const handle = client.getHandle(email);

    // Cancel the workflow
    await handle.cancel();

    // Send a Message back
    response.send({'status': 'OK'});
  } catch (e) {
    console.error(e);
    response.send(e);
  }
});

app.get('/detail', async (request: any, response: any) => {
  try {
    const { email } = request.query;
    const client = await TemporalSingleton.getWorkflowClient();
    const handle = client.getHandle(email);

    // Query the Data
    const NumberOfEmailSent = await handle.query('NumberOfEmailSent');

    // Reporting the data back
    response.send({NumberOfEmailSent});
  } catch (e) {
    console.error(e);
    response.send(e);
  }
})

app.listen(PORT, () => console.log(`Listening on ${PORT}.\nNode Environment is on ${process.env.NODE_ENV} mode.`));