const { App, ExpressReceiver, LogLevel, HTTPResponseAck, HTTPModuleFunctions } = require('@slack/bolt');
const { ConsoleLogger } = require('@slack/logger')
const { Redis } = require("@upstash/redis");
const { ServerResponse } = require('node:http')
const serverless = require('serverless-http');

const {
  parseRequestBody
} = require("../utils");

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

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateVerification: false,
  scopes: ['chat:write', 'channels:history', 'commands', 'channels:read'],
  installationStore,
  processBeforeResponse: true
})

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  authorize: authorizeFn,
  receiver,
  logLevel: LogLevel.DEBUG
});


// app.shortcut('log_decision', async ({ shortcut, ack, client, logger }) => {
//   try {
//     // Acknowledge shortcut request
//     await ack();

//     // Call the views.open method using one of the built-in WebClients
//     const result = await client.views.open({
//       trigger_id: shortcut.trigger_id,
//       view: logDesicionView,
//     })

//     logger.info(result);
//   }
//   catch (error) {
//     logger.error(error);
//   }
// });

// app.view('log_decision', async ({ body, ack, say, logger }) => {
//   await ack();
//   logger.info('from view listener', JSON.stringify(body.view.state, null, 2));
// });

// app.message('hi', async ({ message, say, logger }) => {
//   logger.info('message received: ', message.text)
//   // say() sends a message to the channel where the event was triggered
//   try {

//   } catch (error) {
//     logger.error(error)
//   }
// });
app.message('hi', async ({ message, say, logger }) => {
  logger.info('message received: ', message.text)
  try {
    say('¡Hola!')

  } catch (error) {
    logger.error(error)
  }
});

module.exports.handler = async (req, context) => {
  let stringBody
  const preparsedRawBody = req.rawBody;
  if (preparsedRawBody !== undefined) {
    stringBody = preparsedRawBody.toString();
  } else {
    stringBody = (await rawBody(req)).toString();
  }

  try {
    const { 'content-type': contentType } = req.headers;
    req.body = parseRequestBody(stringBody, contentType);
  } catch (error) {
    if (error) {
      console.log('Parsing request body failed', error);
      return Response('', { status: 401 });
    }
  }

  if (req.body && req.body.ssl_check) {
    return new Response();
  }

  if (req.body && req.body.type && req.body.type === 'url_verification') {
    return Response.json({ challenge: req.body.challenge });
  }

  const ack = new HTTPResponseAck({
    logger: new ConsoleLogger(),
    processBeforeResponse: false,
    unhandledRequestHandler: HTTPModuleFunctions.defaultUnhandledRequestHandler,
    unhandledRequestTimeoutMillis: 3001,
    httpRequest: payload,
    httpResponse: new ServerResponse(payload),
  });
  const event = {
    body: req,
    ack: ack.bind()
  }

  await app.processEvent(event)
  return new Response("ok")

}
// module.exports.handler = async (req, context) => {
//   const payload = parseRequestBody(req.body, req.headers["content-type"]);
//   console.log('payload :', payload);
//   if (isUrlVerificationRequest(payload)) {
//     return new Response(payload.challenge);
//   }

//   return new Response("ok");

// };


