import { App, ExpressReceiver, LogLevel } from '@slack/bolt';
import serverless from 'serverless-http';
import { installationStore, authorizeFn, installExpressReceiver } from 'src/lib/slack';


// Initialize the Slack Bolt ExpressReceiver
const receiver = installExpressReceiver
/*const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateVerification: false,
  scopes: ['chat:write', 'channels:history', 'commands', 'channels:read'],
  installationStore,
  processBeforeResponse: true,
})*/

// Create a Slack Bolt app
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  //authorize: authorizeFn,
  receiver,
  logLevel: LogLevel.DEBUG
});

app.shortcut('log_decision', async ({ shortcut, ack, client, logger }) => {
  try {
    // Acknowledge shortcut request
    await ack();

    // Call the views.open method using one of the built-in WebClients
    const result = await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: logDesicionView,
    })

    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});

// Define a modal view for logging decisions
const logDesicionView = {
  type: 'modal',
  callback_id: 'log_decision', // Add this line
  title: {
    type: 'plain_text',
    text: 'Log Decision',
  },
  blocks: [
    {
      type: 'input',
      block_id: 'title_block',
      optional: false,
      label: {
        type: 'plain_text',
        text: 'What needs to be decided?',
      },
      element: {
        type: 'plain_text_input',
        action_id: 'title_input',
      },
    },
  ],
  submit: {
    type: 'plain_text',
    text: 'Log Decision'
  },
}

app.view('log_decision', async ({ body, ack, say, logger }) => {
  await ack();
  logger.info('from view listener', JSON.stringify(body.view.state, null, 2));
});


// Create receiver serverless handler
const receiverHandler = serverless(receiver.app)

// Export a handler for the app
export const handler = async (event, context) => await receiverHandler(event, context);

