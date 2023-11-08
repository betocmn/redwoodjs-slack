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

