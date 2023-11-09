import serverlessHttp from 'serverless-http'

import { expressReceiver } from 'src/lib/slack'

export const handler = serverlessHttp(async (req, res) => {
  try {
    const url = await expressReceiver.installer.generateInstallUrl({
      scopes: [
        'chat:write',
        'commands',
        'users.profile:read',
        'users:read',
        'users:read.email',
        'channels:read',
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

