/**
 * Imports
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as EmailValidator from 'email-validator';
import { v4 as uuidv4 } from 'uuid';
import { subscription, cancelSubscription, getNumberOfEmailsSentQuery } from './workflows';
import { TemporalSingleton } from './temporal';

/**
 * Clients
 */
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.PORT ? process.env.PORT : '3000';
const emailToUUID: Record<string, string> = {};

/**
 * Express Functions
 */

app.post('/subscribe', async (request, response) => {
  try {
    const { body } = request;
    const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'subscription';
    const client = await TemporalSingleton.getWorkflowClient();
    const email: string = body.email;

    if (!EmailValidator.validate(email)) {
      response.send({ status: 'Error! Invalid email' });
    } else if (emailToUUID[email]) {
      response.send({ status: 'Error! You are already subscribed' });
    } else {
      const uuid = uuidv4();
      emailToUUID[email] = uuid;
      body.uuid = uuid;
      response.send(body);
      await client.start(subscription, {
        taskQueue,
        workflowId: uuid,
        args: [body],
      });
    }
  } catch (e) {
    console.error(e);
    response.send(e);
  }
});

app.delete('/unsubscribe', async (request, response) => {
  try {
    const { email } = request.body;

    if (!emailToUUID[email]) {
      throw new Error('Error: Not a valid email.');
    }

    const uuid = emailToUUID[email];

    const client = await TemporalSingleton.getWorkflowClient();
    const handle = client.getHandle(uuid);

    // Cancel the workflow
    await handle.signal(cancelSubscription);

    // Send a Message back
    response.send({ status: 'OK' });
  } catch (e) {
    console.error(e);
    response.send(e);
  }
});

app.get('/detail', async (request, response) => {
  try {
    const { email } = request.query;

    if (!emailToUUID[email]) {
      throw new Error('Error: Not a valid email.');
    }

    const uuid = emailToUUID[email];

    const client = await TemporalSingleton.getWorkflowClient();
    const handle = client.getHandle(uuid);

    // Query the Data
    const numberOfEmailsSent = await handle.query(getNumberOfEmailsSentQuery);

    // Reporting the data back
    response.send({ numberOfEmailsSent });
  } catch (e) {
    console.error(e);
    response.send(e);
  }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}.\nNode Environment is on ${process.env.NODE_ENV} mode.`));
