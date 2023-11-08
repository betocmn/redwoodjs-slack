import { App, ExpressReceiver, LogLevel } from '@slack/bolt';
import { Redis } from "@upstash/redis";
import serverless from 'serverless-http';

// Initialize Redis connection
const redis = Redis.fromEnv();

// Define an installation store for Slack app installations
const installationStore = {
  // Check if it's an Enterprise Install or a single Team App Install and save accordingly
  storeInstallation: async (installation) => {
    if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
      return await redis.set(installation.enterprise.id, installation);
    }
    if (installation.team !== undefined) {
      return await redis.set(installation.team.id, installation);
    }
    throw new Error('Failed saving installation data to installationStore');
  },
  // Function to fetch installation data
  fetchInstallation: async (installQuery) => {

    if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
      return await redis.get(installQuery.enterpriseId);
    }
    if (installQuery.teamId !== undefined) {
      return await redis.get(installQuery.teamId);
    }
    throw new Error('Failed fetching installation');
  },
  // Function to delete installation data
  deleteInstallation: async (installQuery) => {
    if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
      return await redis.del(installQuery.enterpriseId);
    }
    if (installQuery.teamId !== undefined) {
      return await redis.del(installQuery.teamId);
    }
    throw new Error('Failed to delete installation');
  },
}
// Define an authorization function
const authorizeFn = async ({ teamId, enterpriseId }) => {
  if (enterpriseId) {
    const installation = await redis.get(enterpriseId)
    return {
      botToken: installation.access_token,
      botUserId: installation.bot_user_id,
      userId: installation.authed_user.id,
      teamId: installation.team?.id,
      enterpriseId: installation.enterprise?.id,
    };
  }
  if (teamId) {
    const installation = await redis.get(teamId)
    return {
      botToken: installation.access_token,
      botUserId: installation.bot_user_id,
      userId: installation.authed_user.id,
      teamId: installation.team?.id,
      enterpriseId: installation.enterprise?.id,
    };
  }
  throw new Error('No matching authorizations');


}

// Initialize the Slack Bolt ExpressReceiver
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateVerification: false,
  scopes: ['chat:write', 'channels:history', 'commands', 'channels:read'],
  installationStore,
  processBeforeResponse: true,
})

// Create a Slack Bolt app
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  authorize: authorizeFn,
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

// Export a serverless handler for the app
export const handler = serverless(receiver.app)



