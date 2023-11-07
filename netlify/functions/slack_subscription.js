const { App, ExpressReceiver, LogLevel } = require('@slack/bolt');
const { Redis } = require("@upstash/redis");

const {
  parseRequestBody,
  generateReceiverEvent,
  isUrlVerificationRequest
} = require("../utils");

module.exports.handler = async (req, context) => {

  const redis = Redis.fromEnv();
  const installationStore = {
    storeInstallation: async (installation) => {
      // change the line below so it saves to your database
      if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
        // support for org wide app installation
        return await redis.set(installation.enterprise.id, installation);
      }
      if (installation.team !== undefined) {
        // single team app installation
        return await redis.set(installation.team.id, installation);
      }
      throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
      // change the line below so it fetches from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation lookup
        return await redis.get(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation lookup
        return await redis.get(installQuery.teamId);
      }
      throw new Error('Failed fetching installation');
    },
    deleteInstallation: async (installQuery) => {
      // change the line below so it deletes from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation deletion
        return await redis.del(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation deletion
        return await redis.del(installQuery.teamId);
      }
      throw new Error('Failed to delete installation');
    },
  }

console.log('signingSecret: ',process.env.SLACK_SIGNING_SECRET);
console.log('clientId: ',process.env.SLACK_CLIENT_ID);
console.log('clientSecret: ',process.env.SLACK_CLIENT_SECRET);
  const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: 'arre',
    scopes: ['chat:write', 'channels:history', 'commands', 'channels:read'],
    installationStore
  })

  const app = new App({
    receiver,
    logLevel: LogLevel.DEBUG
  });

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

  app.view('log_decision', async ({ body, ack, say, logger }) => {
    await ack();
    logger.info('from view listener', JSON.stringify(body.view.state, null, 2));
  });

  app.message('hi', async ({ message, say, logger }) => {
    logger.info('message received: ', message.text)
    // say() sends a message to the channel where the event was triggered
    try {
      await say(`Hey there <@${message.user}>!`);

    } catch (error) {
      logger.error(error)
    }
  });


  const payload = parseRequestBody(req.body, req.headers["content-type"]);

  if (isUrlVerificationRequest(payload)) {
    return new Response(payload.challenge);
  }

  const slackEvent = generateReceiverEvent(payload);
  await app.processEvent(slackEvent);

  return new Response("ok", 200);

};
