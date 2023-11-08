/*export const handler = async (event, context) => {
  const clientId = process.env.SLACK_CLIENT_ID;
  const scopes = ['chat:write', 'channels:history', 'commands', 'channels:read'];

  return {
    statusCode: 301,
    headers: {
      'Location': `https://slack.com/oauth/v2/authorize?scope=${scopes.join(',')}&client_id=${clientId}`
    },
  };
};*/

import serverlessHttp from 'serverless-http'

import { installExpressReceiver } from 'src/lib/slack'

export const handler = serverlessHttp(async (req, res) => {
  try {
    const url = await installExpressReceiver.installer.generateInstallUrl({
      scopes: [
        'chat:write',
        'channels:history',
        'commands',
        'channels:read',
        /*
        'chat:write',
        'commands',
        'users.profile:read',
        'users:read',
        'users:read.email',
        */
      ],
      userScopes: ['email', 'profile', 'openid'],
    })

    res.writeHead(302, { Location: url })
    res.end()
  } catch (error) {
    console.error(error)
    res.writeHead(500)
    res.end('Failed to create install url')
  }
})

