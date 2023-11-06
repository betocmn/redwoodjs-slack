const { App, ExpressReceiver, FileInstallationStore, LogLevel } = require('@slack/bolt');


const app = new App({signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  stateSecret: 'my-secret',
  scopes: ['chat:write', 'channels:history', 'commands', 'channels:read'],
  installationStore: new FileInstallationStore(),
  logLevel: LogLevel.DEBUG
});

// receiver.router.post('/slack/events', (req, res) => {
//   res.send('ok')
// });

app.shortcut('log_decision', async ({ shortcut, ack, client, logger }) => {
  try {
    // Acknowledge shortcut request
    await ack();

    // Call the views.open method using one of the built-in WebClients
    const result = await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: {
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
      },
    })

    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});

app.view('log_decision', async ({ body, ack, say, logger }) => {
  await ack();
  logger.info('from view listener', JSON.stringify(body.view.state, null, 2));
});

module.exports = {
  handler: async (event, context, callback) => {
    const _handler = await app.start();
    return _handler(event, context, callback);
  },
  config: {
    path: '/slack/events'
  }
}